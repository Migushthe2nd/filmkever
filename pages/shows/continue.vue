<template>
    <div>
        <resultsList
            :items="continueShowsItems"
            :load-results="loadContinueShows"
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
            title: 'Shows you are watching',
            subtitle: 'Ordered by last modified',
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
