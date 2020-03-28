const MData = require('mdata')
const consola = require('consola')
const benchmark = true // log execution time?
const pageSize = 12

const fanart = new (require('fanart.tv'))(process.env.FANARTTV_APIKEY)
const tmdb = require('themoviedb-api-client')(process.env.TMDB_APIKEY_V3)
const mdata = new MData({
    fanart: process.env.FANARTTV_APIKEY,
    tvdb: process.env.TVDB_APIKEY,
    tmdb: process.env.TMDB_APIKEY_V3,
    omdb: process.env.OMDB_APIKEY
})

function randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomtimein1day() {
    return Math.floor(Date.now() / 1000) + randomIntFromInterval(43200, 86400)
}

function randomtimein1month() {
    // between one day and 20 days
    // return 'UNIX_TIMESTAMP() + ROUND((RAND() * (1728000000-86400000))+86400000)'
    return (
        Math.floor(Date.now() / 1000) + randomIntFromInterval(1296000, 2678400)
    )
}

const canBeIncreased = function(link) {
    if (link) {
        if (link.match('media-amazon.com')) {
            return true
        } else if (link.match('fanart') && link.match('/preview/')) {
            return true
        } else if (link.match('image.tmdb.org') && link.match('/w342/')) {
            return true
        } else return false
    } else return false
}

const originalSize = function(link) {
    consola.log(link)
    if (link.match('media-amazon.com')) {
        link = link.replace(/@\._.+\./gm, '@.')
    } else if (link.match('fanart')) {
        link = link.replace('/preview/', '/fanart/')
    } else if (link.match('image.tmdb.org')) {
        link = link.replace(/\/w\d*\//gm, '/original/')
    }
    return link
}

module.exports = (db, dbFunctions, Trakt) => {
    function movieSummary(traktID) {
        const start = new Date()
        const hrstart = process.hrtime()
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Trakt.client.cached.movies.summary({
                    id: traktID,
                    extended: 'full',
                    'system:tll': 3600 * 24
                })
                resolve(result)
            } catch (err) {
                reject(err)
            }

            const end = new Date() - start
            const hrend = process.hrtime(hrstart)

            if (benchmark) {
                consola.info('Execution time movies.summary: %dms', end)
                consola.info(
                    'Execution time (hr): %ds %dms',
                    hrend[0],
                    hrend[1] / 1000000
                )
            }
        })
    }

    function showSummary(traktID) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Trakt.client.cached.shows.summary({
                    id: traktID,
                    extended: 'full',
                    'system:tll': 3600 * 24
                })
                resolve(result)
            } catch (err) {
                reject(err)
            }
        })
    }

    const functions = {
        user: {
            watch_data: {
                get: (summary, traktID, mediatype, uuid) => {
                    return new Promise((resolve, reject) => {
                        try {
                            dbFunctions.user.watch_data.get(
                                traktID,
                                mediatype,
                                uuid,
                                (error, results) => {
                                    if (error) throw error
                                    summary.data.user_data.watch_data = results

                                    if (!summary.data.user_data.watch_data) {
                                        summary.data.user_data.watch_data = [
                                            {
                                                finished: null
                                            }
                                        ]
                                    }
                                    resolve()
                                }
                            )
                        } catch (e) {
                            consola.error(e)
                        }
                    })
                },
                getMovieBULK: (items, uuid) => {
                    return new Promise((resolve, reject) => {
                        try {
                            dbFunctions.user.watch_data.getMovieBULK(
                                items,
                                uuid,
                                (error, sqlData) => {
                                    if (error) throw error
                                    for (let i = 0; i < items.length; i++) {
                                        for (
                                            let r = 0;
                                            r < sqlData.length;
                                            r++
                                        ) {
                                            if (
                                                sqlData[r].traktid ===
                                                items[i].ids.trakt
                                            ) {
                                                if (!items[i].user_data) {
                                                    items[i].user_data = {}
                                                }

                                                if (
                                                    !items[i].user_data
                                                        .watch_data
                                                ) {
                                                    items[
                                                        i
                                                    ].user_data.watch_data = []
                                                }

                                                items[
                                                    i
                                                ].user_data.watch_data.push(
                                                    sqlData[r]
                                                )
                                            }
                                        }
                                    }
                                    resolve()
                                }
                            )
                        } catch (e) {
                            consola.error(e)
                        }
                    })
                },
                getShowBULK: (items, uuid) => {
                    return new Promise((resolve, reject) => {
                        try {
                            dbFunctions.user.watch_data.getShowBULK(
                                items,
                                uuid,
                                (error, sqlData) => {
                                    if (error) throw error
                                    for (let i = 0; i < items.length; i++) {
                                        for (
                                            let r = 0;
                                            r < sqlData.length;
                                            r++
                                        ) {
                                            if (
                                                sqlData[r].showid ===
                                                items[i].ids.trakt
                                            ) {
                                                if (!items[i].user_data) {
                                                    items[i].user_data = {}
                                                }

                                                if (
                                                    !items[i].user_data
                                                        .watch_data
                                                ) {
                                                    items[
                                                        i
                                                    ].user_data.watch_data = []
                                                }

                                                items[
                                                    i
                                                ].user_data.watch_data.push(
                                                    sqlData[r]
                                                )
                                            }
                                        }
                                    }
                                    resolve()
                                }
                            )
                        } catch (e) {
                            consola.error(e)
                        }
                    })
                },
                set: (uuid, mediatype, traktID, finished, length, position) => {
                    return new Promise((resolve, reject) => {
                        try {
                            dbFunctions.user.watch_data.set(
                                uuid,
                                mediatype,
                                traktID,
                                finished,
                                length,
                                position,
                                (error, results) => {
                                    if (error) throw error

                                    resolve()
                                }
                            )
                        } catch (e) {
                            consola.error(e)
                        }
                    })
                },
                episodes: {
                    get: (seasons, uuid) => {
                        return new Promise((resolve, reject) => {
                            try {
                                dbFunctions.user.watch_data.episodes.get(
                                    seasons,
                                    uuid,
                                    (error, results) => {
                                        if (error) throw error
                                        for (
                                            let i = 0;
                                            i < seasons.length;
                                            i++
                                        ) {
                                            for (
                                                let j = 0;
                                                j < seasons[i].episodes.length;
                                                j++
                                            ) {
                                                let hasData = false
                                                for (
                                                    let r = 0;
                                                    r < results.length;
                                                    r++
                                                ) {
                                                    if (
                                                        results[r].traktid ===
                                                        seasons[i].episodes[j]
                                                            .ids.trakt
                                                    ) {
                                                        hasData = true
                                                        if (
                                                            !seasons[i]
                                                                .episodes[j]
                                                                .user_data
                                                        ) {
                                                            seasons[i].episodes[
                                                                j
                                                            ].user_data = {}
                                                        }

                                                        if (
                                                            !seasons[i]
                                                                .episodes[j]
                                                                .user_data
                                                                .watch_data
                                                        ) {
                                                            seasons[i].episodes[
                                                                j
                                                            ].user_data.watch_data = []
                                                        }

                                                        seasons[i].episodes[
                                                            j
                                                        ].user_data.watch_data.push(
                                                            results[r]
                                                        )
                                                    }
                                                }
                                                if (!hasData) {
                                                    if (
                                                        !seasons[i].episodes[j]
                                                            .user_data
                                                    ) {
                                                        seasons[i].episodes[
                                                            j
                                                        ].user_data = {}
                                                    }

                                                    if (
                                                        !seasons[i].episodes[j]
                                                            .user_data
                                                            .watch_data
                                                    ) {
                                                        seasons[i].episodes[
                                                            j
                                                        ].user_data.watch_data = [
                                                            {
                                                                finished: null
                                                            }
                                                        ]
                                                    }
                                                }
                                            }
                                        }
                                        resolve()
                                    }
                                )
                            } catch (e) {
                                consola.error(e)
                            }
                        })
                    }
                }
            },
            watchlist_data: {
                get: (summary, traktID, mediatype, uuid) => {
                    return new Promise((resolve, reject) => {
                        try {
                            dbFunctions.user.watchlist_data.get(
                                traktID,
                                mediatype,
                                uuid,
                                (error, result) => {
                                    if (error) throw error

                                    summary.data.user_data.watchlist_data = result

                                    resolve()
                                }
                            )
                        } catch (e) {
                            consola.error(e)
                        }
                    })
                },
                getBULK: (items, mediatype, uuid) => {
                    return new Promise((resolve, reject) => {
                        try {
                            dbFunctions.user.watchlist_data.getBULK(
                                items,
                                mediatype,
                                uuid,
                                (error, sqlData) => {
                                    if (error) throw error
                                    for (let i = 0; i < items.length; i++) {
                                        for (
                                            let r = 0;
                                            r < sqlData.length;
                                            r++
                                        ) {
                                            if (
                                                sqlData[r].traktid ===
                                                items[i].ids.trakt
                                            ) {
                                                if (!items[i].user_data) {
                                                    items[i].user_data = {}
                                                }

                                                items[
                                                    i
                                                ].user_data.watchlist_data =
                                                    sqlData[r]
                                            }
                                        }
                                    }
                                    resolve()
                                }
                            )
                        } catch (e) {
                            consola.error(e)
                        }
                    })
                },
                set: (uuid, mediatype, traktID, state) => {
                    return new Promise((resolve, reject) => {
                        try {
                            dbFunctions.user.watchlist_data.set(
                                uuid,
                                mediatype,
                                traktID,
                                state,
                                (error, result) => {
                                    if (error) throw error
                                    resolve()
                                }
                            )
                        } catch (e) {
                            consola.error(e)
                        }
                    })
                }
            }
        },
        general: {
            movies: {
                summary: movieSummary,
                watchlist: (uuid, page, lastID) => {
                    return new Promise((resolve, reject) => {
                        const newItems = {
                            items: []
                        }
                        dbFunctions.user.watchlist(
                            'movie',
                            uuid,
                            pageSize,
                            lastID,
                            (response) => {
                                const promises = []
                                for (let i = 0; i < response.length; i++) {
                                    promises.push(
                                        movieSummary(response[i].traktid)
                                    )
                                }

                                Promise.all(promises).then((results) => {
                                    for (let i = 0; i < results.length; i++) {
                                        newItems.items[i] = results[i].data
                                    }

                                    newItems.pagination = {
                                        item_count: response.length,
                                        page,
                                        page_count:
                                            response.length === pageSize
                                                ? null
                                                : page,
                                        lastID:
                                            response.length > 0
                                                ? response[response.length - 1]
                                                      .id
                                                : null
                                    }
                                    resolve(newItems)
                                })
                            }
                        )
                    })
                },
                trending: (page) => {
                    return new Promise(async (resolve, reject) => {
                        const items = await Trakt.client.cached.movies.trending(
                            {
                                extended: 'full',
                                page,
                                limit: pageSize
                            }
                        )
                        const newItems = {
                            items: []
                        }
                        for (let i = 0; i < items.data.length; i++) {
                            newItems.items[i] = items.data[i].movie
                        }
                        newItems.pagination = {
                            item_count: parseInt(
                                items.pagination['item-count']
                            ),
                            limit: items.pagination.limit,
                            page: items.pagination.page,
                            page_count: parseInt(items.pagination['page-count'])
                        }
                        resolve(newItems)
                    })
                },
                popular: (page) => {
                    return new Promise(async (resolve, reject) => {
                        const items = await Trakt.client.cached.movies.popular({
                            extended: 'full',
                            page,
                            limit: pageSize
                        })
                        const newItems = {
                            items: []
                        }
                        for (let i = 0; i < items.data.length; i++) {
                            newItems.items[i] = items.data[i]
                        }
                        newItems.pagination = {
                            item_count: parseInt(
                                items.pagination['item-count']
                            ),
                            limit: items.pagination.limit,
                            page: items.pagination.page,
                            page_count: parseInt(items.pagination['page-count'])
                        }
                        resolve(newItems)
                    })
                },
                boxoffice: (page) => {
                    return new Promise(async (resolve, reject) => {
                        const items = await Trakt.client.cached.movies.boxoffice(
                            {
                                extended: 'full',
                                page,
                                limit: pageSize
                            }
                        )
                        const newItems = {
                            items: []
                        }
                        for (let i = 0; i < items.data.length; i++) {
                            newItems.items[i] = items.data[i].movie
                        }
                        newItems.pagination = {
                            item_count: items.data.length,
                            limit: items.data.length,
                            page: null,
                            page_count: null
                        }
                        resolve(newItems)
                    })
                },
                anticipated: (page) => {
                    const start = new Date()
                    const hrstart = process.hrtime()
                    return new Promise(async (resolve, reject) => {
                        const anticipated = await Trakt.client.cached.movies.anticipated(
                            {
                                extended: 'full',
                                page,
                                limit: pageSize,
                                'system:tll': 3600 * 24
                            }
                        )
                        resolve(anticipated)
                        const end = new Date() - start
                        const hrend = process.hrtime(hrstart)

                        if (benchmark) {
                            consola.info(
                                'Execution time movies.anticipated: %dms',
                                end
                            )
                            consola.info(
                                'Execution time (hr): %ds %dms',
                                hrend[0],
                                hrend[1] / 1000000
                            )
                        }
                    })
                },
                search: (page, query) => {
                    return new Promise(async (resolve, reject) => {
                        const items = await Trakt.client.cached.search.text({
                            extended: 'full',
                            type: 'movie',
                            query,
                            page,
                            limit: pageSize
                        })
                        const newItems = {
                            items: []
                        }
                        for (let i = 0; i < items.data.length; i++) {
                            newItems.items[i] = items.data[i].movie
                        }
                        newItems.pagination = {
                            item_count: parseInt(
                                items.pagination['item-count']
                            ),
                            limit: items.pagination.limit,
                            page: items.pagination.page,
                            page_count: parseInt(items.pagination['page-count'])
                        }
                        resolve(newItems)
                    })
                },
                images: (summary) => {
                    const start = new Date()
                    const hrstart = process.hrtime()

                    function downloadimages(next) {
                        try {
                            if (!summary.images) {
                                summary.images = {}
                            }
                            fanart.movies
                                .get(summary.ids.imdb)
                                .then((response) => {
                                    if (
                                        response.movieposter &&
                                        response.movieposter.length > 0
                                    ) {
                                        if (
                                            !summary.images.poster ||
                                            summary.images.poster.length === 0
                                        ) {
                                            summary.images.poster = []
                                        }

                                        for (
                                            let i = 0;
                                            i < response.movieposter.length;
                                            i++
                                        ) {
                                            if (
                                                response.movieposter[i].lang ===
                                                'en'
                                            ) {
                                                summary.images.poster.push(
                                                    originalSize(
                                                        response.movieposter[i]
                                                            .url
                                                    )
                                                )
                                            }
                                        }
                                    }

                                    if (
                                        response.moviebackground &&
                                        response.moviebackground.length > 0
                                    ) {
                                        if (
                                            !summary.images.background ||
                                            summary.images.background.length ===
                                                0
                                        ) {
                                            summary.images.background = []
                                        }

                                        for (
                                            let i = 0;
                                            i < response.moviebackground.length;
                                            i++
                                        ) {
                                            summary.images.background.push(
                                                originalSize(
                                                    response.moviebackground[i]
                                                        .url
                                                )
                                            )
                                        }
                                    } else {
                                        throw new Error('error')
                                    }
                                    if (
                                        response.hdmovielogo &&
                                        response.hdmovielogo.length > 0
                                    ) {
                                        if (
                                            !summary.images.logo ||
                                            summary.images.logo.length === 0
                                        ) {
                                            summary.images.logo = []
                                        }

                                        for (
                                            let i = 0;
                                            i < response.hdmovielogo.length;
                                            i++
                                        ) {
                                            if (
                                                response.hdmovielogo[i].lang ===
                                                'en'
                                            ) {
                                                summary.images.logo.push(
                                                    originalSize(
                                                        response.hdmovielogo[i]
                                                            .url
                                                    )
                                                )
                                            }
                                        }
                                    }

                                    dbFunctions.img_cache.set([
                                        {
                                            traktid: summary.ids.trakt,
                                            mediatype: 'movie',
                                            poster: summary.images.poster,
                                            background:
                                                summary.images.background,
                                            logo: summary.images.logo
                                        }
                                    ])

                                    const end = new Date() - start
                                    const hrend = process.hrtime(hrstart)

                                    if (benchmark) {
                                        consola.info(
                                            'Execution time movies.banner, search new images: %dms',
                                            end
                                        )
                                        consola.info(
                                            'Execution time (hr): %ds %dms',
                                            hrend[0],
                                            hrend[1] / 1000000
                                        )
                                    }
                                    next()
                                })
                                .catch(() => {
                                    fanart.movies
                                        .get(summary.ids.tmdb)
                                        .then((response) => {
                                            if (
                                                response.movieposter &&
                                                response.movieposter.length > 0
                                            ) {
                                                if (
                                                    !summary.images.poster ||
                                                    summary.images.poster
                                                        .length === 0
                                                ) {
                                                    summary.images.poster = []
                                                }

                                                for (
                                                    let i = 0;
                                                    i <
                                                    response.movieposter.length;
                                                    i++
                                                ) {
                                                    if (
                                                        response.movieposter[i]
                                                            .lang === 'en'
                                                    ) {
                                                        summary.images.poster.push(
                                                            originalSize(
                                                                response
                                                                    .movieposter[
                                                                    i
                                                                ].url
                                                            )
                                                        )
                                                    }
                                                }
                                            }
                                            if (
                                                response.moviebackground &&
                                                response.moviebackground
                                                    .length > 0
                                            ) {
                                                if (
                                                    !summary.images
                                                        .background ||
                                                    summary.images.background
                                                        .length === 0
                                                ) {
                                                    summary.images.background = []
                                                }

                                                for (
                                                    let i = 0;
                                                    i <
                                                    response.moviebackground
                                                        .length;
                                                    i++
                                                ) {
                                                    summary.images.background.push(
                                                        originalSize(
                                                            response
                                                                .moviebackground[
                                                                i
                                                            ].url
                                                        )
                                                    )
                                                }
                                            } else {
                                                throw new Error('error')
                                            }
                                            if (
                                                response.hdmovielogo &&
                                                response.hdmovielogo.length > 0
                                            ) {
                                                if (
                                                    !summary.images.logo ||
                                                    summary.images.logo
                                                        .length === 0
                                                ) {
                                                    summary.images.logo = []
                                                }

                                                for (
                                                    let i = 0;
                                                    i <
                                                    response.hdmovielogo.length;
                                                    i++
                                                ) {
                                                    if (
                                                        response.hdmovielogo[i]
                                                            .lang === 'en'
                                                    ) {
                                                        summary.images.logo.push(
                                                            originalSize(
                                                                response
                                                                    .hdmovielogo[
                                                                    i
                                                                ].url
                                                            )
                                                        )
                                                    }
                                                }
                                            }

                                            dbFunctions.img_cache.set([
                                                {
                                                    traktid: summary.ids.trakt,
                                                    mediatype: 'movie',
                                                    poster:
                                                        summary.images.poster,
                                                    background:
                                                        summary.images
                                                            .background,
                                                    logo: summary.images.logo
                                                }
                                            ])

                                            const end = new Date() - start
                                            const hrend = process.hrtime(
                                                hrstart
                                            )

                                            if (benchmark) {
                                                consola.info(
                                                    'Execution time movies.banner, search new images: %dms',
                                                    end
                                                )
                                                consola.info(
                                                    'Execution time (hr): %ds %dms',
                                                    hrend[0],
                                                    hrend[1] / 1000000
                                                )
                                            }
                                            next()
                                        })
                                        .catch(() => {
                                            mdata.images
                                                .movie({
                                                    tmdb: summary.ids.tmdb
                                                        ? summary.ids.tmdb
                                                        : null,
                                                    tvdb: summary.ids.tvdb
                                                        ? summary.ids.tvdb
                                                        : null,
                                                    imdb: summary.ids.imdb
                                                        ? summary.ids.imdb
                                                        : null
                                                })
                                                .then((response, err) => {
                                                    if (response.poster) {
                                                        if (
                                                            !summary.images
                                                                .poster ||
                                                            summary.images
                                                                .poster
                                                                .length === 0
                                                        ) {
                                                            summary.images.poster = []
                                                        }

                                                        summary.images.poster.push(
                                                            originalSize(
                                                                response.poster
                                                            )
                                                        )
                                                    }
                                                    if (response.fanart) {
                                                        if (
                                                            !summary.images
                                                                .background ||
                                                            summary.images
                                                                .background
                                                                .length === 0
                                                        ) {
                                                            summary.images.background = []
                                                        }

                                                        summary.images.background.push(
                                                            originalSize(
                                                                response.fanart
                                                            )
                                                        )
                                                    }
                                                    dbFunctions.img_cache.set([
                                                        {
                                                            traktid:
                                                                summary.ids
                                                                    .trakt,
                                                            mediatype: 'movie',
                                                            poster:
                                                                summary.images
                                                                    .poster,
                                                            background:
                                                                summary.images
                                                                    .background
                                                        }
                                                    ])

                                                    next()
                                                })
                                                .catch(() => {
                                                    next()
                                                })
                                        })
                                })
                        } catch (err) {
                            consola.error(err)
                            next()
                        }
                    }
                    return new Promise((resolve, reject) => {
                        try {
                            dbFunctions.img_cache.getBULK(
                                [
                                    {
                                        traktid: summary.ids.trakt,
                                        mediatype: 'movie'
                                    }
                                ],
                                (error, sqlData) => {
                                    if (error) {
                                        downloadimages(() => resolve())
                                    } else if (sqlData[0]) {
                                        summary.images = {
                                            poster: sqlData[0].poster,
                                            background: sqlData[0].background,
                                            logo: sqlData[0].logo0
                                        }
                                        if (
                                            sqlData[0].background != null &&
                                            sqlData[0].logo != null
                                        ) {
                                            const end = new Date() - start
                                            const hrend = process.hrtime(
                                                hrstart
                                            )

                                            if (benchmark) {
                                                consola.info(
                                                    'Execution time movies.banner, get from database: %dms',
                                                    end
                                                )
                                                consola.info(
                                                    'Execution time (hr): %ds %dms',
                                                    hrend[0],
                                                    hrend[1] / 1000000
                                                )
                                            }
                                            resolve()
                                        } else {
                                            downloadimages(() => resolve())
                                        }
                                    } else {
                                        downloadimages(() => resolve())
                                    }
                                }
                            )
                        } catch (e) {
                            consola.error(e)
                        }
                    })
                },
                imagesBULK: (items) => {
                    const start = new Date()
                    const hrstart = process.hrtime()

                    function downloadimages(singleItem) {
                        if (!singleItem.images) {
                            singleItem.images = {}
                        }
                        return new Promise((resolve, reject) => {
                            try {
                                mdata.images
                                    .movie({
                                        tmdb: singleItem.ids.tmdb
                                            ? singleItem.ids.tmdb
                                            : null,
                                        tvdb: singleItem.ids.tvdb
                                            ? singleItem.ids.tvdb
                                            : null,
                                        imdb: singleItem.ids.imdb
                                            ? singleItem.ids.imdb
                                            : null
                                    })
                                    .then((response, err) => {
                                        if (response.poster) {
                                            singleItem.images.poster = []
                                            singleItem.images.poster.push(
                                                originalSize(response.poster)
                                            )
                                        }
                                        if (response.fanart) {
                                            singleItem.images.background = []
                                            singleItem.images.background.push(
                                                originalSize(response.fanart)
                                            )
                                        }
                                        dbFunctions.img_cache.set([
                                            {
                                                traktid: singleItem.ids.trakt,
                                                mediatype: 'movie',
                                                poster:
                                                    singleItem.images.poster,
                                                background:
                                                    singleItem.images.background
                                            }
                                        ])

                                        resolve()
                                    })
                                    .catch(() => {
                                        fanart.movies
                                            .get(singleItem.ids.imdb)
                                            .then((response) => {
                                                if (
                                                    response.movieposter &&
                                                    response.movieposter
                                                        .length > 0
                                                ) {
                                                    singleItem.images.poster = []
                                                    for (
                                                        let i = 0;
                                                        i <
                                                        response.movieposter
                                                            .length;
                                                        i++
                                                    ) {
                                                        if (
                                                            response
                                                                .movieposter[i]
                                                                .lang === 'en'
                                                        ) {
                                                            singleItem.images.poster.push(
                                                                originalSize(
                                                                    response
                                                                        .movieposter[
                                                                        i
                                                                    ].url
                                                                )
                                                            )
                                                        }
                                                    }
                                                } else {
                                                    throw new Error('error')
                                                }
                                                if (
                                                    response.moviebackground &&
                                                    response.moviebackground
                                                        .length > 0
                                                ) {
                                                    singleItem.images.background = []
                                                    for (
                                                        let i = 0;
                                                        i <
                                                        response.moviebackground
                                                            .length;
                                                        i++
                                                    ) {
                                                        singleItem.images.background.push(
                                                            originalSize(
                                                                response
                                                                    .moviebackground[
                                                                    i
                                                                ].url
                                                            )
                                                        )
                                                    }
                                                }
                                                if (
                                                    response.hdmovielogo &&
                                                    response.hdmovielogo
                                                        .length > 0
                                                ) {
                                                    singleItem.images.logo = []
                                                    for (
                                                        let i = 0;
                                                        i <
                                                        response.hdmovielogo
                                                            .length;
                                                        i++
                                                    ) {
                                                        if (
                                                            response
                                                                .hdmovielogo[i]
                                                                .lang === 'en'
                                                        ) {
                                                            singleItem.images.logo.push(
                                                                originalSize(
                                                                    response
                                                                        .hdmovielogo[
                                                                        i
                                                                    ].url
                                                                )
                                                            )
                                                        }
                                                    }
                                                }

                                                dbFunctions.img_cache.set([
                                                    {
                                                        traktid:
                                                            singleItem.ids
                                                                .trakt,
                                                        mediatype: 'movie',
                                                        poster:
                                                            singleItem.images
                                                                .poster,
                                                        background:
                                                            singleItem.images
                                                                .background,
                                                        logo:
                                                            singleItem.images
                                                                .logo
                                                    }
                                                ])

                                                resolve()

                                                const end = new Date() - start
                                                const hrend = process.hrtime(
                                                    hrstart
                                                )

                                                if (benchmark) {
                                                    consola.info(
                                                        'Execution time movies.imagesBULK, search new images: %dms',
                                                        end
                                                    )
                                                    consola.info(
                                                        'Execution time (hr): %ds %dms',
                                                        hrend[0],
                                                        hrend[1] / 1000000
                                                    )
                                                }
                                            })
                                            .catch(() => {
                                                fanart.movies
                                                    .get(singleItem.ids.tmdb)
                                                    .then((response) => {
                                                        if (
                                                            response.movieposter &&
                                                            response.movieposter
                                                                .length > 0
                                                        ) {
                                                            singleItem.images.poster = []
                                                            for (
                                                                let i = 0;
                                                                i <
                                                                response
                                                                    .movieposter
                                                                    .length;
                                                                i++
                                                            ) {
                                                                if (
                                                                    response
                                                                        .movieposter[
                                                                        i
                                                                    ].lang ===
                                                                    'en'
                                                                ) {
                                                                    singleItem.images.poster.push(
                                                                        originalSize(
                                                                            response
                                                                                .movieposter[
                                                                                i
                                                                            ]
                                                                                .url
                                                                        )
                                                                    )
                                                                }
                                                            }
                                                        } else {
                                                            throw new Error(
                                                                'error'
                                                            )
                                                        }
                                                        if (
                                                            response.moviebackground &&
                                                            response
                                                                .moviebackground
                                                                .length > 0
                                                        ) {
                                                            singleItem.images.background = []
                                                            for (
                                                                let i = 0;
                                                                i <
                                                                response
                                                                    .moviebackground
                                                                    .length;
                                                                i++
                                                            ) {
                                                                singleItem.images.background.push(
                                                                    originalSize(
                                                                        response
                                                                            .moviebackground[
                                                                            i
                                                                        ].url
                                                                    )
                                                                )
                                                            }
                                                        }
                                                        if (
                                                            response.hdmovielogo &&
                                                            response.hdmovielogo
                                                                .length > 0
                                                        ) {
                                                            singleItem.images.logo = []
                                                            for (
                                                                let i = 0;
                                                                i <
                                                                response
                                                                    .hdmovielogo
                                                                    .length;
                                                                i++
                                                            ) {
                                                                if (
                                                                    response
                                                                        .hdmovielogo[
                                                                        i
                                                                    ].lang ===
                                                                    'en'
                                                                ) {
                                                                    singleItem.images.logo.push(
                                                                        originalSize(
                                                                            response
                                                                                .hdmovielogo[
                                                                                i
                                                                            ]
                                                                                .url
                                                                        )
                                                                    )
                                                                }
                                                            }
                                                        }

                                                        dbFunctions.img_cache.set(
                                                            [
                                                                {
                                                                    traktid:
                                                                        singleItem
                                                                            .ids
                                                                            .trakt,
                                                                    mediatype:
                                                                        'movie',
                                                                    poster:
                                                                        singleItem
                                                                            .images
                                                                            .poster,
                                                                    background:
                                                                        singleItem
                                                                            .images
                                                                            .background,
                                                                    logo:
                                                                        singleItem
                                                                            .images
                                                                            .logo
                                                                }
                                                            ]
                                                        )

                                                        resolve()

                                                        const end =
                                                            new Date() - start
                                                        const hrend = process.hrtime(
                                                            hrstart
                                                        )

                                                        if (benchmark) {
                                                            consola.info(
                                                                'Execution time movies.imagesBULK, search new images: %dms',
                                                                end
                                                            )
                                                            consola.info(
                                                                'Execution time (hr): %ds %dms',
                                                                hrend[0],
                                                                hrend[1] /
                                                                    1000000
                                                            )
                                                        }
                                                    })
                                                    .catch(() => {
                                                        resolve()
                                                    })
                                            })
                                    })
                            } catch (err) {
                                consola.error(err)
                                resolve()
                            }
                        })
                    }
                    return new Promise((resolve, reject) => {
                        try {
                            const BULKarray = []
                            for (let i = 0; i < items.length; i++) {
                                BULKarray.push({
                                    traktid: items[i].ids.trakt,
                                    mediatype: 'movie'
                                })
                            }
                            dbFunctions.img_cache.getBULK(
                                BULKarray,
                                async (error, sqlData) => {
                                    const promises = []
                                    if (error) {
                                        for (let i = 0; i < items.length; i++) {
                                            promises.push(
                                                downloadimages(items[i])
                                            )
                                        }
                                    } else if (sqlData.length > 0) {
                                        for (let i = 0; i < items.length; i++) {
                                            let inSqlData = false
                                            for (
                                                let j = 0;
                                                j < sqlData.length;
                                                j++
                                            ) {
                                                if (
                                                    items[i].ids.trakt ===
                                                    sqlData[j].traktid
                                                ) {
                                                    inSqlData = true
                                                    if (
                                                        sqlData[j].poster !=
                                                        null
                                                    ) {
                                                        items[i].images = {
                                                            poster:
                                                                sqlData[j]
                                                                    .poster,
                                                            background:
                                                                sqlData[j]
                                                                    .background,
                                                            logo:
                                                                sqlData[j].logo
                                                        }
                                                    } else {
                                                        promises.push(
                                                            downloadimages(
                                                                items[i]
                                                            )
                                                        )
                                                    }
                                                }
                                            }
                                            if (!inSqlData) {
                                                promises.push(
                                                    downloadimages(items[i])
                                                )
                                            }
                                        }
                                    } else {
                                        for (let i = 0; i < items.length; i++) {
                                            promises.push(
                                                downloadimages(items[i])
                                            )
                                        }
                                    }
                                    await Promise.all(promises)
                                    resolve()
                                }
                            )
                        } catch (e) {
                            consola.error(e)
                        }
                    })
                }
            },
            shows: {
                summary: showSummary,
                watchlist: (uuid, page, lastID) => {
                    return new Promise((resolve, reject) => {
                        const newItems = {
                            items: []
                        }
                        dbFunctions.user.watchlist(
                            'show',
                            uuid,
                            pageSize,
                            lastID,
                            (response) => {
                                const promises = []
                                for (let i = 0; i < response.length; i++) {
                                    promises.push(
                                        showSummary(response[i].traktid)
                                    )
                                }

                                Promise.all(promises).then((results) => {
                                    for (let i = 0; i < results.length; i++) {
                                        newItems.items[i] = results[i].data
                                    }

                                    newItems.pagination = {
                                        item_count: response.length,
                                        page,
                                        page_count:
                                            response.length === pageSize
                                                ? null
                                                : page,
                                        lastID:
                                            response.length > 0
                                                ? response[response.length - 1]
                                                      .id
                                                : null
                                    }
                                    resolve(newItems)
                                })
                            }
                        )
                    })
                },
                episode: (traktID, season, episode) => {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const result = await Trakt.client.cached.episodes.summary(
                                {
                                    extended: 'full',
                                    id: traktID,
                                    season,
                                    episode
                                }
                            )
                            resolve(result)
                        } catch (err) {
                            reject(err)
                        }
                    })
                },
                episodes: (traktID) => {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const results = await Trakt.client.cached.seasons.summary(
                                {
                                    id: traktID,
                                    extended: 'episodes'
                                }
                            )

                            // extras to last
                            if (results.data[0].number === 0) {
                                results.data.push(results.data.splice(0, 1)[0])
                            }

                            resolve(results)
                        } catch (err) {
                            reject(err)
                        }
                    })
                },
                recommended: (page) => {
                    return new Promise(async (resolve, reject) => {
                        const recommended = await Trakt.client.cached.recommendations.shows.get(
                            {
                                extended: 'full',
                                username: 'me',
                                page,
                                limit: pageSize
                            }
                        )
                        resolve(recommended)
                    })
                },
                trending: (page) => {
                    return new Promise(async (resolve, reject) => {
                        const items = await Trakt.client.cached.shows.trending({
                            extended: 'full',
                            page,
                            limit: pageSize
                        })
                        const newItems = {
                            items: []
                        }
                        for (let i = 0; i < items.data.length; i++) {
                            newItems.items[i] = items.data[i].show
                        }
                        newItems.pagination = {
                            item_count: parseInt(
                                items.pagination['item-count']
                            ),
                            limit: items.pagination.limit,
                            page: items.pagination.page,
                            page_count: parseInt(items.pagination['page-count'])
                        }
                        resolve(newItems)
                    })
                },
                popular: (page) => {
                    return new Promise(async (resolve, reject) => {
                        const items = await Trakt.client.cached.shows.popular({
                            extended: 'full',
                            page,
                            limit: pageSize
                        })
                        const newItems = {
                            items: []
                        }
                        for (let i = 0; i < items.data.length; i++) {
                            newItems.items[i] = items.data[i]
                        }
                        newItems.pagination = {
                            item_count: parseInt(
                                items.pagination['item-count']
                            ),
                            limit: items.pagination.limit,
                            page: items.pagination.page,
                            page_count: parseInt(items.pagination['page-count'])
                        }
                        resolve(newItems)
                    })
                },
                anticipated: (page) => {
                    return new Promise(async (resolve, reject) => {
                        const anticipated = await Trakt.client.cached.shows.anticipated(
                            {
                                extended: 'full',
                                page,
                                limit: pageSize,
                                'system:tll': 3600 * 24
                            }
                        )
                        resolve(anticipated)
                    })
                },
                search: (page, query) => {
                    return new Promise(async (resolve, reject) => {
                        const items = await Trakt.client.cached.search.text({
                            extended: 'full',
                            type: 'show',
                            query,
                            page,
                            limit: pageSize
                        })
                        const newItems = {
                            items: []
                        }
                        for (let i = 0; i < items.data.length; i++) {
                            newItems.items[i] = items.data[i].show
                        }
                        newItems.pagination = {
                            item_count: parseInt(
                                items.pagination['item-count']
                            ),
                            limit: items.pagination.limit,
                            page: items.pagination.page,
                            page_count: parseInt(items.pagination['page-count'])
                        }
                        resolve(newItems)
                    })
                },
                images: (summary) => {
                    const start = new Date()
                    const hrstart = process.hrtime()
                    function downloadimages(next) {
                        try {
                            if (!summary.images) {
                                summary.images = {}
                            }
                            fanart.shows
                                .get(summary.ids.tvdb)
                                .then((response) => {
                                    if (
                                        response.tvposter &&
                                        response.tvposter.length > 0
                                    ) {
                                        if (
                                            !summary.images.poster ||
                                            summary.images.poster.length === 0
                                        ) {
                                            summary.images.poster = []
                                        }

                                        for (
                                            let i = 0;
                                            i < response.tvposter.length;
                                            i++
                                        ) {
                                            if (
                                                response.tvposter[i].lang ===
                                                'en'
                                            ) {
                                                summary.images.poster.push(
                                                    originalSize(
                                                        response.tvposter[i].url
                                                    )
                                                )
                                            }
                                        }
                                    }
                                    if (
                                        response.showbackground &&
                                        response.showbackground.length > 0
                                    ) {
                                        if (
                                            !summary.images.background ||
                                            summary.images.background.length ===
                                                0
                                        ) {
                                            summary.images.background = []
                                        }

                                        for (
                                            let i = 0;
                                            i < response.showbackground.length;
                                            i++
                                        ) {
                                            summary.images.background.push(
                                                originalSize(
                                                    response.showbackground[i]
                                                        .url
                                                )
                                            )
                                        }
                                    } else {
                                        throw new Error('error')
                                    }
                                    if (
                                        response.hdtvlogo &&
                                        response.hdtvlogo.length > 0
                                    ) {
                                        if (
                                            !summary.images.logo ||
                                            summary.images.logo.length === 0
                                        ) {
                                            summary.images.logo = []
                                        }

                                        for (
                                            let i = 0;
                                            i < response.hdtvlogo.length;
                                            i++
                                        ) {
                                            if (
                                                response.hdtvlogo[i].lang ===
                                                'en'
                                            ) {
                                                summary.images.logo.push(
                                                    originalSize(
                                                        response.hdtvlogo[i].url
                                                    )
                                                )
                                            }
                                        }
                                    }

                                    dbFunctions.img_cache.set([
                                        {
                                            traktid: summary.ids.trakt,
                                            mediatype: 'show',
                                            poster: summary.images.poster,
                                            background:
                                                summary.images.background,
                                            logo: summary.images.logo
                                        }
                                    ])

                                    const end = new Date() - start
                                    const hrend = process.hrtime(hrstart)

                                    if (benchmark) {
                                        consola.info(
                                            'Execution time shows.banner, search new images: %dms',
                                            end
                                        )
                                        consola.info(
                                            'Execution time (hr): %ds %dms',
                                            hrend[0],
                                            hrend[1] / 1000000
                                        )
                                    }

                                    next()
                                })
                                .catch(() => {
                                    mdata.images
                                        .show({
                                            tmdb: summary.ids.tmdb
                                                ? summary.ids.tmdb
                                                : null,
                                            tvdb: summary.ids.tvdb
                                                ? summary.ids.tvdb
                                                : null,
                                            imdb: summary.ids.imdb
                                                ? summary.ids.imdb
                                                : null
                                        })
                                        .then((response, err) => {
                                            if (response.poster) {
                                                if (
                                                    !summary.images.poster ||
                                                    summary.images.poster
                                                        .length === 0
                                                ) {
                                                    summary.images.poster = []
                                                }

                                                summary.images.poster.push(
                                                    originalSize(
                                                        response.poster
                                                    )
                                                )
                                            }
                                            if (response.fanart) {
                                                if (
                                                    !summary.images
                                                        .background ||
                                                    summary.images.background
                                                        .length === 0
                                                ) {
                                                    summary.images.background = []
                                                }

                                                summary.images.background.push(
                                                    originalSize(
                                                        response.fanart
                                                    )
                                                )
                                            }
                                            dbFunctions.img_cache.set([
                                                {
                                                    traktid: summary.ids.trakt,
                                                    mediatype: 'show',
                                                    poster:
                                                        summary.images.poster,
                                                    background:
                                                        summary.images
                                                            .background
                                                }
                                            ])

                                            next()
                                        })
                                        .catch(() => {
                                            next()
                                        })
                                })
                        } catch (err) {
                            consola.error(err)
                            next()
                        }
                    }
                    return new Promise((resolve, reject) => {
                        try {
                            dbFunctions.img_cache.getBULK(
                                [
                                    {
                                        traktid: summary.ids.trakt,
                                        mediatype: 'show'
                                    }
                                ],
                                (error, sqlData) => {
                                    if (error) {
                                        downloadimages(() => resolve())
                                    } else if (sqlData[0]) {
                                        if (
                                            sqlData[0].background != null &&
                                            sqlData[0].logo != null
                                        ) {
                                            summary.images = {
                                                poster: sqlData[0].poster,
                                                background:
                                                    sqlData[0].background,
                                                logo: sqlData[0].logo
                                            }

                                            const end = new Date() - start
                                            const hrend = process.hrtime(
                                                hrstart
                                            )

                                            if (benchmark) {
                                                consola.info(
                                                    'Execution time shows.banner, get from database: %dms',
                                                    end
                                                )
                                                consola.info(
                                                    'Execution time (hr): %ds %dms',
                                                    hrend[0],
                                                    hrend[1] / 1000000
                                                )
                                            }
                                            resolve()
                                        } else {
                                            downloadimages(() => resolve())
                                        }
                                    } else {
                                        downloadimages(() => resolve())
                                    }
                                }
                            )
                        } catch (e) {
                            consola.error(e)
                        }
                    })
                },
                imagesBULK: (items) => {
                    const start = new Date()
                    const hrstart = process.hrtime()

                    function downloadimages(singleItem) {
                        if (!singleItem.images) {
                            singleItem.images = {}
                        }
                        return new Promise((resolve, reject) => {
                            try {
                                mdata.images
                                    .show({
                                        tmdb: singleItem.ids.tmdb
                                            ? singleItem.ids.tmdb
                                            : null,
                                        tvdb: singleItem.ids.tvdb
                                            ? singleItem.ids.tvdb
                                            : null,
                                        imdb: singleItem.ids.imdb
                                            ? singleItem.ids.imdb
                                            : null
                                    })
                                    .then((response, err) => {
                                        if (response.poster) {
                                            singleItem.images.poster = []
                                            singleItem.images.poster.push(
                                                originalSize(response.poster)
                                            )
                                        }
                                        if (response.fanart) {
                                            singleItem.images.background = []
                                            singleItem.images.background.push(
                                                originalSize(response.fanart)
                                            )
                                        }
                                        dbFunctions.img_cache.set([
                                            {
                                                traktid: singleItem.ids.trakt,
                                                mediatype: 'show',
                                                poster:
                                                    singleItem.images.poster,
                                                background:
                                                    singleItem.images.background
                                            }
                                        ])

                                        resolve()
                                    })
                                    .catch(() => {
                                        fanart.shows
                                            .get(singleItem.ids.tvdb)
                                            .then((response) => {
                                                if (
                                                    response.tvposter &&
                                                    response.tvposter.length > 0
                                                ) {
                                                    singleItem.images.poster = []
                                                    for (
                                                        let i = 0;
                                                        i <
                                                        response.tvposter
                                                            .length;
                                                        i++
                                                    ) {
                                                        if (
                                                            response.tvposter[i]
                                                                .lang === 'en'
                                                        ) {
                                                            singleItem.images.poster.push(
                                                                originalSize(
                                                                    response
                                                                        .tvposter[
                                                                        i
                                                                    ].url
                                                                )
                                                            )
                                                        }
                                                    }
                                                } else {
                                                    throw new Error('error')
                                                }
                                                if (
                                                    response.showbackground &&
                                                    response.showbackground
                                                        .length > 0
                                                ) {
                                                    singleItem.images.background = []
                                                    for (
                                                        let i = 0;
                                                        i <
                                                        response.showbackground
                                                            .length;
                                                        i++
                                                    ) {
                                                        singleItem.images.background.push(
                                                            originalSize(
                                                                response
                                                                    .showbackground[
                                                                    i
                                                                ].url
                                                            )
                                                        )
                                                    }
                                                }
                                                if (
                                                    response.hdtvlogo &&
                                                    response.hdtvlogo.length > 0
                                                ) {
                                                    singleItem.images.logo = []
                                                    for (
                                                        let i = 0;
                                                        i <
                                                        response.hdtvlogo
                                                            .length;
                                                        i++
                                                    ) {
                                                        if (
                                                            response.hdtvlogo[i]
                                                                .lang === 'en'
                                                        ) {
                                                            singleItem.images.logo.push(
                                                                originalSize(
                                                                    response
                                                                        .hdtvlogo[
                                                                        i
                                                                    ].url
                                                                )
                                                            )
                                                        }
                                                    }
                                                }

                                                dbFunctions.img_cache.set([
                                                    {
                                                        traktid:
                                                            singleItem.ids
                                                                .trakt,
                                                        mediatype: 'show',
                                                        poster:
                                                            singleItem.images
                                                                .poster,
                                                        background:
                                                            singleItem.images
                                                                .background,
                                                        logo:
                                                            singleItem.images
                                                                .logo
                                                    }
                                                ])

                                                resolve()

                                                const end = new Date() - start
                                                const hrend = process.hrtime(
                                                    hrstart
                                                )

                                                if (benchmark) {
                                                    consola.info(
                                                        'Execution time shows.imagesBULK, search new images: %dms',
                                                        end
                                                    )
                                                    consola.info(
                                                        'Execution time (hr): %ds %dms',
                                                        hrend[0],
                                                        hrend[1] / 1000000
                                                    )
                                                }
                                            })
                                            .catch(() => {
                                                resolve()
                                            })
                                    })
                            } catch (err) {
                                consola.error(err)
                                resolve()
                            }
                        })
                    }
                    return new Promise((resolve, reject) => {
                        try {
                            const BULKarray = []
                            for (let i = 0; i < items.length; i++) {
                                BULKarray.push({
                                    traktid: items[i].ids.trakt,
                                    mediatype: 'show'
                                })
                            }
                            dbFunctions.img_cache.getBULK(
                                BULKarray,
                                async (error, sqlData) => {
                                    const promises = []
                                    if (error) {
                                        for (let i = 0; i < items.length; i++) {
                                            promises.push(
                                                downloadimages(items[i])
                                            )
                                        }
                                    } else if (sqlData.length > 0) {
                                        for (let i = 0; i < items.length; i++) {
                                            let inSqlData = false
                                            for (
                                                let j = 0;
                                                j < sqlData.length;
                                                j++
                                            ) {
                                                if (
                                                    items[i].ids.trakt ===
                                                    sqlData[j].traktid
                                                ) {
                                                    inSqlData = true
                                                    if (
                                                        sqlData[j].poster !=
                                                        null
                                                    ) {
                                                        items[i].images = {
                                                            poster:
                                                                sqlData[j]
                                                                    .poster,
                                                            background:
                                                                sqlData[j]
                                                                    .background,
                                                            logo:
                                                                sqlData[j].logo
                                                        }
                                                    } else {
                                                        promises.push(
                                                            downloadimages(
                                                                items[i]
                                                            )
                                                        )
                                                    }
                                                }
                                            }
                                            if (!inSqlData) {
                                                promises.push(
                                                    downloadimages(items[i])
                                                )
                                            }
                                        }
                                    } else {
                                        for (let i = 0; i < items.length; i++) {
                                            promises.push(
                                                downloadimages(items[i])
                                            )
                                        }
                                    }
                                    await Promise.all(promises)
                                    resolve()
                                }
                            )
                        } catch (e) {
                            consola.error(e)
                        }
                    })
                },
                episodeImages: (summary, tmdbid, season, episode) => {
                    const start = new Date()
                    const hrstart = process.hrtime()

                    function downloadimages(next) {
                        try {
                            summary.images = {}
                            tmdb.tvEpisodeImages({
                                id: tmdbid || null,
                                season_number: season,
                                episode_number: episode
                            })
                                .then((response, err) => {
                                    if (response.body.stills.length > 0) {
                                        summary.images.background = []
                                        for (
                                            let i = 0;
                                            i < response.body.stills.length;
                                            i++
                                        ) {
                                            summary.images.background.push(
                                                'https://image.tmdb.org/t/p/original' +
                                                    response.body.stills[i]
                                                        .file_path
                                            )
                                        }
                                    }

                                    dbFunctions.img_cache.set([
                                        {
                                            traktid: summary.ids.trakt,
                                            mediatype: 'episode',
                                            background:
                                                summary.images.background
                                        }
                                    ])

                                    const end = new Date() - start
                                    const hrend = process.hrtime(hrstart)

                                    if (benchmark) {
                                        consola.info(
                                            'Execution time episode.background, search new images: %dms',
                                            end
                                        )
                                        consola.info(
                                            'Execution time (hr): %ds %dms',
                                            hrend[0],
                                            hrend[1] / 1000000
                                        )
                                    }
                                    next()
                                })
                                .catch((err) => {
                                    consola.error(err)
                                    next()
                                })
                        } catch (err) {
                            consola.error(err)
                            next()
                        }
                    }
                    return new Promise((resolve, reject) => {
                        try {
                            dbFunctions.img_cache.getBULK(
                                [
                                    {
                                        traktid: summary.ids.trakt,
                                        mediatype: 'episode'
                                    }
                                ],
                                (error, sqlData) => {
                                    if (error) {
                                        downloadimages(() => resolve())
                                    } else if (sqlData[0]) {
                                        if (sqlData[0].background != null) {
                                            summary.images = {
                                                background:
                                                    sqlData[0].background
                                            }

                                            const end = new Date() - start
                                            const hrend = process.hrtime(
                                                hrstart
                                            )

                                            if (benchmark) {
                                                consola.info(
                                                    'Execution time episode.background, get from database: %dms',
                                                    end
                                                )
                                                consola.info(
                                                    'Execution time (hr): %ds %dms',
                                                    hrend[0],
                                                    hrend[1] / 1000000
                                                )
                                            }
                                            resolve()
                                        } else {
                                            downloadimages(() => resolve())
                                        }
                                    } else {
                                        downloadimages(() => resolve())
                                    }
                                }
                            )
                        } catch (e) {
                            consola.error(e)
                        }
                    })
                }
            }
        }
    }

    return functions
}
