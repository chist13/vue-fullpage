import Fullpage from './src/Fullpage'
import Page from './src/Page'

export default {
    install(Vue, options) {
        Vue.component('fullpage', Fullpage)
        Vue.component('page', Page)
    }
}
