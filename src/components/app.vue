<template>
  <f7-app v-bind="f7params">
    <f7-view main class="safe-areas" url="/" :browser-history="true" :animate="false">
      <f7-navbar v-if="showHeader">
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

      <f7-toolbar v-if="showHeader" tabbar labels bottom class="toolbar-custom">
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { f7, f7ready } from 'framework7-vue';
import { getDevice } from 'framework7/lite-bundle';
import store from '../js/store';
import routes from '../js/routes';

export default {
  setup() {
    const device = getDevice();
    const cartCount = ref(0);
    const currentPath = ref(window.location.pathname);
    let storageListener = null;
    let cartUpdateListener = null;
    const hideHeaderRoutes = ['/login/', '/register/'];
    const normalizePath = (path) => {
      return path.endsWith('/') ? path : path + '/';
    };
    const showHeader = computed(() => {
      const normalizedPath = normalizePath(currentPath.value);
      return !hideHeaderRoutes.includes(normalizedPath);
    });
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('/user/cart/') || '[]');
        cartCount.value = cart.length;
      } catch (e) {
        console.error('Error reading cart:', e);
        cartCount.value = 0;
      }
    };

    const handleStorageEvent = (event) => {
      if (event.key === '/user/cart/') {
        updateCartCount();
      }
    };

    onMounted(() => {
      f7ready(() => {
        if (device.cordova) cordovaApp.init(f7);

        currentPath.value = f7.views.main.router.url;

        f7.on('routeChange', (newRoute) => {
          currentPath.value = newRoute.url;
          console.log('Route changed to:', newRoute.url); 
        });

        updateCartCount();
        window.addEventListener('storage', handleStorageEvent);
        cartUpdateListener = f7.on('cartUpdated', updateCartCount);
      });
    });

    onUnmounted(() => {
      window.removeEventListener('storage', handleStorageEvent);
      if (cartUpdateListener) cartUpdateListener.off();
    });

    const f7params = {
      name: 'Ngopilosofi',
      theme: 'auto',
      store,
      routes,
      serviceWorker: process.env.NODE_ENV === 'production' ? {
        path: '/service-worker.js',
      } : {},
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
    };

    return {
      f7params,
      cartCount,
      showHeader, 
    };
  },
};
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

.cart-badge {
  left: -10px;
  bottom: 10px;
}

.no-header .navbar,
.no-header .toolbar {
  display: none !important;
}
</style>