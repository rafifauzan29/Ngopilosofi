<template>
  <f7-page class="page-bg">
    <f7-navbar title="Favorit Saya" back-link="Back" class="navbar-custom"></f7-navbar>
    <f7-block>
      <f7-block v-if="favoriteItems.length > 0" class="favorites-title">Daftar Favorit</f7-block>

      <div v-if="favoriteItems.length > 0">
        <div class="menu-grid">
          <div v-for="(item, index) in favoriteItems" :key="index" class="menu-card">
            <div class="favorite-icon" @click="toggleFavorite(item)">
              <f7-icon ios="f7:heart_fill" aurora="f7:heart_fill" md="material:favorite" color="red"></f7-icon>
            </div>
            <img :src="item.gambar" class="menu-image" />
            <div class="menu-details">
              <div class="menu-name">{{ item.nama }}</div>
              <div class="menu-price">{{ formatRupiah(item.harga) }}</div>
            </div>
            <f7-button small fill class="add-button" @click="openDetail(item)">
              Tambah
            </f7-button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <f7-icon ios="f7:heart" aurora="f7:heart" md="material:favorite_border" size="48px" color="#331c2c"></f7-icon>
        <div class="empty-text">Belum ada menu favorit</div>
        <f7-button href="/user/menu-list/" class="browse-button">
          Lihat Menu
        </f7-button>
      </div>
    </f7-block>

    <f7-popup v-model:opened="popupOpened">
      <f7-page class="page-bg">
        <f7-navbar title="Detail Produk" class="navbar-custom">
          <f7-nav-right>
            <f7-link popup-close>Close</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block class="text-align-center">
          <img v-if="selectedItem" :src="selectedItem.gambar"
            style="width: 200px; border-radius: 12px; margin-bottom: 10px;" />
          <h2>{{ selectedItem?.nama }}</h2>
          <h3 style="color: #666;">{{ formatRupiah(selectedItem?.harga) }}</h3>
          <p style="padding: 0 20px;">{{ selectedItem?.deskripsi }}</p>

          <f7-list strong inset>
            <f7-list-item v-for="(addon, index) in selectedItem?.tambahan" :key="index" :title="addon.nama"
              :after="formatRupiah(addon.harga)">
              <template #media>
                <f7-checkbox :checked="isAddonSelected(addon)" @change="toggleAddon(addon)" />
              </template>
            </f7-list-item>
          </f7-list>

          <div style="display: flex; align-items: center; justify-content: center; margin: 20px;">
            <f7-button small @click="decreaseQuantity">-</f7-button>
            <div style="margin: 0 15px;">{{ quantity }}</div>
            <f7-button small @click="increaseQuantity">+</f7-button>
          </div>

          <f7-button fill color="black" @click="addToCart">
            Tambah ke Pesanan
          </f7-button>
        </f7-block>
      </f7-page>
    </f7-popup>
  </f7-page>
</template>

<script>
import { f7 } from 'framework7-vue';
import { useCartStore } from '../../js/stores/cart';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Preferences } from '@capacitor/preferences';

export default {
  name: 'FavoritePage',
  setup() {
    const cartStore = useCartStore();
    const favoriteItems = ref([]);
    const popupOpened = ref(false);
    const selectedItem = ref(null);
    const selectedAddons = ref([]);
    const quantity = ref(1);
    const userId = ref(null);
    const pendingFavorites = ref([]);

    const formatRupiah = (angka) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(angka);
    };

    const loadUserData = async () => {
      const { value: userRaw } = await Preferences.get({ key: 'user' });
      console.log('[DEBUG] userRaw:', userRaw);

      try {
        const user = userRaw ? JSON.parse(userRaw) : null;
        console.log('[DEBUG] Parsed user:', user);

        // Kompatibel dengan ._id (MongoDB) dan .id (JSON API)
        userId.value = user?._id || user?.id || null;
        console.log('[DEBUG] userId.value:', userId.value);
      } catch (e) {
        console.error('[ERROR] Gagal parsing user dari Preferences:', e);
        userId.value = null;
      }

      const { value: pendingFavs } = await Preferences.get({ key: 'pendingFavorites' });
      pendingFavorites.value = pendingFavs ? JSON.parse(pendingFavs) : [];
    };

    const fetchFavoriteItems = async () => {
      await loadUserData();

      if (!userId.value) {
        f7.toast.create({
          text: 'Silakan login terlebih dahulu',
          closeTimeout: 3000,
          cssClass: 'error-toast',
        }).open();
        return;
      }

      try {
        const { value: token } = await Preferences.get({ key: 'token' });

        const response = await fetch('https://ngopilosofi-production.up.railway.app/api/favorite', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch favorites');

        favoriteItems.value = await response.json();

        await Preferences.set({
          key: `userFavorites_${userId.value}`,
          value: JSON.stringify(favoriteItems.value)
        });

      } catch (error) {
        console.error('Error fetching favorites:', error);

        const { value: cachedFavorites } = await Preferences.get({
          key: `userFavorites_${userId.value}`
        });

        if (cachedFavorites) {
          favoriteItems.value = JSON.parse(cachedFavorites);
          f7.toast.create({
            text: 'Menggunakan data offline',
            closeTimeout: 3000,
            cssClass: 'warning-toast',
          }).open();
        }
      }
    };

    const toggleFavorite = async (item) => {
      await loadUserData();

      if (!userId.value) {
        f7.toast.create({
          text: 'Silakan login terlebih dahulu',
          closeTimeout: 3000,
          cssClass: 'error-toast',
        }).open();
        return;
      }

      const { value: token } = await Preferences.get({ key: 'token' });
      if (!token) {
        f7.toast.create({
          text: 'Token tidak ditemukan, silakan login ulang',
          closeTimeout: 3000,
          cssClass: 'error-toast',
        }).open();
        return;
      }

      if (!navigator.onLine) {
        const newPending = {
          menuId: item._id,
          action: 'remove',
          timestamp: new Date().getTime()
        };

        pendingFavorites.value.push(newPending);
        await Preferences.set({
          key: 'pendingFavorites',
          value: JSON.stringify(pendingFavorites.value)
        });

        favoriteItems.value = favoriteItems.value.filter(i => i._id !== item._id);

        f7.toast.create({
          text: 'Akan disinkronisasi ketika online',
          closeTimeout: 3000,
          cssClass: 'warning-toast',
        }).open();
        return;
      }

      try {
        const response = await fetch(`https://ngopilosofi-production.up.railway.app/api/favorite/${item._id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to remove favorite');

        favoriteItems.value = favoriteItems.value.filter(i => i._id !== item._id);

        await Preferences.set({
          key: `userFavorites_${userId.value}`,
          value: JSON.stringify(favoriteItems.value)
        });

        f7.toast.create({
          text: 'Dihapus dari favorit',
          closeTimeout: 3000,
          cssClass: 'success-toast',
        }).open();

        if (pendingFavorites.value.length > 0) {
          await syncPendingFavorites();
        }
      } catch (error) {
        console.error('Error removing favorite:', error);
        f7.toast.create({
          text: 'Gagal menghapus favorit',
          closeTimeout: 3000,
          cssClass: 'error-toast',
        }).open();
      }
    };

    const syncPendingFavorites = async () => {
      try {
        const { value: token } = await Preferences.get({ key: 'token' });
        if (!token) return;

        for (const pending of pendingFavorites.value) {
          await fetch(`https://ngopilosofi-production.up.railway.app/api/favorite/${pending.menuId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }

        pendingFavorites.value = [];
        await Preferences.remove({ key: 'pendingFavorites' });

        await fetchFavoriteItems();
      } catch (error) {
        console.error('Error syncing pending favorites:', error);
      }
    };

    const openDetail = (item) => {
      selectedItem.value = item;
      selectedAddons.value = [];
      quantity.value = 1;
      popupOpened.value = true;
    };

    const increaseQuantity = () => {
      quantity.value++;
    };

    const decreaseQuantity = () => {
      if (quantity.value > 1) quantity.value--;
    };

    const isAddonSelected = (addon) => {
      return selectedAddons.value.some((a) => a.nama === addon.nama);
    };

    const toggleAddon = (addon) => {
      const index = selectedAddons.value.findIndex((a) => a.nama === addon.nama);
      if (index === -1) {
        selectedAddons.value.push(addon);
      } else {
        selectedAddons.value.splice(index, 1);
      }
    };

    const addToCart = async () => {
      const success = await cartStore.addToCart(
        selectedItem.value._id,
        quantity.value,
        selectedAddons.value
      );

      if (success) {
        popupOpened.value = false;
        showToast('Produk ditambahkan ke keranjang');
      }
    };

    const showToast = (message) => {
      f7.toast.create({
        text: message,
        closeTimeout: 3000,
        cssClass: 'success-toast',
      }).open();
    };

    onMounted(async () => {
      await fetchFavoriteItems();
      window.addEventListener('online', syncPendingFavorites);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('online', syncPendingFavorites);
    });

    return {
      favoriteItems,
      popupOpened,
      selectedItem,
      selectedAddons,
      quantity,
      userId,
      pendingFavorites,
      formatRupiah,
      toggleFavorite,
      openDetail,
      increaseQuantity,
      decreaseQuantity,
      isAddonSelected,
      toggleAddon,
      addToCart,
      showToast
    };
  }
};
</script>

<style scoped>
.page-bg {
  background-color: #ede0d1;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.menu-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(51, 28, 44, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.favorite-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.menu-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.menu-details {
  padding: 12px;
}

.menu-name {
  font-weight: 600;
  color: #331c2c;
  font-size: 15px;
  margin-bottom: 4px;
}

.menu-price {
  color: #331c2c;
  opacity: 0.8;
  font-size: 14px;
  font-weight: 500;
}

.add-button {
  --f7-button-bg-color: #331c2c;
  --f7-button-text-color: white;
  --f7-button-padding-vertical: 8px;
  margin: 8px 12px 12px;
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 200px);
  text-align: center;
}

.empty-text {
  margin: 16px 0;
  color: #331c2c;
  font-size: 18px;
  font-weight: 500;
}

.browse-button {
  --f7-button-bg-color: #331c2c;
  --f7-button-text-color: white;
  margin-top: 16px;
}

.favorites-title {
  color: #331c2c;
  font-size: 22px;
  font-weight: 600;
  margin: 16px 0;
  padding-bottom: 20px;
  text-align: center;
  text-transform: none;
  letter-spacing: 0.5px;
}

.popup-content {
  padding: 16px;
  text-align: center;
}

.popup-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
}

.popup-name {
  margin-top: 12px;
  font-weight: 600;
  color: #331c2c;
}

.popup-price {
  color: #331c2c;
  opacity: 0.8;
  margin: 8px 0;
}

.quantity-selector {
  margin: 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.quantity-number {
  font-size: 18px;
  font-weight: 600;
}

.confirm-button {
  --f7-button-bg-color: #331c2c;
  --f7-button-text-color: white;
  border-radius: 12px;
  margin-top: 16px;
}
</style>