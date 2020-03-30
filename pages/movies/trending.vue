<template>
    <div>
        <resultsList
            :items="trendingMoviesItems"
            :load-results="loadTrendingMovies"
        />
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
            params: {},
            displayResultsCount: true,
            displayItemRank: true,
            autoLoadMoreResults: true
        }
    }
}
</script>
