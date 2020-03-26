import cheerio from 'cheerio'

export default {
    data() {
        return {}
    },
    methods: {
        searchFmovies() {
            let searchQuery = null
            switch (this.$parent.mediatype) {
                case 'movie':
                    searchQuery = this.$parent.summary.title
                    break
                case 'show':
                    searchQuery = this.$parent.sourceFinderSeason
                        ? this.$parent.sourceFinderSeason + ' '
                        : this.$parent.summary.title
                    break
            }
            this.iframeIsLoading = true
            // this.playerIframeSource =
            //     'https://fmovies.to/ajax/film/search?sort=year%3Adesc&keyword=' +
            //     encodeURIComponent(searchQuery)
            // this.displayPlayerIframe = true
            this.$axios({
                url:
                    'https://fmovies.to/ajax/film/search?sort=year%3Adesc&keyword=' +
                    encodeURIComponent(searchQuery)
            })
                .then((response) => {
                    if (response.data.html === '') {
                        this.sourceSnackbarNoResults()
                    } else {
                        const $ = cheerio.load(response.data.html, {
                            decodeEntities: false
                        })
                        const resultsArray = []
                        let i = 0

                        $('.item').each(function() {
                            const item = $(this)
                            const idREGEX = /\.(.+)/gm
                            resultsArray[i] = {}
                            resultsArray[i].title = $(
                                '.info .name',
                                item
                            ).html()
                            resultsArray[i].year = $(
                                '.info .meta span:nth-child(3)',
                                item
                            )
                                .text()
                                .replace(/\D+/gm, '')
                            resultsArray[i].data_id = idREGEX.exec(
                                $('.info .name', item).attr('href')
                            )[1]
                            resultsArray[i].poster = $('.thumb', item).attr(
                                'src'
                            )
                            i++
                        })

                        if (resultsArray.length > 0) {
                            this.searchResponse = resultsArray
                            this.$parent.sourceFinderStep++
                        } else {
                            this.sourceSnackbarNoResults()
                        }
                    }
                })
                .catch(() => {
                    this.sourceSnackbarErrorResults()
                })
        },
        itemsFmovies(index) {
            this.crossRequestIframe = encodeURIComponent(
                'https://fmovies.to/ajax/film/servers/' +
                    this.searchResponse[index].data_id
            )

            this.$axios({
                url: this.makeProxyUrl(
                    'https://fmovies.to/ajax/film/servers/' +
                        this.searchResponse[index].data_id
                )
            })
                .then((response) => {
                    const $ = cheerio.load(response.data.html, {
                        decodeEntities: false
                    })

                    const resultsArray = []
                    let i = 0
                    const serverrow = $('.server.row').first() // MyCloud
                    // var serverrow = $('.server.row:nth-child(2)'); // F5 - HQ
                    $('a', serverrow).each(function() {
                        const option = $(this)
                        resultsArray[i] = {}
                        resultsArray[i].name = option.html()
                        resultsArray[i].url = option.attr('href') // public url to fmovies.to/film/result
                        resultsArray[i].data_id = option.attr('data-id')
                        i++
                    })
                    if (resultsArray.length > 0) {
                        this.itemsResponse = resultsArray
                        this.$parent.sourceFinderStep++
                    } else {
                        this.sourceSnackbarNoResults()
                    }
                })
                .catch(() => {
                    this.sourceSnackbarErrorResults()
                })
        },
        playlistFmovies(index) {
            const url =
                'https://fmovies.to/ajax/episode/info?ts=' +
                Math.floor(new Date() / 1000) +
                '_=694&id=' +
                this.itemsResponse[index].data_id +
                '&server=36'

            const self = this
            this.$axios({ url: this.makeProxyUrl(url) })
                .then((response) => {
                    const targetURL = response.data.target
                    const vttURL = response.data.subtitle
                    setTimeout(function() {
                        self.$axios({
                            url: self.makeProxyUrl(
                                'https://fmovies.to/ajax/film/servers/' +
                                    self.searchResponse[index].data_id,
                                url
                            )
                        })
                            .then((response) => {
                                let error = null
                                let mediaSources = null
                                if (targetURL.includes('mcloud')) {
                                    const source = 'mcloud.to'

                                    const $ = cheerio.load(response.data)

                                    const mediaSourcesREGEX = /var mediaSources = (.*);/gmu
                                    if (
                                        $('div.inner')
                                            .text()
                                            .includes(
                                                'This video is in processing'
                                            )
                                    ) {
                                        // Video is being processed!
                                        error =
                                            'Deze video is aan het verwerken i.v.m. een recente crash bij de bron. Probeer het later opnieuw.'
                                    } else {
                                        mediaSources = JSON.parse(
                                            mediaSourcesREGEX.exec(
                                                response.data
                                            )[1]
                                        )
                                    }

                                    const image = null
                                    const playlist = [
                                        {
                                            file: '/media/intro.mp4'
                                        },
                                        {
                                            image: image || undefined,
                                            sources: mediaSources,
                                            tracks: vttURL
                                                ? [
                                                      {
                                                          file: vttURL,
                                                          kind: 'captions',
                                                          label: 'eng',
                                                          default: true
                                                      }
                                                  ]
                                                : []
                                        }
                                    ]

                                    if (!error) {
                                        self.playlistResponse = {
                                            playlist,
                                            cast: false,
                                            referer: source
                                        }
                                    } else {
                                        self.sourceSnackbarErrorResults()
                                    }
                                }
                            })
                            .catch(() => {
                                self.sourceSnackbarErrorResults()
                            })
                    }, 400)
                })
                .catch(() => {
                    this.sourceSnackbarErrorResults()
                })
        }
    }
}
