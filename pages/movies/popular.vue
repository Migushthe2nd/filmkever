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
            title: 'All-Time Popular Movies',
            subtitle: 'The all-time most popular movies',
            mediatype: 'movie',
            displayResultsCount: true,
            displayItemRank: true,
            autoLoadMoreResults: true
        }
    },
    created() {
        this.loadPopularMovies()
    },
    methods: {
        loadResults() {
            this.loadPopularMovies()
        }
    }
}
</script>
