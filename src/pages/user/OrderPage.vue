<template>
  <f7-page class="page-bg">
    <f7-navbar title="Pesanan Saya" back-link="Back">
      <f7-nav-right>
        <f7-link icon-only @click="refreshCart">
          <f7-icon ios="f7:arrow_clockwise" aurora="f7:arrow_clockwise" md="material:refresh"></f7-icon>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-block v-if="cartItems.length === 0" class="empty-cart">
      <f7-icon class="cart-icon" ios="f7:cart" aurora="f7:cart" md="material:shopping_cart" size="48px" color="#331c2c"></f7-icon>
      <div class="empty-text">Keranjang Anda kosong</div>
      <f7-button href="/user/menu-list/" class="browse-button">Lihat Menu</f7-button>
    </f7-block>

    <f7-block v-else>
      <f7-block class="selection-controls">
        <f7-row>
          <f7-col>
            <f7-checkbox :checked="allSelected" @change="toggleSelectAll"></f7-checkbox>
            <span style="margin-left: 8px;">Pilih Semua</span>
          </f7-col>
          <f7-col class="text-align-right">
            <f7-button small @click="removeSelected" color="red" outline>Hapus Terpilih</f7-button>
          </f7-col>
        </f7-row>
      </f7-block>

      <f7-list media-list class="order-list">
        <f7-card v-for="(item, index) in cartItems" :key="index" class="product-card" outline>
          <f7-card-content>
            <f7-list-item
              :title="item.produk.nama"
              :subtitle="formatAddons(item.tambahan)"
              :text="`Jumlah: ${item.jumlah}`"
              :after="formatRupiah(item.totalHarga)"
              @click="editItem(index)"
              checkbox
              :checked="item.selected"
              @change="toggleItemSelection(index)"
            >
              <template #media>
                <img :src="item.produk.gambar" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;" />
              </template>
              <template #after>
                <f7-button small color="red" outline @click.stop="removeItem(index)" class="remove-btn">
                  Hapus
                </f7-button>
              </template>
            </f7-list-item>
          </f7-card-content>
        </f7-card>
      </f7-list>

      <f7-block class="summary-block">
        <f7-row>
          <f7-col>Total Item Terpilih:</f7-col>
          <f7-col class="text-align-right">{{ selectedItemsCount }}</f7-col>
        </f7-row>
        <f7-row>
          <f7-col>Total Harga:</f7-col>
          <f7-col class="text-align-right">{{ formatRupiah(selectedItemsPrice) }}</f7-col>
        </f7-row>
      </f7-block>

      <f7-button large fill color="black" class="checkout-btn" @click="checkout" :disabled="selectedItemsCount === 0">
        Checkout ({{ formatRupiah(selectedItemsPrice) }})
      </f7-button>
    </f7-block>

    <f7-popup v-model:opened="editPopupOpened">
      <f7-page class="page-bg">
        <f7-navbar :title="editingItem ? editingItem.produk.nama : ''">
          <f7-nav-right>
            <f7-link popup-close>Tutup</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block v-if="editingItem">
          <img :src="editingItem.produk.gambar" style="width: 150px; border-radius: 12px; display: block; margin: 0 auto 15px;" />
          
          <f7-list strong inset>
            <f7-list-item
              v-for="(addon, index) in editingItem.produk.tambahan"
              :key="index"
              :title="addon.nama"
              :after="formatRupiah(addon.harga)"
            >
              <template #media>
                <f7-checkbox 
                  :checked="isAddonSelected(addon)"
                  @change="toggleAddon(addon)"
                />
              </template>
            </f7-list-item>
          </f7-list>

          <div style="display: flex; align-items: center; justify-content: center; margin: 20px;">
            <f7-button small @click="decreaseEditQuantity">-</f7-button>
            <div style="margin: 0 15px; font-size: 18px;">{{ editQuantity }}</div>
            <f7-button small @click="increaseEditQuantity">+</f7-button>
          </div>

          <f7-button fill color="black" @click="saveEdit">
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
          destroyOnClose: true
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
      this.$f7router.navigate('/user/checkout/');
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
}

.empty-cart {
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

.order-list {
  margin: 0;
}

.product-card {
  margin: 8px 0;
  border-radius: 12px;
  overflow: hidden;
}

.product-card .card-content {
  padding: 0;
}

.order-list .item-title {
  font-weight: 600;
  color: #331c2c;
}

.order-list .item-subtitle {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}

.order-list .item-text {
  font-size: 14px;
  color: #331c2c;
  margin-top: 4px;
}

.remove-btn {
  margin-left: 10px;
}

.summary-block {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.summary-block .row {
  margin-bottom: 8px;
  font-size: 16px;
}

.summary-block .row:last-child {
  margin-bottom: 0;
  font-weight: 600;
  font-size: 18px;
  color: #331c2c;
}

.checkout-btn {
  margin-top: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.checkout-btn[disabled] {
  opacity: 0.6;
}

.selection-controls {
  margin-bottom: 10px;
  padding: 10px 16px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.text-align-right {
  text-align: right;
}
</style>