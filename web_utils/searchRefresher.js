export default {
    computed: {
        searchQuery() {
            return this.$store.state.searchQuery
        },
        currSearchType() {
            return this.$store.state.currSearchType
        },
        subtitle() {
            return (
                this.$store.state.searchQuery ||
                decodeURIComponent(this.$route.query.s) ||
                'Please search something'
            )
        }
    },
    watch: {
        searchQuery(newQuery, oldQuery) {
            this.clearList()
            this.loadUpdateResults(
                newQuery || decodeURIComponent(this.$route.query.s)
            )
        },
        currSearchType(newType, oldType) {
            this.$router.push({
                path: `/${newType.toLowerCase()}/search`,
                query: { s: this.$store.state.searchQuery }
            })
        }
    },
    created() {
        if (!this.$store.state.searchQuery) {
            this.$store.commit(
                'UPDATE_SEARCH_QUERY',
                decodeURIComponent(this.$route.query.s)
            )
        }
    }
}
