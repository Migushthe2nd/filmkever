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
            title: 'Your Movies Watchlist',
            subtitle: 'Ordered by last added',
            mediatype: 'movie',
            displayResultsCount: false,
            displayItemRank: false,
            autoLoadMoreResults: true
        }
    },
    beforeCreate() {
        if (!this.$store.state.loggedIn) {
            this.$router.replace('/')
        }
    },
    created() {
        this.loadResults()
    },
    methods: {
        loadResults() {
            this.loadWatchlistMovies()
        }
    }
}
</script>
