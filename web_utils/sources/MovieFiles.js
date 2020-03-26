export default {
    data() {
        return {}
    },
    methods: {
        searchMovieFiles() {
            let searchQuery = null
            switch (this.$parent.mediatype) {
                case 'movie':
                    searchQuery = this.$parent.summary.title
                    break
                case 'show':
                    searchQuery = this.$parent.sourceFinderSeason
                        ? this.$parent.summary.title +
                          ' ' +
                          this.$parent.sourceFinderSeason
                        : this.$parent.summary.title
                    break
            }
            this.iframeIsLoading = true
            this.playerIframeSource =
                'https://moviefiles.org/?search2=' +
                encodeURIComponent(searchQuery.replace(/[^a-zA-Z \d.]/gm, ''))
            this.useUserInput = true
            this.displayPlayerIframe = true
        }
    }
}
