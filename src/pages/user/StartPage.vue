<template>
  <f7-page name="start" class="start-page">
    <div class="swiper start-swiper">
      <div class="swiper-wrapper">
        <div class="swiper-slide">
          <div class="slide-content">
            <div class="logo-container">
              <img src="../../logo.png" alt="Logo" class="start-logo" />
            </div>
            <div class="text-container">
              <h2 class="slide-title">Ngopilosofi</h2>
              <p class="slide-text">Selamat datang di dunia kopi yang penuh makna.</p>
              <div class="button-placeholder"></div>
            </div>
          </div>
        </div>
        <div class="swiper-slide">
          <div class="slide-content">
            <div class="logo-container">
              <img src="../../logo.png" alt="Logo" class="start-logo" />
            </div>
            <div class="text-container">
              <h2 class="slide-title">Lebih dari Sekadar Ngopi</h2>
              <p class="slide-text">Temukan cerita di balik setiap biji kopi.</p>
              <div class="button-placeholder"></div>
            </div>
          </div>
        </div>
        <div class="swiper-slide">
          <div class="slide-content">
            <div class="logo-container">
              <img src="../../logo.png" alt="Logo" class="start-logo" />
            </div>
            <div class="text-container">
              <h2 class="slide-title">Bergabung Sekarang</h2>
              <p class="slide-text">Mulailah perjalananmu bersama komunitas kopi.</p>
              <f7-button class="button button-fill start-button" @click="goToLogin">
                Mulai Sekarang
              </f7-button>
            </div>
          </div>
        </div>
      </div>

      <div class="swiper-pagination"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    </div>
  </f7-page>
</template>

<script>
import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.css';
import { f7 } from 'framework7-vue';

export default {
  name: 'StartPage',
  mounted() {
    new Swiper('.start-swiper', {
      direction: 'horizontal',
      loop: false,
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  },
  methods: {
    goToLogin() {
      f7.views.main.router.navigate('/login/');
    },
  },
};
</script>

<style scoped>
html, body, .page, .start-page {
  height: 100%;
  margin: 0;
}

.start-page {
  background-color: #ede0d1;
}

.start-swiper {
  height: 100%;
  position: relative;
}

.swiper-slide {
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  max-width: 320px;
  text-align: center;
  height: 100%;
  padding: 60px 20px 60px;
  box-sizing: border-box;
}

.logo-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 30px;
}

.text-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 30px;
}

.start-logo {
  width: 120px;
  height: 120px;
  border-radius: 24px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(112, 72, 93, 0.2));
}

.slide-title {
  font-size: 24px;
  font-weight: 700;
  color: #331c2c;
  margin-bottom: 16px;
  line-height: 1.3;
}

.slide-text {
  font-size: 16px;
  color: #70485d;
  margin-bottom: 24px;
  line-height: 1.5;
}

.start-button {
  background-color: #331c2c;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  border-radius: 50px;
  padding: 14px 32px;
  margin-top: 20px;
  margin-bottom: 100px;
  box-shadow: 0 4px 8px rgba(51, 28, 44, 0.2);
  transition: all 0.3s ease;
}

.start-button:hover {
  background-color: #70485d;
}

.start-button:active {
  transform: scale(0.98);
}

.button-placeholder {
  height: 52px;
  margin-top: 100px;
}

.swiper-pagination {
  position: absolute;
  bottom: 30px;
  width: 100%;
}

.swiper-button-prev,
.swiper-button-next {
  color: #331c2c;
  width: 40px;
  height: 40px;
  background: rgb(255, 255, 255);
  border-radius: 50%;
  border: 2px solid #a58e7c;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.swiper-button-prev::after,
.swiper-button-next::after {
  font-size: 18px;
  font-weight: bold;
}

.swiper-button-prev:hover,
.swiper-button-next:hover {
  background: #ede0d1;
  transform: scale(1.1);
}

.start-swiper .swiper-slide:last-child .swiper-button-next,
.start-swiper .swiper-slide:last-child .swiper-button-prev {
  display: none;
}

:deep(.swiper-pagination-bullet) {
  width: 8px;
  height: 8px;
  background-color: #a58e7c;
  opacity: 1;
}

:deep(.swiper-pagination-bullet-active) {
  background-color: #331c2c;
}
</style>
