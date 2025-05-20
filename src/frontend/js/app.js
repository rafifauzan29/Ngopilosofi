import { createApp } from 'vue';
import Framework7 from 'framework7/lite-bundle';
import Framework7Vue, { registerComponents, f7 } from 'framework7-vue/bundle';
import 'framework7/css/bundle';
import '../css/icons.css';
import App from '../components/app.vue';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000/api';
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

axios.interceptors.response.use(response => response, error => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    f7.views.main.router.navigate('/login/');
  }
  return Promise.reject(error);
});

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

Framework7.use(Framework7Vue, framework7Params);

const app = createApp(App);

app.config.globalProperties.$axios = axios;
app.config.globalProperties.$f7 = f7;

registerComponents(app);

app.mount('#app');