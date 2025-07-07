<template>
  <f7-page class="order-history-page">
    <f7-navbar title="Riwayat Pesanan" back-link="Back" class="navbar-custom">
      <f7-nav-right>
        <f7-link icon-only @click="refreshOrders" class="refresh-btn">
          <f7-icon ios="f7:arrow_clockwise" aurora="f7:arrow_clockwise" md="material:refresh"></f7-icon>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-block v-if="loading" class="loading-block">
      <f7-preloader></f7-preloader>
      <div>Memuat riwayat pesanan...</div>
    </f7-block>

    <f7-block v-else-if="orders.length === 0" class="empty-orders">
      <div class="empty-container">
        <f7-icon ios="f7:doc_text" aurora="f7:doc_text" md="material:receipt" size="64" color="#331c2c"></f7-icon>
        <div class="empty-title">Belum Ada Pesanan</div>
        <div class="empty-subtitle">Anda belum melakukan pesanan apapun</div>
        <f7-button href="/user/menu-list/" class="browse-button">Jelajahi Menu</f7-button>
      </div>
    </f7-block>

    <f7-block v-else class="orders-container">
      <f7-list media-list class="orders-list">
        <f7-list-item
          v-for="order in orders"
          :key="order._id"
          :link="`/user/order-history/${order._id}/`"
          :title="`Order #${order._id.substring(0, 8)}`"
          :subtitle="formatDate(order.orderDate)"
          :text="getOrderStatusText(order.status)"
          :footer="`Total: ${formatRupiah(order.totalAmount)}`"
          class="order-item"
          :class="`status-${order.status}`"
        >
          <template #media>
            <f7-icon
              :ios="getStatusIcon(order.status)"
              :aurora="getStatusIcon(order.status)"
              :md="getStatusIcon(order.status)"
              :color="getStatusColor(order.status)"
              size="32"
            ></f7-icon>
          </template>
          <template #after>
            <f7-badge :color="getStatusBadgeColor(order.status)">
              {{ getOrderStatusText(order.status) }}
            </f7-badge>
          </template>
        </f7-list-item>
      </f7-list>

      <f7-block v-if="hasMore" class="load-more">
        <f7-button small outline @click="loadMore" :disabled="loadingMore">
          {{ loadingMore ? 'Memuat...' : 'Muat Lebih Banyak' }}
        </f7-button>
      </f7-block>
    </f7-block>

    <f7-popup v-model:opened="orderDetailOpened" class="order-detail-popup">
      <f7-page class="order-detail-page">
        <f7-navbar :title="`Order #${selectedOrder ? selectedOrder._id.substring(0, 8) : ''}`" back-link="Tutup" class="popup-navbar">
          <f7-nav-right>
            <f7-link popup-close>Tutup</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block v-if="selectedOrder" class="order-detail-container">
          <div class="order-header">
            <div class="order-status" :class="`status-${selectedOrder.status}`">
              <f7-icon :ios="getStatusIcon(selectedOrder.status)" :aurora="getStatusIcon(selectedOrder.status)" 
                :md="getStatusIcon(selectedOrder.status)" size="20"></f7-icon>
              <span>{{ getOrderStatusText(selectedOrder.status) }}</span>
            </div>
            <div class="order-date">{{ formatDateTime(selectedOrder.orderDate) }}</div>
          </div>

          <div class="order-summary">
            <div class="section-title">Detail Pesanan</div>
            <div class="order-items">
              <div v-for="(item, index) in selectedOrder.items" :key="index" class="order-item">
                <div class="item-info">
                  <div class="item-name">{{ item.name }} × {{ item.quantity }}</div>
                  <div class="item-addons" v-if="item.addons && item.addons.length > 0">
                    {{ formatAddons(item.addons) }}
                  </div>
                </div>
                <div class="item-price">{{ formatRupiah(item.totalPrice) }}</div>
              </div>
            </div>

            <div class="payment-method">
              <div class="section-title">Metode Pembayaran</div>
              <div class="method-detail">
                <f7-icon :ios="getPaymentMethodIcon(selectedOrder.paymentMethod)" 
                  :aurora="getPaymentMethodIcon(selectedOrder.paymentMethod)" 
                  :md="getPaymentMethodIcon(selectedOrder.paymentMethod)" size="20"></f7-icon>
                <span>{{ selectedOrder.paymentMethod }}</span>
              </div>
            </div>

            <div class="order-total">
              <div class="total-row">
                <span>Total Pesanan</span>
                <span class="total-amount">{{ formatRupiah(selectedOrder.totalAmount) }}</span>
              </div>
            </div>
          </div>

          <div class="order-notes" v-if="selectedOrder.notes">
            <div class="section-title">Catatan</div>
            <div class="notes-content">{{ selectedOrder.notes }}</div>
          </div>

          <div class="order-actions" v-if="selectedOrder.status === 'pending'">
            <f7-button large fill round color="red" @click="cancelOrder(selectedOrder._id)">
              Batalkan Pesanan
            </f7-button>
          </div>
        </f7-block>
      </f7-page>
    </f7-popup>
  </f7-page>
</template>

<script>
import { f7, f7ready } from 'framework7-vue';
import { Preferences } from '@capacitor/preferences';

export default {
  name: 'OrderHistoryPage',
  data() {
    return {
      orders: [],
      loading: true,
      loadingMore: false,
      page: 1,
      limit: 10,
      hasMore: true,
      orderDetailOpened: false,
      selectedOrder: null
    };
  },
  computed: {
    paymentMethods() {
      return [
        { id: 1, name: 'Tunai (Cash)', icon: 'f7:money_dollar_circle' },
        { id: 2, name: 'Transfer Bank', icon: 'f7:building_columns' },
        { id: 3, name: 'E-Wallet', icon: 'f7:wallet_pass' },
        { id: 4, name: 'QRIS', icon: 'f7:qrcode' }
      ];
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
    formatDate(dateString) {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    },
    formatDateTime(dateString) {
      const options = { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    },
    formatAddons(addons) {
      if (!addons || addons.length === 0) return 'Tanpa tambahan';
      return addons.map(a => a.nama).join(', ');
    },
    getOrderStatusText(status) {
      const statusMap = {
        'pending': 'Menunggu Konfirmasi',
        'processing': 'Sedang Diproses',
        'completed': 'Selesai',
        'cancelled': 'Dibatalkan'
      };
      return statusMap[status] || status;
    },
    getStatusIcon(status) {
      const iconMap = {
        'pending': 'f7:clock',
        'processing': 'f7:arrow_2_circlepath',
        'completed': 'f7:checkmark_circle',
        'cancelled': 'f7:xmark_circle'
      };
      return iconMap[status] || 'f7:doc_text';
    },
    getStatusColor(status) {
      const colorMap = {
        'pending': '#FFA500',
        'processing': '#1E90FF',
        'completed': '#32CD32',
        'cancelled': '#FF0000'
      };
      return colorMap[status] || '#331c2c';
    },
    getStatusBadgeColor(status) {
      const colorMap = {
        'pending': 'orange',
        'processing': 'blue',
        'completed': 'green',
        'cancelled': 'red'
      };
      return colorMap[status] || 'gray';
    },
    getPaymentMethodIcon(method) {
      const methodMap = {
        'Tunai (Cash)': 'f7:money_dollar_circle',
        'Transfer Bank': 'f7:building_columns',
        'E-Wallet': 'f7:wallet_pass',
        'QRIS': 'f7:qrcode'
      };
      return methodMap[method] || 'f7:creditcard';
    },
    async loadOrders() {
      this.loading = true;
      try {
        const { value: token } = await Preferences.get({ key: 'token' });
        
        if (!token) {
          const { value: savedOrders } = await Preferences.get({ key: 'user_orders' });
          this.orders = savedOrders ? JSON.parse(savedOrders) : [];
          this.loading = false;
          return;
        }

        const response = await fetch(
          `https://ngopilosofi-production.up.railway.app/api/orders?page=${this.page}&limit=${this.limit}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch orders');

        const data = await response.json();
        this.orders = data.orders || [];
        this.hasMore = data.hasMore || false;

        await Preferences.set({ key: 'user_orders', value: JSON.stringify(this.orders) });
      } catch (error) {
        console.error('Error loading orders:', error);
        
        // Fallback to offline data
        const { value: savedOrders } = await Preferences.get({ key: 'user_orders' });
        this.orders = savedOrders ? JSON.parse(savedOrders) : [];
        
        if (navigator.onLine) {
          this.showToast('Gagal memuat riwayat pesanan');
        } else {
          this.showToast('Menggunakan data offline');
        }
      } finally {
        this.loading = false;
      }
    },
    async loadMore() {
      if (!this.hasMore || this.loadingMore) return;
      
      this.loadingMore = true;
      this.page += 1;
      
      try {
        const { value: token } = await Preferences.get({ key: 'token' });
        const response = await fetch(
          `https://ngopilosofi-production.up.railway.app/api/orders?page=${this.page}&limit=${this.limit}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch more orders');

        const data = await response.json();
        this.orders = [...this.orders, ...(data.orders || [])];
        this.hasMore = data.hasMore || false;

        await Preferences.set({ key: 'user_orders', value: JSON.stringify(this.orders) });
      } catch (error) {
        console.error('Error loading more orders:', error);
        this.page -= 1;
        this.showToast('Gagal memuat lebih banyak pesanan');
      } finally {
        this.loadingMore = false;
      }
    },
    async refreshOrders() {
      this.page = 1;
      await this.loadOrders();
      this.showToast('Riwayat pesanan diperbarui');
    },
    showOrderDetail(order) {
      this.selectedOrder = order;
      this.orderDetailOpened = true;
    },
    async cancelOrder(orderId) {
      this.showConfirmDialog(
        'Apakah Anda yakin ingin membatalkan pesanan ini?',
        'Batalkan Pesanan',
        async () => {
          try {
            const { value: token } = await Preferences.get({ key: 'token' });
            
            if (!token) {
              this.showToast('Anda harus login untuk membatalkan pesanan');
              return;
            }

            const response = await fetch(
              `https://ngopilosofi-production.up.railway.app/api/orders/${orderId}/cancel`,
              {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (!response.ok) throw new Error('Failed to cancel order');

            const updatedOrder = await response.json();
            
            // Update the order in local state
            const index = this.orders.findIndex(o => o._id === orderId);
            if (index !== -1) {
              this.orders[index] = updatedOrder;
            }
            
            // Update selected order if it's the one being cancelled
            if (this.selectedOrder && this.selectedOrder._id === orderId) {
              this.selectedOrder = updatedOrder;
            }

            await Preferences.set({ key: 'user_orders', value: JSON.stringify(this.orders) });
            this.showToast('Pesanan berhasil dibatalkan');
          } catch (error) {
            console.error('Error cancelling order:', error);
            this.showToast('Gagal membatalkan pesanan');
          }
        }
      );
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
    showConfirmDialog(text, title, callback) {
      f7ready(() => {
        f7.dialog.confirm(text, title, callback);
      });
    }
  },
  async mounted() {
    await this.loadOrders();
  }
};
</script>

<style scoped>
.order-history-page {
  background-color: #ede0d1;
}

.navbar-custom {
  background-color: #331c2c;
  color: white;
}

.navbar-custom .left a {
  color: white;
}

.refresh-btn {
  color: white;
}

.loading-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.empty-orders {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
}

.empty-container {
  text-align: center;
  padding: 20px;
}

.empty-title {
  font-size: 22px;
  font-weight: 600;
  color: #2d3436;
  margin: 20px 0 8px;
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

.orders-list {
  margin: 0;
}

.order-item {
  margin-bottom: 8px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.order-item.status-pending {
  border-left: 4px solid #FFA500;
}

.order-item.status-processing {
  border-left: 4px solid #1E90FF;
}

.order-item.status-completed {
  border-left: 4px solid #32CD32;
}

.order-item.status-cancelled {
  border-left: 4px solid #FF0000;
}

.load-more {
  text-align: center;
  margin: 20px 0;
}

.order-detail-popup {
  --f7-popup-border-radius: 16px 16px 0 0;
  --f7-popup-tablet-border-radius: 16px;
}

.order-detail-page {
  background-color: #ede0d1;
}

.popup-navbar {
  background-color: #331c2c;
  color: white;
}

.popup-navbar .right a {
  color: white;
}

.order-detail-container {
  padding-bottom: 30px;
}

.order-header {
  background-color: white;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.order-status {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.order-status.status-pending {
  color: #FFA500;
}

.order-status.status-processing {
  color: #1E90FF;
}

.order-status.status-completed {
  color: #32CD32;
}

.order-status.status-cancelled {
  color: #FF0000;
}

.order-status i {
  margin-right: 8px;
}

.order-date {
  font-size: 14px;
  color: #636e72;
}

.order-summary {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #331c2c;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f2f6;
}

.order-items {
  margin-bottom: 16px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f2f6;
}

.order-item:last-child {
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

.payment-method {
  margin-top: 20px;
}

.method-detail {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.method-detail i {
  margin-right: 8px;
  color: #331c2c;
}

.order-total {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px dashed #ddd;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  color: #2d3436;
}

.total-amount {
  font-weight: 600;
  color: #331c2c;
  font-size: 18px;
}

.order-notes {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.notes-content {
  font-size: 14px;
  color: #2d3436;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 8px;
}

.order-actions {
  margin-top: 24px;
}
</style>