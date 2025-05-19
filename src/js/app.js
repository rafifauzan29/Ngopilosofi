import { createApp } from 'vue';
import Framework7 from 'framework7/lite-bundle';
import Framework7Vue, { registerComponents, f7 } from 'framework7-vue/bundle';
import 'framework7/css/bundle';
import '../css/icons.css';
import App from '../components/app.vue';

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
  }
};

Framework7.use(Framework7Vue, framework7Params);

const app = createApp(App);

app.config.globalProperties.$f7 = f7;

registerComponents(app);

app.mount('#app');