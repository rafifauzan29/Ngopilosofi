import DashboardPage from '../pages/admin/DashboardPage.vue';
import MenuManagementPage from '../pages/admin/MenuManagementPage.vue';
import PromoManagementPage from '../pages/admin/PromoManagementPage.vue';

import StartPage from '../pages/user/StartPage.vue';
import HomePage from '../pages/user/HomePage.vue';
import MenuListPage from '../pages/user/MenuListPage.vue';
import OrderPage from '../pages/user/OrderPage.vue';
import FavoritePage from '../pages/user/FavoritePage.vue';
import ProfilePage from '../pages/user/ProfilePage.vue';
import PointPage from '../pages/user/PointPage.vue';

import LoginPage from '../pages/auth/LoginPage.vue';
import RegisterPage from '../pages/auth/RegisterPage.vue';

var routes = [
  {
    path: '/',
    component: StartPage,
  },
  {
    path: '/user/home/',
    component: HomePage,
  },
  {
    path: '/register/',
    component: RegisterPage,
  },
  {
    path: '/admin/dashboard/',
    component: DashboardPage,
  },
  {
    path: '/admin/menu-management/',
    component: MenuManagementPage,
  },
  {
    path: '/admin/promo-management/',
    component: PromoManagementPage,
  },
  {
    path: '/login/',
    component: LoginPage,
  },
  {
    path: '/user/menu-list/',
    component: MenuListPage,
  },
  {
    path: '/user/order/',
    component: OrderPage,
  },
  {
    path: '/user/favorite/',
    component: FavoritePage,
  },
  {
    path: '/user/profile/',
    component: ProfilePage,
  },
  {
    path: '/user/point/',
    component: PointPage,
  },
];

export default routes;
