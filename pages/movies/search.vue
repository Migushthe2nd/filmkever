<template>
    <div>
        <resultsList :items="searchMoviesItems" :load-results="loadResults" />
    </div>
</template>

<script>
import resultsList from '@/layouts/resultsList.vue'
import loadResults from '@/web_utils/loadResults.js'
import searchRefresher from '@/web_utils/searchRefresher.js'

export default {
    components: {
        resultsList
    },
    mixins: [loadResults, searchRefresher],
    data() {
        return {
            title: `Movie Search Results`,
            mediatype: 'movie',
            params: {},
            displayResultsCount: true,
            displayItemRank: false,
            autoLoadMoreResults: true
        }
    },
    methods: {
        loadResults(params, callback) {
            if (this.$store.state.searchQuery) {
                this.loadSearchMovies(
                    this.$store.state.searchQuery ||
                        decodeURIComponent(this.$route.query.s),
                    () => {
                        callback()
                    }
                )
            }
        },
        loadUpdateResults(query) {
            this.loadSearchMovies(query)
        }
    }
}
</script>
