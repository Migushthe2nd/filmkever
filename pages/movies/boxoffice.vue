<template>
    <div>
        <resultsList
            :items="boxofficeMoviesItems"
            :load-results="loadBoxofficeMovies"
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
            title: 'Box Office Movies',
            subtitle:
                'The top 10 grossing movies in the U.S. box office last weekend',
            mediatype: 'movie',
            params: {},
            displayResultsCount: false,
            displayItemRank: false,
            autoLoadMoreResults: true
        }
    }
}
</script>
