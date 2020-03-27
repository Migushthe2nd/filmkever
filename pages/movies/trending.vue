<template>
    <div>
        <resultsList />
    </div>
</template>

<script>
import resultsList from '@/layouts/resultsList.vue'
import loadResults from '@/web_utils/loadResults.js'

export default {
    components: {
        resultsList
    },
    mixins: [loadResults],
    data() {
        return {
            title: 'Trending Movies',
            subtitle: 'Movies being watched right now',
            mediatype: 'movie',
            displayResultsCount: true,
            displayItemRank: true,
            autoLoadMoreResults: true
        }
    },
    created() {
        this.loadResults()
    },
    methods: {
        loadResults() {
            this.loadTrendingMovies()
        }
    }
}
</script>
