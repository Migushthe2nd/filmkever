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
            title: 'Trending Shows',
            subtitle: 'Shows being watched right now',
            mediatype: 'show',
            displayResultsCount: true,
            displayItemRank: true,
            autoLoadMoreResults: true
        }
    },
    created() {
        this.loadTrendingShows()
    },
    methods: {
        loadResults() {
            this.loadTrendingShows()
        }
    }
}
</script>
