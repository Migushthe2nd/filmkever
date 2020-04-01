import queries from '@/web_utils/queries.gql'

export default {
    data() {
        return {
            page: 1,
            searchMoviesItems: [],
            searchShowsItems: [],
            continueMoviesItems: [],
            continueShowsItems: [],
            watchlistMoviesItems: [],
            watchlistShowsItems: [],
            trendingMoviesItems: [],
            trendingShowsItems: [],
            boxofficeMoviesItems: [],
            popularMoviesItems: [],
            popularShowsItems: [],
            playedMoviesItems: [],
            playedShowsItems: [],
            lastID: null,
            lastTime: null,
            resultAmount: null,
            limitReached: false,
            error: null
        }
    },
    methods: {
        clearList() {
            this.page = 1
            this.searchMoviesItems = []
            this.searchShowsItems = []
            this.continueMoviesItems = []
            this.continueShowsItems = []
            this.watchlistMoviesItems = []
            this.watchlistShowsItems = []
            this.trendingMoviesItems = []
            this.trendingShowsItems = []
            this.boxofficeMoviesItems = []
            this.popularMoviesItems = []
            this.popularShowsItems = []

            this.resultAmount = null
        },
        parseErrors(error) {
            const parsedError = JSON.parse(JSON.stringify(error))
            if (
                parsedError.graphQLErrors &&
                parsedError.graphQLErrors.length > 0 &&
                parsedError.graphQLErrors[0].message
            ) {
                this.error = parsedError.graphQLErrors[0].message
            } else {
                this.error = error.message
                    .toString()
                    .replace('GraphQL error: ', '')
            }
        },
        loadSearchMovies(query, callback) {
            this.$apollo
                .query({
                    query: queries.searchMovies,
                    variables: {
                        page: this.page,
                        query
                    }
                })
                .then((response) => {
                    this.resultAmount =
                        response.data.searchMovies.pagination.item_count
                    if (
                        response.data.searchMovies.pagination.page_count ===
                        response.data.searchMovies.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.searchMoviesItems = this.searchMoviesItems.concat(
                        response.data.searchMovies.items
                    )
                    callback()
                })
                .catch((error) => {
                    this.parseErrors(error)
                    callback()
                })
        },
        loadSearchShows(query, callback) {
            this.$apollo
                .query({
                    query: queries.searchShows,
                    variables: {
                        page: this.page,
                        query
                    }
                })
                .then((response) => {
                    this.resultAmount =
                        response.data.searchShows.pagination.item_count
                    if (
                        response.data.searchShows.pagination.page_count ===
                        response.data.searchShows.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.searchShowsItems = this.searchShowsItems.concat(
                        response.data.searchShows.items
                    )
                    callback()
                })
                .catch((error) => {
                    this.parseErrors(error)
                    callback()
                })
        },
        loadContinueMovies(params, callback) {
            this.$apollo
                .query({
                    query: queries.continueMovies,
                    variables: {
                        page: this.page,
                        lastTime: this.lastTime
                    }
                })
                .then((response) => {
                    this.resultAmount =
                        response.data.continueMovies.pagination.item_count
                    if (
                        response.data.continueMovies.pagination.page_count ===
                        response.data.continueMovies.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                        this.lastTime =
                            response.data.continueMovies.pagination.lastTime
                    }
                    this.continueMoviesItems = this.continueMoviesItems.concat(
                        response.data.continueMovies.items
                    )
                    callback()
                })
                .catch((error) => {
                    this.parseErrors(error)
                    callback()
                })
        },
        loadContinueShows(params, callback) {
            this.$apollo
                .query({
                    query: queries.continueShows,
                    variables: {
                        page: this.page,
                        lastID: this.lastID,
                        lastTime: this.lastTime
                    }
                })
                .then((response) => {
                    this.resultAmount =
                        response.data.continueShows.pagination.item_count
                    if (
                        response.data.continueShows.pagination.page_count ===
                        response.data.continueShows.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                        this.lastID =
                            response.data.continueShows.pagination.lastID
                        this.lastTime =
                            response.data.continueShows.pagination.lastTime
                    }
                    this.continueShowsItems = this.continueShowsItems.concat(
                        response.data.continueShows.items
                    )
                    callback()
                })
                .catch((error) => {
                    this.parseErrors(error)
                    callback()
                })
        },
        loadWatchlistMovies(params, callback) {
            this.$apollo
                .query({
                    query: queries.watchlistMovies,
                    variables: {
                        page: this.page,
                        lastID: this.lastID
                    }
                })
                .then((response) => {
                    this.resultAmount =
                        response.data.watchlistMovies.pagination.item_count
                    if (
                        response.data.watchlistMovies.pagination.page_count ===
                        response.data.watchlistMovies.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                        this.lastID =
                            response.data.watchlistMovies.pagination.lastID
                    }
                    this.watchlistMoviesItems = this.watchlistMoviesItems.concat(
                        response.data.watchlistMovies.items
                    )
                    callback()
                })
                .catch((error) => {
                    this.parseErrors(error)
                    callback()
                })
        },
        loadWatchlistShows(params, callback) {
            this.$apollo
                .query({
                    query: queries.watchlistShows,
                    variables: {
                        page: this.page,
                        lastID: this.lastID
                    }
                })
                .then((response) => {
                    this.resultAmount =
                        response.data.watchlistShows.pagination.item_count
                    if (
                        response.data.watchlistShows.pagination.page_count ===
                        response.data.watchlistShows.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                        this.lastID =
                            response.data.watchlistShows.pagination.lastID
                    }
                    this.watchlistShowsItems = this.watchlistShowsItems.concat(
                        response.data.watchlistShows.items
                    )
                    callback()
                })
                .catch((error) => {
                    this.parseErrors(error)
                    callback()
                })
        },
        loadTrendingMovies(params, callback) {
            this.$apollo
                .query({
                    query: queries.trendingMovies,
                    variables: {
                        page: this.page
                    }
                })
                .then((response) => {
                    this.resultAmount =
                        response.data.trendingMovies.pagination.item_count
                    if (
                        response.data.trendingMovies.pagination.page_count ===
                        response.data.trendingMovies.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.trendingMoviesItems = this.trendingMoviesItems.concat(
                        response.data.trendingMovies.items
                    )
                    callback()
                })
                .catch((error) => {
                    this.parseErrors(error)
                    callback()
                })
        },
        loadTrendingShows(params, callback) {
            this.$apollo
                .query({
                    query: queries.trendingShows,
                    variables: {
                        page: this.page
                    }
                })
                .then((response) => {
                    this.resultAmount =
                        response.data.trendingShows.pagination.item_count
                    if (
                        response.data.trendingShows.pagination.page_count ===
                        response.data.trendingShows.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.trendingShowsItems = this.trendingShowsItems.concat(
                        response.data.trendingShows.items
                    )
                    callback()
                })
                .catch((error) => {
                    this.parseErrors(error)
                    callback()
                })
        },
        loadBoxofficeMovies(params, callback) {
            this.$apollo
                .query({
                    query: queries.boxofficeMovies,
                    variables: {
                        mediatype: this.mediatype,
                        page: this.page
                    }
                })
                .then((response) => {
                    this.resultAmount =
                        response.data.boxofficeMovies.pagination.item_count
                    if (
                        response.data.boxofficeMovies.pagination.page_count ===
                        response.data.boxofficeMovies.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.boxofficeMoviesItems = this.boxofficeMoviesItems.concat(
                        response.data.boxofficeMovies.items
                    )
                    callback()
                })
                .catch((error) => {
                    this.parseErrors(error)
                    callback()
                })
        },
        loadPopularMovies(params, callback) {
            this.$apollo
                .query({
                    query: queries.popularMovies,
                    variables: {
                        page: this.page
                    }
                })
                .then((response) => {
                    this.resultAmount =
                        response.data.popularMovies.pagination.item_count
                    if (
                        response.data.popularMovies.pagination.page_count ===
                        response.data.popularMovies.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.popularMoviesItems = this.popularMoviesItems.concat(
                        response.data.popularMovies.items
                    )
                    callback()
                })
                .catch((error) => {
                    this.parseErrors(error)
                    callback()
                })
        },
        loadPopularShows(params, callback) {
            this.$apollo
                .query({
                    query: queries.popularShows,
                    variables: {
                        page: this.page
                    }
                })
                .then((response) => {
                    this.resultAmount =
                        response.data.popularShows.pagination.item_count
                    if (
                        response.data.popularShows.pagination.page_count ===
                        response.data.popularShows.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.popularShowsItems = this.popularShowsItems.concat(
                        response.data.popularShows.items
                    )
                    callback()
                })
                .catch((error) => {
                    this.parseErrors(error)
                    callback()
                })
        },
        loadPlayedMovies({ period }, callback) {
            this.$apollo
                .query({
                    query: queries.playedMovies,
                    variables: {
                        page: this.page,
                        period
                    }
                })
                .then((response) => {
                    this.resultAmount =
                        response.data.playedMovies.pagination.item_count
                    if (
                        response.data.playedMovies.pagination.page_count ===
                        response.data.playedMovies.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.playedMoviesItems = this.playedMoviesItems.concat(
                        response.data.playedMovies.items
                    )
                    callback()
                })
                .catch((error) => {
                    this.parseErrors(error)
                    callback()
                })
        },
        loadPlayedShows({ period }, callback) {
            this.$apollo
                .query({
                    query: queries.playedShows,
                    variables: {
                        page: this.page,
                        period
                    }
                })
                .then((response) => {
                    this.resultAmount =
                        response.data.playedShows.pagination.item_count
                    if (
                        response.data.playedShows.pagination.page_count ===
                        response.data.playedShows.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.playedShowsItems = this.playedShowsItems.concat(
                        response.data.playedShows.items
                    )
                    callback()
                })
                .catch((error) => {
                    this.parseErrors(error)
                    callback()
                })
        }
    }
}
