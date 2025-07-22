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
      <div v-if="loading" class="skeleton-searchbar"></div>
      <f7-searchbar v-else placeholder="Cari menu..." :clear-button="true" @input="onSearch" class="custom-searchbar" />
    </f7-block>

    <f7-block class="category-container">
      <div v-if="loading" class="skeleton-chips">
        <div class="skeleton-chip" v-for="i in 5" :key="'chip-skeleton-' + i"></div>
      </div>
      <div v-else class="chips-wrapper">
        <f7-chip v-for="kategori in kategoriList" :key="kategori" :text="kategori" :outline="false"
          @click="selectedKategori = kategori" class="category-chip" :class="{
            'selected-chip': selectedKategori === kategori,
            'unselected-chip': selectedKategori !== kategori
          }" />
      </div>
    </f7-block>

    <f7-block class="menu-container">
      <div v-if="loading" class="loading-state">
        <div class="skeleton-card" v-for="i in 6" :key="'skeleton-' + i"></div>
      </div>
      <div v-else-if="semuaMenu.length === 0" class="empty-state">
        <div class="empty-illustration">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 50H150V125H50V50Z" fill="#F3F4F6" />
            <path d="M50 125H150V150C150 155.523 145.523 160 140 160H60C54.4772 160 50 155.523 50 150V125Z"
              fill="#E5E7EB" />
            <path d="M75 75H125V100H75V75Z" fill="#D1D5DB" />
            <path d="M75 112.5H125V125H75V112.5Z" fill="#9CA3AF" />
            <path d="M75 137.5H125V150H75V137.5Z" fill="#9CA3AF" />
          </svg>
        </div>
        <h3>Menu Tidak Tersedia</h3>
        <p>Silakan coba lagi nanti</p>
        <f7-button @click="fetchMenuItems" class="action-button">Muat Ulang</f7-button>
      </div>
      <div v-else class="menu-grid">
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
          <f7-button small fill class="add-button"
            @click="getCartQuantity(item._id) > 0 ? openVariants(item) : openDetail(item)">
            {{ getCartQuantity(item._id) > 0 ? `${getCartQuantity(item._id)} item` : 'Tambah' }}
          </f7-button>
        </div>
      </div>
    </f7-block>

    <div v-show="cartStore.totalItems > 0" class="floating-order-summary" @click="goToOrderPage">
      <div class="order-summary-content">
        <div class="item-count">{{ cartStore.totalItems }} item</div>
        <div class="total-price">
          {{ isNaN(cartStore.totalPrice) ? 'Rp0' : formatRupiah(cartStore.totalPrice) }}
        </div>
        <div class="view-order">Lihat Pesanan</div>
      </div>
    </div>

    <f7-popup v-model:opened="popupOpened" class="detail-product-popup">
      <div class="modal-content" v-if="selectedItem">
        <div class="modal-header">
          <h2>Detail Produk</h2>
          <f7-link popup-close class="close-btn" aria-label="Tutup">
            <f7-icon ios="f7:xmark" md="material:close" size="20"></f7-icon>
          </f7-link>
        </div>

        <div class="product-body text-align-center">
          <img :src="selectedItem.gambar" style="width: 200px; border-radius: 12px; margin-bottom: 10px;" />
          <h2>{{ selectedItem.nama }}</h2>
          <h3 style="color: #666;">{{ formatRupiah(selectedItem.harga) }}</h3>
          <p style="padding: 0 20px;">{{ selectedItem.deskripsi }}</p>

          <f7-list strong inset>
            <f7-list-item v-for="(addon, index) in selectedItem.tambahan" :key="index" :title="addon.nama"
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

          <f7-button fill color="black" @click="addToCart" class="add-to-cart-btn">
            Tambah ke Pesanan
          </f7-button>
        </div>
      </div>
    </f7-popup>

    <f7-popup v-model:opened="variantListPopupOpened" class="variant-product-popup">
      <div class="modal-content" v-if="selectedVariants && selectedVariants.length">
        <div class="modal-header">
          <h2>Variasi Pesanan</h2>
          <f7-link popup-close class="close-btn" aria-label="Tutup">
            <f7-icon ios="f7:xmark" md="material:close" size="20"></f7-icon>
          </f7-link>
        </div>

        <div class="variant-list-wrapper">
          <div class="variant-box" v-for="(variant, index) in selectedVariants" :key="index">
            <div class="product-title">
              {{ variant.menuItem?.nama || '-' }}
            </div>

            <div class="variant-details">
              <div class="addon-list">
                <div v-for="addon in variant.addons" :key="addon.nama" class="addon-item">
                  <span class="addon-name">{{ addon.nama }}:</span>
                  <span class="addon-value">
                    {{ addon.value !== undefined ? addon.value : (addon.harga !== undefined ? formatRupiah(addon.harga)
                      :
                      '-') }}
                  </span>
                </div>
              </div>
              <div class="price">{{ formatRupiah(variant.totalPrice) }}</div>
            </div>

            <div class="variant-actions">
              <f7-button small outline class="edit-btn" @click="editVariant(variant)">
                <f7-icon f7="pencil" slot="media" class="edit-icon"></f7-icon>
                Edit
              </f7-button>
              <f7-button small outline @click="updateCartItemQty(variant, variant.quantity - 1)">-</f7-button>
              <div class="qty">{{ variant.quantity }}</div>
              <f7-button small outline @click="updateCartItemQty(variant, variant.quantity + 1)">+</f7-button>
            </div>
          </div>

          <f7-button fill class="tambah-btn" @click="openDetail(selectedItem)">
            Tambah custom-an lain
          </f7-button>
        </div>
      </div>
    </f7-popup>
  </f7-page>
</template>

<script>
import { f7 } from 'framework7-vue';
import { useCartStore } from '../../js/stores/cart';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { Preferences } from '@capacitor/preferences';

export default {
  name: 'MenuListPage',
  setup() {
    const cartStore = useCartStore();
    const keyword = ref('');
    const selectedKategori = ref('Semua');
    const semuaMenu = ref([]);
    const popupOpened = ref(false);
    const selectedItem = ref(null);
    const selectedAddons = ref([]);
    const quantity = ref(1);
    const userId = ref(null);
    const pendingFavorites = ref([]);
    const variantListPopupOpened = ref(false);
    const isAdding = ref(false);
    const editingVariantId = ref(null);
    const loading = ref(true);

    const loadPreferences = async () => {
      try {
        const { value: userRaw } = await Preferences.get({ key: 'user' });
        const user = userRaw ? JSON.parse(userRaw) : null;
        userId.value = user?._id || user?.id || null;

        const { value: storedPendingFavorites } = await Preferences.get({ key: 'pendingFavorites' });
        pendingFavorites.value = storedPendingFavorites ? JSON.parse(storedPendingFavorites) : [];
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    const kategoriList = [
      'Semua', 'Baru', 'Paling Laku', 'Kopi', 'Susu', 'Makanan', 'Minuman', 'Snack'
    ];

    const getMenuItemId = (menuItem) =>
      typeof menuItem === 'object' && menuItem !== null ? menuItem._id : menuItem;

    const filteredMenu = computed(() => {
      return semuaMenu.value.map(item => {
        const qty = cartStore.items
          .filter(i => getMenuItemId(i.menuItem) === item._id)
          .reduce((sum, i) => sum + i.quantity, 0);

        return {
          ...item,
          cartQty: qty
        };
      }).filter(item => {
        const matchKategori =
          selectedKategori.value === 'Semua' ||
          (Array.isArray(item.kategori)
            ? item.kategori.includes(selectedKategori.value)
            : item.kategori === selectedKategori.value);
        const matchKeyword = item.nama.toLowerCase().includes(keyword.value.toLowerCase());
        return matchKategori && matchKeyword;
      });
    });

    const getCartQuantity = (menuItemId) =>
      cartStore.items.filter(i => getMenuItemId(i.menuItem) === menuItemId)
        .reduce((sum, i) => sum + i.quantity, 0);

    const selectedVariants = computed(() => {
      return cartStore.items
        .filter(i => getMenuItemId(i.menuItem) === selectedItem.value?._id)
        .map(variant => {
          const foundMenu = semuaMenu.value.find(m => m._id === getMenuItemId(variant.menuItem));

          const menuAddons = foundMenu?.tambahan || [];

          const rebuiltAddons = (variant.addons || []).map(cartAddon => {
            const match = menuAddons.find(a => a.nama === cartAddon.nama);
            return {
              ...cartAddon,
              _id: match?._id || null
            };
          });

          return {
            ...variant,
            menuItem: foundMenu || variant.menuItem,
            addons: rebuiltAddons,
            _id: variant._id,
          };
        });
    });

    const formatRupiah = angka =>
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    const onSearch = event => {
      keyword.value = event.target.value;
    };

    const openVariants = item => {
      selectedItem.value = item;
      variantListPopupOpened.value = true;
    };

    const editVariant = variant => {
      selectedItem.value = semuaMenu.value.find(m => m._id === getMenuItemId(variant.menuItem));
      selectedAddons.value = [...variant.addons];
      quantity.value = variant.quantity;
      editingVariantId.value = variant._id;
      variantListPopupOpened.value = false;
      popupOpened.value = true;
    };

    const updateCartItemQty = async (variant, newQty) => {
      const itemId = variant._id;
      if (newQty < 1) {
        await cartStore.removeFromCart(itemId);
      } else {
        const addons = Array.isArray(variant.addons)
          ? variant.addons.map(a => ({ _id: a._id }))
          : [];

        await cartStore.updateCartItem(itemId, newQty, addons);
      }

      const remainingVariants = cartStore.items.filter(i =>
        getMenuItemId(i.menuItem) === selectedItem.value?._id
      );

      if (remainingVariants.length === 0) {
        variantListPopupOpened.value = false;
      }
    };

    const openDetail = (item) => {
      selectedItem.value = item;
      selectedAddons.value = [];
      quantity.value = 1;
      editingVariantId.value = null;
      popupOpened.value = true;
    };

    const increaseQuantity = () => quantity.value++;

    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--;
      } else {
        const existing = cartStore.items.find(i =>
          getMenuItemId(i.menuItem) === selectedItem.value?._id &&
          JSON.stringify(i.addons.map(a => a.nama).sort()) ===
          JSON.stringify(selectedAddons.value.map(a => a.nama).sort())
        );
        if (existing) {
          cartStore.removeFromCart(existing._id);
          popupOpened.value = false;
        }
      }
    };

    const isAddonSelected = (addon) =>
      selectedAddons.value.some(a => a.nama === addon.nama);

    const toggleAddon = (addon) => {
      const index = selectedAddons.value.findIndex(a => a.nama === addon.nama);
      if (index === -1) selectedAddons.value.push(addon);
      else selectedAddons.value.splice(index, 1);
    };

    const addToCart = async () => {
      if (isAdding.value) return;
      isAdding.value = true;

      const normalizedSelectedAddons = selectedAddons.value.map(a => ({ _id: a._id }));

      let success = false;

      if (editingVariantId.value) {
        success = await cartStore.updateCartItem(
          editingVariantId.value,
          quantity.value,
          normalizedSelectedAddons
        );
      } else {
        const existing = cartStore.items.find(i =>
          getMenuItemId(i.menuItem) === selectedItem.value?._id &&
          JSON.stringify(
            (i.addons || []).map(a => a._id).sort()
          ) === JSON.stringify(
            normalizedSelectedAddons.map(a => a._id).sort()
          )
        );

        if (existing) {
          success = await cartStore.updateCartItem(
            existing._id,
            existing.quantity + quantity.value,
            normalizedSelectedAddons
          );
        } else {
          success = await cartStore.addToCart(
            selectedItem.value._id,
            quantity.value,
            selectedAddons.value
          );
        }
      }

      if (success) {
        popupOpened.value = false;
        editingVariantId.value = null;
      }

      isAdding.value = false;
    };

    const toggleFavorite = async (item) => {
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

      const wasFavorite = item.isFavorite;
      semuaMenu.value = semuaMenu.value.map(menu =>
        menu._id === item._id ? { ...menu, isFavorite: !wasFavorite } : menu
      );

      if (!navigator.onLine) {
        pendingFavorites.value.push({
          menuId: item._id,
          action: wasFavorite ? 'remove' : 'add',
          timestamp: new Date().getTime()
        });

        await Preferences.set({
          key: 'pendingFavorites',
          value: JSON.stringify(pendingFavorites.value)
        });

        f7.toast.create({
          text: 'Akan disinkronisasi ketika online',
          closeTimeout: 3000,
          cssClass: 'warning-toast',
        }).open();
        return;
      }

      try {
        const action = wasFavorite ? 'remove' : 'add';
        const response = await fetch(`https://ngopilosofi-production.up.railway.app/api/favorite/${item._id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to update favorite');

        await response.json();

        f7.toast.create({
          text: action === 'add' ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit',
          closeTimeout: 3000,
          cssClass: action === 'add' ? 'success-toast' : 'danger-toast',
        }).open();

        if (pendingFavorites.value.length > 0) {
          await syncPendingFavorites();
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);

        semuaMenu.value = semuaMenu.value.map(menu =>
          menu._id === item._id ? { ...menu, isFavorite: wasFavorite } : menu
        );

        f7.toast.create({
          text: 'Gagal mengupdate favorit',
          closeTimeout: 3000,
          cssClass: 'error-toast',
        }).open();
      }
    };

    const syncPendingFavorites = async () => {
      try {
        const { value: token } = await Preferences.get({ key: 'token' });

        for (const pending of pendingFavorites.value) {
          await fetch(`https://ngopilosofi-production.up.railway.app/api/favorite/${pending.menuId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }

        pendingFavorites.value = [];
        await Preferences.remove({ key: 'pendingFavorites' });
      } catch (error) {
        console.error('Error syncing pending favorites:', error);
      }
    };

    const checkFavoritesStatus = async () => {
      try {
        const { value: token } = await Preferences.get({ key: 'token' });
        if (!token || !userId.value) return; 

        const response = await fetch('https://ngopilosofi-production.up.railway.app/api/favorite', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch favorites');
        const favorites = await response.json();
        const favoriteIds = favorites.map(f => f?._id).filter(Boolean); 

        semuaMenu.value = semuaMenu.value.map(item => {
          if (!item) return null; 
          return {
            ...item,
            isFavorite: favoriteIds.includes(item._id)
          };
        }).filter(Boolean);
      } catch (error) {
        console.error('Error checking favorites status:', error);
      }
    };

    const fetchMenuItems = async () => {
      try {
        loading.value = true;
        const response = await fetch('https://ngopilosofi-production.up.railway.app/api/menu');
        if (!response.ok) throw new Error('Failed to fetch menu items');

        const data = await response.json();
        semuaMenu.value = data.filter(item => item !== null && item._id);

        if (userId.value) await checkFavoritesStatus();

        await Preferences.set({
          key: '/menu/all/',
          value: JSON.stringify(semuaMenu.value)
        });
      } catch (error) {
        console.error('Error fetching menu items:', error);

        const { value: cachedMenu } = await Preferences.get({ key: '/menu/all/' });
        if (cachedMenu) {
          semuaMenu.value = JSON.parse(cachedMenu).filter(item => item !== null && item._id);
          f7.toast.create({
            text: 'Menggunakan data offline',
            closeTimeout: 3000,
            cssClass: 'warning-toast',
          }).open();
        }
      } finally {
        loading.value = false;
      }
    };

    const goToOrderPage = () => f7.views.main.router.navigate('/user/order/');

    const onPageBeforeIn = async () => {
      const { value: cachedMenu } = await Preferences.get({ key: '/menu/all/' });
      if (cachedMenu) semuaMenu.value = JSON.parse(cachedMenu);
    };

    onMounted(async () => {
      await loadPreferences();
      await cartStore.fetchCart();
      await fetchMenuItems();
      window.addEventListener('online', syncPendingFavorites);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('online', syncPendingFavorites);
    });

    return {
      keyword,
      selectedKategori,
      kategoriList,
      semuaMenu,
      popupOpened,
      selectedItem,
      selectedAddons,
      quantity,
      userId,
      pendingFavorites,
      variantListPopupOpened,
      filteredMenu,
      loading,
      formatRupiah,
      onSearch,
      toggleFavorite,
      openDetail,
      increaseQuantity,
      decreaseQuantity,
      isAddonSelected,
      toggleAddon,
      addToCart,
      goToOrderPage,
      updateCartItemQty,
      cartStore,
      getCartQuantity,
      selectedVariants,
      openVariants,
      editVariant,
      onPageBeforeIn,
    };
  },
  on: {
    pageBeforeIn: 'onPageBeforeIn',
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
  margin-bottom: 80px;
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

.floating-order-summary {
  position: fixed;
  bottom: 75px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 500px;
  background-color: #331c2c;
  color: white;
  border-radius: 12px;
  padding: 8px 2px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.floating-order-summary:active {
  transform: translateX(-50%) scale(0.98);
}

.order-summary-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-count {
  font-size: 16px;
  opacity: 0.9;
  padding-left: 10px;
}

.total-price {
  font-weight: 600;
  font-size: 16px;
}

.view-order {
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 16px;
}

.variant-box {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #eaeaea;
}

.variant-popup-page {
  background-color: #ede0d1;
}

.variant-list-wrapper {
  padding: 16px;
}

.variant-box {
  background-color: white;
  border: 1px solid #d5c3b2;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 6px rgba(51, 28, 44, 0.05);
}

.product-title {
  color: #331c2c;
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 8px;
}

.variant-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.addon-list {
  font-size: 13px;
}

.addon-item {
  margin-bottom: 4px;
}

.addon-name {
  color: #5c3a2f;
  font-weight: 500;
}

.addon-value {
  margin-left: 4px;
  color: #7a5c4c;
}

.price {
  color: #331c2c;
  font-weight: bold;
  font-size: 15px;
  white-space: nowrap;
}

.variant-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.qty {
  font-weight: 600;
  min-width: 28px;
  text-align: center;
  color: #331c2c;
}

.f7-button {
  --f7-button-border-color: #a37e69;
  --f7-button-text-color: #331c2c;
  --f7-button-bg-color: white;
  --f7-button-hover-bg-color: #f3e9e2;
  border-radius: 8px;
  font-size: 13px;
}

.tambah-btn {
  background-color: #331c2c !important;
  color: white !important;
  font-weight: 600;
  border-radius: 12px;
  font-size: 15px;
  margin-top: 20px;
  transition: background-color 0.3s;
}

.tambah-btn:active {
  background-color: #22121c !important;
}

.edit-btn {
  --f7-button-border-color: #331c2c;
  --f7-button-text-color: #331c2c;
  color: #331c2c !important;
  border-color: #331c2c !important;
  font-weight: 500;
}

.edit-icon {
  color: #331c2c !important;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ccc;
  background-color: #ede0d1;
}

.close-btn {
  color: #666;
}

.modal-content {
  padding: 16px;
  max-height: 100vh;
  overflow-y: auto;
}

.product-body {
  padding-top: 30px;
}

.detail-product-popup {
  background-color: #ede0d1;
}

.variant-product-popup {
  background-color: #ede0d1;
}

.is-native-app .detail-product-popup,
.is-native-app .variant-product-popup {
  padding-top: 30px;
}

.loading-state {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.skeleton-card {
  height: 200px;
  background: linear-gradient(90deg, #f2e9e1 25%, #e0d3c5 50%, #f2e9e1 75%);
  background-size: 200% 100%;
  border-radius: 16px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  padding: 0 24px;
  text-align: center;
}

.empty-illustration {
  margin-bottom: 24px;
  opacity: 0.7;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #331c2c;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 15px;
  color: #6b5e63;
  margin-bottom: 24px;
}

.action-button {
  --f7-button-bg-color: #331c2c;
  --f7-button-text-color: #ffffff;
  --f7-button-font-size: 15px;
  --f7-button-height: 48px;
  --f7-button-border-radius: 12px;
  font-weight: 500;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(51, 28, 44, 0.3);
}

.skeleton-searchbar {
  height: 44px;
  background: linear-gradient(90deg, #f2e9e1 25%, #e0d3c5 50%, #f2e9e1 75%);
  background-size: 200% 100%;
  border-radius: 12px;
  animation: shimmer 1.5s infinite;
}

.skeleton-chips {
  display: flex;
  gap: 8px;
  padding: 8px 0 12px;
  overflow-x: auto;
}

.skeleton-chip {
  width: 80px;
  height: 36px;
  background: linear-gradient(90deg, #f2e9e1 25%, #e0d3c5 50%, #f2e9e1 75%);
  background-size: 200% 100%;
  border-radius: 9999px;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
}
</style>