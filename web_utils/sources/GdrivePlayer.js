export default {
    data() {
        return {}
    },
    methods: {
        searchGdrivePlayer() {
            // let searchQuery = null
            // switch (this.$parent.mediatype) {
            //     case 'movie':
            //         searchQuery = this.$parent.summary.title
            //         break
            //     case 'show':
            //         searchQuery = this.$parent.sourceFinderSeason
            //             ? this.$parent.sourceFinderSeason + ' '
            //             : this.$parent.summary.title
            //         break
            // }

            if (
                !this.$parent.summary.ids.imdb &&
                !this.$parent.summary.ids.tmdb
            ) {
                this.sourceSnackbarNoResults()
            } else if (this.$parent.mediatype === 'movie') {
                this.iframeIsLoading = true
                this.playerIframeSource =
                    'http://database.gdriveplayer.us/player.php?imdb=' +
                    this.$parent.summary.ids.imdb
                this.displayPlayerIframe = true
                this.$parent.displaySourceFinder = false
            } else if (this.$parent.mediatype === 'show') {
                let seasonsAmount = 0
                let seasonString = null

                if (this.$parent.sourceFinderSeason === 0) {
                    this.sourceSnackbarNoResults()
                } else {
                    for (let i = 0; i < this.$parent.seasons.length; i++) {
                        if (this.$parent.seasons[i].number !== 0) {
                            seasonsAmount++
                        }
                    }
                    if (seasonsAmount > 10) {
                        if (this.$parent.sourceFinderSeason) {
                            if (this.$parent.sourceFinderSeason < 10) {
                                seasonString = ` - season ${this.$parent.sourceFinderSeason}`
                            }
                        } else {
                            seasonString = ``
                        }
                    } else if (this.$parent.sourceFinderSeason) {
                        seasonString = ` - season ${this.$parent.sourceFinderSeason}`
                    } else {
                        seasonString = ``
                    }

                    this.$axios({
                        url: `https://api.gdriveplayer.us/v2/series/search?title=${this.$parent.summary.title.replace(
                            /[^a-zA-Z \d:.]/gm,
                            ''
                        )}${seasonString}`
                    })
                        .then((response) => {
                            if (response.data !== null) {
                                const resultsArray = []
                                for (let i = 0; i < response.data.length; i++) {
                                    resultsArray.push({
                                        title: response.data[i].title,
                                        url: response.data[i].detail,
                                        poster: response.data[i].poster,
                                        id: response.data[i].id
                                    })
                                }

                                if (resultsArray.length > 0) {
                                    this.searchResponse = resultsArray
                                    this.$parent.sourceFinderStep++
                                } else {
                                    this.sourceSnackbarNoResults()
                                }
                            } else {
                                if (seasonsAmount > 10) {
                                    if (this.$parent.sourceFinderSeason) {
                                        if (
                                            this.$parent.sourceFinderSeason < 10
                                        ) {
                                            seasonString = ` - season 0${this.$parent.sourceFinderSeason}`
                                        }
                                    } else {
                                        seasonString = ``
                                    }
                                } else if (this.$parent.sourceFinderSeason) {
                                    seasonString = ` - season ${this.$parent.sourceFinderSeason}`
                                } else {
                                    seasonString = ``
                                }

                                this.$axios({
                                    url: `https://api.gdriveplayer.us/v2/series/search?title=${this.$parent.summary.title.replace(
                                        /[^a-zA-Z \d:.]/gm,
                                        ''
                                    )}${seasonString}`
                                })
                                    .then((response) => {
                                        if (response.data !== null) {
                                            const resultsArray = []
                                            for (
                                                let i = 0;
                                                i < response.data.length;
                                                i++
                                            ) {
                                                resultsArray.push({
                                                    title:
                                                        response.data[i].title,
                                                    url:
                                                        response.data[i].detail,
                                                    poster:
                                                        response.data[i].poster,
                                                    id: response.data[i].id
                                                })
                                            }

                                            if (resultsArray.length > 0) {
                                                this.searchResponse = resultsArray
                                                this.$parent.sourceFinderStep++
                                            } else {
                                                this.sourceSnackbarNoResults()
                                            }
                                        } else {
                                            this.sourceSnackbarNoResults()
                                        }
                                    })
                                    .catch(() => {
                                        this.sourceSnackbarErrorResults()
                                    })
                            }
                        })
                        .catch(() => {
                            this.sourceSnackbarErrorResults()
                        })
                }
            }
        },
        itemsGdrivePlayer(index) {
            this.$axios({
                url: this.searchResponse[index].url
            })
                .then((response) => {
                    if (response.data !== null) {
                        const resultsArray = []
                        for (
                            let i = 0;
                            i < response.data[0].list_episode.length;
                            i++
                        ) {
                            resultsArray.push({
                                name: response.data[0].list_episode[i].episode,
                                url: response.data[0].list_episode[i].player_url
                            })
                        }

                        if (resultsArray.length > 0) {
                            this.itemsResponse = resultsArray
                            this.$parent.sourceFinderStep++
                        } else {
                            this.sourceSnackbarNoResults()
                        }
                    } else {
                        this.sourceSnackbarNoResults()
                    }
                })
                .catch(() => {
                    this.sourceSnackbarErrorResults()
                })
        },
        playlistGdrivePlayer(index) {
            this.iframeIsLoading = true
            this.playerIframeSource = this.itemsResponse[index].url
            this.displayPlayerIframe = true
            this.$parent.displaySourceFinder = false
        }
    }
}
