<template>
    <div>
        <resultsList
            :items="watchlistShowsItems"
            :load-results="loadWatchlistShows"
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
            title: 'Shows on your watchlist',
            subtitle: 'Ordered by last added',
            mediatype: 'show',
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
