export default {
    methods: {
        convertMinsToHrsMins(mins) {
            let h = Math.floor(mins / 60)
            let m = mins % 60
            h = h < 10 ? '0' + h : h
            m = m < 10 ? '0' + m : m
            return `${h}:${m}`
        },
        displayProgress(item, manuallyActivate) {
            if (manuallyActivate === true) {
                return true
            } else if (
                manuallyActivate === false &&
                this.$store.state.loggedIn &&
                !(
                    item.user_data &&
                    item.user_data.watch_data &&
                    item.user_data.watch_data.length > 0
                )
            ) {
                return false
            } else if (
                this.$store.state.loggedIn &&
                item.user_data &&
                ((item.user_data.watch_data &&
                    item.user_data.watch_data.length > 0) ||
                    (item.user_data.watchlist_data &&
                        item.user_data.watchlist_data.added))
            ) {
                return true
            } else return false
        },
        progressValue(item, mediatype) {
            if (
                item.user_data &&
                item.user_data.watch_data &&
                item.user_data.watch_data.length > 0
            ) {
                if (mediatype === 'movie') {
                    if (!item.user_data.watch_data[0].finished) {
                        return (
                            ((Math.floor(
                                item.user_data.watch_data[0].position / 60
                            ) || 0) /
                                parseInt(item.runtime)) *
                            100
                        )
                    } else if (item.user_data.watch_data[0].finished) {
                        return 100
                    } else return 0
                } else if (mediatype === 'show') {
                    return (
                        ((Math.max.apply(
                            Math,
                            item.user_data.watch_data.map(function(o) {
                                return o.episode_number
                            })
                        ) || 0) /
                            (item.aired_episodes || 0)) *
                        100
                    )
                }
            } else return 0
        },
        progressText(item, mediatype) {
            if (mediatype === 'movie') {
                let currPosition = null
                let currLength = null
                if (
                    item.user_data &&
                    item.user_data.watch_data &&
                    item.user_data.watch_data.length > 0
                ) {
                    currPosition = Math.floor(
                        item.user_data.watch_data[0].position / 60
                    )
                    currLength = Math.floor(
                        item.user_data.watch_data[0].length / 60
                    )
                }

                if (
                    item.user_data &&
                    item.user_data.watch_data &&
                    item.user_data.watch_data.length > 0 &&
                    !item.user_data.watch_data[0].finished
                ) {
                    return `${this.convertMinsToHrsMins(
                        currPosition || 0
                    )}/${(currLength
                        ? this.convertMinsToHrsMins(currLength)
                        : null) ||
                        (item.runtime
                            ? this.convertMinsToHrsMins(item.runtime)
                            : '?')}`
                } else
                    return `${
                        currLength
                            ? this.convertMinsToHrsMins(currLength)
                            : this.convertMinsToHrsMins(0)
                    }/${(currLength
                        ? this.convertMinsToHrsMins(currLength)
                        : null) ||
                        (item.runtime
                            ? this.convertMinsToHrsMins(item.runtime)
                            : '?')}`
            } else if (mediatype === 'show') {
                let currEpisode = null
                if (
                    item.user_data &&
                    item.user_data.watch_data &&
                    item.user_data.watch_data.length > 0
                ) {
                    currEpisode = Math.max.apply(
                        Math,
                        item.user_data.watch_data.map(function(o) {
                            return o.episode_number
                        })
                    )
                }

                return `${currEpisode || 0}/${item.aired_episodes || 0}/${
                    item.status === 'ended' || item.status === 'canceled'
                        ? item.aired_episodes
                        : '?'
                }`
            }
        }
    }
}
