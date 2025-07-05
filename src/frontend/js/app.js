import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Framework7 from 'framework7/lite-bundle'
import Framework7Vue, { registerComponents, f7 } from 'framework7-vue/bundle'
import 'framework7/css/bundle'
import '../css/icons.css'
import App from '../components/app.vue'
import axios from 'axios'
import { Preferences } from '@capacitor/preferences'

const pinia = createPinia()

const axiosInstance = axios.create({
  baseURL: 'https://ngopilosofi-production.up.railway.app/api',
})

axiosInstance.interceptors.request.use(async config => {
  const { value: token } = await Preferences.get({ key: 'token' })
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => Promise.reject(error))

axiosInstance.interceptors.response.use(response => response, async error => {
  if (error.response && error.response.status === 401) {
    await Preferences.remove({ key: 'token' })
    await Preferences.remove({ key: 'user' })
    try {
      f7.views.main.router.navigate('/login/')
    } catch (e) {
      window.location.href = '/login/'
    }
  }
  return Promise.reject(error)
})

const framework7Params = {
  animate: true,
  view: {
    animate: true,
  },
  popup: {
    animate: true,
  },
  router: {
    animate: true,
    beforeEnter: async (routeTo, routeFrom, resolve) => {
      const protectedRoutes = [
        '/user/home/',
        '/user/favorite/',
        '/user/menu-list/',
        '/user/order/',
        '/user/profile/',
      ]

      const { value: token } = await Preferences.get({ key: 'token' })
      const authRequired = protectedRoutes.includes(routeTo.url)

      if (authRequired && !token) {
        resolve({ url: '/login/' })
        return
      }

      if (['/login/', '/register/'].includes(routeTo.url) && token) {
        resolve({ url: '/user/home/' })
        return
      }

      resolve()
    }
  }
}

const initApp = async () => {
  Framework7.use(Framework7Vue, framework7Params)

  const app = createApp(App)
  app.use(pinia)

  app.config.globalProperties.$axios = axiosInstance
  app.config.globalProperties.$f7 = f7

  registerComponents(app)
  app.mount('#app')

  const { value: token } = await Preferences.get({ key: 'token' })

  if (token) {
    f7.views.main.router.navigate('/user/home/', {
      reloadCurrent: true,
      ignoreCache: true,
    })
  } else {
    f7.views.main.router.navigate('/', {
      reloadCurrent: true,
      ignoreCache: true,
    })
  }
}

initApp()
