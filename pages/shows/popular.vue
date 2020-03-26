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
            title: 'All-Time Popular Shows',
            subtitle: 'The all-time most popular shows',
            mediatype: 'show',
            displayResultsCount: true,
            displayItemRank: true,
            autoLoadMoreResults: true
        }
    },
    created() {
        this.loadPopularShows()
    },
    methods: {
        loadResults() {
            this.loadPopularShows()
        }
    }
}
</script>
