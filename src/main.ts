import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { permissionDirective } from './directives/permission'

// Import Tailwind CSS
import './assets/tailwind.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.directive('permission', permissionDirective)

app.mount('#app')
