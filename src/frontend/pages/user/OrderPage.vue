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

      <f7-button large fill round class="checkout-btn" @click="openCheckoutPopup" :disabled="selectedItemsCount === 0">
        <span class="checkout-text">Checkout {{ formatRupiah(selectedItemsPrice) }}</span>
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

    <f7-popup v-model:opened="checkoutPopupOpened" class="checkout-popup">
      <f7-page class="checkout-popup-bg">
        <f7-navbar title="Konfirmasi Pesanan" class="popup-navbar">
          <f7-nav-right>
            <f7-link popup-close class="popup-close-btn">Tutup</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block class="checkout-content">
          <div class="order-summary">
            <div class="summary-title">Ringkasan Pesanan</div>

            <div class="selected-items-list">
              <div v-for="(item, index) in selectedItems" :key="index" class="checkout-item">
                <div class="item-info">
                  <div class="item-name">{{ item.produk.nama }} × {{ item.jumlah }}</div>
                  <div class="item-addons" v-if="item.tambahan.length > 0">{{ formatAddons(item.tambahan) }}</div>
                </div>
                <div class="item-price">{{ formatRupiah(item.totalHarga) }}</div>
              </div>
            </div>

            <div class="checkout-summary">
              <div class="summary-row">
                <span>Total Item</span>
                <span class="summary-value">{{ selectedItemsCount }}</span>
              </div>
              <div class="summary-row total-price">
                <span>Total Harga</span>
                <span class="summary-value">{{ formatRupiah(selectedItemsPrice) }}</span>
              </div>
            </div>
          </div>

          <div class="payment-methods">
            <div class="section-title">Metode Pembayaran</div>
            <div class="payment-options">
              <div v-for="method in paymentMethods" :key="method.id" class="payment-option"
                :class="{ 'selected': selectedPaymentMethod === method.id }" @click="selectedPaymentMethod = method.id">
                <f7-icon :ios="method.icon" :aurora="method.icon" :md="method.icon" size="24"></f7-icon>
                <span>{{ method.name }}</span>
                <f7-icon v-if="selectedPaymentMethod === method.id" ios="f7:checkmark_alt" aurora="f7:checkmark_alt"
                  md="material:check" size="16" class="check-icon"></f7-icon>
              </div>
            </div>
          </div>
          <f7-button large fill round color="primary" class="confirm-checkout-btn" :disabled="!selectedPaymentMethod"
            @click="confirmCheckout">
            {{ selectedPaymentMethodName
              ? 'Bayar dengan ' + selectedPaymentMethodName
              : 'Silakan memilih metode pembayaran' }}
          </f7-button>
        </f7-block>
      </f7-page>
    </f7-popup>
  </f7-page>
</template>

<script>
import { f7, f7ready } from 'framework7-vue';
import { useCartStore } from '../../js/stores/cart';
import { Preferences } from '@capacitor/preferences';

export default {
  name: 'OrderPage',
  setup() {
    const cartStore = useCartStore();
    return { cartStore };
  },
  data() {
    return {
      cartItems: [],
      editPopupOpened: false,
      editingItem: null,
      editingIndex: -1,
      editQuantity: 1,
      editSelectedAddons: [],
      isLoading: false,
      isSyncing: false,
      menuItems: [],
      checkoutPopupOpened: false,
      isProcessingCheckout: false,
      paymentMethods: [
        { id: 1, name: 'Tunai (Cash)', icon: 'f7:money_dollar_circle' },
        { id: 2, name: 'Transfer Bank', icon: 'f7:building_columns' },
        { id: 3, name: 'E-Wallet', icon: 'f7:wallet_pass' },
        { id: 4, name: 'QRIS', icon: 'f7:qrcode' }
      ],
      selectedPaymentMethod: null
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
    },
    selectedItems() {
      return this.cartItems.filter(item => item.selected);
    },
    selectedPaymentMethodName() {
      if (!this.selectedPaymentMethod) return null;
      const method = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod);
      return method ? method.name : null;
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
    openCheckoutPopup() {
      if (this.selectedItemsCount === 0) return;
      this.checkoutPopupOpened = true;
    },
    async refreshCart() {
      if (this.isSyncing) return;

      this.isSyncing = true;
      try {
        await Promise.all([this.loadMenu(), this.loadCart()]);
        this.showToast('Keranjang diperbarui');
      } catch (error) {
        console.error('Error refreshing cart:', error);
        this.showToast('Gagal memuat keranjang');
      } finally {
        this.isSyncing = false;
      }
    },
    async loadMenu() {
      try {
        const response = await fetch('https://ngopilosofi-production.up.railway.app/api/menu');
        if (!response.ok) throw new Error('Failed to fetch menu');
        this.menuItems = await response.json();
        await Preferences.set({ key: 'menuItems', value: JSON.stringify(this.menuItems) });
      } catch (error) {
        console.error('Error loading menu:', error);
        const { value: savedMenu } = await Preferences.get({ key: 'menuItems' });
        this.menuItems = savedMenu ? JSON.parse(savedMenu) : [];
      }
    },
    async loadCart() {
      this.isLoading = true;
      try {
        const { value: token } = await Preferences.get({ key: 'token' });
        if (!token) {
          const { value: savedCart } = await Preferences.get({ key: '/user/cart/' });
          this.cartItems = savedCart ? JSON.parse(savedCart) : [];
          this.cartStore.count = this.totalItems;
          return;
        }

        await this.cartStore.fetchCart();
        this.cartItems = this.cartStore.items.map(item => {
          const menuItem = this.menuItems.find(m => m._id === item.menuItem._id) || item.menuItem;
          return {
            _id: item._id,
            produk: {
              _id: menuItem._id,
              nama: menuItem.nama,
              harga: menuItem.harga,
              gambar: menuItem.gambar,
              tambahan: menuItem.tambahan || []
            },
            tambahan: item.addons || [],
            jumlah: item.quantity,
            totalHarga: item.totalPrice,
            selected: true
          };
        });

        await Preferences.set({ key: '/user/cart/', value: JSON.stringify(this.cartItems) });

      } catch (error) {
        console.error('Error loading cart:', error);
        const { value: savedCart } = await Preferences.get({ key: '/user/cart/' });
        this.cartItems = savedCart ? JSON.parse(savedCart) : [];
        this.cartStore.count = this.totalItems;

        if (navigator.onLine) {
          this.showToast('Gagal memuat keranjang');
        } else {
          this.showToast('Menggunakan data offline');
        }
      } finally {
        this.isLoading = false;
      }
    },
    findCartItemIndex(menuItemId, addons) {
      return this.cartItems.findIndex(item => {
        if (item.produk._id !== menuItemId) return false;
        if (item.tambahan.length !== addons.length) return false;

        const itemAddonIds = item.tambahan.map(a => a._id).sort();
        const newAddonIds = addons.map(a => a._id).sort();

        return JSON.stringify(itemAddonIds) === JSON.stringify(newAddonIds);
      });
    },
    async addToCart(menuItem, quantity = 1, addons = []) {
      try {
        const existingItemIndex = this.findCartItemIndex(menuItem._id, addons);

        if (existingItemIndex !== -1) {
          await this.updateCartItemQuantity(existingItemIndex, this.cartItems[existingItemIndex].jumlah + quantity);
          this.showToast('Jumlah item diperbarui');
          return;
        }

        const { value: token } = await Preferences.get({ key: 'token' });
        const totalAddonPrice = addons.reduce((sum, addon) => sum + addon.harga, 0);
        const totalHarga = (menuItem.harga + totalAddonPrice) * quantity;

        if (!token) {
          const newItem = {
            _id: Date.now().toString(),
            produk: menuItem,
            tambahan: addons,
            jumlah: quantity,
            totalHarga: totalHarga,
            selected: true
          };
          this.cartItems.push(newItem);
          await this.saveLocalCart();
          this.showToast('Item ditambahkan ke keranjang (offline)');
          return;
        }

        const response = await fetch('https://ngopilosofi-production.up.railway.app/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            menuItemId: menuItem._id,
            quantity: quantity,
            addons: addons.map(a => a._id)
          })
        });

        if (!response.ok) throw new Error('Failed to add item');

        await this.loadCart();
        this.showToast('Item ditambahkan ke keranjang');

      } catch (error) {
        console.error('Error adding to cart:', error);
        this.showToast('Gagal menambahkan item');
      }
    },
    async updateCartItemQuantity(index, newQuantity) {
      try {
        const item = this.cartItems[index];
        const { value: token } = await Preferences.get({ key: 'token' });

        if (!token) {
          const totalAddonPrice = item.tambahan.reduce((sum, addon) => sum + addon.harga, 0);
          const totalHarga = (item.produk.harga + totalAddonPrice) * newQuantity;

          this.cartItems[index] = {
            ...item,
            jumlah: newQuantity,
            totalHarga: totalHarga
          };
          await this.saveLocalCart();
          this.cartStore.count = this.totalItems;
          return;
        }

        const success = await this.cartStore.updateCartItem(
          item._id,
          newQuantity,
          item.tambahan
        );

        if (!success) throw new Error('Failed to update quantity');

        await this.loadCart();

      } catch (error) {
        console.error('Error updating quantity:', error);
        throw error;
      }
    },
    async removeItem(index) {
      const itemId = this.cartItems[index]._id;

      this.showConfirmDialog(
        'Apakah Anda yakin ingin menghapus item ini?',
        'Hapus Item',
        async () => {
          try {
            const { value: token } = await Preferences.get({ key: 'token' });

            if (!token) {
              this.cartItems.splice(index, 1);
              await this.saveLocalCart();
              this.cartStore.count = this.totalItems;
              this.showToast('Item dihapus dari keranjang');
              return;
            }

            const success = await this.cartStore.removeFromCart(itemId);
            if (!success) throw new Error('Failed to delete item');

            await this.loadCart();
            this.showToast('Item dihapus dari keranjang');

          } catch (error) {
            console.error('Error removing item:', error);
            this.showToast('Gagal menghapus item');
          }
        }
      );
    },
    async saveLocalCart() {
      await Preferences.set({ key: '/user/cart/', value: JSON.stringify(this.cartItems) });
      this.$emit('cartUpdated', this.cartItems.length);
    },
    showConfirmDialog(text, title, callback) {
      f7ready(() => {
        f7.dialog.confirm(text, title, callback);
      });
    },
    showToast(message, type = 'normal') {
      f7ready(() => {
        f7.toast.create({
          text: message,
          closeTimeout: 2000,
          destroyOnClose: true,
          cssClass: `custom-toast ${type}`
        }).open();
      });
    },
    editItem(index) {
      this.editingIndex = index;
      const originalItem = this.cartItems[index];
      this.editingItem = JSON.parse(JSON.stringify(originalItem));
      this.editQuantity = originalItem.jumlah;
      const allAddons = originalItem.produk.tambahan || [];
      const selectedNames = (originalItem.tambahan || []).map(a => a.nama);
      this.editSelectedAddons = allAddons.filter(a => selectedNames.includes(a.nama));
      this.editPopupOpened = true;
    },
    isAddonSelected(addon) {
      return this.editSelectedAddons.some(a => a.nama === addon.nama);
    },
    toggleAddon(addon) {
      const index = this.editSelectedAddons.findIndex(a => a._id === addon._id);
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
    async saveEdit() {
      const totalAddonPrice = this.editSelectedAddons.reduce((sum, addon) => sum + addon.harga, 0);
      const totalHarga = (this.editingItem.produk.harga + totalAddonPrice) * this.editQuantity;

      try {
        const duplicateIndex = this.cartItems.findIndex((item, index) => {
          if (index === this.editingIndex) return false;
          if (item.produk._id !== this.editingItem.produk._id) return false;
          if (item.tambahan.length !== this.editSelectedAddons.length) return false;

          const itemAddonIds = item.tambahan.map(a => a._id).sort();
          const editAddonIds = this.editSelectedAddons.map(a => a._id).sort();

          return JSON.stringify(itemAddonIds) === JSON.stringify(editAddonIds);
        });

        if (duplicateIndex !== -1) {
          const combinedQuantity = this.cartItems[duplicateIndex].jumlah + this.editQuantity;

          if (this.editingIndex > duplicateIndex) {
            await this.removeItem(this.editingIndex);
            await this.updateCartItemQuantity(duplicateIndex, combinedQuantity);
          } else {
            await this.updateCartItemQuantity(duplicateIndex, combinedQuantity);
            await this.removeItem(this.editingIndex);
          }

          this.editPopupOpened = false;
          this.showToast('Item digabungkan dengan yang sudah ada');
          return;
        }

        const { value: token } = await Preferences.get({ key: 'token' });

        if (duplicateIndex !== -1) {
          const duplicateItem = this.cartItems[duplicateIndex];
          const newJumlah = duplicateItem.jumlah + this.editQuantity;

          if (!token) {
            const totalHargaBaru = (duplicateItem.produk.harga +
              this.editSelectedAddons.reduce((sum, a) => sum + a.harga, 0)) * newJumlah;

            this.cartItems[duplicateIndex] = {
              ...duplicateItem,
              jumlah: newJumlah,
              totalHarga: totalHargaBaru
            };
            this.cartItems.splice(this.editingIndex, 1);
            await this.saveLocalCart();
            this.showToast('Item digabung (offline)');
            this.editPopupOpened = false;
            return;
          }

          await fetch(`https://ngopilosofi-production.up.railway.app/api/cart/${duplicateItem._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              quantity: newJumlah,
              addons: duplicateItem.tambahan.map(a => a._id)
            })
          });

          await fetch(`https://ngopilosofi-production.up.railway.app/api/cart/${this.editingItem._id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          await this.loadCart();
          this.showToast('Item digabung');
        } else {
          if (!token) {
            const updatedItem = {
              ...this.editingItem,
              jumlah: this.editQuantity,
              tambahan: this.editSelectedAddons,
              totalHarga
            };
            this.cartItems.splice(this.editingIndex, 1, updatedItem);
            await this.saveLocalCart();
            this.showToast('Item diperbarui (offline)');
            this.editPopupOpened = false;
            return;
          }

          await fetch(`https://ngopilosofi-production.up.railway.app/api/cart/${this.editingItem._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              quantity: this.editQuantity,
              addons: this.editSelectedAddons.map(a => a._id)
            })
          });

          await this.loadCart();
          this.showToast('Item diperbarui');
        }

        this.editPopupOpened = false;
      } catch (error) {
        console.error('Error saving edit:', error);
        this.showToast('Gagal menyimpan perubahan');
      }
    },
    async confirmCheckout() {
      if (this.isProcessingCheckout) return;

      if (!this.selectedPaymentMethod) {
        this.showAlert('Silakan pilih metode pembayaran', 'Pembayaran');
        return;
      }

      this.isProcessingCheckout = true;

      try {
        const { value: token } = await Preferences.get({ key: 'token' });
        if (!token) {
          this.checkoutPopupOpened = false;
          this.showAlert('Silakan login terlebih dahulu', 'Checkout Gagal');
          f7.views.main.router.navigate('/login/');
          return;
        }

        // Prepare order items data
        const orderItems = this.selectedItems.map(item => ({
          menuItemId: item.produk._id,
          quantity: item.jumlah,
          addons: item.tambahan.map(a => a._id),
          price: item.totalHarga
        }));

        // Get payment method name
        const paymentMethod = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod)?.name || 'Unknown';

        // Create new order (TANPA deliveryAddress)
        const response = await fetch('https://ngopilosofi-production.up.railway.app/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            items: orderItems,
            paymentMethod: paymentMethod,
            notes: '' // Jika pakai catatan. Kalau tidak perlu, hapus juga
          })
        });

        if (!response.ok) {
          let errorMessage = 'Checkout failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
          throw new Error(errorMessage);
        }

        // Parse the successful response
        let orderData;
        try {
          orderData = await response.json();
        } catch (e) {
          console.error('Error parsing order response:', e);
          throw new Error('Invalid response from server');
        }

        // Clear cart after successful checkout
        try {
          await fetch('https://ngopilosofi-production.up.railway.app/api/cart', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (e) {
          console.error('Error clearing cart:', e);
          // Continue even if cart clearing fails
        }

        // Save order data locally
        await this.saveOrderLocally(orderData);

        // Update UI state
        this.checkoutPopupOpened = false;
        this.showSuccessDialog(orderData);

        // Refresh cart data
        await this.loadCart();

      } catch (error) {
        console.error('Checkout error:', error);
        this.showAlert(
          error.message || 'Gagal melakukan checkout. Silakan coba lagi.',
          'Checkout Gagal'
        );
      } finally {
        this.isProcessingCheckout = false;
      }
    },

    async saveOrderLocally(orderData) {
      try {
        const { value: existingOrders } = await Preferences.get({ key: '/user/order-history/' });
        const orders = existingOrders ? JSON.parse(existingOrders) : [];

        const formattedOrder = {
          _id: orderData._id,
          orderNumber: orderData._id.substring(0, 8).toUpperCase(),
          items: this.selectedItems.map(item => ({
            menuItem: {
              _id: item.produk._id,
              name: item.produk.nama,
              price: item.produk.harga
            },
            addons: item.tambahan,
            quantity: item.jumlah,
            price: item.totalHarga
          })),
          totalItems: this.selectedItemsCount,
          totalPrice: this.selectedItemsPrice,
          paymentMethod: this.paymentMethods.find(m => m.id === this.selectedPaymentMethod)?.name || 'Unknown',
          status: 'pending',
          createdAt: new Date().toISOString(),
          reviewed: false
        };

        orders.unshift(formattedOrder);

        await Preferences.set({
          key: '/user/order-history/',
          value: JSON.stringify(orders)
        });

      } catch (error) {
        console.error('Error saving order locally:', error);
      }
    },

    showSuccessDialog(orderData) {
      f7ready(() => {
        f7.dialog.create({
          title: 'Pesanan Berhasil',
          text: `Pesanan #${orderData._id.substring(0, 8).toUpperCase()} telah berhasil dibuat dengan total ${this.formatRupiah(this.selectedItemsPrice)}`,
          buttons: [
            {
              text: 'Lihat Pesanan',
              onClick: () => {
                f7.views.main.router.navigate(`/user/order-detail/${orderData._id}`);
              }
            },
            {
              text: 'Kembali ke Menu',
              onClick: () => {
                f7.views.main.router.navigate('/user/menu-list/');
              }
            }
          ],
          verticalButtons: true,
          on: {
            closed: () => {
              // Clear selected items after checkout
              this.cartItems.forEach(item => {
                item.selected = false;
              });
              this.saveLocalCart();
            }
          }
        }).open();
      });
    },

    showAlert(text, title) {
      f7ready(() => {
        f7.dialog.alert(text, title);
      });
    },

    showSuccessDialog(orderData) {
      f7ready(() => {
        f7.dialog.create({
          title: 'Pesanan Berhasil',
          text: `Pesanan #${orderData._id.substring(0, 8).toUpperCase()} telah berhasil dibuat dengan total ${this.formatRupiah(this.selectedItemsPrice)}`,
          buttons: [
            {
              text: 'Lihat Pesanan',
              onClick: () => {
                f7.views.main.router.navigate(`/user/order-detail/${orderData._id}`);
              }
            },
            {
              text: 'Kembali ke Menu',
              onClick: () => {
                f7.views.main.router.navigate('/user/menu-list/');
              }
            }
          ],
          verticalButtons: true,
          on: {
            closed: () => {
              // Clear selected items after checkout
              this.cartItems.forEach(item => {
                item.selected = false;
              });
              this.saveLocalCart();
            }
          }
        }).open();
      });
    },

    showAlert(text, title) {
      f7ready(() => {
        f7.dialog.alert(text, title);
      });
    },
    showSuccessDialog() {
      f7ready(() => {
        f7.dialog.create({
          title: 'Pesanan Berhasil',
          text: `Pesanan Anda telah berhasil dibuat dengan total ${this.formatRupiah(this.selectedItemsPrice)}`,
          buttons: [
            {
              text: 'Lihat Pesanan',
              onClick: () => {
                f7.views.main.router.navigate('/user/order-history/');
              }
            },
            {
              text: 'Kembali ke Menu',
              onClick: () => {
                f7.views.main.router.navigate('/user/menu-list/');
              }
            }
          ],
          verticalButtons: true
        }).open();
      });
    },
    showAlert(text, title) {
      f7ready(() => {
        f7.dialog.alert(text, title);
      });
    },
    toggleItemSelection(index) {
      this.cartItems[index].selected = !this.cartItems[index].selected;
      this.saveLocalCart();
    },
    toggleSelectAll() {
      const newSelectState = !this.allSelected;
      this.cartItems = this.cartItems.map(item => ({
        ...item,
        selected: newSelectState
      }));
      this.saveLocalCart();
    },
    async removeSelected() {
      if (this.selectedItemsCount === 0) {
        this.showToast('Tidak ada item yang dipilih');
        return;
      }

      this.showConfirmDialog(
        'Apakah Anda yakin ingin menghapus item yang dipilih?',
        'Hapus Item Terpilih',
        async () => {
          try {
            const { value: token } = await Preferences.get({ key: 'token' });

            if (!token) {
              this.cartItems = this.cartItems.filter(item => !item.selected);
              await this.saveLocalCart();
              this.cartStore.count = this.totalItems;
              this.showToast('Item terpilih dihapus (offline)');
              return;
            }

            const selectedIds = this.cartItems
              .filter(item => item.selected)
              .map(item => item._id);

            const success = await this.cartStore.bulkRemoveItems(selectedIds);
            if (!success) throw new Error('Failed to remove items');

            await this.loadCart();
            this.showToast('Item terpilih dihapus');

          } catch (error) {
            console.error('Error removing selected items:', error);
            this.showToast('Gagal menghapus item terpilih');
          }
        }
      );
    },
    setupOnlineHandler() {
      window.addEventListener('online', async () => {
        if (navigator.onLine) {
          try {
            await Promise.all([this.loadMenu(), this.loadCart()]);
            this.showToast('Data disinkronisasi');
          } catch (error) {
            console.error('Error syncing data:', error);
          }
        }
      });
    }
  },
  async mounted() {
    await Promise.all([this.loadMenu(), this.loadCart()]);
    this.setupOnlineHandler();
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

.checkout-popup {
  --f7-popup-border-radius: 16px 16px 0 0;
  --f7-popup-tablet-border-radius: 16px;
}

.checkout-popup-bg {
  background-color: #ede0d1;
}

.checkout-content {
  padding-bottom: 100px;
}

.order-summary {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-title {
  font-size: 18px;
  font-weight: 600;
  color: #331c2c;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f2f6;
}

.selected-items-list {
  margin-bottom: 16px;
}

.checkout-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f2f6;
}

.checkout-item:last-child {
  border-bottom: none;
}

.item-info {
  flex-grow: 1;
  margin-right: 12px;
}

.item-name {
  font-size: 15px;
  font-weight: 500;
  color: #2d3436;
  margin-bottom: 4px;
}

.item-addons {
  font-size: 13px;
  color: #636e72;
}

.item-price {
  font-size: 15px;
  font-weight: 600;
  color: #331c2c;
  min-width: 80px;
  text-align: right;
}

.checkout-summary {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
}

.checkout-summary .summary-row {
  font-size: 15px;
  margin-bottom: 8px;
}

.checkout-summary .summary-row.total-price {
  font-size: 17px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #ddd;
}

.confirm-checkout-btn {
  --f7-button-bg-color: #331c2c;
  --f7-button-text-color: white;
  --f7-button-height: 48px;
  --f7-button-font-size: 16px;
  font-weight: 600;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
}

.payment-methods {
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

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
}

.payment-option.selected {
  background-color: #f0e6ff;
  border: 1px solid #331c2c;
}

.payment-option span {
  margin-left: 12px;
  font-size: 15px;
  color: #2d3436;
  flex-grow: 1;
}

.payment-option .check-icon {
  color: #331c2c;
  margin-left: 8px;
}
</style>