<template>
  <f7-page class="page-bg">
    <f7-navbar title="Pesanan Saya" back-link="Back" class="navbar-custom">
      <f7-nav-right>
        <f7-link icon-only @click="refreshCart" class="refresh-btn">
          <f7-icon ios="f7:arrow_clockwise" aurora="f7:arrow_clockwise" md="material:refresh"></f7-icon>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-block v-if="cartItems.length === 0" class="empty-cart">
      <div class="empty-cart-container">
        <div class="empty-cart-icon">
          <f7-icon ios="f7:cart_fill" aurora="f7:cart_fill" md="material:shopping_cart" size="64px"
            color="#331c2c"></f7-icon>
        </div>
        <div class="empty-title">Keranjang Kosong</div>
        <div class="empty-subtitle">Belum ada item di keranjang Anda</div>
        <f7-button href="/user/menu-list/" class="browse-button">Jelajahi Menu</f7-button>
      </div>
    </f7-block>

    <f7-block v-else class="cart-container">
      <div class="cart-header">
        <f7-row>
          <f7-col>
            <div class="selection-control">
              <f7-checkbox :checked="allSelected" @change="toggleSelectAll" class="custom-checkbox"></f7-checkbox>
              <span class="select-all-text">Pilih Semua</span>
            </div>
          </f7-col>
          <f7-col class="text-align-right">
            <f7-button small @click="removeSelected" class="remove-selected-btn">
              Hapus Terpilih
            </f7-button>
          </f7-col>
        </f7-row>
      </div>

      <div class="cart-items">
        <div v-for="(item, index) in cartItems" :key="index" class="cart-item-card">
          <div class="item-checkbox">
            <f7-checkbox :checked="item.selected" @change="toggleItemSelection(index)"
              class="custom-checkbox"></f7-checkbox>
          </div>
          <div class="item-image" @click="editItem(index)">
            <img :src="item.produk.gambar" />
          </div>
          <div class="item-details" @click="editItem(index)">
            <div class="item-name">{{ item.produk.nama }}</div>
            <div class="item-addons">{{ formatAddons(item.tambahan) }}</div>
            <div class="item-quantity">Jumlah: {{ item.jumlah }}</div>
          </div>
          <div class="item-price-actions">
            <div class="item-price">{{ formatRupiah(item.totalHarga) }}</div>
            <f7-button small @click.stop="removeItem(index)" class="remove-item-btn">
              <f7-icon ios="f7:trash" aurora="f7:trash" md="material:delete"></f7-icon>
            </f7-button>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>Total Item Terpilih</span>
          <span class="summary-value">{{ selectedItemsCount }}</span>
        </div>
        <div class="summary-row total-price">
          <span>Total Harga</span>
          <span class="summary-value">{{ formatRupiah(selectedItemsPrice) }}</span>
        </div>
      </div>

      <f7-button large fill round class="checkout-btn" @click="checkout" :disabled="selectedItemsCount === 0">
        <span class="checkout-text">Checkout</span>
        <span class="checkout-price">{{ formatRupiah(selectedItemsPrice) }}</span>
      </f7-button>
    </f7-block>

    <f7-popup v-model:opened="editPopupOpened" class="edit-popup">
      <f7-page class="edit-popup-bg">
        <f7-navbar :title="editingItem ? editingItem.produk.nama : ''" class="popup-navbar">
          <f7-nav-right>
            <f7-link popup-close class="popup-close-btn">Tutup</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block v-if="editingItem" class="edit-content">
          <div class="edit-image-container">
            <img :src="editingItem.produk.gambar" class="edit-image" />
          </div>

          <div class="edit-section">
            <div class="section-title">Tambahan</div>
            <div class="addons-list">
              <div v-for="(addon, index) in editingItem.produk.tambahan" :key="index" class="addon-item">
                <f7-checkbox :checked="isAddonSelected(addon)" @change="toggleAddon(addon)"
                  class="addon-checkbox"></f7-checkbox>
                <div class="addon-info">
                  <div class="addon-name">{{ addon.nama }}</div>
                  <div class="addon-price">{{ formatRupiah(addon.harga) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="edit-section">
            <div class="section-title">Jumlah</div>
            <div class="quantity-control">
              <f7-button small round @click="decreaseEditQuantity" class="quantity-btn minus">
                <f7-icon ios="f7:minus" aurora="f7:minus" md="material:remove"></f7-icon>
              </f7-button>
              <div class="quantity-value">{{ editQuantity }}</div>
              <f7-button small round @click="increaseEditQuantity" class="quantity-btn plus">
                <f7-icon ios="f7:plus" aurora="f7:plus" md="material:add"></f7-icon>
              </f7-button>
            </div>
          </div>

          <f7-button large fill round color="primary" @click="saveEdit" class="save-edit-btn">
            Simpan Perubahan
          </f7-button>
        </f7-block>
      </f7-page>
    </f7-popup>
  </f7-page>
</template>

<script>
import { f7, f7ready } from 'framework7-vue';

export default {
  name: 'OrderPage',
  data() {
    return {
      cartItems: [],
      editPopupOpened: false,
      editingItem: null,
      editingIndex: -1,
      editQuantity: 1,
      editSelectedAddons: []
    };
  },
  computed: {
    totalItems() {
      return this.cartItems.reduce((sum, item) => sum + item.jumlah, 0);
    },
    totalPrice() {
      return this.cartItems.reduce((sum, item) => sum + item.totalHarga, 0);
    },
    selectedItemsCount() {
      return this.cartItems
        .filter(item => item.selected)
        .reduce((sum, item) => sum + item.jumlah, 0);
    },
    selectedItemsPrice() {
      return this.cartItems
        .filter(item => item.selected)
        .reduce((sum, item) => sum + item.totalHarga, 0);
    },
    allSelected() {
      return this.cartItems.length > 0 && this.cartItems.every(item => item.selected);
    }
  },
  methods: {
    formatRupiah(angka) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(angka);
    },
    formatAddons(addons) {
      if (!addons || addons.length === 0) return 'Tanpa tambahan';
      return addons.map(a => a.nama).join(', ');
    },
    refreshCart() {
      this.loadCart();
      this.showToast('Keranjang diperbarui');
    },
    loadCart() {
      const savedCart = localStorage.getItem('/user/cart/');
      this.cartItems = savedCart ? JSON.parse(savedCart) : [];

      this.cartItems = this.cartItems.map(item => ({
        ...item,
        selected: item.selected !== undefined ? item.selected : true
      }));
    },
    removeItem(index) {
      this.showConfirmDialog(
        'Apakah Anda yakin ingin menghapus item ini?',
        'Hapus Item',
        () => {
          const newCartItems = [...this.cartItems];
          newCartItems.splice(index, 1);
          this.cartItems = newCartItems;
          this.saveCart();
          this.showToast('Item dihapus dari keranjang');

          setTimeout(() => {
            location.reload();
          }, 1500);
        }
      );
    },
    removeSelected() {
      if (this.selectedItemsCount === 0) {
        this.showToast('Tidak ada item yang dipilih');
        return;
      }

      this.showConfirmDialog(
        'Apakah Anda yakin ingin menghapus item yang dipilih?',
        'Hapus Item Terpilih',
        () => {
          this.cartItems = this.cartItems.filter(item => !item.selected);
          this.saveCart();
          this.showToast('Item terpilih dihapus');
        }
      );
    },
    saveCart() {
      localStorage.setItem('/user/cart/', JSON.stringify(this.cartItems));
      this.$emit('cartUpdated', this.cartItems.length);
    },
    showConfirmDialog(text, title, callback) {
      f7ready(() => {
        f7.dialog.confirm(text, title, callback);
      });
    },
    showToast(message) {
      f7ready(() => {
        f7.toast.create({
          text: message,
          closeTimeout: 2000,
          destroyOnClose: true,
          cssClass: 'custom-toast'
        }).open();
      });
    },
    editItem(index) {
      this.editingIndex = index;
      this.editingItem = JSON.parse(JSON.stringify(this.cartItems[index]));
      this.editQuantity = this.editingItem.jumlah;
      this.editSelectedAddons = [...this.editingItem.tambahan];
      this.editPopupOpened = true;
    },
    isAddonSelected(addon) {
      return this.editSelectedAddons.some(a => a.nama === addon.nama);
    },
    toggleAddon(addon) {
      const index = this.editSelectedAddons.findIndex(a => a.nama === addon.nama);
      if (index === -1) {
        this.editSelectedAddons.push(addon);
      } else {
        this.editSelectedAddons.splice(index, 1);
      }
    },
    increaseEditQuantity() {
      this.editQuantity++;
    },
    decreaseEditQuantity() {
      if (this.editQuantity > 1) this.editQuantity--;
    },
    saveEdit() {
      const totalAddonPrice = this.editSelectedAddons.reduce((sum, addon) => sum + addon.harga, 0);
      const totalHarga = (this.editingItem.produk.harga + totalAddonPrice) * this.editQuantity;

      const updatedItem = {
        produk: this.editingItem.produk,
        tambahan: this.editSelectedAddons,
        jumlah: this.editQuantity,
        totalHarga: totalHarga,
        selected: this.cartItems[this.editingIndex].selected
      };

      this.cartItems.splice(this.editingIndex, 1, updatedItem);
      this.saveCart();
      this.editPopupOpened = false;
      this.showToast('Perubahan disimpan');
    },
    checkout() {
      const selectedItems = this.cartItems.filter(item => item.selected);

      if (selectedItems.length === 0) {
        this.showAlert('Silakan pilih minimal 1 item untuk checkout', 'Checkout Gagal');
        return;
      }

      const checkoutData = {
        items: selectedItems,
        totalItems: this.selectedItemsCount,
        totalPrice: this.selectedItemsPrice,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('/user/checkout/', JSON.stringify(checkoutData));
      f7.views.main.router.navigate('/user/checkout/');
    },
    showAlert(text, title) {
      f7ready(() => {
        f7.dialog.alert(text, title);
      });
    },
    toggleItemSelection(index) {
      this.cartItems[index].selected = !this.cartItems[index].selected;
      this.saveCart();
    },
    toggleSelectAll() {
      const newSelectState = !this.allSelected;
      this.cartItems = this.cartItems.map(item => ({
        ...item,
        selected: newSelectState
      }));
      this.saveCart();
    },
    areAddonsIdentical(a, b) {
      if (a.length !== b.length) return false;
      const aNames = a.map(x => x.nama).sort();
      const bNames = b.map(x => x.nama).sort();
      return JSON.stringify(aNames) === JSON.stringify(bNames);
    }
  },
  mounted() {
    this.loadCart();
  }
};
</script>

<style scoped>
.page-bg {
  background-color: #ede0d1;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

.navbar-custom {
  background-color: #331c2c;
  color: white;
  box-shadow: 0 2px 10px rgba(108, 92, 231, 0.2);
}

.navbar-custom .left a {
  color: white;
}

.refresh-btn {
  color: white;
}

.empty-cart {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
}

.empty-cart-container {
  text-align: center;
  padding: 20px;
}

.empty-cart-icon {
  margin-bottom: 20px;
}

.empty-title {
  font-size: 22px;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 16px;
  color: #636e72;
  margin-bottom: 24px;
}

.browse-button {
  --f7-button-bg-color: #331c2c;
  --f7-button-text-color: white;
  --f7-button-font-size: 16px;
  --f7-button-height: 48px;
  border-radius: 12px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
}

.cart-container {
  padding-bottom: 80px;
}

.cart-header {
  background-color: white;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.selection-control {
  display: flex;
  align-items: center;
}

.select-all-text {
  font-size: 15px;
  color: #2d3436;
  margin-left: 8px;
}

.remove-selected-btn {
  --f7-button-text-color: #e74c3c;
  --f7-button-border-color: #e74c3c;
  --f7-button-border-width: 1px;
  --f7-button-height: 32px;
  --f7-button-font-size: 13px;
  font-weight: 500;
}

.custom-checkbox {
  --f7-checkbox-active-color: rgb(22, 175, 22);
}

.cart-items {
  margin-bottom: 16px;
}

.cart-item-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cart-item-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.item-checkbox {
  margin-right: 12px;
}

.item-image {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex-grow: 1;
  overflow: hidden;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-addons {
  font-size: 13px;
  color: #636e72;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-quantity {
  font-size: 14px;
  color: #2d3436;
}

.item-price-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 12px;
}

.item-price {
  font-size: 16px;
  font-weight: 600;
  color: #331c2c;
  margin-bottom: 8px;
}

.remove-item-btn {
  --f7-button-text-color: #e74c3c;
  --f7-button-border-color: #e74c3c;
  --f7-button-border-width: 1px;
  --f7-button-height: 28px;
  --f7-button-font-size: 12px;
  min-width: 28px;
  padding: 0 8px;
}

.cart-summary {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 16px;
  color: #2d3436;
}

.summary-row.total-price {
  font-weight: 600;
  font-size: 18px;
  color: #331c2c;
  margin-bottom: 0;
}

.summary-value {
  font-weight: 500;
}

.checkout-btn {
  --f7-button-bg-color: #331c2c;
  --f7-button-text-color: white;
  --f7-button-height: 40px;
  --f7-button-font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(49, 48, 56, 0.3);
  margin-top: 0;
}

.checkout-btn[disabled] {
  --f7-button-bg-color: #b2b2b2;
  box-shadow: none;
}

.checkout-text {
  margin-right: 8px;
}

.edit-popup-bg {
  background-color: #ede0d1;
}

.popup-navbar {
  background-color: #331c2c;
  color: #331c2c;
}

.popup-navbar .right a {
  color: #331c2c;
  font-weight: 500;
}

.popup-close-btn {
  font-size: 16px;
}

.edit-content {
  padding-bottom: 30px;
}

.edit-image-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.edit-image {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.edit-section {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 12px;
}

.addons-list {
  margin-top: 8px;
}

.addon-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f1f2f6;
}

.addon-item:last-child {
  border-bottom: none;
}

.addon-checkbox {
  margin-right: 12px;
}

.addon-info {
  flex-grow: 1;
}

.addon-name {
  font-size: 15px;
  color: #2d3436;
  margin-bottom: 2px;
}

.addon-price {
  font-size: 14px;
  color: #331c2c;
  font-weight: 500;
}

.quantity-control {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
}

.quantity-btn {
  --f7-button-height: 36px;
  --f7-button-width: 36px;
  --f7-button-text-color: #331c2c;
  --f7-button-border-color: #331c2c;
  --f7-button-border-width: 1px;
}

.quantity-value {
  font-size: 18px;
  font-weight: 600;
  color: #2d3436;
  margin: 0 20px;
  min-width: 24px;
  text-align: center;
}

.save-edit-btn {
  --f7-button-bg-color: #331c2c;
  --f7-button-text-color: white;
  --f7-button-height: 48px;
  --f7-button-font-size: 16px;
  font-weight: 600;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
}

:root {
  --f7-toast-text-color: white;
  --f7-toast-bg-color: #331c2c;
  --f7-toast-border-radius: 8px;
}
</style>