$('.continue_watching .swiper-container').ready(function () {
    var swiper_continue_watching = new Swiper('.continue_watching .swiper-container', {
        // effect: 'coverflow',
        // coverflowEffect: {
        //     rotate: 10,
        //     stretch: 0,
        //     depth: 100,
        //     modifier: 1,
        //     slideShadows: true,
        // },
        // centeredSlides: true,
        slidesPerView: 1,
        spaceBetween: 16,
        slidesPerGroup: 1,
        breakpoints: {
            480: {
                slidesPerView: 2,
                slidesPerGroup: 2,
            },
            992: {
                slidesPerView: 3,
                slidesPerGroup: 3,
            },
            1200: {
                slidesPerView: 4,
                slidesPerGroup: 4,
            },
        },
        preloadImages: false,
        lazy: true,
        loop: false,
        watchOverflow: true,
        loopFillGroupWithBlank: true,
        // pagination: {
        //     el: '.swiper-pagination'
        // },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
})

$('.watchlist .swiper-container').ready(function () {
    var swiper_watchlist = new Swiper('.watchlist .swiper-container', {
        // effect: 'coverflow',
        // coverflowEffect: {
        //     rotate: 20,
        //     stretch: 10,
        //     depth: 10,
        //     modifier: 1,
        //     // slideShadows: true,
        // },
        centeredSlides: false,
        preloadImages: false,
        lazy: true,
        slidesPerView: 2,
        spaceBetween: 16,
        slidesPerGroup: 2,
        breakpoints: {
            360: {
                slidesPerView: 3,
                slidesPerGroup: 3,
            },
            480: {
                slidesPerView: 4,
                slidesPerGroup: 4,
            },
            768: {
                slidesPerView: 6,
                slidesPerGroup: 6,
            },
            992: {
                slidesPerView: 8,
                slidesPerGroup: 8,
            },
            1200: {
                slidesPerView: 10,
                slidesPerGroup: 10,
            }
        },
        loop: false,
        watchOverflow: true,
        loopFillGroupWithBlank: true,
        // pagination: {
        //     el: '.swiper-pagination'
        // },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
})

$('.recommended .swiper-container').ready(function () {
    var swiper_recommended = new Swiper('.recommended .swiper-container', {
        // effect: 'coverflow',
        // coverflowEffect: {
        //     rotate: 5,
        //     stretch: 10,
        //     depth: 10,
        //     modifier: 1,
        //     // slideShadows: true,
        // },
        // centeredSlides: true,
        preloadImages: false,
        lazy: true,
        slidesPerView: 2,
        spaceBetween: 16,
        slidesPerGroup: 2,
        breakpoints: {
            360: {
                slidesPerView: 3,
                slidesPerGroup: 3,
            },
            480: {
                slidesPerView: 4,
                slidesPerGroup: 4,
            },
            768: {
                slidesPerView: 6,
                slidesPerGroup: 6,
            },
            992: {
                slidesPerView: 8,
                slidesPerGroup: 8,
            },
            1200: {
                slidesPerView: 10,
                slidesPerGroup: 10,
            }
        },
        loop: true,
        watchOverflow: true,
        loopFillGroupWithBlank: true,
        // pagination: {
        //     el: '.swiper-pagination'
        // },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
})

$('.trending .swiper-container').ready(function () {
    var swiper_trending = new Swiper('.trending .swiper-container', {
        // effect: 'coverflow',
        // coverflowEffect: {
        //     rotate: 5,
        //     stretch: 10,
        //     depth: 10,
        //     modifier: 1,
        //     // slideShadows: true,
        // },
        // centeredSlides: true,
        preloadImages: false,
        lazy: true,
        slidesPerView: 2,
        spaceBetween: 16,
        slidesPerGroup: 2,
        breakpoints: {
            360: {
                slidesPerView: 3,
                slidesPerGroup: 3,
            },
            480: {
                slidesPerView: 4,
                slidesPerGroup: 4,
            },
            768: {
                slidesPerView: 6,
                slidesPerGroup: 6,
            },
            992: {
                slidesPerView: 8,
                slidesPerGroup: 8,
            },
            1200: {
                slidesPerView: 10,
                slidesPerGroup: 10,
            }
        },
        loop: true,
        watchOverflow: true,
        loopFillGroupWithBlank: true,
        // pagination: {
        //     el: '.swiper-pagination'
        // },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
})

$('.recent .swiper-container').ready(function () {
    var swiper_recent = new Swiper('.recent .swiper-container', {
        // effect: 'coverflow',
        // coverflowEffect: {
        //     rotate: 5,
        //     stretch: 10,
        //     depth: 10,
        //     modifier: 1,
        //     // slideShadows: true,
        // },
        // centeredSlides: true,
        preloadImages: false,
        lazy: true,
        slidesPerView: 2,
        spaceBetween: 16,
        slidesPerGroup: 2,
        breakpoints: {
            360: {
                slidesPerView: 3,
                slidesPerGroup: 3,
            },
            480: {
                slidesPerView: 4,
                slidesPerGroup: 4,
            },
            768: {
                slidesPerView: 6,
                slidesPerGroup: 6,
            },
            992: {
                slidesPerView: 8,
                slidesPerGroup: 8,
            },
            1200: {
                slidesPerView: 10,
                slidesPerGroup: 10,
            }
        },
        loop: false,
        loopFillGroupWithBlank: true,
        // pagination: {
        //     el: '.swiper-pagination'
        // },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
})

$('.popular .swiper-container').ready(function () {
    var swiper_popular = new Swiper('.popular .swiper-container', {
        // effect: 'coverflow',
        // coverflowEffect: {
        //     rotate: 5,
        //     stretch: 10,
        //     depth: 10,
        //     modifier: 1,
        //     // slideShadows: true,
        // },
        // centeredSlides: true,
        preloadImages: false,
        lazy: true,
        slidesPerView: 2,
        spaceBetween: 16,
        slidesPerGroup: 2,
        breakpoints: {
            360: {
                slidesPerView: 3,
                slidesPerGroup: 3,
            },
            480: {
                slidesPerView: 4,
                slidesPerGroup: 4,
            },
            768: {
                slidesPerView: 6,
                slidesPerGroup: 6,
            },
            992: {
                slidesPerView: 8,
                slidesPerGroup: 8,
            },
            1200: {
                slidesPerView: 10,
                slidesPerGroup: 10,
            }
        },
        loop: true,
        watchOverflow: true,
        loopFillGroupWithBlank: true,
        // pagination: {
        //     el: '.swiper-pagination'
        // },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
})