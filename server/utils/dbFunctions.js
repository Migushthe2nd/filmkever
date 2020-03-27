const consola = require('consola')

module.exports = (pgp, db) => {
    return {
        user: {
            watch_data: {
                get: async (traktID, mediatype, uuid, callback) => {
                    try {
                        const results = await db.any(
                            `
                            SELECT *, (time_watched IS NOT NULL) as finished
                            FROM users_watch_data
                            WHERE uuid = $1 AND mediatype = $2 AND traktid = $3
                        `,
                            [uuid, mediatype, traktID]
                        )
                        if (results) {
                            callback(null, results)
                        } else {
                            callback(null, [])
                        }
                    } catch (error) {
                        consola.error(error)
                    }
                },
                getMovieBULK: async (items, uuid, callback) => {
                    try {
                        const cs = new pgp.helpers.ColumnSet(
                            ['uuid', 'traktid', 'mediatype'],
                            {
                                table: 'users_watch_data'
                            }
                        )

                        const values = []
                        for (let i = 0; i < items.length; i++) {
                            values.push({
                                uuid,
                                traktid: items[i].ids.trakt,
                                mediatype: 'movie'
                            })
                        }

                        const query = () => pgp.helpers.values(values, cs)

                        const results = await db.any(`
                                SELECT rows.*, (rows.time_watched IS NOT NULL) as finished
                                FROM users_watch_data rows
                                JOIN ( 
                                    values${query()}
                                ) AS l(uuid, traktid, mediatype) ON l.uuid::uuid = rows.uuid AND l.traktid = rows.traktid AND l.mediatype = rows.mediatype
                                ORDER BY time_modified DESC;
                            `)
                        if (results) {
                            callback(null, results)
                        } else {
                            callback(null, [])
                        }
                    } catch (error) {
                        consola.error(error)
                    }
                },
                getShowBULK: async (items, uuid, callback) => {
                    try {
                        const csEpisodes = new pgp.helpers.ColumnSet(
                            ['showid'],
                            {
                                table: 'trakt_episodes'
                            }
                        )

                        const valuesEpisodes = []
                        for (let i = 0; i < items.length; i++) {
                            valuesEpisodes.push({
                                showid: items[i].ids.trakt
                            })
                        }

                        const queryEpisodes = () =>
                            pgp.helpers.values(valuesEpisodes, csEpisodes)

                        const episodes = await db.any(
                            `
                            SELECT rows.showid, rows.traktid, rows.season, rows.episode_number
                            FROM trakt_episodes rows
                            JOIN ( 
                                values${queryEpisodes()}
                            ) AS l(showid) ON l.showid = rows.showid;
                        `
                        )

                        if (episodes.length > 0) {
                            const cs = new pgp.helpers.ColumnSet(
                                [
                                    'uuid',
                                    'traktid',
                                    'showid',
                                    'mediatype',
                                    'season',
                                    'episode_number'
                                ],
                                {
                                    table: 'users_watch_data'
                                }
                            )

                            const values = []
                            for (let i = 0; i < episodes.length; i++) {
                                values.push({
                                    uuid,
                                    traktid: episodes[i].traktid,
                                    showid: episodes[i].showid,
                                    mediatype: 'episode',
                                    season: episodes[i].season,
                                    episode_number: episodes[i].episode_number
                                })
                            }

                            const query = () => pgp.helpers.values(values, cs)

                            const results = await db.any(`
                                SELECT rows.*, l.showid, l.season, l.episode_number, (rows.time_watched IS NOT NULL) as finished
                                FROM users_watch_data rows
                                JOIN ( 
                                    values${query()}
                                ) AS l(uuid, traktid, showid, mediatype, season, episode_number) ON l.uuid::uuid = rows.uuid AND l.traktid = rows.traktid AND l.mediatype = rows.mediatype
                                ORDER BY time_modified DESC;
                            `)
                            if (results) {
                                callback(null, results)
                            } else {
                                callback(null, [])
                            }
                        } else {
                            callback(null, [])
                        }
                    } catch (error) {
                        consola.error(error)
                    }
                },
                set: async (
                    uuid,
                    mediatype,
                    traktID,
                    finished,
                    length,
                    position,
                    callback
                ) => {
                    try {
                        let timeWatched = null
                        if (finished) {
                            timeWatched = Date.now()
                        }
                        if (finished === false) {
                            const results = await db.none(
                                `
                                DELETE FROM users_watch_data 
                                WHERE uuid = $1 AND mediatype = $2 AND traktid = $3;
                            `,
                                [uuid, mediatype, traktID]
                            )
                            callback(results)
                        } else {
                            const results = await db.none(
                                `
                                INSERT INTO users_watch_data (uuid, mediatype, traktid, time_modified, time_watched, length, position)
                                SELECT $1, $2, $3, NOW(), NULL, $5, $6
                                WHERE NOT EXISTS (SELECT 1 FROM users_watch_data WHERE uuid = $1 AND mediatype = $2 AND traktid = $3 AND time_watched IS NULL);
    
                                UPDATE users_watch_data
                                SET    time_modified = NOW(), time_watched = to_timestamp($4/1000), length = $5, position = $6
                                WHERE  uuid = $1 AND mediatype = $2 AND traktid = $3 AND time_watched IS NULL;
                            `,
                                [
                                    uuid,
                                    mediatype,
                                    traktID,
                                    timeWatched,
                                    length,
                                    position
                                ]
                            )
                            callback(results)
                        }
                    } catch (error) {
                        consola.error(error)
                    }
                },
                episodes: {
                    get: async (seasons, uuid, callback) => {
                        const cs = new pgp.helpers.ColumnSet(
                            ['uuid', 'traktid', 'mediatype'],
                            {
                                table: 'users_watch_data'
                            }
                        )
                        const values = []
                        for (let i = 0; i < seasons.length; i++) {
                            for (
                                let j = 0;
                                j < seasons[i].episodes.length;
                                j++
                            ) {
                                values.push({
                                    uuid,
                                    traktid: seasons[i].episodes[j].ids.trakt,
                                    mediatype: 'episode'
                                })
                            }
                        }

                        const query = () => pgp.helpers.values(values, cs)
                        try {
                            const results = await db.any(`
                                SELECT rows.*, (rows.time_watched IS NOT NULL) as finished
                                FROM users_watch_data rows
                                JOIN ( 
                                    values${query()}
                                ) AS l(uuid, traktid, mediatype) ON l.uuid::uuid = rows.uuid AND l.traktid = rows.traktid AND l.mediatype = rows.mediatype
                                ORDER BY time_modified DESC;
                            `)
                            if (results) {
                                callback(null, results)
                            } else {
                                callback(null, [])
                            }
                        } catch (error) {
                            consola.error(error)
                        }
                    }
                }
            },
            watchlist: async (mediatype, uuid, pageSize, lastID, callback) => {
                try {
                    const results = await db.any(
                        `
                        SELECT traktID, id
                        FROM users_watchlist_data
                        WHERE uuid = $1 AND mediatype = $2 AND id > $4
                        ORDER BY time_added DESC
                        LIMIT $3
                    `,
                        [uuid, mediatype, pageSize, lastID || 0]
                    )
                    if (results) {
                        callback(results)
                    } else {
                        callback(null)
                    }
                } catch (error) {
                    consola.error(error)
                }
            },
            watchlist_data: {
                get: async (traktID, mediatype, uuid, callback) => {
                    try {
                        const results = await db.oneOrNone(
                            `
                            SELECT *, (time_added IS NOT NULL) as added
                            FROM users_watchlist_data
                            WHERE uuid = $1 AND mediatype = $2 AND traktid = $3
                        `,
                            [uuid, mediatype, traktID]
                        )
                        if (results) {
                            callback(null, results)
                        } else {
                            callback(null, null)
                        }
                    } catch (error) {
                        consola.error(error)
                    }
                },
                getBULK: async (items, mediatype, uuid, callback) => {
                    try {
                        const cs = new pgp.helpers.ColumnSet(
                            ['uuid', 'traktid', 'mediatype'],
                            {
                                table: 'users_watchlist_data'
                            }
                        )

                        const values = []
                        for (let i = 0; i < items.length; i++) {
                            values.push({
                                uuid,
                                traktid: items[i].ids.trakt,
                                mediatype
                            })
                        }

                        const query = () => pgp.helpers.values(values, cs)
                        const results = await db.any(
                            `
                            SELECT rows.*, (rows.time_added IS NOT NULL) as added
                            FROM users_watchlist_data rows
                            JOIN ( 
                                values${query()}
                            ) AS l(uuid, traktid, mediatype) ON l.uuid::uuid = rows.uuid AND l.traktid = rows.traktid AND l.mediatype = rows.mediatype;
                        `
                        )
                        if (results) {
                            callback(null, results)
                        } else {
                            callback(null, [])
                        }
                    } catch (error) {
                        consola.error(error)
                    }
                },
                set: async (uuid, mediatype, traktID, state, callback) => {
                    try {
                        if (state === false) {
                            const results = await db.none(
                                `
                                DELETE FROM users_watchlist_data 
                                WHERE uuid = $1 AND mediatype = $2 AND traktid = $3;
                            `,
                                [uuid, mediatype, traktID]
                            )
                            callback(results)
                        } else {
                            const results = await db.none(
                                `
                                INSERT INTO users_watchlist_data (uuid, mediatype, traktid, time_added)
                                VALUES ($1, $2, $3, NOW())
                                ON CONFLICT DO NOTHING
                            `,
                                [uuid, mediatype, traktID]
                            )
                            callback(results)
                        }
                    } catch (error) {
                        consola.error(error)
                    }
                }
            }
        },
        img_cache: {
            getBULK: async (bulkvalues, callback) => {
                const cs = new pgp.helpers.ColumnSet(['traktid', 'mediatype'], {
                    table: 'img_cache'
                })
                const values = []
                for (let i = 0; i < bulkvalues.length; i++) {
                    values.push({
                        traktid: bulkvalues[i].traktid,
                        mediatype: bulkvalues[i].mediatype
                    })
                }

                const query = () => pgp.helpers.values(values, cs)
                try {
                    const results = await db.any(`
                        SELECT rows.*
                        FROM img_cache rows
                        JOIN ( 
                            values${query()}
                        ) AS l(traktid, mediatype) ON l.traktid = rows.traktid AND l.mediatype = rows.mediatype;
                    `)
                    if (results) {
                        callback(null, results)
                    } else {
                        callback(null, [])
                    }
                } catch (error) {
                    consola.error(error)
                }
            },
            set: (bulkvalues) => {
                try {
                    const cs = new pgp.helpers.ColumnSet(
                        [
                            'traktid',
                            'mediatype',
                            'poster',
                            'background',
                            'logo'
                        ],
                        {
                            table: 'img_cache'
                        }
                    )
                    const values = []
                    for (let i = 0; i < bulkvalues.length; i++) {
                        values.push({
                            traktid: bulkvalues[i].traktid,
                            mediatype: bulkvalues[i].mediatype,
                            poster: bulkvalues[i].poster,
                            background: bulkvalues[i].background,
                            logo: bulkvalues[i].logo
                        })
                    }
                    const query = () =>
                        pgp.helpers.insert(values, cs) +
                        ` ON CONFLICT (traktid, mediatype) DO UPDATE
                            SET poster = excluded.poster,
                                background = excluded.background,
                                logo = excluded.logo
                        `
                    db.none(query)
                } catch (error) {
                    consola.error(error)
                }
            }
        },
        shows: {
            set: (seasons, traktID, tmdbID) => {
                const cs = new pgp.helpers.ColumnSet(
                    [
                        'traktid',
                        'showid',
                        'season',
                        'episode',
                        'tmdbid',
                        'episode_number'
                    ],
                    {
                        table: 'trakt_episodes'
                    }
                )

                const values = []
                let episodeNumber = null
                for (let s = 0; s < seasons.length; s++) {
                    for (let e = 0; e < seasons[s].episodes.length; e++) {
                        if (seasons[s].number !== 0) {
                            episodeNumber++
                        }
                        values.push({
                            traktid: seasons[s].episodes[e].ids.trakt,
                            showid: traktID,
                            season: seasons[s].number,
                            episode: seasons[s].episodes[e].number,
                            tmdbid: tmdbID,
                            episode_number:
                                seasons[s].number !== 0 ? episodeNumber : null
                        })
                    }
                }

                function upsertReplaceQuery(values, cs) {
                    return (
                        pgp.helpers.insert(values, cs) +
                        ' ON CONFLICT(traktid) DO UPDATE SET ' +
                        cs.assignColumns({ from: 'EXCLUDED', skip: 'traktid' })
                    )
                }
                // const query = () =>
                //     pgp.helpers.insert(values, cs) + ' ON CONFLICT DO NOTHING'
                db.none(upsertReplaceQuery(values, cs))
            }
        }
    }
}
