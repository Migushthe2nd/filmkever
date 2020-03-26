import Vue from 'vue'
import VueGlobalVariable from 'vue-global-var'

Vue.use(VueGlobalVariable, {
    globals: {
        user: {
            username: 'gebruikersnaam'
        },
        obj: {}
    }
})
