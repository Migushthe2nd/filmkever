const consola = require('consola')
const bcrypt = require('bcryptjs')
const joinMonster = require('join-monster').default
const graphqlFields = require('graphql-fields')
const { errorName } = require('../utils/errorTypes')

module.exports = (pgp, db, dbFunctions, functions) => {
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
                    summary = await functions.general.movies.summary(traktID)
                    if (getImages && summary && summary.data) {
                        await functions.general.movies.images(summary.data)
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
                        functions.user.watch_data.getMovieBULK(
                            [summary.data],
                            uuid
                        ),
                        functions.user.watchlist_data.getBULK(
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
                    summary = await functions.general.shows.summary(traktID)
                    if (getImages && summary && summary.data) {
                        await functions.general.shows.images(summary.data)
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
                        functions.user.watch_data.getShowBULK(
                            [summary.data],
                            uuid
                        ),
                        functions.user.watchlist_data.getBULK(
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
                        summary = await functions.general.shows.episode(
                            dbData.showid,
                            dbData.season,
                            dbData.episode
                        )
                        if (getImages && summary && summary.data) {
                            await functions.general.shows.episodeImages(
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
                        functions.user.watch_data.getOne(
                            summary,
                            traktID,
                            'episode',
                            uuid
                        ),
                        functions.user.watchlist_data.getOne(
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
                    seasons = await functions.general.shows.episodes(traktID)
                    if (
                        context.req.isAuthenticated() &&
                        getUserData &&
                        seasons.data.length > 0
                    ) {
                        const uuid = context.req.user.uuid
                        await Promise.all([
                            functions.user.watch_data.getEpisodeBULK(
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
                    items = await functions.general.movies.search(page, query)
                    if (
                        getImages &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await functions.general.movies.imagesBULK(items.items)
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
                        functions.user.watch_data.getMovieBULK(
                            items.items,
                            uuid
                        ),
                        functions.user.watchlist_data.getBULK(
                            items.items,
                            'movie',
                            uuid
                        )
                    ])
                }

                return items
            },
            continueMovies: async (
                parent,
                { page, lastTime },
                context,
                info
            ) => {
                if (context.req.isAuthenticated()) {
                    const uuid = context.req.user.uuid
                    let items
                    const getImages = !!graphqlFields(info).items.images
                    const getUserData = !!graphqlFields(info).items.user_data

                    try {
                        items = await functions.general.movies.continue(
                            uuid,
                            page,
                            lastTime
                        )
                        if (getImages && items.items.length > 0) {
                            await functions.general.movies.imagesBULK(
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
                        getUserData &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await Promise.all([
                            functions.user.watch_data.getMovieBULK(
                                items.items,
                                uuid
                            ),
                            functions.user.watchlist_data.getBULK(
                                items.items,
                                'movie',
                                uuid
                            )
                        ])
                    }

                    return items
                } else {
                    throw new Error(errorName.UNAUTHORIZED)
                }
            },
            watchlistMovies: async (
                parent,
                { page, lastID },
                context,
                info
            ) => {
                if (context.req.isAuthenticated()) {
                    const uuid = context.req.user.uuid
                    let items
                    const getImages = !!graphqlFields(info).items.images
                    const getUserData = !!graphqlFields(info).items.user_data

                    try {
                        items = await functions.general.movies.watchlist(
                            uuid,
                            page,
                            lastID
                        )
                        if (getImages && items.items.length > 0) {
                            await functions.general.movies.imagesBULK(
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
                        getUserData &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await Promise.all([
                            functions.user.watch_data.getMovieBULK(
                                items.items,
                                uuid
                            ),
                            functions.user.watchlist_data.getBULK(
                                items.items,
                                'movie',
                                uuid
                            )
                        ])
                    }

                    return items
                } else {
                    throw new Error(errorName.UNAUTHORIZED)
                }
            },
            trendingMovies: async (parent, { page }, context, info) => {
                let items
                const getImages = !!graphqlFields(info).items.images
                const getUserData = !!graphqlFields(info).items.user_data

                try {
                    items = await functions.general.movies.trending(page)
                    if (getImages && items.items.length > 0) {
                        await functions.general.movies.imagesBULK(items.items)
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
                        functions.user.watch_data.getMovieBULK(
                            items.items,
                            uuid
                        ),
                        functions.user.watchlist_data.getBULK(
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
                    items = await functions.general.movies.boxoffice(page)
                    if (
                        getImages &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await functions.general.movies.imagesBULK(items.items)
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
                        functions.user.watch_data.getMovieBULK(
                            items.items,
                            uuid
                        ),
                        functions.user.watchlist_data.getBULK(
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
                    items = await functions.general.movies.popular(page)
                    if (
                        getImages &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await functions.general.movies.imagesBULK(items.items)
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
                        functions.user.watch_data.getMovieBULK(
                            items.items,
                            uuid
                        ),
                        functions.user.watchlist_data.getBULK(
                            items.items,
                            'movie',
                            uuid
                        )
                    ])
                }

                return items
            },
            playedMovies: async (parent, { page, period }, context, info) => {
                let items
                const getImages = !!graphqlFields(info).items.images
                const getUserData = !!graphqlFields(info).items.user_data

                try {
                    items = await functions.general.movies.played(page, period)
                    if (
                        getImages &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await functions.general.movies.imagesBULK(items.items)
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
                        functions.user.watch_data.getMovieBULK(
                            items.items,
                            uuid
                        ),
                        functions.user.watchlist_data.getBULK(
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
                    items = await functions.general.shows.search(page, query)
                    if (
                        getImages &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await functions.general.shows.imagesBULK(items.items)
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
                        functions.user.watch_data.getShowBULK(
                            items.items,
                            uuid
                        ),
                        functions.user.watchlist_data.getBULK(
                            items.items,
                            'show',
                            uuid
                        )
                    ])
                }

                return items
            },
            continueShows: async (
                parent,
                { page, lastTime, lastID },
                context,
                info
            ) => {
                if (context.req.isAuthenticated()) {
                    const uuid = context.req.user.uuid
                    let items
                    const getImages = !!graphqlFields(info).items.images
                    const getUserData = !!graphqlFields(info).items.user_data

                    try {
                        items = await functions.general.shows.continue(
                            uuid,
                            page,
                            lastTime,
                            lastID
                        )
                        if (getImages && items.items.length > 0) {
                            await functions.general.shows.imagesBULK(
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
                        getUserData &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await Promise.all([
                            // functions.user.watch_data.getShowBULK(
                            //     items.items,
                            //     uuid
                            // ),
                            functions.user.watchlist_data.getBULK(
                                items.items,
                                'show',
                                uuid
                            )
                        ])
                    }

                    return items
                } else {
                    throw new Error(errorName.UNAUTHORIZED)
                }
            },
            watchlistShows: async (parent, { page, lastID }, context, info) => {
                if (context.req.isAuthenticated()) {
                    const uuid = context.req.user.uuid
                    let items
                    const getImages = !!graphqlFields(info).items.images
                    const getUserData = !!graphqlFields(info).items.user_data

                    try {
                        items = await functions.general.shows.watchlist(
                            uuid,
                            page,
                            lastID
                        )
                        if (getImages && items.items.length > 0) {
                            await functions.general.shows.imagesBULK(
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
                        getUserData &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await Promise.all([
                            functions.user.watch_data.getShowBULK(
                                items.items,
                                uuid
                            ),
                            functions.user.watchlist_data.getBULK(
                                items.items,
                                'show',
                                uuid
                            )
                        ])
                    }

                    return items
                } else {
                    throw new Error(errorName.UNAUTHORIZED)
                }
            },
            trendingShows: async (parent, { page }, context, info) => {
                let items
                const getImages = !!graphqlFields(info).items.images
                const getUserData = !!graphqlFields(info).items.user_data

                try {
                    items = await functions.general.shows.trending(page)
                    if (
                        getImages &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await functions.general.shows.imagesBULK(items.items)
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
                        functions.user.watch_data.getShowBULK(
                            items.items,
                            uuid
                        ),
                        functions.user.watchlist_data.getBULK(
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
                    items = await functions.general.shows.popular(page)
                    if (
                        getImages &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await functions.general.shows.imagesBULK(items.items)
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
                        functions.user.watch_data.getShowBULK(
                            items.items,
                            uuid
                        ),
                        functions.user.watchlist_data.getBULK(
                            items.items,
                            'show',
                            uuid
                        )
                    ])
                }

                return items
            },
            playedShows: async (parent, { page, period }, context, info) => {
                let items
                const getImages = !!graphqlFields(info).items.images
                const getUserData = !!graphqlFields(info).items.user_data

                try {
                    items = await functions.general.shows.played(page, period)
                    if (
                        getImages &&
                        items &&
                        items.items &&
                        items.items.length > 0
                    ) {
                        await functions.general.shows.imagesBULK(items.items)
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
                        functions.user.watch_data.getShowBULK(
                            items.items,
                            uuid
                        ),
                        functions.user.watchlist_data.getBULK(
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
            //         functions.general.movies
            //             .userdata(traktID)
            //             .then((res) => {
            //                 consola.log(res.data)
            //                 return res.data
            //             })
            //         if (context.req.isAuthenticated()) {
            //             // functions.general.users.UserWatchData.get()
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
                        functions.user.watch_data
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
                        functions.user.watchlist_data
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
            },
            preferences: (parent, args, context, info) => {
                if (context.req.isAuthenticated()) {
                    const uuid = context.req.user.uuid
                    return new Promise((resolve, reject) => {
                        try {
                            dbFunctions.user.preferences.set(uuid, args, () => {
                                context.req.session.passport.user.preferences = args
                                resolve(true)
                            })
                        } catch (error) {
                            consola.error(error)
                            resolve(new Error(errorName.UNKNOWN))
                        }
                    })
                } else {
                    throw new Error(errorName.UNAUTHORIZED)
                }
            }
        }
    }
}
