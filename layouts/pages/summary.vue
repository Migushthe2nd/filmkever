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
                    class="mx-auto"
                    type="list-item-two-line"
                ></v-skeleton-loader>
                <v-skeleton-loader
                    class="mx-auto"
                    type="list-item-two-line"
                ></v-skeleton-loader>
                <v-skeleton-loader
                    class="mx-auto"
                    type="list-item-two-line"
                ></v-skeleton-loader>
                <v-skeleton-loader
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
                        this.summary.user_data &&
                        this.summary.user_data.watchlist_data &&
                        this.summary.user_data.watchlist_data.added === true
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
                        this.summary.user_data &&
                        this.summary.user_data.watchlist_data &&
                        this.summary.user_data.watchlist_data.added === true
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
