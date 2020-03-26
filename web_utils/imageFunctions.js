export default {
    methods: {
        original(link) {
            if (link.match('media-amazon.com')) {
                link = link.replace(/@\._.+\./gm, '@.')
            } else if (link.match('fanart') && link.match('/preview/')) {
                link = link.replace('/preview/', '/fanart/')
            } else if (link.match('image.tmdb.org') && link.match('/w342/')) {
                link = link.replace('/w342/', '/original/')
            } else if (link.match('media-amazon.com')) {
                link = link.replace(/@\._.+\./gm, '@.')
            }
            return link
        },
        w92(link) {
            if (link.match('assets.fanart.tv')) {
                link = link.replace('fanart.tv/fanart', 'fanart.tv/preview')
            } else if (link.match('image.tmdb.org')) {
                link = link
                    .replace('/original/', '/w92/')
                    .replace('/w780/', '/w92/')
            } else if (link.match('tvdb.com')) {
                link = link.replace('banners/', 'banners/_cache/')
            } else if (link.match('media-amazon.com')) {
                link = link.replace('@.', '@.SY92.')
            }
            return link
        },
        w154(link) {
            if (link.match('assets.fanart.tv')) {
                link = link.replace('fanart.tv/fanart', 'fanart.tv/preview')
            } else if (link.match('image.tmdb.org')) {
                link = link
                    .replace('/original/', '/w154/')
                    .replace('/w780/', '/w154/')
            } else if (link.match('tvdb.com')) {
                link = link.replace('banners/', 'banners/_cache/')
            } else if (link.match('media-amazon.com')) {
                link = link.replace('@.', '@.SY154.')
            }
            return link
        },
        w185(link) {
            if (link.match('assets.fanart.tv')) {
                link = link.replace('fanart.tv/fanart', 'fanart.tv/preview')
            } else if (link.match('image.tmdb.org')) {
                link = link
                    .replace('/original/', '/w185/')
                    .replace('/w780/', '/w185/')
            } else if (link.match('tvdb.com')) {
                link = link.replace('banners/', 'banners/_cache/')
            } else if (link.match('media-amazon.com')) {
                link = link.replace('@.', '@.SY185.')
            }
            return link
        },
        w1280(link) {
            if (link.match('assets.fanart.tv')) {
                link = link.replace('fanart.tv/preview', 'fanart.tv/fanart')
            } else if (link.match('image.tmdb.org')) {
                link = link
                    .replace('/original/', '/w1280/')
                    .replace('/w780/', '/w1280/')
            } else if (link.match('media-amazon.com')) {
                link = link.replace('@.', '@.SY1280.')
            }
            return link
        }
    }
}
