

$(document).ready(function () {
    if (!isMobile) {
        function get_summary(item, type, traktid, hover_box, summary_data) {
            $.ajax({
                type: "GET",
                url: `${baseUrl}/api/get/summary`,
                data: `type=${type}&traktID=${traktid}`,
                success: function (summary) {
                    $('.meta .title', summary_data).text(summary.title)
                    if (summary.userdata) {
                        $('.title', summary_data).append('<br>')
                        if (summary.userdata.watched) {
                            let element = $('<span></span>', { class: 'labels', html: 'Finished' })
                                .append($('<i></i>', { class: 'label material-icons', html: 'check_circle' }))
                            $('.title', summary_data).append(element)
                        }
                        if (summary.userdata.added) {
                            let element = $('<span></span>', { class: 'labels', html: 'Watchlist' })
                                .append($('<i></i>', { class: 'label material-icons', html: 'playlist_add_check' }))
                            $('.title', summary_data).append(element)
                        }
                    }
                    $('.meta #rating b', summary_data).text(summary.rating)
                    $('.meta #length b', summary_data).text(summary.length)
                    $('.meta #certification b', summary_data).text(summary.certification)
                    $('.meta #released b', summary_data).text(new Date(summary.released).getFullYear())
                    for (let i = 0; i < summary.genres.length; i++) {
                        let element = $('<span></span>', { class: 'genres', html: summary.genres[i].charAt(0).toUpperCase() + summary.genres[i].slice(1) })
                        $('.meta #genres', summary_data).append(element)
                    }
                    $('.description', summary_data).text(summary.description)

                    $('<div></div>', { class: 'actions btn-group' })
                        .append($('<button></button>', { class: summary.userdata.added ? 'watchlist material-icons toggle on' : 'watchlist material-icons toggle', 'data-toggle': "tooltip", 'data-placement': "top", title: "Watchlist", post_: "watchlist", onclick: "itemTogglePost(this)" }))
                        .append($('<button></button>', { class: summary.userdata.watched ? summary.userdata.watched > 0 ? 'finished material-icons toggle on' : 'finished material-icons toggle' : 'finished material-icons toggle', 'data-toggle': "tooltip", 'data-placement': "top", title: "Finished", post_: "finished", onclick: "itemTogglePost(this)" }))
                        .prependTo($(summary_data))

                    // Set IDs
                    hover_box.data('slug', summary.ids.slug)
                    hover_box.data('tvdbID', summary.ids.tvdb)
                    hover_box.data('imdbID', summary.ids.imdb)
                    hover_box.data('tmdbID', summary.ids.tmdb)

                    // Set trailer
                    if (summary.trailer) {
                        hover_box.data('src_disabled', summary.trailer)
                        if (item.hasClass('thumbnail')) {
                            $('<iframe></iframe>', { class: 'hover_box_videoiframe thumbnail', src: summary.trailer, allow: "autoplay; fullscreen", frameborder: "0", scrolling: "0", allowtransparency: "" })
                                .hide()
                                .appendTo(item).delay(1000).fadeIn(400);
                        } else {
                            $('<iframe></iframe>', { class: 'hover_box_videoiframe poster', src: summary.trailer, allow: "autoplay; fullscreen", frameborder: "0", scrolling: "0", allowtransparency: "" })
                                .hide()
                                .appendTo(item).delay(1000).fadeIn(400);
                        }
                    }

                    $('.swiper-lazy-preloader', hover_box).css({ display: 'none' })
                    $('.meta', hover_box).css({ display: 'block' });
                    $('.description', hover_box).css({ display: 'block' });
                    $('.summary-data', hover_box).height('auto')
                }
            });
        }

        function set_hover_box(item, hover_box, summary_data) {

            let window_height = $(window).height();
            let window_width = $(window).width();
            let item_height = $('img', item).outerHeight();
            let item_width = $('img', item).outerWidth();

            let top_of_item_vwind = $('img', item)[0].getBoundingClientRect().top;
            let left_of_item_vwind = $('img', item)[0].getBoundingClientRect().left;

            let offset = $('img', item).offset()
            let top_of_item = offset.top - 3;
            let bottom_of_item = offset.top + item_height + 3;
            let left_of_item = offset.left;
            let right_of_item = offset.left + item_width;

            if (item.hasClass('thumbnail')) {
                // With a thumbnail, display it under/above the item
                if (top_of_item_vwind + item_height / 2 > window_height / 2) {
                    // Display above
                    hover_box.css({ top: top_of_item, bottom: 'unset', left: left_of_item, right: 'unset' })
                    summary_data.width(item_width).css({ bottom: 0, top: 'unset' })
                } else {
                    // Display under
                    hover_box.css({ top: bottom_of_item, bottom: 'unset', left: left_of_item, right: 'unset' })
                    summary_data.width(item_width).css({ bottom: 'unset', top: 0 })
                }
            } else if (item.hasClass('poster')) {
                // Normally with a poster, display it next to the item
                if (top_of_item_vwind + item_height / 2 > window_height / 2) {
                    // Display upwards
                    if (left_of_item_vwind + item_width / 2 > window_width / 2) {
                        // Display on left side
                        hover_box.css({ top: bottom_of_item, left: left_of_item })
                        summary_data.width(item_width * 2).css({ bottom: 0, top: 'unset', left: 'unset', right: 0 })
                    } else {
                        // Display on right side
                        hover_box.css({ top: bottom_of_item, left: right_of_item })
                        summary_data.width(item_width * 2).css({ bottom: 0, top: 'unset', left: 0, right: 'unset' })
                    }
                } else {
                    // Display downwards
                    if (left_of_item_vwind + item_width / 2 > window_width / 2) {
                        // Display on left side
                        hover_box.css({ top: top_of_item, left: left_of_item })
                        summary_data.width(item_width * 2).css({ bottom: 'unset', top: 0, left: 'unset', right: 0 })
                    } else {
                        // Display on right side
                        hover_box.css({ top: top_of_item, left: right_of_item })
                        summary_data.width(item_width * 2).css({ bottom: 'unset', top: 0, left: 0, right: 'unset' })
                    }
                }
            }

            if (!$('.meta .title', summary_data).text()) {
                // Get data
                get_summary(item, hover_box.attr('type'), hover_box.attr('traktid'), hover_box, summary_data)
            } else {
                $('.summary-data', hover_box).height('auto')
                $('.hover_box_videoiframe', item).attr('src', $('.hover_box_videoiframe', item).data('src_disabled'));

                if (hover_box.data('src_disabled')) {
                    $('.hover_box_videoiframe .item').fadeOut(200, function () { $(this).remove(); });
                    if (item.hasClass('thumbnail')) {
                        $('<iframe></iframe>', { class: 'hover_box_videoiframe thumbnail', src: hover_box.data('src_disabled'), allow: "autoplay; fullscreen", frameborder: "0", scrolling: "0", allowtransparency: "" })
                            .hide()
                            .appendTo(item).delay(1000).fadeIn(400);
                    } else {
                        $('<iframe></iframe>', { class: 'hover_box_videoiframe poster', src: hover_box.data('src_disabled'), allow: "autoplay; fullscreen", frameborder: "0", scrolling: "0", allowtransparency: "" })
                            .hide()
                            .appendTo(item).delay(1000).fadeIn(400);
                    }
                }
            }
        }

        var delay = 500, setTimeoutConst;
        $('.row .item').mouseenter(function () {
            let item = $(this);
            setTimeoutConst = setTimeout(function () {

                $('.swiper-container .item:not(:hover)').css({ filter: 'brightness(.5)' })
                $('.swiper-container .item:hover').css({ filter: 'brightness(1)' })

                let item_height = $('img', item).height();
                let item_width = $('img', item).width();

                let hover_box = $(`.hover_box[type='${item.attr('type')}'][traktid='${item.attr('traktid')}']`)
                if (hover_box.length) {
                    hover_box.css({ opacity: 100, 'pointer-events': 'auto' })
                    let summary_data = $('.summary-data', hover_box)
                    set_hover_box(item, hover_box, summary_data)
                } else {
                    let hover_box = $(".hover_box[type=''][traktID='']").clone().attr({ type: item.attr('type'), traktid: item.attr('traktid') }).css({ opacity: 100, 'pointer-events': 'auto' }).prependTo("body");
                    let summary_data = $(`.hover_box[type='${item.attr('type')}'][traktid='${item.attr('traktid')}'] .summary-data`).height(item_height)
                    if (item.hasClass('thumbnail')) {
                        summary_data.width(item_width)
                    } else {
                        summary_data.width(item_width * 2)
                    }

                    set_hover_box(item, hover_box, summary_data)

                    // Bind listener to new hover_box
                    summary_data.mouseleave(function () {
                        // if (!('.item').hover()) {
                        hide_hover_box(item, hover_box)
                        // }
                    })
                }
            }, delay);
        }).mouseleave(function () {
            clearTimeout(setTimeoutConst);

            let item = $(this);

            let hover_box = $(`.hover_box[type='${item.attr('type')}'][traktid='${item.attr('traktid')}']`);
            let summary_data = $(`.summary-data:hover`, hover_box);

            if (!summary_data.length) {
                hide_hover_box(item, hover_box)
            }
        });

        function hide_hover_box(item, hover_box) {
            $($('.hover_box_videoiframe', item)).ready(function () {
                $('.hover_box_videoiframe', item).fadeOut(200, function () { $(this).remove(); });
            });

            $('.swiper-container:not(:hover) .item').css({ filter: 'brightness(1)' })
            $('.swiper-container:hover .item').css({ filter: 'brightness(1)' })
            hover_box.css({ opacity: 0, 'pointer-events': 'none' })
            $('.actions', item).css({ opacity: 0, 'pointer-events': 'none' })
        }

    }
});