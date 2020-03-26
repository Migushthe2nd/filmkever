<template>
    <div>
        <oneList />
    </div>
</template>

<script>
import oneList from '@/layouts/oneList.vue'
import loadResults from '@/web_utils/loadResults.js'

export default {
    components: {
        oneList
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
        this.loadTrendingMovies()
    },
    methods: {
        loadResults() {
            this.loadTrendingMovies()
        }
    }
}
</script>
