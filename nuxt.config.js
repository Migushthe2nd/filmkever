const colors = require('vuetify/es5/util/colors').default
require('dotenv').config()

module.exports = {
    env: {
        APP_TITLE: process.env.APP_TITLE || 'AppTitle',
        APP_TITLE_SHORT: process.env.APP_TITLE_SHORT || 'AppTitle',
        APP_BASE_URL: process.env.VUE_APP_BASE_URL || '/',
        // APP_API_ROOT:
        //     process.env.VUE_APP_ROOT_API || 'http://localhost:3000/api',
        GC_USER_ID: process.env.VUE_APP_GC_USER_ID,
        GC_AUTH_TOKEN: process.env.VUE_APP_GC_AUTH_TOKEN
    },
    server: {
        host: process.env.APP_HOST_DOMAIN || 'localhost',
        port: process.env.APP_HOST_PORT || 3000
    },
    mode: 'universal',
    /*
     ** Headers of the page
     */
    head: {
        titleTemplate:
            '%s - ' + process.env.APP_TITLE ||
            '%s - ' + process.env.npm_package_name,
        title: process.env.APP_TITLE || process.env.npm_package_name || '',
        meta: [
            { charset: 'utf-8' },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1'
            },
            {
                hid: 'description',
                name: 'description',
                content:
                    process.env.APP_DESCRIPTION ||
                    process.env.npm_package_description ||
                    ''
            }
        ],
        link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    },
    /*
     ** Customize the progress-bar color
     */
    loading: { color: '#fff' },
    /*
     ** Global CSS
     */
    css: [],
    /*
     ** Plugins to load before mounting the App
     */
    plugins: [
        // { src: '~/plugins/vuex-persist', ssr: false }
        // { src: '~/plugins/localStorage.js', ssr: false }
        // '~/plugins/VueGlobalVariable.js'
    ],
    /*
     ** Nuxt.js dev-modules
     */
    buildModules: [
        '@nuxtjs/dotenv',
        '@nuxtjs/eslint-module',
        '@nuxtjs/stylelint-module',
        '@nuxtjs/vuetify'
    ],
    /*
     ** Nuxt.js modules
     */
    modules: [
        // Doc: https://axios.nuxtjs.org/usage
        // '@nuxtjs/svg',
        '@nuxtjs/axios',
        '@nuxtjs/apollo',
        [
            'nuxt-rfg-icon',
            {
                masterPicture: 'static/icon.png'
            }
        ],
        '@nuxtjs/pwa'
    ],
    apollo: {
        // // optional
        // watchLoading: '~/plugins/apollo-watch-loading-handler.js',
        // // optional
        // errorHandler: '~/plugins/apollo-error-handler.js',
        clientConfigs: {
            default: {
                httpEndpoint: process.env.VUE_APP_httpEndpoint,
                wsEndpoint: null
                // // You can use `wss` for secure connection (recommended in production)
                // // Use `null` to disable subscriptions
                // wsEndpoint: 'ws://localhost:4000', // optional
                // // Use websockets for everything (no HTTP)
                // // You need to pass a `wsEndpoint` for this to work
                // websocketsOnly: false // Optional
            }
        }
    },
    /*
     ** Axios module configuration
     ** See https://axios.nuxtjs.org/options
     */
    axios: {},

    pwa: {
        manifest: {
            name: process.env.APP_TITLE,
            short_name: process.env.APP_TITLE_SHORT,
            description: process.env.APP_DESCRIPTION,
            lang: 'en',
            theme_color: '#d50000',
            background_color: '#121212'
        }
    },
    /*
     ** vuetify module configuration
     ** https://github.com/nuxt-community/vuetify-module
     */
    vuetify: {
        customVariables: ['~/assets/variables.scss'],
        // defaultAssets: {
        //     font: {
        //         family: 'Open+Sans'
        //     },
        //     icons: 'mdi'
        // },
        theme: {
            options: {
                // customProperties: true
            },
            dark: true,
            themes: {
                dark: {
                    // primary: colors.red.darken2,
                    primary: colors.red.darken3,
                    accent: colors.grey.darken3,
                    secondary: colors.amber.darken3,
                    info: colors.teal.lighten1,
                    warning: colors.amber.base,
                    error: colors.deepOrange.accent4,
                    success: colors.green.accent3
                }
            }
        }
    },
    /*
     ** Build configuration
     */
    build: {
        /*
         ** You can extend webpack config here
         */
        terser: {
            terserOptions: {
                compress: {
                    drop_console: true
                }
            }
        },
        extend(config, ctx) {
            const fileLoader = config.module.rules.find((rule) =>
                rule.test.toString().includes('svg')
            )
            fileLoader.exclude = /\.svg$/

            config.module.rules.push({
                test: /\.svg$/,
                loader: 'vue-svg-loader'
            })

            config.module.rules.push({
                test: /\.(png|jpe?g|gif|ttf|eot|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                exclude: /node_modules/,
                loader: 'file-loader'
            })

            config.module.rules.push({
                test: /\/graphql\/\.(graphql|gql)$/,
                exclude: /(node_modules|server)/,
                loader: 'graphql-tag/loader'
            })

            // config.plugins.push(
            //     new VuetifyLoaderPlugin({
            //         progressiveImages: true
            //     })
            // )

            if (ctx.isDev) {
                config.mode = 'development'
            } else if (ctx.isClient) {
                config.optimization.splitChunks.maxSize = 400000
            }
        }
    }
}
