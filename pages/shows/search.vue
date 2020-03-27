<template>
    <div>
        <resultsList />
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
            title: `Show Search Results`,
            mediatype: 'show',
            displayResultsCount: true,
            displayItemRank: false,
            autoLoadMoreResults: true
        }
    },
    created() {
        this.loadResults()
    },
    methods: {
        loadResults() {
            if (this.$store.state.searchQuery) {
                this.loadSearchShows(
                    this.$store.state.searchQuery ||
                        decodeURIComponent(this.$route.query.s)
                )
            }
        },
        loadUpdateResults(query) {
            this.loadSearchShows(query)
        }
    }
}
</script>
