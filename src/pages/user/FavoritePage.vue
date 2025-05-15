<template>
  <f7-page class="page-bg">
    <f7-block>
      <f7-block v-if="favoriteItems.length > 0" class="favorites-title">My Favorites</f7-block>

      <div v-if="favoriteItems.length > 0">
        <div class="menu-grid">
          <div v-for="(item, index) in favoriteItems" :key="index" class="menu-card">
            <div class="favorite-icon" @click="removeFavorite(item)">
              <f7-icon ios="f7:heart_fill" aurora="f7:heart_fill" md="material:favorite" color="red"></f7-icon>
            </div>
            <img :src="item.gambar" class="menu-image" />
            <div class="menu-details">
              <div class="menu-name">{{ item.nama }}</div>
              <div class="menu-price">{{ formatRupiah(item.harga) }}</div>
            </div>
            <f7-button small fill class="add-button" @click="openPopup(item)">
              Tambah
            </f7-button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <f7-icon ios="f7:heart" aurora="f7:heart" md="material:favorite_border" size="48px" color="#331c2c"></f7-icon>
        <div class="empty-text">No favorites yet</div>
        <f7-button href="/user/menu-list/" class="browse-button">
          Browse Menu
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

export default {
  name: 'FavoritePage',
  data() {
    return {
      favoriteItems: [],
      popupOpened: false,
      selectedItem: null,
      selectedAddons: [],
      quantity: 1,
    };
  },
  methods: {
    formatRupiah(angka) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(angka);
    },
    tambahPesanan(item) {
      this.$f7.dialog.alert(`Tambahkan: ${item.nama}`);
    },
    removeFavorite(item) {
      const index = this.favoriteItems.findIndex(
        (fav) => fav.nama === item.nama
      );
      if (index !== -1) {
        this.favoriteItems.splice(index, 1);
      }

      localStorage.setItem(
        '/user/favorite/',
        JSON.stringify(this.favoriteItems)
      );

      this.$f7.toast
        .create({
          text: 'Removed from favorites',
          closeTimeout: 2000,
          destroyOnClose: true,
        })
        .open();
    },
    openPopup(item) {
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
          item.produk.id === cartItem.produk.id &&
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
          position: 'bottom',
          closeTimeout: 2000,
          cssClass: 'success-toast',
        })
        .open();
    },
    loadFavorite() {
      const savedFavorite = localStorage.getItem('/user/favorite/');
      this.favoriteItems = savedFavorite ? JSON.parse(savedFavorite) : [];
    },
  },
  mounted() {
    this.loadFavorite();
  },
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