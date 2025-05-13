import { createApp } from 'vue';
import Framework7 from 'framework7/lite-bundle';
import Framework7Vue, { registerComponents, f7 } from 'framework7-vue/bundle';
import 'framework7/css/bundle';
import '../css/icons.css';
import '../css/app.css';
import App from '../components/app.vue';

// Konfigurasi Framework7 dengan animasi
const framework7Params = {
  // Aktifkan animasi untuk berbagai komponen
  animate: true, // Aktifkan animasi global
  view: {
    animate: true,
  },
  popup: {
    animate: true, 
  },
  router: {
    animate: true,
  }
};

// Init Framework7-Vue Plugin dengan parameter
Framework7.use(Framework7Vue, framework7Params);

// Init App
const app = createApp(App);

// Inject Framework7 instance globally
app.config.globalProperties.$f7 = f7;

// Register Framework7 Vue components
registerComponents(app);

// Mount the app
app.mount('#app');