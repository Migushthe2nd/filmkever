import cheerio from 'cheerio'
let tempIndex = null
const englishOnlyREGEX = /[\w\d:.,[\]()?!]+/gm

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

                        $('.itemFetched').each(function() {
                            const item = $(this)

                            const yearREGEX = /\d{4}/gm
                            resultsArray[i] = {}
                            resultsArray[i].title = $(item)
                                .prop('title')
                                .match(englishOnlyREGEX)
                                .join(' ')
                                .replace(yearREGEX, '')

                            resultsArray[i].url = $(item).attr('href')
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
                                '.download-info li.quality-item',
                                item
                            )
                                .text()
                                .match(englishOnlyREGEX)
                                .join(' ')

                            if (
                                $('.download-info li:nth-child(3)', item)
                                    .length > 0
                            ) {
                                resultsArray[i].size = $(
                                    '.download-info li:nth-child(2)',
                                    item
                                )
                                    .text()
                                    .replace('گیگابایت', 'GB')
                                    .replace('مگابایت', 'MB')
                                resultsArray[i].group = $(
                                    '.download-info li:nth-child(3)',
                                    item
                                ).text()
                            } else {
                                resultsArray[i].size = $(
                                    '.download-info li:nth-child(2)',
                                    item
                                )
                                    .text()
                                    .replace('گیگابایت', 'GB')
                                    .replace('مگابایت', 'MB')
                            }
                            resultsArray[i].url = $(
                                '.download-link .download-link-btn',
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
                                $('.show-links li:nth-child(1)', item)
                                    .text()
                                    .replace(/\D+/gm, '')
                                    .replace(/^0/, '')
                            )

                            if (
                                seasonInDocument ===
                                self.$parent.sourceFinderSeason
                            ) {
                                resultsArray[i] = {}
                                resultsArray[i].quality = $(
                                    '.show-links li:nth-child(3)',
                                    item
                                )
                                    .text()
                                    .match(/[a-zA-Z0-9]+/gm)
                                    .join(' ')

                                // resultsArray[i].size = $(
                                //     '.show-links li:nth-child(2)',
                                //     item
                                // )
                                //     .text()
                                //     .replace('گیگابایت', 'GB/Ep')
                                //     .replace('مگابایت', 'MB/Ep')

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
