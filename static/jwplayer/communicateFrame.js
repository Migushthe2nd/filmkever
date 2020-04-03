playerInstance.on('ready', function() {
    $('.jw-slider-time').css('display', 'none')
    $('.jw-text-elapsed').css('visibility', 'hidden')
    $('.jw-text-duration').css('visibility', 'hidden')
    // Add playerinfo
    $('<div></div>', { class: 'player-episode-info' })
        .append(
            $('<div></div>', { class: 'title-info' })
                .append(
                    $('<h4></h4>', {
                        class: 'headline text-truncate',
                        html: metadata.title
                    })
                )
                .append(
                    $('<h5></h5>', {
                        class: 'subheading text-truncate',
                        html: metadata.subtitle
                    })
                )
        )
        .prependTo('.jw-controls.jw-reset')
    // Add upper right buttons
    // $('<div></div>', { 'class': 'player-episode-rightnav' })
    //     .append($('<div></div>', { 'class': 'layout row wrap' })
    //         .append($('<div></div>', { 'class': 'flex btn-group' })
    //             .append($('<button></button>', {
    //                 'type': 'button', 'class': 'share btn-copy js-tooltip js-copy v-btn v-btn--flat v-btn--icon v-btn--small', 'data-toggle': 'tooltip', 'data-placement': 'bottom', 'onClick': 'buttonClick(false); share(this);'
    //             })
    //                 .append($('<div></div>', { 'class': 'v-btn__content' })
    //                     .append($('<i></i>', { 'aria-hidden': 'true', 'class': 'v-icon material-icons', 'html': 'share' }))
    //                 )
    //             )
    //         )
    //     )
    //     .prependTo('.jw-controls.jw-reset')
})

playerInstance.on('setupError', function() {
    console.log('setupError')
    // playerInstance.next();
})

playerInstance.on('error', function() {
    console.log('error')
    // playerInstance.next();
})

playerInstance.on('playAttemptFailed', function() {
    console.log('playAttemptFailed')
    // playerInstance.next();
})

playerInstance.once('play', function() {
    $('.jw-icon-rewind').css('display', 'none')
    playerInstance.on('playlistItem', function() {
        $('.jw-slider-time').css('display', 'flex')
        $('.jw-icon-rewind').css('display', 'flex')
        $('.jw-text-elapsed').css('visibility', 'unset')
        $('.jw-text-duration').css('visibility', 'unset')
        playerInstance.once('play', function() {
            if (playerConfig.starttime) {
                playerInstance.seek(parseFloat(playerConfig.starttime))
            }
            window.setInterval(function() {
                if (playerInstance.getState() === 'playing') {
                    parent.postMessage(
                        {
                            name: 'position',
                            length: Math.floor(playerInstance.getDuration()),
                            position: Math.floor(playerInstance.getPosition())
                        },
                        VUE_APP_HOST
                    )
                }
            }, 5000)
        })
    })
})
