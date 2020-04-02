import queries from '@/web_utils/queries.gql'

export default {
    data() {
        return {}
    },
    methods: {
        searchFilePursuit(args, callback) {
            this.videoUrls = []
            this.querySubscription = this.$apollo
                .subscribe({
                    query: queries.searchFilePursuit,
                    variables: {
                        id: Math.random()
                            .toString(36)
                            .substr(2, 9),
                        title: this.$parent.summary.title,
                        mediatype: this.$parent.mediatype,
                        imdb: this.$parent.summary.ids.imdb,
                        year: this.$parent.summary.year,
                        season: this.$parent.sourceFinderSeason,
                        episode: this.$parent.sourceFinderEpisode
                    }
                })
                .subscribe(({ data, loading }) => {
                    for (let i = 0; i < data.searchFilePursuit.length; i++) {
                        if (data.searchFilePursuit[i].extracted)
                            this.videoUrls.push(data.searchFilePursuit[i].url)
                    }
                })
            // .then((response) => {
            //     this.resultAmount =
            //         response.data.searchMovies.pagination.item_count
            //     if (
            //         response.data.searchMovies.pagination.page_count ===
            //         response.data.searchMovies.pagination.page
            //     ) {
            //         this.limitReached = true
            //     } else {
            //         this.page++
            //     }
            //     this.searchMoviesItems = this.searchMoviesItems.concat(
            //         response.data.searchMovies.items
            //     )
            //     callback()
            // })
            // .catch((error) => {
            //     this.parseErrors(error)
            //     callback()
            // })
        }
    }
}
