export default {
    data() {
        return {}
    },
    mounted() {
        window.addEventListener('message', this.receiveMessage, false)
    },
    beforeDestroy() {
        window.removeEventListener('message', this.receiveMessage)
    },
    methods: {
        receiveMessage(event) {
            if (event.origin !== 'null') return

            const sendPosition = () => {
                this.$parent.mediaProgress(
                    this.$parent.mediatype === 'movie' ? 'movie' : 'episode',
                    this.$parent.currPlayingTraktID,
                    (event.data.position / event.data.length) * 100 >
                        this.$store.state.user.preferences.finishPercentage
                        ? true
                        : null,
                    event.data.length,
                    event.data.position
                )
                this.lastPosition = event.data.position
            }

            switch (event.data.name) {
                case 'position':
                    if (this.$store.state.loggedIn) {
                        if (
                            this.selectedSource.name === 'MovieFiles' &&
                            event.data.position > this.lastPosition
                        ) {
                            sendPosition()
                        } else {
                            sendPosition()
                        }
                    }
                    break
                default:
                    // eslint-disable-next-line no-console
                    console.log('Unknown frame event')
            }
        }
    }
}
