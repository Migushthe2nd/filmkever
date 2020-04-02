import nestedObjectAssign from 'nested-object-assign'

export const state = () => ({
    loggedIn: false,
    user: {
        uuid: null,
        username: null,
        email: null,
        joined: null,
        last_logged_in: null,
        role: null,
        preferences: {
            // Defaults here
            finishPercentage: 80,
            defaultPlayer: 'JWPlayer'
        }
    },
    searchQuery: null,
    currSearchType: null,

    movieWatchlist: [],
    showWatchlist: []
})

export const mutations = {
    SET_USER(state, user) {
        state.loggedIn = true
        state.user = nestedObjectAssign({}, state.user, user)
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
