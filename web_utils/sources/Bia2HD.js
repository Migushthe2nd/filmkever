import cheerio from 'cheerio'
let tempIndex = null

export default {
    data() {
        return {}
    },
    methods: {
        searchBia2HD() {
            this.$axios({
                url: this.makeProxyUrl(
                    'http://bia2hd.ga/wp-admin/admin-ajax.php?action=live_func&keyword=' +
                        encodeURIComponent(
                            this.$parent.summary.title.replace(
                                /\([^()]*\)/gm,
                                ''
                            )
                        )
                )
            })
                .then((response) => {
                    if (response.data === '') {
                        this.sourceSnackbarNoResults()
                    } else {
                        const $ = cheerio.load(response.data, {
                            decodeEntities: false
                        })
                        const resultsArray = []
                        let i = 0

                        $('.live-items').each(function() {
                            const item = $(this)
                            const englishOnlyREGEX = /[\w\d:.,[\]()?!]+/gm
                            const yearREGEX = /\d{4}/gm
                            resultsArray[i] = {}
                            resultsArray[i].title = $('.q-title', item)
                                .text()
                                .match(englishOnlyREGEX)
                                .join(' ')
                                .replace(yearREGEX, '')
                            const year = yearREGEX.exec(
                                $('.q-title', item).text()
                            )
                            resultsArray[i].year = year ? year.join('') : null
                            resultsArray[i].url = $('a', item).attr('href')
                            resultsArray[i].poster = $('img', item).attr('src')
                            i++
                        })

                        if (resultsArray.length > 0) {
                            this.searchResponse = resultsArray
                            this.$parent.sourceFinderStep++
                        } else {
                            this.sourceSnackbarNoResults()
                        }
                        this.loading = false
                    }
                })
                .catch(() => {
                    this.sourceSnackbarErrorResults()
                    this.loading = false
                })
        },
        qualityBia2HD(index) {
            tempIndex = index
            this.$axios({
                url: this.makeProxyUrl(
                    encodeURIComponent(
                        unescape(this.searchResponse[index].url)
                    ),
                    'http://bia2hd.ga/'
                )
            })
                .then((response) => {
                    const $ = cheerio.load(response.data, {
                        decodeEntities: false
                    })
                    const self = this

                    const resultsArray = []
                    let i = 0

                    if (!this.searchResponse[index].url.includes('/series/')) {
                        $('.dl-items').each(function() {
                            const item = $(this)
                            resultsArray[i] = {}
                            resultsArray[i].quality = $(
                                '.download-info li:nth-child(1) span',
                                item
                            ).text()
                            if (
                                $('.download-info li:nth-child(3) span', item)
                                    .length > 0
                            ) {
                                resultsArray[i].size = $(
                                    '.download-info li:nth-child(3) span',
                                    item
                                )
                                    .text()
                                    .replace('گیگابایت', 'GB')
                                    .replace('مگابایت', 'MB')
                                resultsArray[i].group = $(
                                    '.download-info li:nth-child(2) span',
                                    item
                                ).text()
                            } else {
                                resultsArray[i].size = $(
                                    '.download-info li:nth-child(2) span',
                                    item
                                )
                                    .text()
                                    .replace('گیگابایت', 'GB')
                                    .replace('مگابایت', 'MB')
                            }
                            resultsArray[i].url = $(
                                '.download-link a.dl-',
                                item
                            ).attr('href')

                            i++
                        })
                    } else if (
                        this.searchResponse[index].url.includes('/series/')
                    ) {
                        $('.links-body').each(function() {
                            const item = $(this)
                            const seasonInDocument = parseInt(
                                $(
                                    '.show-links li:nth-child(1) span',
                                    item
                                ).text()
                            )
                            if (
                                seasonInDocument ===
                                self.$parent.sourceFinderSeason
                            ) {
                                resultsArray[i] = {}
                                resultsArray[i].quality = $(
                                    '.show-links li:nth-child(4) span',
                                    item
                                ).text()
                                resultsArray[i].size = $(
                                    '.show-links li:nth-child(3) span',
                                    item
                                )
                                    .text()
                                    .replace('گیگابایت', 'GB/Ep')
                                    .replace('مگابایت', 'MB/Ep')

                                resultsArray[i].episodes = []
                                $('.dl-body p:nth-child(1) a', item).each(
                                    function() {
                                        resultsArray[i].episodes.push({
                                            name: $(this)
                                                .text()
                                                .replace(/\D+/gm, '')
                                                .replace(/^0/, ''),
                                            url: $(this).attr('href')
                                        })
                                    }
                                )

                                i++
                            }
                        })
                    }

                    if (resultsArray.length > 0) {
                        this.qualityResponse = resultsArray
                        this.$parent.sourceFinderStep += 0.5
                    } else {
                        this.sourceSnackbarNoResults()
                    }
                    this.loading = false
                })
                .catch(() => {
                    this.sourceSnackbarErrorResults()
                    this.loading = false
                })
        },
        itemsBia2HD(index) {
            if (!this.searchResponse[tempIndex].url.includes('/series/')) {
                this.makeIframePlayer(this.qualityResponse[index].url)
            } else if (
                this.searchResponse[tempIndex].url.includes('/series/')
            ) {
                this.itemsResponse = this.qualityResponse[index].episodes
                this.$parent.sourceFinderStep = 2
            }
            this.loading = false
        },
        playlistBia2HD(index) {
            this.makeIframePlayer(this.itemsResponse[index].url)
            this.loading = false
        }
    }
}
