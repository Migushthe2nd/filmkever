<template>
    <v-flex v-resize="onResize" ma-0 pa-0 fluid fill-height>
        <div v-if="summary.title" class="fill-height">
            <Details v-if="summary.title != null" />
            <ItemList
                v-if="mediatype === 'show' && seasons.length > 0"
                class="ma-xs-2"
            />
            <v-sheet
                v-else-if="mediatype === 'show'"
                color="grey darken-4"
                class="px-3 pt-3 pb-3"
            >
                <v-skeleton-loader
                    hover
                    class="mx-auto"
                    type="list-item-two-line"
                ></v-skeleton-loader>
                <v-skeleton-loader
                    hover
                    class="mx-auto"
                    type="list-item-two-line"
                ></v-skeleton-loader>
                <v-skeleton-loader
                    hover
                    class="mx-auto"
                    type="list-item-two-line"
                ></v-skeleton-loader>
                <v-skeleton-loader
                    hover
                    class="mx-auto"
                    type="list-item-two-line"
                ></v-skeleton-loader>
            </v-sheet>
        </div>
        <Error v-if="error" />
        <sourceFinder />
    </v-flex>
</template>

<script>
import queries from '@/web_utils/queries.gql'
import Error from '@/layouts/error.vue'
import Details from '@/components/summary/Details.vue'
import ItemList from '@/components/summary/ItemList.vue'
import sourceFinder from '@/components/summary/sourceFinder.vue'

export default {
    components: {
        Error,
        Details,
        ItemList,
        sourceFinder
    },
    data() {
        return {
            traktID: null,
            mediatype: this.$parent.mediatype,
            slug: '',
            summary: {
                title: null,
                overview: null
            },
            seasons: [],
            loader: null,
            sourceFinderSeason: null,
            sourceFinderEpisode: null,
            currPlayingTraktID: null,
            displaySourceFinder: false,
            sourceFinderStep: 0,
            isWatchlist: null,
            loading_watchlist: false,
            loading_follow: false,
            windowHeight: 0,
            error: null
        }
    },
    watch: {
        displaySourceFinder() {
            this.sourceFinderStep = 0
        }
    },
    mounted() {
        this.onResize()
    },
    created() {
        const slug = this.$route.params.slug.split('-')
        this.slug = slug.slice(0, -1).join('-')
        this.traktID = parseInt(slug[slug.length - 1])

        if (this.mediatype === 'movie') {
            this.$apollo
                .query({
                    query: queries.movie,
                    variables: {
                        traktID: this.traktID
                    }
                })
                .then((response) => {
                    this.summary = response.data.movie

                    if (
                        this.$store.state.movieWatchlist.some(
                            (storeSummary) =>
                                storeSummary.ids.trakt ===
                                this.summary.ids.trakt
                        ) ||
                        (this.summary.user_data &&
                            this.summary.user_data.watchlist_data &&
                            this.summary.user_data.watchlist_data.added ===
                                true)
                    ) {
                        this.isWatchlist = true
                    }

                    this.getSeasons()
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
        } else if (this.mediatype === 'show') {
            this.$apollo
                .query({
                    query: queries.show,
                    variables: {
                        traktID: this.traktID
                    }
                })
                .then((response) => {
                    this.summary = response.data.show

                    if (
                        this.$store.state.showWatchlist.some(
                            (storeSummary) =>
                                storeSummary.ids.trakt ===
                                this.summary.ids.trakt
                        ) ||
                        (this.summary.user_data &&
                            this.summary.user_data.watchlist_data &&
                            this.summary.user_data.watchlist_data.added ===
                                true)
                    ) {
                        this.isWatchlist = true
                    }

                    this.getSeasons()
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
    },
    methods: {
        onResize() {
            this.windowHeight = window.innerHeight
        },
        mediaProgress(mediatype, traktID, finished, length, position) {
            this.$apollo
                .mutate({
                    mutation: queries.progress,
                    variables: {
                        mediatype,
                        traktID,
                        finished,
                        length,
                        position
                    },
                    refetchQueries:
                        !position && position !== 0
                            ? [
                                  {
                                      query:
                                          this.mediatype === 'movie'
                                              ? queries.movie
                                              : queries.show,
                                      variables: {
                                          traktID: this.summary.ids.trakt
                                      }
                                  },
                                  {
                                      query:
                                          this.mediatype === 'movie'
                                              ? queries.continueMovies
                                              : queries.continueShows,
                                      variables: { page: 1 }
                                  },
                                  {
                                      query:
                                          this.mediatype === 'movie'
                                              ? queries.watchlistMovies
                                              : queries.watchlistShows,
                                      variables: { page: 1 }
                                  }
                              ]
                            : []
                })
                .then(() => {
                    if (this.mediatype === 'movie') {
                        if (!this.summary.user_data.watch_data) {
                            this.summary.user_data.watch_data = []
                        }
                        if (
                            this.summary.user_data.watch_data.length > 0 &&
                            !this.summary.user_data.watch_data[0].finished
                        ) {
                            this.summary.user_data.watch_data[0] = {
                                finished,
                                length,
                                position,
                                time_modified: Date.now(),
                                time_watched: finished ? Date.now() : null
                            }
                        } else {
                            this.summary.user_data.watch_data.unshift({
                                finished,
                                length,
                                position,
                                time_modified: Date.now(),
                                time_watched: finished ? Date.now() : null
                            })
                        }
                    } else {
                        let totalEpisode = 1
                        let isFound = false
                        for (let i = 0; i < this.seasons.length; i++) {
                            for (
                                let j = 0;
                                j < this.seasons[i].episodes.length;
                                j++
                            ) {
                                if (
                                    this.seasons[i].episodes[j].ids.trakt ===
                                    this.currPlayingTraktID
                                ) {
                                    if (
                                        !this.seasons[i].episodes[j].user_data
                                            .watch_data
                                    ) {
                                        this.seasons[i].episodes[
                                            j
                                        ].user_data.watch_data = []
                                    }
                                    if (
                                        this.seasons[i].episodes[j].user_data
                                            .watch_data.length > 0 &&
                                        !this.seasons[i].episodes[j].user_data
                                            .watch_data[0].finished
                                    ) {
                                        this.seasons[i].episodes[
                                            j
                                        ].user_data.watch_data[0] = {
                                            episode_number: totalEpisode,
                                            finished,
                                            length,
                                            position,
                                            season: this.sourceFinderSeason,
                                            time_modified: Date.now(),
                                            time_watched: finished
                                                ? Date.now()
                                                : null,
                                            traktid: this.currPlayingTraktID
                                        }
                                    } else {
                                        this.seasons[i].episodes[
                                            j
                                        ].user_data.watch_data.unshift({
                                            finished,
                                            length,
                                            position,
                                            time_modified: Date.now(),
                                            time_watched: finished
                                                ? Date.now()
                                                : null
                                        })
                                    }
                                    isFound = true
                                } else if (
                                    !isFound &&
                                    this.seasons[i].number !== 0
                                ) {
                                    totalEpisode++
                                }
                            }
                        }

                        if (!this.summary.user_data.watch_data) {
                            this.summary.user_data.watch_data = []
                        }
                        for (
                            let i = 0;
                            i < this.summary.user_data.watch_data.length;
                            i++
                        ) {
                            if (
                                this.summary.user_data.watch_data[i].traktid ===
                                this.currPlayingTraktID
                            ) {
                                if (
                                    !this.summary.user_data.watch_data[i]
                                        .finished
                                ) {
                                    this.summary.user_data.watch_data[0] = {
                                        episode_number: totalEpisode,
                                        finished,
                                        length,
                                        position,
                                        season: this.sourceFinderSeason,
                                        time_modified: Date.now(),
                                        time_watched: finished
                                            ? Date.now()
                                            : null,
                                        traktid: this.currPlayingTraktID
                                    }
                                } else {
                                    this.summary.user_data.watch_data.unshift({
                                        episode_number: totalEpisode,
                                        finished,
                                        length,
                                        position,
                                        season: this.sourceFinderSeason,
                                        time_modified: Date.now(),
                                        time_watched: finished
                                            ? Date.now()
                                            : null,
                                        traktid: this.currPlayingTraktID
                                    })
                                }
                            }
                        }
                    }
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
        getSeasons() {
            if (this.mediatype === 'show') {
                this.$apollo
                    .query({
                        query: queries.seasonsAndEpisodes,
                        variables: {
                            traktID: this.traktID,
                            saveTmdbID: this.summary.ids.tmdb
                        }
                    })
                    .then((response) => {
                        this.seasons = response.data.seasonsAndEpisodes
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
    },
    head() {
        return {
            title: this.summary.title,
            meta: [
                {
                    hid: 'summary_description',
                    name: 'description',
                    content: this.summary.overview
                }
            ]
        }
    }
}
</script>
