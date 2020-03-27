export const state = () => ({
    loggedIn: false,
    user: null,
    searchQuery: null,
    currSearchType: null,

    movieWatchlist: [],
    showWatchlist: []
})

export const mutations = {
    SET_USER(state, user) {
        state.loggedIn = true
        state.user = user
    },
    REMOVE_USER(state) {
        state.loggedIn = false
        state.user = null
    },
    UPDATE_SEARCHTYPE_QUERY(state, type) {
        state.currSearchType = type
    },
    UPDATE_SEARCH_QUERY(state, query) {
        state.searchQuery = query
    },

    ADD_MOVIE_WATCHLIST(state, summary) {
        state.movieWatchlist.push(summary)
    },
    REMOVE_MOVIE_WATCHLIST(state, summary) {
        state.movieWatchlist = state.movieWatchlist.filter(
            (storeSummary) => storeSummary.ids.trakt !== summary.ids.trakt
        )
    },
    ADD_SHOW_WATCHLIST(state, summary) {
        state.showWatchlist.push(summary)
    },
    REMOVE_SHOW_WATCHLIST(state, summary) {
        state.showWatchlist = state.showWatchlist.filter(
            (storeSummary) => storeSummary.ids.trakt !== summary.ids.trakt
        )
    }
}

export const actions = {
    nuxtServerInit({ commit }, { req }) {
        if (req.user) {
            commit('SET_USER', req.user)
        } else {
            commit('REMOVE_USER')
        }
    }
}

// export const getters = {
//     isAuthenticated(state) {
//         return state.auth.loggedIn
//     },

//     loggedInUser(state) {
//         return state.auth.user
//     }
// }
