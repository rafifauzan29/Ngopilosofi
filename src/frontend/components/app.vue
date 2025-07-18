<template>
  <f7-app v-bind="f7params">
    <f7-view main class="safe-areas" url="/" :browser-history="true" :router="true">
      <f7-navbar v-if="showNavbar" class="navbar-custom">
        <f7-nav-title class="brand-title">
          <div class="brand-logo">Ngopilosofi</div>
          <div class="brand-subtitle">Philosophy in Every Sip</div>
        </f7-nav-title>
        <f7-nav-right>
          <f7-link id="cart-icon" href="/user/order/" icon-f7="cart" class="cart-link">
            <f7-badge class="cart-badge" v-if="cartCount > 0" color="red">{{ cartCount }}</f7-badge>
          </f7-link>
        </f7-nav-right>
      </f7-navbar>

      <f7-toolbar v-if="showToolbar && isAuthenticated" tabbar labels bottom class="toolbar-custom">
        <f7-link href="/user/home/" :class="{ 'active-link': currentPath === '/user/home/' }">
          <i class="f7-icons">house</i>
          <span class="tabbar-label">Home</span>
        </f7-link>
        <f7-link href="/user/favorite/" :class="{ 'active-link': currentPath === '/user/favorite/' }">
          <i class="f7-icons">heart</i>
          <span class="tabbar-label">Favorit</span>
        </f7-link>
        <f7-link href="/user/menu-list/" :class="{ 'active-link': currentPath === '/user/menu-list/' }">
          <i class="f7-icons">square_grid_2x2</i>
          <span class="tabbar-label">Menu</span>
        </f7-link>
        <f7-link href="/user/order-history/" :class="{ 'active-link': currentPath === '/user/order-history/' }">
          <i class="f7-icons">doc_text</i>
          <span class="tabbar-label">Riwayat</span>
        </f7-link>
        <f7-link href="/user/profile/" :class="{ 'active-link': currentPath === '/user/profile/' }">
          <i class="f7-icons">person</i>
          <span class="tabbar-label">Profil</span>
        </f7-link>
      </f7-toolbar>
    </f7-view>
  </f7-app>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { f7, f7ready } from 'framework7-vue'
import { getDevice } from 'framework7/lite-bundle'
import routes from '../js/routes'
import { useCartStore } from '../js/stores/cart'
import { Preferences } from '@capacitor/preferences'

export default {
  setup() {
    const device = getDevice()
    const cartStore = useCartStore()
    const currentPath = ref('/')
    const isAuthenticated = ref(false)

    const hideNavbarRoutes = ['/login/', '/register/', '/']
    const hideToolbarRoutes = ['/login/', '/register/', '/']

    const showNavbar = computed(() => !hideNavbarRoutes.includes(currentPath.value))
    const showToolbar = computed(() => isAuthenticated.value && !hideToolbarRoutes.includes(currentPath.value))
    const cartCount = computed(() => cartStore.count)

    const checkAuth = async () => {
      const { value: token } = await Preferences.get({ key: 'token' })
      isAuthenticated.value = !!token
      if (token) {
        cartStore.fetchCart()
      } else {
        cartStore.count = 0
      }
    }

    const handleRouteChange = (route) => {
      currentPath.value = route.url
      checkAuth()
    }

    onMounted(() => {
      f7ready(() => {
        currentPath.value = f7.views.main.router.url
        f7.on('routeChange', handleRouteChange)
        checkAuth()
      })
    })

    onUnmounted(() => {
      f7.off('routeChange', handleRouteChange)
    })

    const f7params = {
      name: 'Ngopilosofi',
      theme: 'auto',
      id: 'com.ngopilosofi.app',
      routes,
      input: {
        scrollIntoViewOnFocus: device.cordova,
        scrollIntoViewCentered: device.cordova,
      },
      statusbar: {
        iosOverlaysWebView: true,
        androidOverlaysWebView: true,
        androidBackgroundColor: '#331c2c'
      },
      colors: {
        primary: '#331c2c',
      },
      view: {
        browserHistory: true,
        iosDynamicNavbar: false,
        material: true,
        xhrCache: false,
      },
      router: {
        beforeEnter: async (routeTo, routeFrom, resolve, reject) => {
          const protectedRoutes = [
            '/user/home/',
            '/user/favorite/',
            '/user/menu-list/',
            '/user/order-history/',
            '/user/profile/',
          ]
          const authRequired = protectedRoutes.includes(routeTo.url)
          const { value: token } = await Preferences.get({ key: 'token' })

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

    return {
      f7params,
      cartCount,
      showNavbar,
      showToolbar,
      isAuthenticated,
      currentPath
    }
  }
}
</script>

<style scoped>
::v-deep(.navbar-inner) {
  background-color: white !important;
}

.brand-title {
  text-align: center;
  padding: 0 20px;
}

.brand-logo {
  font-size: 22px;
  font-weight: 700;
  color: #331c2c;
  letter-spacing: 1px;
}

.brand-subtitle {
  font-size: 12px;
  color: #331c2c;
  font-style: italic;
  margin-top: 4px;
}

.toolbar-custom {
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(51, 28, 44, 0.1);
  height: calc(56px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
}

::v-deep(.toolbar-custom .f7-icons),
::v-deep(.toolbar-custom .tabbar-label) {
  color: rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease;
}

::v-deep(.toolbar-custom .active-link .f7-icons),
::v-deep(.toolbar-custom .active-link .tabbar-label) {
  color: #331c2c !important;
  font-weight: 550;
}

.cart-link {
  position: relative;
}

.cart-link .badge {
  left: -10px;
  bottom: 10px;
}

.safe-areas {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.navbar-custom {
  height: calc(56px + env(safe-area-inset-top));
  padding-top: env(safe-area-inset-top);
}

.page-content {
  padding-top: calc(56px + env(safe-area-inset-top)); 
  padding-bottom: calc(56px + env(safe-area-inset-bottom)); 
}
</style>
