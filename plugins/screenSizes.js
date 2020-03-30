import Vue from 'vue'

Vue.prototype.$screen = Vue.observable({
    width: window.innerWidth,
    height: window.innerHeight
})

window.addEventListener('resize', () => {
    Vue.prototype.$screen.width = window.innerWidth
    Vue.prototype.$screen.height = window.innerHeight
})
