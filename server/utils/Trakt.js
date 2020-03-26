const Trakt = require('trakt.tv')

module.exports = (DB) => {
    const trakt = {
        client: new Trakt({
            client_id: process.env.TRAKT_CLIENT_ID,
            client_secret: process.env.TRAKT_CLIENT_SECRET,
            redirect_uri:
                'https://' +
                process.env.domain +
                process.env.BaseUrl +
                '/auth/trakt/callback',
            pagination: true,
            debug: true,
            plugins: {
                // images: require('trakt.tv-images'),
                cached: require('trakt.tv-cached')
            },
            options: {
                cached: {
                    defaultTTL: 600,
                    connection:
                        'postgresql://' +
                        process.env.POSTGRES_USER +
                        ':' +
                        process.env.POSTGRES_PASSWORD +
                        '@' +
                        process.env.POSTGRES_HOST +
                        ':' +
                        process.env.POSTGRES_PORT +
                        '/' +
                        process.env.POSTGRES_DB,
                    // handleError: myHandler,
                    storageOptions: {
                        namespace: process.env.POSTGRES_DB_NAMESPACE,
                        // you can specify the table name:
                        table: 'trakt_cache',
                        keySize: 255 // this is the default key column size
                    }
                }
            }
        }),
        authenticate: (username) => {
            return new Promise((resolve, reject) => {
                DB.users.extract(username, (error, tokendata) => {
                    if (error) {
                        console.log(error)
                    } else {
                        Trakt.client
                            .import_token(tokendata)
                            .then(resolve(Trakt.connected))
                    }
                })
            })
        },
        revoke: (username) => {
            return new Promise((resolve, reject) => {
                DB.users.extract(username, (error, tokendata) => {
                    if (error) {
                        console.log(error)
                    } else {
                        Trakt.client.revoke_token(tokendata)
                        DB.users.revoke(username, (error) => {
                            if (error) {
                                console.log(error)
                            }
                        })
                    }
                })
            })
        },
        connected: (info) => {
            console.info('Trakt is connected')
            console.log(info)
        }
    }
    return trakt
}
