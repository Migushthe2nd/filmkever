let alreadyFirstStart = false
player.once('playing', function () {
    if (!alreadyFirstStart) {
        player.currentTime = sourceConfig.starttime
        alreadyFirstStart = true
        window.setInterval(function () {
            if (player.playing) {
                parent.postMessage(
                    {
                        name: 'position',
                        length: Math.floor(player.duration),
                        position: Math.floor(player.currentTime)
                    },
                    VUE_APP_HOST
                )
            }
        }, 5000)
    }
})