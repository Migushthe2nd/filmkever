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
            title: 'Your Shows Watchlist',
            subtitle: 'Ordered by last watched',
            mediatype: 'show',
            displayResultsCount: false,
            displayItemRank: false,
            autoLoadMoreResults: true,
            localStoreList: this.$store.state.showWatchlist
        }
    },
    created() {
        if (!this.$store.state.loggedIn) {
            this.$router.replace('/')
        } else {
            this.loadResults()
        }
    },
    methods: {
        loadResults() {
            this.loadWatchlistShows()
        }
    }
}
</script>
