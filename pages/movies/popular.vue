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
            title: 'All-Time Popular Movies',
            subtitle: 'The all-time most popular movies',
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
            this.loadPopularMovies()
        }
    }
}
</script>
