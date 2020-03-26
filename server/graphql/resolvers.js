const consola = require('consola')
const bcrypt = require('bcryptjs')
const joinMonster = require('join-monster').default
const graphqlFields = require('graphql-fields')
const { errorName } = require('../utils/errorTypes')

module.exports = (pgp, db, dbFunctions, TraktFunctions) => {
    return {
        Query: {
            allUsers: (parent, args, context, info) => {
                if (context.req.isAuthenticated()) {
                    // return joinMonster(info, args, (sql) => {
                    //     return db.any(sql)
                    // })
                }
            },
            me: (parent, args, context, info) => {
                if (context.req.isAuthenticated()) {
                    return joinMonster(info, context.req.user.uuid, (sql) => {
                        return db.any(sql)
                    })
                } else {
                    throw new Error(errorName.UNAUTHORIZED)
                }
            },
            emailAvailable: async (parent, { email }, context, info) => {
                const dbData = await db.oneOrNone(
                    `SELECT 1 from users WHERE email = $1`,
                    [email]
                )
                if (!dbData) {
                    return true
                } else return false
            },
            movie: async (parent, { traktID }, context, info) => {
                let summary
                const getImages = !!graphqlFields(info).images
                const getUserData = !!graphqlFields(info).user_data

                try {
                    summary = await TraktFunctions.general.movies.summary(
                        traktID
                    )
                    if (getImages && summary && summary.data) {
                        await TraktFunctions.general.movies.images(summary.data)
                    }
                } catch (err) {
                    if (err.toString().includes('404')) {
                        throw new Error(errorName.ITEM_NOT_EXIST)
                    } else {
                        throw new Error(errorName.UNKNOWN)
                    }
                }

                if (context.req.isAuthenticated() && getUserData && summary) {
                    const uuid = context.req.user.uuid
                    summary.data.user_data = {}
                    await Promise.all([
                        TraktFunctions.user.watch_data.getMovieBULK(
                            [summary.data],
                            uuid
                        ),
                        TraktFunctions.user.watchlist_data.getBULK(
                            [summary.data],
                            'movie',
                            uuid
                        )
                    ])
                }

                return summary.data
            },
            show: async (parent, { traktID }, context, info) => {
                let summary
                const getImages = !!graphqlFields(info).images
                const getUserData = !!graphqlFields(info).user_data

                try {
                    summary = await TraktFunctions.general.shows.summary(
                        traktID
                    )
                    if (getImages && summary && summary.data) {
                        await TraktFunctions.general.shows.images(summary.data)
                    }
                } catch (err) {
                    if (err.toString().includes('404')) {
                        throw new Error(errorName.ITEM_NOT_EXIST)
                    } else {
                        throw new Error(errorName.UNKNOWN)
                    }
                }

                if (context.req.isAuthenticated() && getUserData && summary) {
                    const uuid = context.req.user.uuid
                    summary.data.user_data = {}
                    await Promise.all([
                        TraktFunctions.user.watch_data.getShowBULK(
                            [summary.data],
                            uuid
                        ),
                        TraktFunctions.user.watchlist_data.getBULK(
                            [summary.data],
                            'show',
                            uuid
                        )
                    ])
                }

                return summary.data
            },
            episode: async (parent, { traktID }, context, info) => {
                let summary
                const getImages = !!graphqlFields(info).images
                const getUserData = !!graphqlFields(info).user_data

                const dbData = await db.oneOrNone(
                    `SELECT season, episode, showid, tmdbid from trakt_episodes WHERE traktID = $1`,
                    [traktID]
                )

                if (!dbData) {
                    throw new Error(errorName.EPISODE_NOT_INDEXED)
                } else {
                    try {
                        summary = await TraktFunctions.general.shows.episode(
                            dbData.showid,
                            dbData.season,
                            dbData.episode
                        )
                        if (getImages && summary && summary.data) {
                            await TraktFunctions.general.shows.episodeImages(
                                summary.data,
                                dbData.tmdbid,
                                dbData.season,
                                dbData.episode
                                // 'show',
                                // 'original'
                            )
                        }
                    } catch (err) {
                        if (err.toString().includes('404')) {
                            throw new Error(errorName.ITEM_NOT_EXIST)
                        } else {
                            throw new Error(errorName.UNKNOWN)
                        }
                    }
                }

                if (context.req.isAuthenticated() && getUserData && summary) {
                    const uuid = context.req.user.uuid
                    summary.data.user_data = {}
                    await Promise.all([
                        TraktFunctions.user.watch_data.get(
                            summary,
                            traktID,
                            'episode',
                            uuid
                        ),
                        TraktFunctions.user.watchlist_data.get(
                            summary,
                            traktID,
                            'episode',
                            uuid
                        )
                    ])
                }

                return summary.data
            },
            seasonsAndEpisodes: async (
                parent,
                { traktID, saveTmdbID },
                context,
                info
            ) => {
                let seasons = []
                const getUserData = !!graphqlFields(info).episodes.user_data
                try {
                    seasons = await TraktFunctions.general.shows.episodes(
                        traktID
                    )
                    if (
                        context.req.isAuthenticated() &&
                        getUserData &&
                        seasons.data.length > 0
                    ) {
                        const uuid = context.req.user.uuid
                        await Promise.all([
                            TraktFunctions.user.watch_data.episodes.get(
                                seasons.data,
                                uuid
                            )
                        ])
                    }
                    dbFunctions.shows.set(seasons.data, traktID, saveTmdbID)
                    return seasons.data
                } catch (err) {
                    if (err.toString().includes('404')) {
                        throw new Error(errorName.ITEM_NOT_EXIST)
                    } else {
                        throw new Error(errorName.UNKNOWN)
                    }
                }
            },
            searchMovies: async (parent, { page, query }, context, info) => {
                let items
                const getImages = !!graphqlFields(info).items.images
                const getUserData = !!graphqlFields(info).items.user_data

                try {
                    items = await TraktFunctions.general.movies.search(
                        page,
                        query
                    )
                    if (
                        getImages &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await TraktFunctions.general.movies.imagesBULK(
                            items.items
                        )
                    }
                } catch (err) {
                    if (err.toString().includes('404')) {
                        throw new Error(errorName.ITEM_NOT_EXIST)
                    } else {
                        throw new Error(errorName.UNKNOWN)
                    }
                }

                if (
                    context.req.isAuthenticated() &&
                    getUserData &&
                    items &&
                    items.items &&
                    items.items.length > 0
                ) {
                    const uuid = context.req.user.uuid
                    await Promise.all([
                        TraktFunctions.user.watch_data.getMovieBULK(
                            items.items,
                            uuid
                        ),
                        TraktFunctions.user.watchlist_data.getBULK(
                            items.items,
                            'movie',
                            uuid
                        )
                    ])
                }

                return items
            },
            trendingMovies: async (parent, { page }, context, info) => {
                let items
                const getImages = !!graphqlFields(info).items.images
                const getUserData = !!graphqlFields(info).items.user_data

                try {
                    items = await TraktFunctions.general.movies.trending(page)
                    if (getImages && items.items.length > 0) {
                        await TraktFunctions.general.movies.imagesBULK(
                            items.items
                        )
                    }
                } catch (err) {
                    if (err.toString().includes('404')) {
                        throw new Error(errorName.ITEM_NOT_EXIST)
                    } else {
                        throw new Error(errorName.UNKNOWN)
                    }
                }

                if (
                    context.req.isAuthenticated() &&
                    getUserData &&
                    items &&
                    items.items &&
                    items.items.length > 0
                ) {
                    const uuid = context.req.user.uuid
                    await Promise.all([
                        TraktFunctions.user.watch_data.getMovieBULK(
                            items.items,
                            uuid
                        ),
                        TraktFunctions.user.watchlist_data.getBULK(
                            items.items,
                            'movie',
                            uuid
                        )
                    ])
                }

                return items
            },
            boxofficeMovies: async (parent, { page }, context, info) => {
                let items
                const getImages = !!graphqlFields(info).items.images
                const getUserData = !!graphqlFields(info).items.user_data

                try {
                    items = await TraktFunctions.general.movies.boxoffice(page)
                    if (
                        getImages &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await TraktFunctions.general.movies.imagesBULK(
                            items.items
                        )
                    }
                } catch (err) {
                    if (err.toString().includes('404')) {
                        throw new Error(errorName.ITEM_NOT_EXIST)
                    } else {
                        throw new Error(errorName.UNKNOWN)
                    }
                }

                if (
                    context.req.isAuthenticated() &&
                    getUserData &&
                    items &&
                    items.items &&
                    items.items.length > 0
                ) {
                    const uuid = context.req.user.uuid
                    await Promise.all([
                        TraktFunctions.user.watch_data.getMovieBULK(
                            items.items,
                            uuid
                        ),
                        TraktFunctions.user.watchlist_data.getBULK(
                            items.items,
                            'movie',
                            uuid
                        )
                    ])
                }

                return items
            },
            popularMovies: async (parent, { page }, context, info) => {
                let items
                const getImages = !!graphqlFields(info).items.images
                const getUserData = !!graphqlFields(info).items.user_data

                try {
                    items = await TraktFunctions.general.movies.popular(page)
                    if (
                        getImages &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await TraktFunctions.general.movies.imagesBULK(
                            items.items
                        )
                    }
                } catch (err) {
                    if (err.toString().includes('404')) {
                        throw new Error(errorName.ITEM_NOT_EXIST)
                    } else {
                        throw new Error(errorName.UNKNOWN)
                    }
                }

                if (
                    context.req.isAuthenticated() &&
                    getUserData &&
                    items &&
                    items.items &&
                    items.items.length > 0
                ) {
                    const uuid = context.req.user.uuid
                    await Promise.all([
                        TraktFunctions.user.watch_data.getMovieBULK(
                            items.items,
                            uuid
                        ),
                        TraktFunctions.user.watchlist_data.getBULK(
                            items.items,
                            'movie',
                            uuid
                        )
                    ])
                }

                return items
            },
            searchShows: async (parent, { page, query }, context, info) => {
                let items
                const getImages = !!graphqlFields(info).items.images
                const getUserData = !!graphqlFields(info).items.user_data

                try {
                    items = await TraktFunctions.general.shows.search(
                        page,
                        query
                    )
                    if (
                        getImages &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await TraktFunctions.general.shows.imagesBULK(
                            items.items
                        )
                    }
                } catch (err) {
                    if (err.toString().includes('404')) {
                        throw new Error(errorName.ITEM_NOT_EXIST)
                    } else {
                        throw new Error(errorName.UNKNOWN)
                    }
                }

                if (
                    context.req.isAuthenticated() &&
                    getUserData &&
                    items &&
                    items.items &&
                    items.items.length > 0
                ) {
                    const uuid = context.req.user.uuid
                    await Promise.all([
                        TraktFunctions.user.watch_data.getShowBULK(
                            items.items,
                            uuid
                        ),
                        TraktFunctions.user.watchlist_data.getBULK(
                            items.items,
                            'show',
                            uuid
                        )
                    ])
                }

                return items
            },
            trendingShows: async (parent, { page }, context, info) => {
                let items
                const getImages = !!graphqlFields(info).items.images
                const getUserData = !!graphqlFields(info).items.user_data

                try {
                    items = await TraktFunctions.general.shows.trending(page)
                    if (
                        getImages &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await TraktFunctions.general.shows.imagesBULK(
                            items.items
                        )
                    }
                } catch (err) {
                    if (err.toString().includes('404')) {
                        throw new Error(errorName.ITEM_NOT_EXIST)
                    } else {
                        throw new Error(errorName.UNKNOWN)
                    }
                }

                if (
                    context.req.isAuthenticated() &&
                    getUserData &&
                    items &&
                    items.items &&
                    items.items.length > 0
                ) {
                    const uuid = context.req.user.uuid
                    await Promise.all([
                        TraktFunctions.user.watch_data.getShowBULK(
                            items.items,
                            uuid
                        ),
                        TraktFunctions.user.watchlist_data.getBULK(
                            items.items,
                            'show',
                            uuid
                        )
                    ])
                }

                return items
            },
            popularShows: async (parent, { page }, context, info) => {
                let items
                const getImages = !!graphqlFields(info).items.images
                const getUserData = !!graphqlFields(info).items.user_data

                try {
                    items = await TraktFunctions.general.shows.popular(page)
                    if (
                        getImages &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await TraktFunctions.general.shows.imagesBULK(
                            items.items
                        )
                    }
                } catch (err) {
                    if (err.toString().includes('404')) {
                        throw new Error(errorName.ITEM_NOT_EXIST)
                    } else {
                        throw new Error(errorName.UNKNOWN)
                    }
                }

                if (
                    context.req.isAuthenticated() &&
                    getUserData &&
                    items &&
                    items.items &&
                    items.items.length > 0
                ) {
                    const uuid = context.req.user.uuid
                    await Promise.all([
                        TraktFunctions.user.watch_data.getShowBULK(
                            items.items,
                            uuid
                        ),
                        TraktFunctions.user.watchlist_data.getBULK(
                            items.items,
                            'show',
                            uuid
                        )
                    ])
                }

                return items
            }
            // progress: (parent, { mediatype, traktID }, context, info) => {
            //     if (context.req.isAuthenticated()) {
            //         const uuid = context.req.user.uuid
            //         consola.log(mediatype, traktID, uuid)
            //         TraktFunctions.general.movies
            //             .userdata(traktID)
            //             .then((res) => {
            //                 consola.log(res.data)
            //                 return res.data
            //             })
            //         if (context.req.isAuthenticated()) {
            //             // TraktFunctions.general.users.UserWatchData.get()
            //         }
            //     } else {
            //         throw new Error(errorName.UNAUTHORIZED)
            //     }
            // }
        },
        Mutation: {
            register: async (
                parent,
                { username, email, password },
                context
            ) => {
                if (!context.req.isAuthenticated()) {
                    const res = await db.oneOrNone(
                        'SELECT password_hash FROM users WHERE email = $1',
                        [email]
                    )
                    if (res) {
                        throw new Error(errorName.USER_EXISTS)
                    } else {
                        const resHash = await bcrypt.hash(password, 10)
                        const user = await db.one(
                            'INSERT INTO users(uuid, username, email, joined, last_logged_in, password_hash) VALUES(uuid_generate_v4(), $1, $2, NOW(), NOW(), $3) RETURNING uuid, username, email, joined, last_logged_in, role',
                            [username, email, resHash]
                        )
                        // Immediately log in new user
                        await context.login(user)
                        return { user }
                    }
                } else {
                    throw new Error(errorName.ALREADY_AUTHORIZED)
                }
            },
            login: async (parent, { email, password }, context) => {
                if (!context.req.isAuthenticated()) {
                    const { user } = await context.authenticate(
                        'graphql-local',
                        {
                            email,
                            password
                        }
                    )
                    try {
                        await context.login(user)
                        return { user }
                    } catch (err) {
                        throw new Error(errorName.AUTHORIZATION_ERROR)
                    }
                } else {
                    throw new Error(errorName.ALREADY_AUTHORIZED)
                }
            },
            logout: (parent, args, context) => {
                if (context.req.isAuthenticated()) {
                    try {
                        context.logout()
                        context.req.session.destroy()
                        return 'Success'
                    } catch (err) {
                        throw new Error(errorName.UNKNOWN)
                    }
                } else {
                    throw new Error(errorName.UNAUTHORIZED)
                }
            },
            progress: (
                parent,
                { mediatype, traktID, finished, length, position },
                context,
                info
            ) => {
                if (context.req.isAuthenticated()) {
                    const uuid = context.req.user.uuid
                    return new Promise((resolve, reject) => {
                        TraktFunctions.user.watch_data
                            .set(
                                uuid,
                                mediatype,
                                traktID,
                                finished,
                                length,
                                position
                            )
                            .then(() => {
                                resolve(finished)
                            })
                            .catch(() => {
                                resolve(new Error(errorName.UNKNOWN))
                            })
                    })
                } else {
                    throw new Error(errorName.UNAUTHORIZED)
                }
            },
            watchlist: (
                parent,
                { mediatype, traktID, state },
                context,
                info
            ) => {
                if (context.req.isAuthenticated()) {
                    const uuid = context.req.user.uuid
                    return new Promise((resolve, reject) => {
                        TraktFunctions.user.watchlist_data
                            .set(uuid, mediatype, traktID, state)
                            .then(() => {
                                resolve(state)
                            })
                            .catch(() => {
                                resolve(new Error(errorName.UNKNOWN))
                            })
                    })
                } else {
                    throw new Error(errorName.UNAUTHORIZED)
                }
            }
        }
    }
}
