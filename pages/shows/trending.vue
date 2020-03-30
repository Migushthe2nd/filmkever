<template>
    <div>
        <resultsList
            :items="trendingShowsItems"
            :load-results="loadTrendingShows"
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
            title: 'Trending Shows',
            subtitle: 'Shows being watched right now',
            mediatype: 'show',
            params: {},
            displayResultsCount: true,
            displayItemRank: true,
            autoLoadMoreResults: true
        }
    }
}
</script>
