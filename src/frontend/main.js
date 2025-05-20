import Vue from 'vue';
import Framework7 from 'framework7';
import Framework7Vue from 'framework7-vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import routes from './routes';

// Import Styles
import 'framework7/css/framework7.bundle.min.css';
import './assets/css/app.css';

Vue.use(Framework7Vue, Framework7);
Vue.use(VueRouter);

// Konfigurasi Vue Router
const router = new VueRouter({
  routes, // Gunakan routes yang sudah didefinisikan di routes.js
  mode: 'history',
});

new Vue({
  render: (h) => h(App),
  router, // Daftarkan router
}).$mount('#app');
