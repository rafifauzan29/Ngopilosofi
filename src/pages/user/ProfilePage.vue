<template>
  <f7-page name="profile" class="profile-page">
    <div class="profile-header">
      <img src="../../logo.png" alt="Ngopilosofi Logo" class="logo" />
      <h1 class="app-name">Ngopilosofi</h1>
      <p class="subtitle">Ngopi & Ngobrol dengan Filosofi</p>
    </div>

    <div class="profile-content">
      <f7-link href="/login/" class="button button-fill main-button login">
        Login
      </f7-link>
      <f7-button class="main-button secondary" @click="openPopup('cs')">
        Customer Service
      </f7-button>
      <f7-button class="main-button secondary" @click="openPopup('about')">
        Tentang Kami
      </f7-button>
      <f7-button class="main-button secondary" @click="openPopup('privacy')">
        Kebijakan Privasi
      </f7-button>
    </div>

    <div class="footer-text">
      <p>© 2025 Ngopilosofi</p>
    </div>

    <f7-popup v-model:opened="popupOpen" class="info-popup">
      <f7-page>
        <f7-navbar :title="popupTitle">
          <f7-nav-right>
            <f7-link @click="popupOpen = false" class="close-link">Tutup</f7-link>
          </f7-nav-right>
        </f7-navbar>
        <f7-block class="popup-content">
          <div v-if="popupContent === 'cs'">
            <f7-icon f7="phone" size="40px" class="popup-icon"></f7-icon>
            <p>Silakan hubungi kami di:</p>
            <p><b>ngopilosofi@gmail.com</b></p>
            <p>atau via WhatsApp: <b>+62 812-3456-7890</b></p>
          </div>
          <div v-else-if="popupContent === 'about'">
            <f7-icon f7="info_circle_fill" size="40px" class="popup-icon"></f7-icon>
            <p>Ngopilosofi adalah aplikasi pemesanan kopi modern<br />yang menggabungkan filosofi hidup dalam setiap
              tegukan.</p>
          </div>
          <div v-else-if="popupContent === 'privacy'">
            <f7-icon f7="lock_fill" size="40px" class="popup-icon"></f7-icon>
            <p>Kami menjaga privasi dan keamanan data Anda dengan ketat.<br />Data Anda tidak akan dibagikan tanpa izin.
            </p>
          </div>
        </f7-block>
      </f7-page>
    </f7-popup>
  </f7-page>
</template>

<script>
export default {
  name: 'ProfilePage',
  data() {
    return {
      popupOpen: false,
      popupContent: '',
    };
  },
  computed: {
    popupTitle() {
      switch (this.popupContent) {
        case 'cs':
          return 'Customer Service';
        case 'about':
          return 'Tentang Kami';
        case 'privacy':
          return 'Kebijakan Privasi';
        default:
          return 'Info';
      }
    },
  },
  methods: {
    openPopup(content) {
      this.popupContent = content;
      this.popupOpen = true;
    },
  },
};
</script>

<style scoped>
.profile-page {
  background-color: #ede0d1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 20px;
  min-height: 100%;
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
}

.app-name {
  font-size: 26px;
  color: #331c2c;
  margin: 0;
}

.subtitle {
  font-size: 16px;
  color: #5a3c4c;
  margin-top: 8px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.main-button {
  width: 100%;
  max-width: 320px;
  font-size: 16px;
  padding: 12px;
  border-radius: 12px;
}

.login {
  background-color: #331c2c;
  color: white;
}

.secondary {
  background-color: white;
  color: #331c2c;
  border: 1px solid #331c2c;
}

.footer-text {
  text-align: center;
  font-size: 14px;
  color: #5a3c4c;
  margin-top: 40px;
}

.info-popup .popup-content {
  text-align: center;
  padding: 30px 20px;
  font-size: 16px;
  color: #331c2c;
}

.popup-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
}

.close-link {
  color: #331c2c;
  font-weight: bold;
}
</style>
