export const state = () => ({
    loggedIn: false,
    user: null,
    searchQuery: null,
    currSearchType: null
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
