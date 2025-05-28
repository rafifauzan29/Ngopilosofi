<template>
  <f7-page class="page-bg">
    <f7-navbar title="Menu" class="navbar-custom">
      <f7-nav-right>
        <f7-link href="/user/favorites/" class="favorites-link">
          <f7-icon ios="f7:heart" aurora="f7:heart" md="material:favorite"></f7-icon>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-block class="search-container">
      <f7-searchbar placeholder="Cari menu..." :clear-button="true" @input="onSearch" class="custom-searchbar" />
    </f7-block>

    <f7-block class="category-container">
      <div class="chips-wrapper">
        <f7-chip v-for="kategori in kategoriList" :key="kategori" :text="kategori" :outline="false"
          @click="selectedKategori = kategori" class="category-chip" :class="{
            'selected-chip': selectedKategori === kategori,
            'unselected-chip': selectedKategori !== kategori
          }" />
      </div>
    </f7-block>

    <f7-block class="menu-container">
      <div class="menu-grid">
        <div v-for="(item, index) in filteredMenu" :key="index" class="menu-card">
          <div class="favorite-icon" @click="toggleFavorite(item)">
            <f7-icon :ios="item.isFavorite ? 'f7:heart_fill' : 'f7:heart'"
              :aurora="item.isFavorite ? 'f7:heart_fill' : 'f7:heart'"
              :md="item.isFavorite ? 'material:favorite' : 'material:favorite_border'"
              :color="item.isFavorite ? 'red' : '#331c2c'" />
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
    </f7-block>

    <f7-popup v-model:opened="popupOpened">
      <f7-page class="page-bg">
        <f7-navbar title="Detail Produk">
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

          <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 20px;
            ">
            <f7-button small @click="decreaseQuantity">-</f7-button>
            <div style="margin: 0 15px;">{{ quantity }}</div>
            <f7-button small @click="increaseQuantity">+</f7-button>
          </div>

          <f7-button fill color="black" @click="addToCart" class="add-to-cart-btn">
            Tambah ke Pesanan
          </f7-button>
        </f7-block>
      </f7-page>
    </f7-popup>
  </f7-page>
</template>

<script>
import { f7 } from 'framework7-vue';

export default {
  name: 'MenuListPage',
  data() {
    return {
      keyword: '',
      selectedKategori: 'Semua',
      kategoriList: [
        'Semua',
        'Baru',
        'Paling Laku',
        'Kopi',
        'Susu',
        'Makanan',
        'Minuman',
        'Snack',
      ],
      semuaMenu: [],
      popupOpened: false,
      selectedItem: null,
      selectedAddons: [],
      quantity: 1,
      userId: localStorage.getItem('userId') || null,
      pendingFavorites: JSON.parse(localStorage.getItem('pendingFavorites') || '[]')
    };
  },
  computed: {
    filteredMenu() {
      return this.semuaMenu.filter((item) => {
        const matchKategori =
          this.selectedKategori === 'Semua' ||
          (Array.isArray(item.kategori)
            ? item.kategori.includes(this.selectedKategori)
            : item.kategori === this.selectedKategori);
        const matchKeyword = item.nama.toLowerCase().includes(this.keyword.toLowerCase());
        return matchKategori && matchKeyword;
      });
    }
  },
  methods: {
    formatRupiah(angka) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(angka);
    },
    onSearch(event) {
      this.keyword = event.target.value;
    },
    async toggleFavorite(item) {
      if (!this.userId) {
        f7.toast.create({
          text: 'Silakan login terlebih dahulu',
          closeTimeout: 3000,
          cssClass: 'error-toast',
        }).open();
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        f7.toast.create({
          text: 'Token tidak ditemukan, silakan login ulang',
          closeTimeout: 3000,
          cssClass: 'error-toast',
        }).open();
        return;
      }

      this.semuaMenu = this.semuaMenu.map(menu => {
        if (menu._id === item._id) {
          return { ...menu, isFavorite: !menu.isFavorite };
        }
        return menu;
      });

      if (!navigator.onLine) {
        this.pendingFavorites.push({
          menuId: item._id,
          action: item.isFavorite ? 'add' : 'remove',
          timestamp: new Date().getTime()
        });
        localStorage.setItem('pendingFavorites', JSON.stringify(this.pendingFavorites));

        f7.toast.create({
          text: 'Akan disinkronisasi ketika online',
          closeTimeout: 3000,
          cssClass: 'warning-toast',
        }).open();
        return;
      }

      try {
        item.isFavorite = !item.isFavorite;

        const action = item.isFavorite ? 'add' : 'remove';

        const response = await fetch(`http://localhost:5000/api/favorite/${item._id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to update favorite');

        const result = await response.json();

        f7.toast.create({
          text: action === 'add' ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit',
          closeTimeout: 3000,
          cssClass: action === 'add' ? 'success-toast' : 'danger-toast',
        }).open();

        if (this.pendingFavorites.length > 0) {
          await this.syncPendingFavorites();
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        this.semuaMenu = this.semuaMenu.map(menu => {
          if (menu._id === item._id) {
            return { ...menu, isFavorite: !menu.isFavorite };
          }
          return menu;
        });
        f7.toast.create({
          text: 'Gagal mengupdate favorit',
          closeTimeout: 3000,
          cssClass: 'error-toast',
        }).open();
      }
    },

    async syncPendingFavorites() {
      try {
        for (const pending of this.pendingFavorites) {
          await fetch(`http://localhost:5000/api/favorite/${pending.menuId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        }

        this.pendingFavorites = [];
        localStorage.removeItem('pendingFavorites');

      } catch (error) {
        console.error('Error syncing pending favorites:', error);
      }
    },
    openDetail(item) {
      this.selectedItem = item;
      this.selectedAddons = [];
      this.quantity = 1;
      this.popupOpened = true;
    },
    increaseQuantity() {
      this.quantity++;
    },
    decreaseQuantity() {
      if (this.quantity > 1) this.quantity--;
    },
    isAddonSelected(addon) {
      return this.selectedAddons.some((a) => a.nama === addon.nama);
    },
    toggleAddon(addon) {
      const index = this.selectedAddons.findIndex((a) => a.nama === addon.nama);
      if (index === -1) {
        this.selectedAddons.push(addon);
      } else {
        this.selectedAddons.splice(index, 1);
      }
    },
    async addToCart() {
      const totalAddonPrice = this.selectedAddons.reduce(
        (sum, addon) => sum + addon.harga,
        0
      );
      const totalHarga = (this.selectedItem.harga + totalAddonPrice) * this.quantity;

      const cartItem = {
        produk: this.selectedItem,
        tambahan: [...this.selectedAddons],
        jumlah: this.quantity,
        totalHarga: totalHarga,
        selected: true,
      };

      let existingCart = JSON.parse(localStorage.getItem('/user/cart/') || '[]');

      const isSameAddons = (a, b) => {
        if (a.length !== b.length) return false;
        const aSorted = [...a].map(x => x.nama).sort();
        const bSorted = [...b].map(x => x.nama).sort();
        return JSON.stringify(aSorted) === JSON.stringify(bSorted);
      };

      const existingIndex = existingCart.findIndex(
        item =>
          item.produk._id === cartItem.produk._id &&
          isSameAddons(item.tambahan, cartItem.tambahan)
      );

      if (existingIndex !== -1) {
        const existingItem = existingCart[existingIndex];
        const newJumlah = existingItem.jumlah + cartItem.jumlah;
        const newTotalHarga = (cartItem.produk.harga +
          cartItem.tambahan.reduce((sum, addon) => sum + addon.harga, 0)) * newJumlah;

        existingCart[existingIndex].jumlah = newJumlah;
        existingCart[existingIndex].totalHarga = newTotalHarga;
      } else {
        existingCart.push(cartItem);
      }

      localStorage.setItem('/user/cart/', JSON.stringify(existingCart));

      this.showToast('Produk ditambahkan ke keranjang');
      this.popupOpened = false;
    },
    showToast(message) {
      f7.toast
        .create({
          text: message,
          closeTimeout: 3000,
          cssClass: 'success-toast',
        })
        .open();
    },
    async fetchMenuItems() {
      try {
        const response = await fetch('http://localhost:5000/api/menu');
        if (!response.ok) throw new Error('Failed to fetch menu items');

        const data = await response.json();
        this.semuaMenu = data;

        if (this.userId) {
          await this.checkFavoritesStatus();
        }

        localStorage.setItem('/menu/all/', JSON.stringify(this.semuaMenu));
      } catch (error) {
        console.error('Error fetching menu items:', error);
        const cachedMenu = localStorage.getItem('/menu/all/');
        if (cachedMenu) {
          this.semuaMenu = JSON.parse(cachedMenu);
          f7.toast.create({
            text: 'Menggunakan data offline',
            closeTimeout: 3000,
            cssClass: 'warning-toast',
          }).open();
        }
      }
    },
    async checkFavoritesStatus() {
      try {
        const response = await fetch('http://localhost:5000/api/favorite', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch favorites');

        const favorites = await response.json();
        const favoriteIds = favorites.map(fav => fav._id);

        this.semuaMenu = this.semuaMenu.map(item => ({
          ...item,
          isFavorite: favoriteIds.includes(item._id)
        }));

      } catch (error) {
        console.error('Error checking favorites status:', error);
        const cachedFavorites = localStorage.getItem(`userFavorites_${this.userId}`);
        if (cachedFavorites) {
          const favoriteIds = JSON.parse(cachedFavorites).map(fav => fav._id);
          this.semuaMenu = this.semuaMenu.map(item => ({
            ...item,
            isFavorite: favoriteIds.includes(item._id)
          }));
        }
      }
    },
    onPageBeforeIn() {
      const cachedMenu = localStorage.getItem('/menu/all/');
      if (cachedMenu) {
        this.semuaMenu = JSON.parse(cachedMenu);
      }
    }
  },
  async created() {
    await this.fetchMenuItems();

    window.addEventListener('online', this.syncPendingFavorites);
  },
  beforeDestroy() {
    window.removeEventListener('online', this.syncPendingFavorites);
  },
  on: {
    pageBeforeIn: 'onPageBeforeIn'
  }
};
</script>

<style scoped>
.page-bg {
  background-color: #ede0d1;
}

.navbar-custom {
  background-color: #331c2c !important;
  color: white;
}

.navbar-custom .left,
.navbar-custom .right,
.navbar-custom .title {
  color: white;
}

.favorites-link {
  margin-right: 15px;
}

.search-container {
  padding: 0 16px;
}

.custom-searchbar {
  --f7-searchbar-input-bg-color: white;
  --f7-searchbar-input-border-radius: 12px;
  --f7-searchbar-input-height: 44px;
  --f7-searchbar-input-padding-horizontal: 16px;
}

.category-container {
  padding: 0 16px;
}

.chips-wrapper {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  padding: 8px 0 12px;
  -webkit-overflow-scrolling: touch;
}

.chips-wrapper::-webkit-scrollbar {
  display: none;
}

.category-chip {
  white-space: nowrap;
  border-radius: 9999px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
}

.unselected-chip {
  background-color: white;
  color: #331c2c;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.selected-chip {
  background-color: #331c2c;
  color: white;
  box-shadow: 0 4px 8px rgba(51, 28, 44, 0.2);
}

.menu-container {
  padding: 0 16px 16px;
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

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(51, 28, 44, 0.15);
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
  transition: transform 0.2s ease;
  position: relative;
  overflow: hidden;
}

.add-button:active {
  transform: scale(0.95);
}

.add-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.add-button:active::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 1;
  }

  100% {
    transform: scale(20, 20);
    opacity: 0;
  }
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
