const Metadata = {
    Query: {
        fields: {
            me: {
                where: (table, empty, uuid) => `${table}.uuid = '${uuid}'`
            }
            // watch_data: {
            //     where: (table, empty, uuid, mediatype, traktid) =>
            //         `${table}.uuid = '${uuid}' AND ${table}.mediatype = '${mediatype}' AND ${table}.traktid = '${traktid}'`
            // },
            // watchlist_data: {
            //     where: (table, empty, uuid, mediatype, traktid) =>
            //         `${table}.uuid = '${uuid}' AND ${table}.mediatype = '${mediatype}' AND ${table}.traktid = '${traktid}'`
            // }
        }
    },
    User: {
        sqlTable: 'users',
        uniqueKey: 'uuid'
    },
    UserInfo: {
        sqlTable: 'users',
        uniqueKey: 'uuid'
    },
    UserWatchData: {
        sqlTable: 'users_watch_data',
        uniqueKey: ['uuid', 'mediatype', 'traktid']
    },
    UserWatchlistData: {
        sqlTable: 'users_watchlist_data',
        uniqueKey: ['uuid', 'mediatype', 'traktid']
    }
}

module.exports = Metadata
