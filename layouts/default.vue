<template>
    <v-app dark>
        <div class="background-wrapper" app fixed>
            <!-- <iframe
                class="backgroundvideoiframe"
                width="100%"
                height="100%"
                src="https://youtube.com/embed/MZoO8QVMxkk?autoplay=1&loop=1&playlist=MZoO8QVMxkk&modestbranding=1&showinfo=0&rel=0&cc_load_policy=1&iv_load_policy=3&fs=0&controls=0&disablekb=1&mute=1"
                allow="autoplay; fullscreen"
                frameborder="0"
                scrolling="0"
                allowtransparency=""
            /> -->
            <!-- <img
                src="https://i.pinimg.com/originals/bb/b8/8e/bbb88ec618f806c87a7c4b0230bcdbb4.jpg"
            /> -->
        </div>

        <v-navigation-drawer
            v-model="drawer"
            :mini-variant="false"
            :clipped="clipped"
            temporary
            fixed
            app
        >
            <v-list nav>
                <v-list-item
                    v-if="!$store.state.loggedIn"
                    link
                    two-line
                    router
                    exact
                    @click.stop="login_dialog = true"
                >
                    <v-list-item-avatar>
                        <v-icon large>
                            mdi-account-circle
                        </v-icon>
                    </v-list-item-avatar>

                    <v-list-item-content>
                        <v-list-item-title>
                            Login / register
                        </v-list-item-title>
                    </v-list-item-content>
                    <v-icon>mdi-login</v-icon>
                </v-list-item>
                <v-list-group
                    v-if="$store.state.loggedIn"
                    :two-line="!!!$store.state.user.role"
                    :three-line="$store.state.user.role"
                    no-action
                >
                    <template v-slot:activator>
                        <v-list-item-avatar>
                            <img
                                v-if="
                                    $store.state.loggedIn &&
                                        $store.state.user.avatar
                                "
                                :src="$store.state.user.avatar"
                            />
                            <v-icon v-else large>
                                mdi-account-circle
                            </v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title>
                                {{ $store.state.user.username }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                                {{ $store.state.user.email }}
                            </v-list-item-subtitle>
                            <v-list-item-subtitle v-if="$store.state.user.role">
                                <v-icon small>
                                    {{ roleIcon() }}
                                </v-icon>
                                {{ $store.state.user.role }}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </template>
                    <v-list-item dense router exact to="/account">
                        <v-list-item-title>Profile</v-list-item-title>
                        <v-list-item-icon>
                            <v-icon>mdi-face</v-icon>
                        </v-list-item-icon>
                    </v-list-item>
                    <v-list-item dense router exact to="/party">
                        <v-list-item-title>Party</v-list-item-title>
                        <v-list-item-icon>
                            <v-icon>mdi-account-group</v-icon>
                        </v-list-item-icon>
                    </v-list-item>
                    <v-list-item dense router exact to="/account/settings">
                        <v-list-item-title>Settings</v-list-item-title>
                        <v-list-item-icon>
                            <v-icon>mdi-account-cog</v-icon>
                        </v-list-item-icon>
                    </v-list-item>
                    <v-list-item dense @click="logout()">
                        <v-list-item-title>Logout</v-list-item-title>
                        <v-list-item-icon>
                            <v-icon>mdi-logout</v-icon>
                        </v-list-item-icon>
                    </v-list-item>
                </v-list-group>
            </v-list>
            <v-divider />
            <v-list nav>
                <v-list-group
                    v-for="type in types"
                    :key="type.title"
                    dense
                    :prepend-icon="type.icon"
                    no-action
                >
                    <template v-slot:activator>
                        <v-list-item-content>
                            <v-list-item-title
                                v-text="type.title"
                            ></v-list-item-title>
                        </v-list-item-content>
                    </template>
                    <template v-for="page in type.pages">
                        <v-list-item
                            v-if="needsAuth(page)"
                            :key="page.title"
                            :prepend-icon="page.icon"
                            link
                            router
                            :to="type.to + page.to"
                            dense
                        >
                            <v-list-item-title v-text="page.title" />
                            <v-list-item-icon>
                                <v-icon v-text="page.icon" />
                            </v-list-item-icon>
                        </v-list-item>
                    </template>
                </v-list-group>
            </v-list>
            <v-divider />
            <v-list nav>
                <!-- <v-list-item
                    v-if="$store.state.loggedIn"
                    router
                    exact
                    to="/account/settings"
                >
                    <v-list-item-action>
                        <v-icon>mdi-settings</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Settings</v-list-item-title>
                    </v-list-item-content>
                </v-list-item> -->
                <v-list-item router exact to="/about">
                    <v-list-item-action>
                        <v-icon>mdi-information-outline</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>About</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-app-bar
            :clipped-left="clipped"
            app
            elevate-on-scroll
            color="transparent"
        >
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
            <router-link to="/">
                <LogoFull
                    class="logo d-block ml-1 mr-1"
                    height="30"
                    width="auto"
                />
            </router-link>
            <!-- <v-toolbar-items>
                <v-toolbar-item-action>
                    <v-icon>mdi-4k</v-icon>
                </v-toolbar-item-action>
                <v-toolbar-item-content>
                    <v-toolbar-item-title text="item text" />
                </v-toolbar-item-content>
            </v-toolbar-items> -->
            <v-spacer />
            <v-layout hidden-sm-and-down>
                <v-flex xs12>
                    <form @submit.prevent="submitSearch()">
                        <v-text-field
                            v-model="searchQuery"
                            autocomplete="off"
                            style="border-top-right-radius: 0; border-bottom-right-radius: 0;"
                            append-icon="mdi-magnify"
                            hide-details
                            flat
                            required
                            label="Search"
                            solo-inverted
                            @input="updateSearchQuery()"
                        >
                        </v-text-field>
                    </form>
                </v-flex>
                <v-flex class="searchTypeSelector">
                    <v-select
                        v-model="currSearchType"
                        :items="searchTypes"
                        :menu-props="{ offsetY: true }"
                        style="border-top-left-radius: 0; border-bottom-left-radius: 0;"
                        flat
                        label="Type"
                        hide-details
                        solo
                        @input="updateCurrSearchType()"
                    ></v-select>
                </v-flex>
            </v-layout>

            <!-- <v-btn icon @click.stop="signUp = !signUp">
                <v-icon>mdi-account</v-icon>
            </v-btn> -->
        </v-app-bar>

        <v-content>
            <v-container fluid pa-0 style="height: 100%">
                <nuxt />
            </v-container>
        </v-content>

        <Login v-model="login_dialog" />
        <v-navigation-drawer
            v-model="rightDrawer"
            :right="right"
            temporary
            fixed
        >
            <v-list>
                <v-list-item @click.native="right = !right">
                    <v-list-item-action>
                        <v-icon light>mdi-repeat</v-icon>
                    </v-list-item-action>
                    <v-list-item-title
                        >Switch drawer (click me)</v-list-item-title
                    >
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <!-- <v-footer :fixed="fixed" app>
            <span>&copy; {{ new Date().getFullYear() }}</span>
        </v-footer> -->
    </v-app>
</template>

<script>
// import defaultAvatar from '@/assets/images/account/account-circle.svg'
import LogoFull from '@/assets/images/logo_full.svg'
import Login from '~/components/Login.vue'
import queries from '@/web_utils/queries.gql'

let delayTimer

export default {
    components: {
        LogoFull,
        Login
    },
    data() {
        return {
            login_dialog: false,
            clipped: false,
            drawer: false,
            fixed: false,
            currSearchType: null,
            searchTypes: ['Movies', 'Shows'],
            searchQuery: this.$route.query.s || '',
            types: [
                {
                    icon: 'mdi-movie',
                    title: 'Movies',
                    to: '/movies',
                    pages: [
                        {
                            title: 'Continue',
                            icon: 'mdi-play-circle',
                            to: '/continue',
                            needsAuth: true
                        },
                        {
                            title: 'Watchlist',
                            icon: 'mdi-playlist-play',
                            to: '/watchlist',
                            needsAuth: true
                        },
                        // {
                        //     title: 'Discover',
                        //     icon: 'mdi-compass',
                        //     to: '/discover',
                        //     needsAuth: false
                        // },
                        // {
                        //     title: 'Recommended',
                        //     icon: 'mdi-thumb-up',
                        //     to: '/recommended',
                        //     needsAuth: true
                        // },
                        {
                            title: 'Trending',
                            icon: 'mdi-trending-up',
                            to: '/trending',
                            needsAuth: false
                        },
                        {
                            title: 'Box Office',
                            icon: 'mdi-new-box',
                            to: '/boxoffice',
                            needsAuth: false
                        },
                        {
                            title: 'All-Time Popular',
                            icon: 'mdi-star-circle',
                            to: '/popular',
                            needsAuth: false
                        }
                    ]
                },
                {
                    icon: 'mdi-movie',
                    title: 'Shows',
                    to: '/shows',
                    pages: [
                        {
                            title: 'Continue',
                            icon: 'mdi-play-circle',
                            to: '/continue',
                            needsAuth: true
                        },
                        {
                            title: 'Watchlist',
                            icon: 'mdi-playlist-play',
                            to: '/watchlist',
                            needsAuth: true
                        },
                        // {
                        //     title: 'Discover',
                        //     icon: 'mdi-compass',
                        //     to: '/discover',
                        //     needsAuth: false
                        // },
                        // {
                        //     title: 'Recommended',
                        //     icon: 'mdi-thumb-up',
                        //     to: '/recommended',
                        //     needsAuth: true
                        // },
                        {
                            title: 'Trending',
                            icon: 'mdi-trending-up',
                            to: '/trending',
                            needsAuth: false
                        },
                        {
                            title: 'All-Time Popular',
                            icon: 'mdi-star-circle',
                            to: '/popular',
                            needsAuth: false
                        }
                    ]
                }
            ],
            miniVariant: false,
            right: true,
            rightDrawer: false,
            signUp: false,
            title: process.env.APP_TITLE
        }
    },
    computed: {
        currUrlSearchType() {
            return this.$route.path.split('/')[1]
        },
        newSearchType() {
            return this.searchTypes.find(
                (arrayItem) =>
                    arrayItem.toLowerCase() ===
                    this.$route.path.split('/')[1].toLowerCase()
            )
                ? this.searchTypes.find(
                      (arrayItem) =>
                          arrayItem.toLowerCase() ===
                          this.$route.path.split('/')[1].toLowerCase()
                  )
                : this.$store.state.currSearchType
                ? this.$store.state.currSearchType
                : this.searchTypes[0]
        }
    },
    watch: {
        currUrlSearchType() {
            this.currSearchType = this.newSearchType
            this.$store.commit('UPDATE_SEARCHTYPE_QUERY', this.newSearchType)
        }
    },
    created() {
        this.currSearchType = this.newSearchType
        this.$store.commit('UPDATE_SEARCHTYPE_QUERY', this.newSearchType)
    },
    methods: {
        roleIcon() {
            switch (this.$store.state.user.role) {
                case 'Admin':
                    return 'mdi-crown'
                default:
                    return ''
            }
        },
        logout() {
            this.$apollo
                .mutate({
                    mutation: queries.logout
                })
                .then((response) => {
                    this.$router.go()
                    this.step = 0
                })
                .catch((error) => {
                    const parsedError = JSON.parse(JSON.stringify(error))
                    if (
                        parsedError.graphQLErrors &&
                        parsedError.graphQLErrors.length > 0 &&
                        parsedError.graphQLErrors.statusCode === 401
                    ) {
                        this.step = 401
                    } else this.step = -1
                })
        },
        needsAuth(element) {
            if (element.needsAuth) {
                if (this.$store.state.loggedIn) {
                    return true
                } else return false
            } else return true
        },
        updateSearchQuery() {
            if (this.$route.path.includes('/search')) {
                this.$router.replace({ query: { s: this.searchQuery } })
                clearTimeout(delayTimer)
                const self = this
                delayTimer = setTimeout(function() {
                    self.$store.commit('UPDATE_SEARCH_QUERY', self.searchQuery)
                }, 800)
            }
        },
        updateCurrSearchType() {
            if (this.$route.path.includes('/search')) {
                this.$store.commit(
                    'UPDATE_SEARCHTYPE_QUERY',
                    this.currSearchType
                )
            }
        },
        submitSearch() {
            if (!this.$route.path.includes('/search')) {
                this.$store.commit(
                    'UPDATE_SEARCHTYPE_QUERY',
                    this.currSearchType
                )
                this.$store.commit('UPDATE_SEARCH_QUERY', this.searchQuery)

                this.$router.push({
                    path: `/${this.currSearchType.toLowerCase()}/search`,
                    query: { s: this.$store.state.searchQuery }
                })
            }
        }
    }
}
</script>

<style lang="scss">
@import '~vuetify/src/styles/styles.sass';
html,
body {
    background-color: map-get($material-dark, 'background');
}

.searchTypeSelector .v-input__control > .v-input__slot {
    background: rgba(255, 255, 255, 0.16) !important;
}
</style>

<style lang="scss" scoped>
.background-wrapper {
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: hidden;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;

    iframe {
        transform: scale(1.6);
        filter: blur(8px);
    }

    img {
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
    }
}
.v-app-bar {
    backdrop-filter: blur(8px);
    .blur {
        filter: blur(8px);
    }
}
</style>

<style lang="scss">
@import '~vuetify/src/styles/styles.sass';
.logo {
    user-select: none;
    fill: map-get($red, 'accent-4');
}
</style>
