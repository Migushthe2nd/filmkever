<template>
    <div>
        <resultsList
            :items="watchlistMoviesItems"
            :load-results="loadWatchlistMovies"
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
            title: 'Movies on your watchlist',
            subtitle: 'Ordered by last added',
            mediatype: 'movie',
            params: {},
            displayResultsCount: false,
            displayItemRank: false,
            autoLoadMoreResults: true
        }
    },
    beforeCreate() {
        if (!this.$store.state.loggedIn) {
            this.$router.replace('/')
        }
    }
}
</script>
