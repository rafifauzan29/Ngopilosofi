<template>
  <f7-page class="order-history-page">
    <f7-navbar title="Riwayat Pesanan" back-link="Kembali" class="navbar">
      <f7-nav-right>
        <f7-link icon-only @click="refreshOrders" class="refresh-btn">
          <f7-icon ios="f7:arrow_clockwise" aurora="f7:arrow_clockwise" md="material:refresh"></f7-icon>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>

    <div v-if="loading" class="loading-state">
      <div class="skeleton-card" v-for="i in 3" :key="'skeleton-' + i"></div>
    </div>

    <div v-else-if="orders.length === 0" class="empty-state">
      <div class="empty-illustration">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 75H150V150C150 155.523 145.523 160 140 160H60C54.4772 160 50 155.523 50 150V75Z"
            fill="#F3F4F6" />
          <path d="M50 75L62.5 40H137.5L150 75H50Z" fill="#E5E7EB" />
          <path
            d="M75 90C75 88.3431 76.3431 87 78 87H122C123.657 87 125 88.3431 125 90C125 91.6569 123.657 93 122 93H78C76.3431 93 75 91.6569 75 90Z"
            fill="#9CA3AF" />
          <path
            d="M87.5 100C87.5 98.3431 88.8431 97 90.5 97H109.5C111.157 97 112.5 98.3431 112.5 100C112.5 101.657 111.157 103 109.5 103H90.5C88.8431 103 87.5 101.657 87.5 100Z"
            fill="#9CA3AF" />
        </svg>
      </div>
      <h3>Belum Ada Pesanan</h3>
      <p>Mulai pesan makanan favorit Anda sekarang</p>
      <f7-button href="/user/menu-list/" class="action-button">Jelajahi Menu</f7-button>
    </div>

    <div v-else class="order-list">
      <div class="list-header">
        <h2>Pesanan Terakhir</h2>
        <span class="badge">{{ orders.length }} pesanan</span>
      </div>

      <div class="order-cards">
        <div v-for="order in orders" :key="order._id" class="order-card" @click="showOrderDetail(order)">
          <div class="order-header">
            <div class="order-id">#{{ order._id.substring(0, 8) }}</div>
            <div class="order-status" :class="order.status">
              {{ getOrderStatusText(order.status) }}
            </div>
          </div>

          <div class="order-details">
            <div class="order-date">{{ formatDate(order.orderDate) }}</div>
            <div class="order-total">{{ formatRupiah(order.totalAmount) }}</div>
          </div>

          <div class="order-items-preview">
            <div v-for="(item, index) in order.items.slice(0, 2)" :key="index" class="preview-item">
              {{ item.name }} × {{ item.quantity }}
            </div>
            <div v-if="order.items.length > 2" class="more-items">
              +{{ order.items.length - 2 }} item lainnya
            </div>
          </div>

          <div class="order-footer">
            <div class="payment-method">
              <f7-icon :ios="getPaymentMethodIcon(order.paymentMethod)"
                :aurora="getPaymentMethodIcon(order.paymentMethod)" :md="getPaymentMethodIcon(order.paymentMethod)"
                size="16"></f7-icon>
              {{ order.paymentMethod }}
            </div>
            <div class="view-details">
              Lihat detail <f7-icon ios="f7:chevron_right" size="14"></f7-icon>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="load-more">
        <f7-button small outline @click="loadMore" :disabled="loadingMore">
          {{ loadingMore ? 'Memuat...' : 'Muat Lebih Banyak' }}
        </f7-button>
      </div>
    </div>

    <f7-popup class="order-detail-modal" :opened="orderDetailOpened" @popup:closed="orderDetailOpened = false">
      <div class="modal-content" v-if="selectedOrder">
        <div class="modal-header">
          <h2>Detail Pesanan</h2>
          <f7-link popup-close class="close-btn" aria-label="Tutup">
            <f7-icon ios="f7:xmark" md="material:close" size="20"></f7-icon>
          </f7-link>
        </div>

        <div class="order-info">
          <div class="info-row">
            <span>ID Pesanan</span>
            <span>#{{ selectedOrder._id.substring(0, 8) }}</span>
          </div>
          <div class="info-row">
            <span>Tanggal</span>
            <span>{{ formatDateTime(selectedOrder.orderDate) }}</span>
          </div>
          <div class="info-row">
            <span>Status</span>
            <span class="status-badge" :class="selectedOrder.status">
              {{ getOrderStatusText(selectedOrder.status) }}
            </span>
          </div>
        </div>

        <div class="section-divider">
          <span>Item Pesanan</span>
        </div>

        <div class="order-summary">
          <div class="order-items-list">
            <div v-for="(item, index) in selectedOrder.items" :key="index" class="item-row">
              <div class="item-info">
                <div class="item-name">{{ item.name }} × {{ item.quantity }}</div>
                <div v-if="item.addons && item.addons.length > 0" class="item-addons">
                  {{ formatAddons(item.addons) }}
                </div>
              </div>
              <div class="item-price">{{ formatRupiah(item.totalPrice) }}</div>
            </div>
          </div>
          <hr class="summary-divider" />
          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{ formatRupiah(selectedOrder.totalAmount) }}</span>
          </div>
          <div class="summary-row">
            <span>Pajak</span>
            <span>{{ formatRupiah(0) }}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>{{ formatRupiah(selectedOrder.totalAmount) }}</span>
          </div>
        </div>

        <div class="section-divider">
          <span>Pembayaran</span>
        </div>

        <div class="payment-info">
          <div class="payment-method">
            <f7-icon :ios="getPaymentMethodIcon(selectedOrder.paymentMethod)"
              :aurora="getPaymentMethodIcon(selectedOrder.paymentMethod)"
              :md="getPaymentMethodIcon(selectedOrder.paymentMethod)" size="20"></f7-icon>
            <span>{{ selectedOrder.paymentMethod }}</span>
          </div>
          <div class="payment-status paid">
            <f7-icon ios="f7:checkmark_circle_fill"></f7-icon>
            <span>Dibayar</span>
          </div>
        </div>

        <div v-if="selectedOrder.notes" class="order-notes">
          <div class="notes-label">Catatan:</div>
          <div class="notes-content">{{ selectedOrder.notes }}</div>
        </div>

        <div class="action-buttons" v-if="selectedOrder.status === 'pending'">
          <f7-button large fill round color="custom" class="cancel-button" @click="cancelOrder(selectedOrder._id)">
            Batalkan Pesanan
          </f7-button>
        </div>
      </div>
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
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    },
    formatDateTime(dateString) {
      const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    },
    formatAddons(addons) {
      if (!addons || addons.length === 0) return '';
      return '• ' + addons.map(a => a.nama).join(', ');
    },
    getOrderStatusText(status) {
      const statusMap = {
        'pending': 'Menunggu',
        'processing': 'Diproses',
        'completed': 'Selesai',
        'cancelled': 'Dibatalkan'
      };
      return statusMap[status] || status;
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
          f7.toast.show({ text: 'Gagal memuat riwayat pesanan', closeTimeout: 2000 });
        } else {
          f7.toast.show({ text: 'Menggunakan data offline', closeTimeout: 2000 });
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
        f7.toast.show({ text: 'Gagal memuat lebih banyak pesanan', closeTimeout: 2000 });
      } finally {
        this.loadingMore = false;
      }
    },
    async refreshOrders() {
      this.page = 1;
      await this.loadOrders();
      f7.toast.show({ text: 'Riwayat pesanan diperbarui', closeTimeout: 2000 });
    },
    showOrderDetail(order) {
      this.selectedOrder = order;
      this.orderDetailOpened = true;
    },
    async cancelOrder(orderId) {
      f7.dialog.confirm(
        'Apakah Anda yakin ingin membatalkan pesanan ini?',
        'Batalkan Pesanan',
        async () => {
          try {
            const { value: token } = await Preferences.get({ key: 'token' });

            if (!token) {
              f7.toast.show({ text: 'Anda harus login untuk membatalkan pesanan', closeTimeout: 2000 });
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

            const index = this.orders.findIndex(o => o._id === orderId);
            if (index !== -1) {
              this.orders[index] = updatedOrder;
            }

            if (this.selectedOrder && this.selectedOrder._id === orderId) {
              this.selectedOrder = updatedOrder;
            }

            await Preferences.set({ key: 'user_orders', value: JSON.stringify(this.orders) });
            f7.toast.show({ text: 'Pesanan berhasil dibatalkan', closeTimeout: 2000 });
            this.orderDetailOpened = false;
          } catch (error) {
            console.error('Error cancelling order:', error);
            f7.toast.show({ text: 'Gagal membatalkan pesanan', closeTimeout: 2000 });
          }
        }
      );
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

.navbar {
  background-color: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.navbar::after {
  display: none;
}

.navbar .title {
  font-weight: 600;
  color: #331c2c;
}

.refresh-btn {
  color: #331c2c;
}

/* Loading State */
.loading-state {
  padding: 16px;
}

.skeleton-card {
  height: 120px;
  background: linear-gradient(90deg, #f2e9e1 25%, #e0d3c5 50%, #f2e9e1 75%);
  background-size: 200% 100%;
  border-radius: 12px;
  margin-bottom: 12px;
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

/* Empty State */
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

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 8px;
}

.list-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #331c2c;
  margin: 0;
}

.list-header .badge {
  background-color: #f7e5dc;
  color: #331c2c;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.order-cards {
  padding: 0 16px 16px;
}

.order-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}

.order-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-id {
  font-size: 15px;
  font-weight: 500;
  color: #7b6b72;
}

.order-status {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
}

.order-status.pending {
  background-color: #fce9d9;
  color: #b45309;
}

.order-status.processing {
  background-color: #e5ddf4;
  color: #6b21a8;
}

.order-status.completed {
  background-color: #d9fbe9;
  color: #15803d;
}

.order-status.cancelled {
  background-color: #ffe4e4;
  color: #b91c1c;
}

.order-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.order-date {
  font-size: 14px;
  color: #7b6b72;
}

.order-total {
  font-size: 16px;
  font-weight: 600;
  color: #331c2c;
}

.order-items-preview {
  margin-bottom: 12px;
}

.preview-item {
  font-size: 14px;
  color: #5f4b55;
  margin-bottom: 4px;
}

.more-items {
  font-size: 13px;
  color: #9ca3af;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.payment-method {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #331c2c;
}

.payment-method i {
  margin-right: 6px;
  color: #6d3c59;
}

.view-details {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #6d3c59;
}

.view-details i {
  margin-left: 4px;
}

.load-more {
  text-align: center;
  padding: 16px;
}

.order-detail-modal {
  --f7-popup-border-radius: 24px 24px 0 0;
  --f7-popup-tablet-border-radius: 24px;
  background-color: #ede0d1;
}

.modal-content {
  padding: 24px;
  padding-bottom: 40px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #331c2c;
  margin: 0;
}

.close-btn {
  color: #331c2c;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(51, 28, 44, 0.08);
}

.order-info {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row span:first-child {
  color: #6b5e63;
}

.info-row span:last-child {
  color: #331c2c;
  font-weight: 500;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge.pending {
  background-color: #fce9d9;
  color: #b45309;
}

.status-badge.processing {
  background-color: #e5ddf4;
  color: #6b21a8;
}

.status-badge.completed {
  background-color: #d9fbe9;
  color: #15803d;
}

.status-badge.cancelled {
  background-color: #ffe4e4;
  color: #b91c1c;
}

.section-divider {
  position: relative;
  margin: 24px 0;
  text-align: center;
  font-weight: bold;
}

.section-divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #331c2c;
  z-index: -1;
}

.section-divider span {
  display: inline-block;
  padding: 0 12px;
  background-color: #ede0d1;
  font-size: 14px;
  color: #6b5e63;
}

.order-items-list {
  margin-bottom: 24px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.item-info {
  flex: 1;
  margin-right: 16px;
}

.item-name {
  font-size: 15px;
  color: #331c2c;
  margin-bottom: 4px;
  font-weight: 500;
}

.item-addons {
  font-size: 13px;
  color: #6b5e63;
}

.item-price {
  font-size: 15px;
  color: #331c2c;
  font-weight: 600;
}

.order-summary {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-row.total {
  font-weight: 600;
  font-size: 16px;
  color: #331c2c;
}

.payment-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.payment-method {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #331c2c;
  font-weight: 500;
}

.payment-method i {
  margin-right: 8px;
  color: #6d3c59;
}

.payment-status {
  display: flex;
  align-items: center;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 12px;
}

.payment-status.paid {
  background-color: #d9fbe9;
  color: #15803d;
}

.payment-status i {
  margin-right: 4px;
}

.order-notes {
  background-color: #f9f5f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.notes-label {
  font-size: 13px;
  color: #6b5e63;
  margin-bottom: 8px;
}

.notes-content {
  font-size: 14px;
  color: #331c2c;
  line-height: 1.5;
}

.action-buttons {
  margin-top: 24px;
}

.cancel-button {
  --f7-button-bg-color: #331c2c;
  --f7-button-text-color: #fff;
  --f7-button-border-radius: 999px;
  --f7-button-font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(51, 28, 44, 0.2);
}

.summary-divider {
  border: none;
  height: 1px;
  background-color: #e5e7eb; 
  margin: 16px 0;
}

.is-native-app .order-detail-modal {
  padding-top: 30px;
}
</style>