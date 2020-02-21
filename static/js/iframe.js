$(document).ready(function () {
    $('iframe').ready(function () {
        let iframe_dom = $(this).contents().find('body')
        $('.html5-video-container', iframe_dom).ready(function () {
            $(this).css({ height: '100%', width: '100%' })
            $('video', $(this)).css({ 'object-fit': 'cover' })
        })
    })
})