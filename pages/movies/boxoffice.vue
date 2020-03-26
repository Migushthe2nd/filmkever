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
            title: 'Box Office Movies',
            subtitle:
                'The top 10 grossing movies in the U.S. box office last weekend',
            mediatype: 'movie',
            displayResultsCount: false,
            displayItemRank: false,
            autoLoadMoreResults: true
        }
    },
    created() {
        this.loadBoxofficeMovies()
    },
    methods: {
        loadResults() {
            this.loadBoxofficeMovies()
        }
    }
}
</script>
