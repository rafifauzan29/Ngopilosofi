<template>
  <f7-app v-bind="f7params">
    <f7-view main class="safe-areas" url="/" :browser-history="true" :router="true">
      <f7-navbar v-if="showNavbar" class="navbar-custom">
        <f7-nav-title class="brand-title">
          <div class="brand-logo">Ngopilosofi</div>
          <div class="brand-subtitle">Philosophy in Every Sip</div>
        </f7-nav-title>
        <f7-nav-right>
          <f7-link v-if="isAuthenticated" href="/user/order/" icon-f7="cart" class="cart-link">
            <f7-badge v-if="cartCount > 0" color="red">{{ cartCount }}</f7-badge>
          </f7-link>
          <f7-link v-if="!isAuthenticated" href="/login/" text="Login" />
        </f7-nav-right>
      </f7-navbar>

      <f7-toolbar v-if="showToolbar && isAuthenticated" tabbar labels bottom class="toolbar-custom">
        <f7-link href="/user/home/" icon-f7="house" text="Home" />
        <f7-link href="/user/favorite/" icon-f7="heart" text="Favorit" />
        <f7-link href="/user/menu-list/" icon-f7="square_grid_2x2" text="Menu" />
        <f7-link href="/user/order/" icon-f7="cart" text="Pesanan" />
        <f7-link href="/user/profile/" icon-f7="person" text="Profil" />
      </f7-toolbar>
    </f7-view>
  </f7-app>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { f7, f7ready } from 'framework7-vue';
import { getDevice } from 'framework7/lite-bundle';
import routes from '../js/routes';

export default {
  setup() {
    const device = getDevice();
    const cartCount = ref(0);
    const currentPath = ref('/');
    const isAuthenticated = ref(false);
    
    const hideNavbarRoutes = ['/login/', '/register/', '/'];
    const hideToolbarRoutes = ['/login/', '/register/', '/'];
    
    const showNavbar = computed(() => {
      return !hideNavbarRoutes.includes(currentPath.value);
    });
    
    const showToolbar = computed(() => {
      return isAuthenticated.value && !hideToolbarRoutes.includes(currentPath.value);
    });
    
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');

        cartCount.value = cart.reduce((total, item) => total + item.quantity, 0);
      } catch (e) {
        console.error('Error reading cart:', e);
        cartCount.value = 0;
      }
    };
    
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      isAuthenticated.value = !!token;
    };
    
    const handleRouteChange = (route) => {
      currentPath.value = route.url;
      checkAuth();
    };
    
    const handleStorageEvent = (event) => {
      if (event.key === 'cart') {
        updateCartCount();
      } else if (event.key === 'token') {
        checkAuth();
      }
    };
    
    onMounted(() => {
      f7ready(() => {
        currentPath.value = f7.views.main.router.url;
        f7.on('routeChange', handleRouteChange);
        updateCartCount();
        checkAuth();
        window.addEventListener('storage', handleStorageEvent);
      });
    });
    
    onUnmounted(() => {
      window.removeEventListener('storage', handleStorageEvent);
      f7.off('routeChange', handleRouteChange);
    });
    
    const f7params = {
      name: 'Ngopilosofi',
      theme: 'auto',
      routes,
      id: 'com.ngopilosofi.app',
      input: {
        scrollIntoViewOnFocus: device.cordova,
        scrollIntoViewCentered: device.cordova,
      },
      statusbar: {
        iosOverlaysWebView: true,
        androidOverlaysWebView: false,
      },
      colors: {
        primary: '#331c2c',
      },
      view: {
        browserHistory: true,
      },
      router: {
        beforeEnter: async (routeTo, routeFrom, resolve, reject) => {
          const protectedRoutes = ['/user/home/', '/user/favorite/', '/user/menu-list/', '/user/order/', '/user/profile/'];
          const authRequired = protectedRoutes.includes(routeTo.url);
          const token = localStorage.getItem('token');
          
          if (authRequired && !token) {
            resolve({ url: '/login/' });
            return;
          }
          
          if (['/login/', '/register/'].includes(routeTo.url) && token) {
            resolve({ url: '/user/home/' });
            return;
          }
          
          resolve();
        }
      }
    };

    return {
      f7params,
      cartCount,
      showNavbar,
      showToolbar,
      isAuthenticated
    };
  },
};
</script>

<style scoped>
.navbar-custom {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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
  margin-top: -4px;
}

.toolbar-custom {
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(51, 28, 44, 0.1);
}

.toolbar-custom .tabbar-link-icon {
  font-size: 22px;
}

.toolbar-custom .tabbar-link-text {
  font-size: 12px;
  margin-top: 4px;
}

.cart-link {
  position: relative;
}

.cart-link .badge {
  position: absolute;
  left: -5px;
  bottom: 10px;
}
</style>