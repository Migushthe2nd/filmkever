import cheerio from 'cheerio'

export default {
    data() {},
    methods: {
        searchSoap2Day() {
            const self = this
            this.$axios({
                url: this.makeProxyUrl(
                    'https://soap2day.to/search/keyword/' +
                        encodeURIComponent(this.$parent.summary.title)
                )
            })
                .then((response) => {
                    const $ = cheerio.load(response.data)
                    const resultsArray = []
                    let i = 0
                    $('.thumbnail').each(function() {
                        const item = $(this)
                        if (
                            self.$parent.mediatype === 'movie' &&
                            $('a', item)
                                .attr('href')
                                .split('_')[0]
                                .includes('movie')
                        ) {
                            resultsArray[i] = {}
                            resultsArray[i].title = $('h5 a', item).text()
                            resultsArray[i].year = $(
                                '.img-tip.label-info',
                                item
                            ).text()
                            resultsArray[i].data_id = $('a', item)
                                .attr('href')
                                .split('_')[1]
                                .replace(/.html/gm, '')
                            resultsArray[i].poster =
                                'https://soap2day.to' +
                                $('a img', item).attr('src')
                            resultsArray[i].referer =
                                'https://soap2day.to' +
                                $('h5 a', item).attr('href')
                            i++
                        } else if (
                            self.$parent.mediatype === 'show' &&
                            $('a', item)
                                .attr('href')
                                .split('_')[0]
                                .includes('tv')
                        ) {
                            resultsArray[i] = {}
                            resultsArray[i].title = $('h5 a', item).text()
                            resultsArray[i].year = $(
                                '.img-tip.label-info',
                                item
                            ).text()
                            resultsArray[i].data_id = $('a', item)
                                .attr('href')
                                .split('_')[1]
                                .replace(/.html/gm, '')
                            resultsArray[i].poster =
                                'https://soap2day.to' +
                                $('a img', item).attr('src')
                            resultsArray[i].referer =
                                'https://soap2day.to' +
                                $('h5 a', item).attr('href')
                            i++
                        }
                    })

                    if (resultsArray.length > 0) {
                        this.searchResponse = resultsArray
                        this.$parent.sourceFinderStep++
                    } else {
                        this.sourceSnackbarNoResults()
                    }
                })
                .catch(() => {
                    this.sourceSnackbarErrorResults()
                })
            this.loading = false
        },
        itemsSoap2Day(index) {
            let url
            const self = this
            if (this.$parent.mediatype === 'movie') {
                url =
                    'https://soap2day.to/movie_' +
                    this.searchResponse[index].data_id

                const resultsArray = []
                resultsArray[0] = {}
                resultsArray[0].name = 'Movie'
                resultsArray[0].url = url // public url to fmovies.to/film/result
                resultsArray[0].data_id = this.searchResponse[index].data_id

                if (resultsArray.length > 0) {
                    this.itemsResponse = resultsArray
                    this.$parent.sourceFinderStep++
                } else {
                    this.sourceSnackbarNoResults()
                }
                this.loading = false
            } else if (this.$parent.mediatype === 'show') {
                url =
                    'https://soap2day.to/tv_' +
                    this.searchResponse[index].data_id
                setTimeout(function() {
                    self.$axios({ url: self.makeProxyUrl(url) })
                        .then((response) => {
                            const $ = cheerio.load(response.data)

                            const resultsArray = []
                            let i = 0
                            const serverrow = $(
                                'div.alert h4:contains("Season' +
                                    self.$parent.sourceFinderSeason +
                                    '")'
                            ).parent()
                            $('a', serverrow).each(function() {
                                const option = $(this)
                                const episodeREGEX = /^\d+/
                                resultsArray[i] = {}
                                resultsArray[i].name = episodeREGEX.exec(
                                    option.text()
                                )
                                resultsArray[i].url =
                                    'https://soap2day.to' + option.attr('href') // public url to fmovies.to/film/result
                                resultsArray[i].data_id = option
                                    .attr('href')
                                    .split('_')[1]
                                    .replace(/.html/gm, '')
                                i++
                            })

                            resultsArray.sort(function(a, b) {
                                return a.name - b.name
                            })

                            if (resultsArray.length > 0) {
                                this.itemsResponse = resultsArray
                                this.$parent.sourceFinderStep++
                            } else {
                                this.sourceSnackbarNoResults()
                            }
                            this.loading = false
                        })
                        .catch(() => {
                            this.sourceSnackbarErrorResults()
                            this.loading = false
                        })
                }, 1000)
            }
        },
        playlistSoap2Day(index) {
            const self = this
            let reqBaseURL
            if (this.itemsResponse[index].url.includes('movie_')) {
                reqBaseURL = 'https://soap2day.to/home/index/GetMInfoAjax'
            } else if (this.itemsResponse[index].url.includes('episode_')) {
                reqBaseURL = 'https://soap2day.to/home/index/GetEInfoAjax'
            }
            console.log(
                reqBaseURL,
                this.itemsResponse[index].data_id,
                this.itemsResponse[index].url
            )
            setTimeout(function() {
                self.$axios({
                    method: 'post',
                    url: self.makeProxyUrl(
                        reqBaseURL,
                        null,
                        self.itemsResponse[index].url
                    ),
                    data: {
                        pass: self.itemsResponse[index].data_id
                    }
                })
                    .then((response) => {
                        console.log(response.data)
                        const tracks = []
                        if (response.data.subs) {
                            for (
                                let i = 0;
                                i < response.data.subs.length;
                                i++
                            ) {
                                const track = {
                                    label: response.data.subs[i].name,
                                    default: response.data.subs[i].default,
                                    // file: 'https://soap2day.to' + response.data.subs[i].path,
                                    file: response.data.subs[i].downlink,
                                    kind: 'captions'
                                }
                                tracks.push(track)
                            }
                        }

                        const playlist = [
                            {
                                file: '/media/intro.mp4'
                            },
                            {
                                sources: [
                                    {
                                        file: response.data.val,
                                        type: response.data.type,
                                        default: true
                                    },
                                    {
                                        file: response.data.val_bak
                                            ? response.data.val_bak
                                            : undefined,
                                        type: response.data.val_bak
                                            ? response.data.type
                                            : undefined
                                    }
                                ]
                                // "tracks": tracks,
                            }
                        ]

                        console.log(
                            'playlist:',
                            JSON.stringify(playlist, null, 4)
                        )
                        self.playlistResponse = {
                            // url: decryptedObject.videos[0].url,
                            url: self.itemsResponse[index].url,
                            cast: true,
                            playlist,
                            referer: self.itemsResponse[index].url
                        }
                        this.loading = false
                    })
                    .catch(() => {
                        this.sourceSnackbarErrorResults()
                        this.loading = false
                    })
            }, 400)
        }
    }
}
