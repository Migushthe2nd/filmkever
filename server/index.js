// import graphql from 'graphql'
const consola = require('consola')
const express = require('express')
const app = express()
const session = require('express-session')
const PgSession = require('connect-pg-simple')(session)
const { Nuxt, Builder } = require('nuxt')
const cloudscraper = require('cloudscraper')
const bodyParser = require('body-parser')

const joinMonsterAdapt = require('join-monster-graphql-tools-adapter')
const bcrypt = require('bcryptjs')
const { makeExecutableSchema } = require('graphql-tools')
// const { importSchema } = require('graphql-import')
const graphqlHTTP = require('express-graphql')
const passport = require('passport')
const { GraphQLLocalStrategy, buildContext } = require('graphql-passport')
const config = require('../nuxt.config.js')
const joinMonsterMetadata = require('./graphql/joinMonsterMetadata')
const { pgp, db } = require('./utils/db')
const dbFunctions = require('./utils/dbFunctions')(pgp, db)
const Trakt = require('./utils/Trakt')(db)
const functions = require('./utils/functions')(db, dbFunctions, Trakt)
const resolvers = require('./graphql/resolvers')(
    pgp,
    db,
    dbFunctions,
    functions
)
const typeDefs = require('./graphql/typeDefs')
const { errorName, errorType } = require('./utils/errorTypes')
const getErrorCode = (errorName) => errorType[errorName]

app.use(
    session({
        store: new PgSession({
            pgPromise: db,
            tableName: 'sessions'
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        // cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
        cookie: { expires: new Date(253402300000000) } // 30 days
    })
)

passport.use(
    new GraphQLLocalStrategy((email, password, done) => {
        db.oneOrNone('SELECT * FROM users WHERE email = $1', [
            email,
            password
        ]).then((res) => {
            consola.log(res)
            if (!res) {
                done(new Error(errorName.USER_NOT_EXIST), null)
            } else {
                bcrypt.compare(password, res.password_hash, function(
                    bcryptErr,
                    bcryptResult
                ) {
                    if (bcryptErr) {
                        done(new Error(errorName.UNKNOWN), null)
                    } else if (bcryptResult) {
                        const user = {
                            uuid: res.uuid,
                            username: res.username,
                            email: res.email,
                            joined: res.joined,
                            last_logged_in: res.last_logged_in,
                            role: res.role
                        }
                        if (res.preferences) {
                            user.preferences = res.preferences
                        }
                        done(null, user)
                    } else {
                        done(new Error(errorName.USER_PASSWORD_INCORRECT), null)
                    }
                })
            }
        })
    })
)

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    db.oneOrNone('SELECT * FROM users WHERE uuid = $1', [user.uuid]).then(
        (res) => {
            // consola.log(res)
            if (!res) {
                done(new Error('User Not Logged in, session error'), null)
            } else {
                done(null, user)
            }
        }
    )
})

app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Import and Set Nuxt.js options
config.dev = process.env.NODE_ENV !== 'production'
consola.log(process.env.APP_TITLE)

// build webpages?
const buildWeb = true

async function start() {
    // Init Nuxt.js
    const nuxt = new Nuxt(config)

    const { host, port } = nuxt.options.server
    await nuxt.ready()
    // Build only in dev mode
    if (config.dev && buildWeb) {
        const builder = new Builder(nuxt)
        await builder.build()
    }

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers
    })

    joinMonsterAdapt(schema, joinMonsterMetadata)

    const extensions = ({
        document,
        variables,
        operationName,
        result,
        context
    }) => {
        return config.dev
            ? {
                  runTime: Date.now() - context.startTime
              }
            : null
    }

    app.get('/logout', function(req, res) {
        req.logout()
        req.session.destroy()
        res.redirect('/')
    })

    app.post('/proxyframe', function(req, res) {
        const headers = {}
        if (req.query.origin) {
            headers.origin = req.query.origin
        }
        if (req.query.referer) {
            headers.referer = req.query.referer
        }

        cloudscraper({
            method: 'post',
            uri: decodeURIComponent(req.query.url),
            headers,
            formData: req.body
        })
            .then((response) => {
                consola.log(response)
                res.write(response)
                res.end()
            })
            .catch((error) => {
                consola.error(error)
                res.status(407).send(error)
            })
    })

    app.get('/proxyframe', function(req, res) {
        const headers = {}
        if (req.query.origin) {
            headers.origin = req.query.origin
        }
        if (req.query.referer) {
            headers.referer = req.query.referer
        }

        cloudscraper({
            uri: decodeURIComponent(req.query.url),
            headers
        })
            .then((response) => {
                res.send(response)
            })
            .catch((error) => {
                consola.error(error)
                res.status(407).send(error)
            })
    })

    // app.get('/account/activate/:uuid/:email', function(req, res) {
    //     const activationUuid = req.params.uuid
    //     const activationEmail = req.params.uuid

    //     db.one('SELECT * FROM users WHERE uuid = $1', [activationUuid]).then(
    //         (res) => {
    //             // consola.log(res)
    //             if (!res) {
    //                 done(new Error('User Not Logged in, session error'), null)
    //             } else {
    //                 bcrypt.compare(res.email, activationEmail, function(
    //                     bcryptErr,
    //                     bcryptResult
    //                 ) {
    //                     if (bcryptErr) {
    //                         new Error(errorName.UNKNOWN)
    //                     } else if (bcryptResult) {
    //                     } else {
    //                         done(
    //                             new Error(errorName.USER_PASSWORD_INCORRECT),
    //                             null
    //                         )
    //                     }
    //                 })
    //             }
    //         }
    //     )
    // })

    app.use(
        '/api',
        graphqlHTTP((req, res) => {
            return {
                schema,
                context: buildContext({ req, res }),
                // context: ({ req, res }) => {
                //     return buildContext({ req, res })
                //     // startTime: Date.now()
                // },
                graphiql: true,
                pretty: true,
                customFormatErrorFn: (err) => {
                    consola.error(err.message)
                    let error = ''

                    if (getErrorCode(err.message)) {
                        error = getErrorCode(err.message)
                    } else if (err.message.includes('Cannot query field')) {
                        const fieldREGEX = /".*?"/
                        // const typeREGEX = /".+"/
                        error = getErrorCode('INVALID_FIELD')(
                            fieldREGEX.exec(err.message)[0].replace(/"/g, ''),
                            ''
                        )
                    } else {
                        error = getErrorCode('UNKNOWN')
                    }
                    return {
                        message: error.message,
                        statusCode: error.statusCode
                    }
                },
                extensions
            }
        })
    )

    app.get('/logout', function(req, res) {
        req.logout()
        req.session.destroy()
        res.redirect('/')
    })

    // Give nuxt middleware to express
    app.use(nuxt.render)

    // Listen the server
    app.listen(port, host)
    consola.ready({
        message: `Server listening on http://${host}:${port}`,
        badge: true
    })
}
start()
