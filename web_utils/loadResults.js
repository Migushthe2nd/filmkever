import queries from '@/web_utils/queries.gql'

export default {
    data() {
        return {
            items: [],
            page: 1,
            lastID: null,
            resultAmount: null,
            limitReached: false,
            error: null
        }
    },
    methods: {
        clearList() {
            this.page = 1
            this.items = []
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
        loadSearchMovies(query) {
            this.$apollo
                .query({
                    query: queries.searchMovies,
                    variables: {
                        page: this.page,
                        query
                    }
                })
                .then((response) => {
                    if (this.resultAmount === null) {
                        this.resultAmount =
                            response.data.searchMovies.pagination.item_count
                    }
                    if (
                        response.data.searchMovies.pagination.page_count ===
                        response.data.searchMovies.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.items = this.items.concat(
                        response.data.searchMovies.items
                    )
                })
                .catch((error) => {
                    this.parseErrors(error)
                })
        },
        loadSearchShows(query) {
            this.$apollo
                .query({
                    query: queries.searchShows,
                    variables: {
                        page: this.page,
                        query
                    }
                })
                .then((response) => {
                    if (this.resultAmount === null) {
                        this.resultAmount =
                            response.data.searchShows.pagination.item_count
                    }
                    if (
                        response.data.searchShows.pagination.page_count ===
                        response.data.searchShows.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.items = this.items.concat(
                        response.data.searchShows.items
                    )
                })
                .catch((error) => {
                    this.parseErrors(error)
                })
        },
        loadWatchlistMovies() {
            this.$apollo
                .query({
                    query: queries.watchlistMovies,
                    variables: {
                        page: this.page,
                        lastID: this.lastID
                    }
                })
                .then((response) => {
                    if (this.resultAmount === null) {
                        this.resultAmount =
                            response.data.watchlistMovies.pagination.item_count
                    }
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
                    this.items = this.items.concat(
                        response.data.watchlistMovies.items
                    )
                })
                .catch((error) => {
                    this.parseErrors(error)
                })
        },
        loadWatchlistShows() {
            this.$apollo
                .query({
                    query: queries.watchlistShows,
                    variables: {
                        page: this.page,
                        lastID: this.lastID
                    }
                })
                .then((response) => {
                    if (this.resultAmount === null) {
                        this.resultAmount =
                            response.data.watchlistShows.pagination.item_count
                    }
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
                    this.items = this.items.concat(
                        response.data.watchlistShows.items
                    )
                })
                .catch((error) => {
                    this.parseErrors(error)
                })
        },
        loadTrendingMovies() {
            this.$apollo
                .query({
                    query: queries.trendingMovies,
                    variables: {
                        page: this.page
                    }
                })
                .then((response) => {
                    if (this.resultAmount === null) {
                        this.resultAmount =
                            response.data.trendingMovies.pagination.item_count
                    }
                    if (
                        response.data.trendingMovies.pagination.page_count ===
                        response.data.trendingMovies.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.items = this.items.concat(
                        response.data.trendingMovies.items
                    )
                })
                .catch((error) => {
                    this.parseErrors(error)
                })
        },
        loadTrendingShows() {
            this.$apollo
                .query({
                    query: queries.trendingShows,
                    variables: {
                        page: this.page
                    }
                })
                .then((response) => {
                    if (this.resultAmount === null) {
                        this.resultAmount =
                            response.data.trendingShows.pagination.item_count
                    }
                    if (
                        response.data.trendingShows.pagination.page_count ===
                        response.data.trendingShows.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.items = this.items.concat(
                        response.data.trendingShows.items
                    )
                })
                .catch((error) => {
                    this.parseErrors(error)
                })
        },
        loadBoxofficeMovies() {
            this.$apollo
                .query({
                    query: queries.boxofficeMovies,
                    variables: {
                        mediatype: this.mediatype,
                        page: this.page
                    }
                })
                .then((response) => {
                    if (this.resultAmount === null) {
                        this.resultAmount =
                            response.data.boxofficeMovies.pagination.item_count
                    }
                    if (
                        response.data.boxofficeMovies.pagination.page_count ===
                        response.data.boxofficeMovies.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.items = this.items.concat(
                        response.data.boxofficeMovies.items
                    )
                })
                .catch((error) => {
                    this.parseErrors(error)
                })
        },
        loadPopularMovies() {
            this.$apollo
                .query({
                    query: queries.popularMovies,
                    variables: {
                        page: this.page
                    }
                })
                .then((response) => {
                    if (this.resultAmount === null) {
                        this.resultAmount =
                            response.data.popularMovies.pagination.item_count
                    }
                    if (
                        response.data.popularMovies.pagination.page_count ===
                        response.data.popularMovies.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.items = this.items.concat(
                        response.data.popularMovies.items
                    )
                })
                .catch((error) => {
                    this.parseErrors(error)
                })
        },
        loadPopularShows() {
            this.$apollo
                .query({
                    query: queries.popularShows,
                    variables: {
                        page: this.page
                    }
                })
                .then((response) => {
                    if (this.resultAmount === null) {
                        this.resultAmount =
                            response.data.popularShows.pagination.item_count
                    }
                    if (
                        response.data.popularShows.pagination.page_count ===
                        response.data.popularShows.pagination.page
                    ) {
                        this.limitReached = true
                    } else {
                        this.page++
                    }
                    this.items = this.items.concat(
                        response.data.popularShows.items
                    )
                })
                .catch((error) => {
                    this.parseErrors(error)
                })
        }
    }
}
