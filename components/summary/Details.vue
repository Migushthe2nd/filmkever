<template>
    <div
        class="banner"
        :class="{ 'fill-height': $parent.mediatype === 'movie' }"
        :style="
            (summary.images.background &&
                summary.images.background.length > 0) ||
            (summary.images.poster && summary.images.poster.length > 0)
                ? 'background-image: url(' +
                  w1280(
                      summary.images.background &&
                          summary.images.background.length > 0
                          ? summary.images.background[0]
                          : summary.images.poster &&
                            summary.images.poster.length > 0
                          ? summary.images.poster[0]
                          : ''
                  ) +
                  ');'
                : 'background-image: url(/images/defaultbackground2.jpg);'
        "
    >
        <v-layout
            class="banner banner-gradient fill-height"
            pa-4
            wrap
            align-center
            fluid
        >
            <v-flex xs-12 lg-8 min-height="40vh">
                <!-- <v-parallax
                src="https://github.com/vuetifyjs/parallax-starter/raw/master/template/assets/hero.jpeg"
                class="banner-parallax"
                height="auto"
                layout
                row
                wrap
                align-center
                absolute
            >
            </v-parallax> -->
                <v-img
                    v-if="
                        summary.images &&
                            summary.images.logo &&
                            summary.images.logo.length > 0 &&
                            summary.images.logo[0]
                    "
                    :lazy-src="w92(summary.images.logo[0])"
                    :src="summary.images.logo[0]"
                    style="filter: drop-shadow(3px 3px 8px #000);"
                    width="40vw"
                    max-width="500"
                    min-width="15rem"
                />
                <h2
                    v-if="
                        summary.images &&
                            summary.images.logo &&
                            summary.images.logo.length > 0 &&
                            summary.images.logo[0]
                    "
                >
                    {{ summary.title }}
                </h2>
                <h1 v-else>{{ summary.title }}</h1>
                <h4 class="font-weight-light text-capitalize">
                    {{
                        (this.$parent.mediatype
                            ? this.$parent.mediatype + ' · '
                            : '') +
                            (summary.year ? summary.year + ' · ' : '') +
                            (summary.certification
                                ? summary.certification + ' · '
                                : '') +
                            (summary.runtime
                                ? this.$parent.mediatype == 'show'
                                    ? summary.runtime + 'min/ep'
                                    : summary.runtime + 'min'
                                : '')
                    }}
                </h4>
                <v-rating
                    v-if="summary.rating"
                    :value="summary.rating / 2"
                    dense
                    readonly
                    half-increments
                />
                <div class="my-3">
                    {{ summary.overview }}
                    <div class="mt-2 text-center">
                        <v-chip
                            v-for="genre in summary.genres"
                            :key="genre"
                            small
                            class="ma-1 text-capitalize"
                        >
                            {{ genre }}
                        </v-chip>
                    </div>
                </div>

                <v-divider class="mx-4 my-2"></v-divider>
                <v-flex
                    v-if="displayProgress(summary, $parent.isWatchlist)"
                    class="mx-4 mt-2"
                >
                    <v-progress-linear
                        :value="progressValue(summary, $parent.mediatype)"
                        height="20"
                        rounded
                        class="subtitle-2 text-capitalize font-weight-regular"
                    >
                        {{ progressText(summary, $parent.mediatype) }}
                    </v-progress-linear>
                </v-flex>

                <div class="text-center">
                    <v-btn
                        v-if="
                            ($store.state.loggedIn &&
                                summary.user_data &&
                                summary.user_data.watch_data &&
                                summary.user_data.watch_data.length > 0 &&
                                summary.user_data.watch_data[0].finished ===
                                    false) ||
                                (summary.user_data &&
                                    summary.user_data.watch_data &&
                                    summary.user_data.watch_data.length > 0 &&
                                    summary.user_data.watch_data[0]
                                        .episode_number <=
                                        summary.aired_episodes)
                        "
                        class="mt-2"
                        color="primary"
                        @click="
                            $parent.sourceFinderSeason =
                                summary.user_data.watch_data[0].season
                            $parent.displaySourceFinder = true
                        "
                    >
                        Continue
                        <v-icon right>
                            mdi-play-circle
                        </v-icon>
                    </v-btn>
                    <v-btn
                        v-else-if="
                            $store.state.loggedIn &&
                                summary.user_data &&
                                summary.user_data.watch_data &&
                                summary.user_data.watch_data.length > 0 &&
                                summary.user_data.watch_data[0].finished ===
                                    true
                        "
                        class="mt-2"
                        color="primary"
                        @click="
                            $parent.sourceFinderSeason = 1
                            $parent.displaySourceFinder = true
                        "
                    >
                        Watch Again
                        <v-icon right>
                            mdi-replay
                        </v-icon>
                    </v-btn>
                    <v-btn
                        v-else
                        class="mt-2"
                        color="primary"
                        @click="
                            $parent.sourceFinderSeason = 1
                            $parent.displaySourceFinder = true
                        "
                    >
                        Watch
                        <v-icon right>
                            mdi-play-circle-outline
                        </v-icon>
                    </v-btn>
                    <v-btn
                        v-if="$store.state.loggedIn"
                        class="mt-2"
                        :loading="loading_watchlist"
                        @click="watchlist()"
                    >
                        {{
                            $parent.isWatchlist
                                ? 'Remove from Watchlist'
                                : 'Add to Watchlist'
                        }}
                        <v-icon right>
                            {{
                                $parent.isWatchlist
                                    ? 'mdi-playlist-check'
                                    : 'mdi-playlist-plus'
                            }}
                        </v-icon>
                    </v-btn>
                    <!-- <v-btn
                        v-if="
                            $store.state.loggedIn &&
                                summary.user_data &&
                                summary.user_data.followed
                        "
                        class="mt-2"
                        :loading="loading_follow"
                        @click="loader = 'loading_follow'"
                    >
                        Unfollow
                        <v-icon right>
                            mdi-bell-ring
                        </v-icon>
                    </v-btn>
                    <v-btn
                        v-else-if="$store.state.loggedIn"
                        class="mt-2"
                        :loading="loading_follow"
                        @click="loader = 'loading_follow'"
                    >
                        Follow
                        <v-icon right>
                            mdi-bell-outline
                        </v-icon>
                    </v-btn> -->
                    <v-btn
                        v-if="summary.trailer"
                        class="mt-2"
                        color="primary"
                        @click="dialog_trailer = true"
                        >Trailer
                        <v-icon right>
                            mdi-youtube
                        </v-icon>
                    </v-btn>
                </div>
                <!-- <v-col align-center>
                <v-btn-toggle
                    v-model="toggle_multiple"
                    multiple
                    background-color="primary"
                >
                    <v-btn>
                        <v-icon>mdi-format-italic</v-icon>
                    </v-btn>

                    <v-btn>
                        <v-icon>mdi-format-underline</v-icon>
                    </v-btn>
                </v-btn-toggle>
            </v-col> -->
            </v-flex>
        </v-layout>
        <v-dialog
            v-model="dialog_trailer"
            fullscreen
            hide-overlay
            transition="dialog-bottom-transition"
        >
            <v-card v-if="summary.trailer">
                <v-toolbar dark color="primary">
                    <v-btn icon @click="dialog_trailer = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title
                        >{{ summary.title }} Trailer</v-toolbar-title
                    >
                </v-toolbar>
                <iframe
                    v-if="dialog_trailer"
                    scrolling="0"
                    frameborder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    allowtransparency
                    width="100%"
                    class="fill-height"
                    style="border: unset; border-radius: unset; position: absolute; outline: none !important;"
                    :src="
                        summary.trailer.replace(
                            'http://youtube.com/watch?v=',
                            'https://youtube.com/embed/'
                        ) + '?autoplay=1'
                    "
                ></iframe>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import queries from '@/web_utils/queries.gql'
import imageFunctions from '@/web_utils/imageFunctions.js'
import progressFunctions from '@/web_utils/progressFunctions.js'

export default {
    layout: 'summary',
    mixins: [imageFunctions, progressFunctions],
    data() {
        return {
            summary: this.$parent.summary,
            dialog_trailer: false,
            loading_watchlist: false,
            loading_follow: false
        }
    },
    watch: {
        loader() {
            const l = this.loader
            this[l] = !this[l]

            setTimeout(() => (this[l] = false), 3000)

            this.loader = null
        }
    },
    methods: {
        watchlist() {
            let doLoad = true
            const self = this
            setTimeout(function() {
                if (doLoad) {
                    self.loading_watchlist = true
                }
            }, 200)
            this.$apollo
                .mutate({
                    mutation: queries.watchlist,
                    variables: {
                        mediatype: this.$parent.mediatype,
                        traktID: this.summary.ids.trakt,
                        state: !this.$parent.isWatchlist
                    },
                    refetchQueries: [
                        {
                            query:
                                this.$parent.mediatype === 'movie'
                                    ? queries.watchlistMovies
                                    : queries.watchlistShows,
                            variables: { page: 1, lastID: null }
                        },
                        {
                            query:
                                this.$parent.mediatype === 'movie'
                                    ? queries.movie
                                    : queries.show,
                            variables: {
                                traktID: this.summary.ids.trakt
                            }
                        }
                    ]
                })
                .then(() => {
                    this.$parent.isWatchlist = !this.$parent.isWatchlist
                    doLoad = false
                    this.loading_watchlist = false
                })
                .catch((error) => {
                    const parsedError = JSON.parse(JSON.stringify(error))
                    if (
                        parsedError.graphQLErrors &&
                        parsedError.graphQLErrors.length > 0 &&
                        parsedError.graphQLErrors[0].message
                    ) {
                        this.error = parsedError.graphQLErrors[0].message
                    } else {
                        this.error = error.message
                            .toString()
                            .replace('GraphQL error: ', '')
                    }
                })
        }
    }
}
</script>

<style lang="scss">
.banner {
    text-shadow: 1px 1px 2px #000;
    // background:
    // linear-gradient(
    //         to top,
    //         map-get($material-dark, 'background') 0%,
    //         transparent 2%
    //     ),
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 50% 25%;
}
</style>

<style lang="scss" scoped>
@import '~vuetify/src/styles/styles.sass';
.banner-gradient {
    // linear: topleft corner
    // background: linear-gradient(
    //     -70deg,
    //     transparent 40%,
    //     map-get($material-dark, 'background') 80%
    // );
    // radial: vignette
    background: radial-gradient(
        transparent,
        map-get($material-dark, 'background')
    );
    min-height: 40vh;
}

.custom-loader {
    animation: loader 1s infinite;
    display: flex;
}
@-moz-keyframes loader {
    from {
        transform: rotate(0);
    }
    to {
        transform: rotate(360deg);
    }
}
@-webkit-keyframes loader {
    from {
        transform: rotate(0);
    }
    to {
        transform: rotate(360deg);
    }
}
@-o-keyframes loader {
    from {
        transform: rotate(0);
    }
    to {
        transform: rotate(360deg);
    }
}
@keyframes loader {
    from {
        transform: rotate(0);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
