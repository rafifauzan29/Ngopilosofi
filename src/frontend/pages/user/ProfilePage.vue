<template>
  <f7-page name="profile" class="profile-page">
    <div class="profile-header">
      <img src="../../logo.png" alt="Ngopilosofi Logo" class="logo" />
      <h1 class="app-name">Ngopilosofi</h1>
      <p class="subtitle">Ngopi & Ngobrol dengan Filosofi</p>
    </div>

    <div class="user-profile-section">
      <div class="avatar-container" @click="openProfileEdit">
        <img :src="userProfile.avatar || 'images/avatar/default.png'" class="avatar" />
        <div class="edit-overlay">
          <f7-icon f7="camera_fill" size="24px" color="white"></f7-icon>
        </div>
      </div>
      <h2 class="user-name">{{ userProfile.name }}</h2>
      <p class="user-email">{{ userProfile.email }}</p>
    </div>

    <div class="profile-content">
      <f7-button class="main-button secondary" @click="openProfileEdit">
        Edit Profil
      </f7-button>
      <f7-button class="main-button secondary" @click="openPopup('cs')">
        Customer Service
      </f7-button>
      <f7-button class="main-button secondary" @click="openPopup('about')">
        Tentang Kami
      </f7-button>
      <f7-button class="main-button secondary" @click="openPopup('privacy')">
        Kebijakan Privasi
      </f7-button>
      <f7-button class="button button-fill main-button login" @click="logout">
        Logout
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

    <f7-popup v-model:opened="profileEditOpen" class="profile-edit-popup">
      <f7-page>
        <f7-navbar title="Edit Profil">
          <f7-nav-right>
            <f7-link @click="saveProfile">Simpan</f7-link>
          </f7-nav-right>
          <f7-nav-left>
            <f7-link @click="profileEditOpen = false">Batal</f7-link>
          </f7-nav-left>
        </f7-navbar>
        <f7-block>
          <div class="avatar-upload">
            <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" style="display: none;" />
            <div class="avatar-preview" @click="$refs.fileInput.click()">
              <img :src="editProfile.avatar || 'images/avatar/default.png'"/>
              <div class="upload-text">
                <f7-icon f7="camera_fill"></f7-icon>
                <p>Ubah Foto</p>
              </div>
            </div>
          </div>

          <f7-link class="delete-avatar-link" @click="removeAvatar">
            Hapus Foto Profil
          </f7-link>

          <f7-list form>
            <f7-list-input label="Nama" type="text" placeholder="Nama Anda" :value="editProfile.name"
              @input="editProfile.name = $event.target.value">
            </f7-list-input>
            <f7-list-input label="Email" type="email" placeholder="Email Anda" :value="editProfile.email"
              @input="editProfile.email = $event.target.value">
            </f7-list-input>

          </f7-list>
        </f7-block>
      </f7-page>
    </f7-popup>
  </f7-page>
</template>

<script>
import { f7 } from 'framework7-vue';
import { Preferences } from '@capacitor/preferences';

export default {
  name: 'ProfilePage',
  data() {
    return {
      popupOpen: false,
      popupContent: '',
      profileEditOpen: false,
      userProfile: {
        name: '',
        email: '',
        avatar: ''
      },
      editProfile: {
        name: '',
        email: '',
        avatar: ''
      },
      selectedFile: null,
      loading: false
    };
  },
  computed: {
    popupTitle() {
      switch (this.popupContent) {
        case 'cs': return 'Customer Service';
        case 'about': return 'Tentang Kami';
        case 'privacy': return 'Kebijakan Privasi';
        default: return 'Info';
      }
    },
  },
  mounted() {
    this.loadUserProfile();
  },
  methods: {
    async loadUserProfile() {
      const { value: userStr } = await Preferences.get({ key: 'user' });
      const { value: avatar } = await Preferences.get({ key: 'userAvatar' });
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || !user.name || !user.email) {
        f7.views.main.router.navigate('/login/');
        return;
      }
      this.userProfile = {
        name: user.name,
        email: user.email,
        avatar: user.avatar || avatar || ''
      };
      this.editProfile = { ...this.userProfile };
    },
    openPopup(content) {
      this.popupContent = content;
      this.popupOpen = true;
    },
    openProfileEdit() {
      this.editProfile = { ...this.userProfile };
      this.profileEditOpen = true;
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 2 * 1024 * 1024;
      if (!allowedTypes.includes(file.type)) {
        f7.dialog.alert('Format file tidak didukung. Hanya JPG, PNG, atau WEBP.');
        return;
      }
      if (file.size > maxSize) {
        f7.dialog.alert('Ukuran file terlalu besar. Maksimum 2MB.');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => {
        this.editProfile.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    async saveProfile() {
      this.loading = true;
      try {
        const { value: token } = await Preferences.get({ key: 'token' });
        if (!token) {
          f7.dialog.alert('Token tidak ditemukan, silakan login ulang.');
          this.loading = false;
          return;
        }
        const payload = {
          name: this.editProfile.name,
          email: this.editProfile.email,
          avatar: this.editProfile.avatar
        };
        const res = await fetch('https://ngopilosofi-production.up.railway.app/api/profile/updateProfile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Gagal update profil');
        const updated = await res.json();
        await Preferences.set({ key: 'user', value: JSON.stringify(updated.user) });
        await Preferences.set({ key: 'userAvatar', value: updated.user.avatar || '' });
        this.userProfile = { ...updated.user };
        this.editProfile = { ...updated.user };
        this.profileEditOpen = false;
        f7.dialog.alert('Profil berhasil diperbarui!');
      } catch (e) {
        console.error('Error:', e);
        f7.dialog.alert(`Error: ${e.message}`);
      } finally {
        this.loading = false;
      }
    },
    async removeAvatar() {
      f7.dialog.confirm('Apakah Anda yakin ingin menghapus foto profil?', 'Konfirmasi Penghapusan', async () => {
        this.loading = true;
        try {
          const { value: token } = await Preferences.get({ key: 'token' });
          if (!token) {
            f7.dialog.alert('Token tidak ditemukan, silakan login ulang.');
            this.loading = false;
            return;
          }
          const res = await fetch('https://ngopilosofi-production.up.railway.app/api/profile/remove-avatar', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
          });
          if (!res.ok) throw new Error((await res.json()).message || 'Gagal hapus avatar');
          const updated = await res.json();
          await Preferences.set({ key: 'user', value: JSON.stringify(updated.user) });
          await Preferences.set({ key: 'userAvatar', value: '' });
          this.userProfile = { ...updated.user };
          this.editProfile = { ...updated.user };
          f7.dialog.alert('Foto profil berhasil dihapus.');
        } catch (e) {
          console.error('Error:', e);
          f7.dialog.alert(`Error: ${e.message}`);
        } finally {
          this.loading = false;
        }
      });
    },
    async logout() {
      f7.dialog.confirm('Apakah Anda yakin ingin logout?', 'Konfirmasi Logout', async () => {
        await Preferences.remove({ key: 'token' });
        await Preferences.remove({ key: 'user' });
        await Preferences.remove({ key: 'userAvatar' });
        f7.dialog.alert('Anda telah logout.', () => {
          f7.views.main.router.navigate('/login/', {
            reloadCurrent: true,
            clearPreviousHistory: true
          });
        });
      });
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
  padding: 20px;
  min-height: 100%;
}

.profile-header {
  text-align: center;
  margin-bottom: 20px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 10px;
}

.app-name {
  font-size: 24px;
  color: #331c2c;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: #5a3c4c;
  margin-top: 5px;
}

.user-profile-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-container {
  width: 120px;
  height: 120px;
  margin: 0 auto 15px;
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #331c2c;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-container:hover .edit-overlay {
  opacity: 1;
}

.user-name {
  font-size: 20px;
  color: #331c2c;
  margin: 5px 0;
}

.user-email {
  font-size: 14px;
  color: #5a3c4c;
  margin: 5px 0 15px;
}

.edit-profile {
  background-color: transparent;
  color: #331c2c;
  border: 1px solid #331c2c;
  width: auto;
  padding: 5px 15px;
  font-size: 14px;
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
  margin-top: 30px;
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

.profile-edit-popup .avatar-upload {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.profile-edit-popup .avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  border: 3px solid #331c2c;
  cursor: pointer;
}

.profile-edit-popup .avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-edit-popup .upload-text {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 10px;
  text-align: center;
  font-size: 14px;
}

.profile-edit-popup .upload-text i {
  display: block;
  margin-bottom: 5px;
}

.delete-avatar-link {
  display: block;
  text-align: center;
  margin-top: 10px;
  color: #d32f2f;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
}
</style>