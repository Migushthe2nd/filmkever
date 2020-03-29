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
            title: 'Movies you are watching',
            subtitle: 'Ordered by last modified',
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
            this.loadContinueMovies()
        }
    }
}
</script>
