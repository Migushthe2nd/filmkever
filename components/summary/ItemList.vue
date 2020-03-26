<template>
    <div>
        <v-layout no-gutters>
            <v-flex xs-12>
                <v-tabs v-model="tab" show-arrows center-active grow>
                    <v-tabs-slider color="primary"></v-tabs-slider>
                    <v-tab
                        v-for="season in seasons"
                        :key="'tab-' + season.number"
                    >
                        {{
                            season.number === 0
                                ? 'Extras'
                                : 'Season ' + season.number
                        }}
                    </v-tab>
                </v-tabs>
                <v-tabs-items v-model="tab">
                    <v-tab-item
                        v-for="season in seasons"
                        :key="'tab_c-' + season.number"
                        :eager="false"
                    >
                        <!-- <v-list three-line> -->
                        <v-list>
                            <template
                                v-for="(episode, index2) in season.episodes"
                            >
                                <v-list-item
                                    :key="
                                        'tab_c-' +
                                            season.number +
                                            'episode_item-' +
                                            episode.number
                                    "
                                    :class="{
                                        watched:
                                            $store.state.loggedIn &&
                                            episode.user_data.watch_data[0]
                                                .finished,
                                        'px-3': isMobile
                                    }"
                                    @click.stop="
                                        getEpisodeSummary(episode.ids.trakt)
                                    "
                                >
                                    <v-list-item-action-text
                                        v-if="$store.state.loggedIn"
                                    >
                                    </v-list-item-action-text>
                                    <v-list-item-action
                                        v-if="$store.state.loggedIn"
                                        @click.stop
                                        @mousedown.stop
                                        @touchstart.native.stop
                                    >
                                        <v-container
                                            fluid
                                            :class="{
                                                'px-0': isMobile
                                            }"
                                        >
                                            <v-checkbox
                                                v-model="
                                                    episode.user_data
                                                        .watch_data[0].finished
                                                "
                                                :indeterminate="
                                                    episode.user_data &&
                                                        episode.user_data
                                                            .watch_data &&
                                                        episode.user_data
                                                            .watch_data[0]
                                                            .position > 0
                                                "
                                                :disabled="
                                                    (episode.title &&
                                                        episode.title.includes(
                                                            'TBA'
                                                        )) ||
                                                        (episode.title &&
                                                            episode.title.includes(
                                                                'TBD'
                                                            ))
                                                "
                                                @change="
                                                    mediaProgress(
                                                        'episode',
                                                        episode.ids.trakt,
                                                        $event
                                                    )
                                                "
                                            ></v-checkbox>
                                        </v-container>
                                    </v-list-item-action>
                                    <v-list-item-action class="mx-0">
                                        <v-container>
                                            {{ episode.number }}
                                        </v-container>
                                    </v-list-item-action>
                                    <v-list-item-content>
                                        <v-list-item-title class="text-wrap">
                                            {{ episode.title }}
                                        </v-list-item-title>
                                        <v-list-item-subtitle
                                            v-if="
                                                episode.watched &&
                                                    episode.user_data &&
                                                    episode.user_data
                                                        .watch_data &&
                                                    episode.user_data
                                                        .watch_data[0]
                                                        .finished === true
                                            "
                                        >
                                            <v-icon
                                                style="vertical-align: text-top;"
                                                small
                                            >
                                                mdi-history
                                            </v-icon>
                                            {{
                                                niceDate(
                                                    episode.user_data
                                                        .watch_data[0]
                                                        .time_watched
                                                )
                                            }}
                                        </v-list-item-subtitle>
                                        <!-- <v-list-item-subtitle>
                                        {{ episode.overview }}
                                    </v-list-item-subtitle>
                                    <v-list-item-subtitle>
                                        {{
                                            episode.first_aired
                                                ? monthNames[
                                                      new Date(
                                                          episode.first_aired
                                                      ).getMonth()
                                                  ] +
                                                  ' ' +
                                                  new Date(
                                                      episode.first_aired
                                                  ).getDate() +
                                                  ', ' +
                                                  new Date(
                                                      episode.first_aired
                                                  ).getFullYear()
                                                : episode.air_date
                                                ? monthNames[
                                                      new Date(
                                                          episode.air_date
                                                      ).getMonth()
                                                  ] +
                                                  ' ' +
                                                  new Date(
                                                      episode.air_date
                                                  ).getDate() +
                                                  ', ' +
                                                  new Date(
                                                      episode.air_date
                                                  ).getFullYear()
                                                : 'TBD'
                                        }}
                                    </v-list-item-subtitle> -->
                                    </v-list-item-content>
                                    <v-list-item-action
                                        @click.stop
                                        @mousedown.stop
                                        @touchstart.native.stop
                                    >
                                        <v-btn
                                            v-if="
                                                episode.title &&
                                                    episode.title.includes(
                                                        'TBA'
                                                    )
                                            "
                                            disabled
                                            color="primary"
                                        >
                                            TBA
                                            <v-icon right>
                                                mdi-calendar-question
                                            </v-icon>
                                        </v-btn>
                                        <v-btn
                                            v-else-if="
                                                episode.title &&
                                                    episode.title.includes(
                                                        'TBD'
                                                    )
                                            "
                                            disabled
                                            color="primary"
                                        >
                                            TBD
                                            <v-icon right>
                                                mdi-calendar-question
                                            </v-icon>
                                        </v-btn>
                                        <v-btn
                                            v-else-if="
                                                episode.user_data &&
                                                    episode.user_data
                                                        .watch_data &&
                                                    episode.user_data
                                                        .watch_data[0]
                                                        .finished === true
                                            "
                                            color="primary"
                                            @click="
                                                $parent.sourceFinderSeason =
                                                    season.number
                                                $parent.displaySourceFinder = true
                                            "
                                        >
                                            Rewatch
                                            <v-icon right>
                                                mdi-replay
                                            </v-icon>
                                        </v-btn>
                                        <v-btn
                                            v-else-if="
                                                episode.user_data &&
                                                    episode.user_data
                                                        .watch_data &&
                                                    episode.user_data
                                                        .watch_data[0]
                                                        .finished === false
                                            "
                                            color="primary"
                                            @click="
                                                $parent.sourceFinderSeason =
                                                    season.number
                                                $parent.displaySourceFinder = true
                                            "
                                        >
                                            Continue
                                            <v-icon right>
                                                mdi-play-circle
                                            </v-icon>
                                        </v-btn>
                                        <v-btn
                                            v-else
                                            color="primary"
                                            @click="
                                                $parent.sourceFinderSeason =
                                                    season.number
                                                $parent.displaySourceFinder = true
                                            "
                                        >
                                            Watch
                                            <v-icon right>
                                                mdi-play-circle-outline
                                            </v-icon>
                                        </v-btn>
                                        <!-- <v-btn
                                        v-else-if="
                                            episode.first_aired
                                                ? new Date(
                                                      episode.first_aired
                                                  ) < new Date()
                                                : false
                                        "
                                        color="primary"
                                    >
                                        Watch
                                        <v-icon right>
                                            mdi-play-circle-outline
                                        </v-icon>
                                    </v-btn>
                                    <v-btn
                                        v-else-if="episode.air_date"
                                        disabled
                                        color="primary"
                                    >
                                        TBR
                                        <v-icon right>
                                            mdi-calendar-clock
                                        </v-icon>
                                    </v-btn> -->
                                    </v-list-item-action>
                                </v-list-item>
                                <v-divider
                                    v-if="
                                        index2 <
                                            Object.keys(season.episodes)
                                                .length -
                                                1
                                    "
                                    :key="
                                        'tab_c-' +
                                            season.number +
                                            'episode_divider-' +
                                            episode.number
                                    "
                                />
                            </template>
                        </v-list>
                    </v-tab-item>
                </v-tabs-items>
            </v-flex>
        </v-layout>
        <v-dialog
            v-model="dialog_episodeSummary"
            fullscreen
            hide-overlay
            transition="dialog-bottom-transition"
        >
            <v-card v-if="episodeSummary">
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click="dialog_episodeSummary = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title
                        >{{
                            episodeSummary.season !== 0
                                ? `S${episodeSummary.season}E${episodeSummary.number}`
                                : `Extras ${episodeSummary.number}`
                        }}
                        -
                        {{ episodeSummary.title }}
                    </v-toolbar-title>
                </v-toolbar>
                <v-carousel
                    v-if="
                        episodeSummary.images.background &&
                            episodeSummary.images.background.length > 0
                    "
                    :show-arrows="episodeSummary.images.background.length !== 1"
                    cycle
                    :continuous="false"
                    hide-delimiters
                    height="40vh"
                >
                    <v-carousel-item
                        v-for="(image, i) in episodeSummary.images.background"
                        :key="i"
                    >
                        <v-img
                            :src="w1280(image)"
                            :lazy-src="w92(image)"
                            height="100%"
                        />
                    </v-carousel-item>
                </v-carousel>
                <v-container xs-12 lg-8 min-height="40vh">
                    <h1>{{ episodeSummary.title }}</h1>
                    <h4 class="font-weight-light text-capitalize">
                        {{
                            'episode · ' +
                                (episodeSummary.first_aired
                                    ? episodeSummary.first_aired.slice(0, 10) +
                                      ' · '
                                    : '') +
                                episodeSummary.runtime +
                                'min'
                        }}
                    </h4>
                    <v-rating
                        v-if="episodeSummary.rating"
                        :value="episodeSummary.rating / 2"
                        dense
                        readonly
                        half-increments
                    />
                    <div class="my-3">
                        {{ episodeSummary.overview }}
                        <v-col class="mt-2 text-center">
                            <v-chip
                                v-for="genre in episodeSummary.genres"
                                :key="genre"
                                small
                                class="ma-1 text-capitalize"
                            >
                                {{ genre }}
                            </v-chip>
                        </v-col>
                    </div>
                    <v-divider class="mx-4 my-2"></v-divider>
                    <v-col class="text-center">
                        <v-btn
                            v-if="
                                $store.state.loggedIn &&
                                    episodeSummary.user_data &&
                                    episodeSummary.user_data.watch_data &&
                                    episodeSummary.user_data.watch_data.length >
                                        0 &&
                                    episodeSummary.user_data.watch_data[0]
                                        .position
                            "
                            color="primary"
                            @click="
                                $parent.sourceFinderSeason =
                                    episodeSummary.season
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
                                    episodeSummary.user_data &&
                                    episodeSummary.user_data.watch_data &&
                                    episodeSummary.user_data.watch_data.length >
                                        0 &&
                                    episodeSummary.user_data.watch_data[0]
                                        .finished === true
                            "
                            color="primary"
                            @click="
                                $parent.sourceFinderSeason =
                                    episodeSummary.season
                                $parent.displaySourceFinder = true
                            "
                        >
                            Rewatch
                            <v-icon right>
                                mdi-replay
                            </v-icon>
                        </v-btn>
                        <v-btn
                            v-else
                            color="primary"
                            @click="
                                $parent.sourceFinderSeason =
                                    episodeSummary.season
                                $parent.displaySourceFinder = true
                            "
                        >
                            Watch
                            <v-icon right>
                                mdi-play-circle-outline
                            </v-icon>
                        </v-btn>
                        <!-- <v-btn
                                    v-if="
                                        $store.state.loggedIn &&
                                            episodeSummary.user_data &&
                                            episodeSummary.user_data.added
                                    "
                                    :loading="loading_watchlist"
                                    @click="loader = 'loading_watchlist'"
                                >
                                    Remove from Watchlist
                                    <v-icon right>
                                        mdi-playlist-check
                                    </v-icon>
                                </v-btn>
                                <v-btn
                                    v-else-if="$store.state.loggedIn"
                                    :loading="loading_watchlist"
                                    @click="loader = 'loading_watchlist'"
                                >
                                    Add to Watchlist
                                    <v-icon right>
                                        mdi-playlist-plus
                                    </v-icon>
                                </v-btn>
                                <v-btn
                                    v-if="
                                        $store.state.loggedIn &&
                                            episodeSummary.user_data &&
                                            episodeSummary.user_data.followed
                                    "
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
                                    :loading="loading_follow"
                                    @click="loader = 'loading_follow'"
                                >
                                    Follow
                                    <v-icon right>
                                        mdi-bell-outline
                                    </v-icon>
                                </v-btn> -->
                    </v-col>
                </v-container>
            </v-card>
        </v-dialog>
    </div>
</template>

<style lang="scss" scoped>
.v-list-item {
    transition: opacity 0.4s ease-in-out;
}

.v-list-item.watched {
    opacity: 0.56;
}

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
</style>

<script>
import queries from '@/web_utils/queries.gql'
import imageFunctions from '@/web_utils/imageFunctions.js'

export default {
    mixins: [imageFunctions],
    data() {
        return {
            tab: null,
            seasons: this.$parent.seasons,
            episodeSummary: null,
            dialog_episodeSummary: false,
            isMobile: false,
            monthNames: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ]
        }
    },
    beforeDestroy() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this.onResize, {
                passive: true
            })
        }
    },
    mounted() {
        this.onResize()
        window.addEventListener('resize', this.onResize, { passive: true })
    },
    methods: {
        niceDate(date) {
            const DateTime = new Date(parseInt(date))
            return (
                this.monthNames[DateTime.getMonth()] +
                ' ' +
                DateTime.getDate() +
                ', ' +
                DateTime.getFullYear()
            )
        },
        mediaProgress(mediatype, traktID, finished, length, position) {
            this.$parent.mediaProgress(
                mediatype,
                traktID,
                finished,
                length,
                position
            )
        },
        getEpisodeSummary(traktID) {
            this.$apollo
                .query({
                    query: queries.episode,
                    variables: {
                        traktID
                    }
                })
                .then((response) => {
                    this.episodeSummary = response.data.episode

                    this.dialog_episodeSummary = true
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
        },
        onResize() {
            this.isMobile = window.innerWidth < 600
        }
    }
}
</script>
