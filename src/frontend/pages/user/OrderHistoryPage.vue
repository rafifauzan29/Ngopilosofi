<template>
  <f7-page class="page-bg">
    <f7-navbar title="Riwayat Pesanan" back-link="Back" class="navbar-custom">
      <f7-nav-right>
        <f7-link icon-only @click="refreshHistory" class="refresh-btn">
          <f7-icon ios="f7:arrow_clockwise" aurora="f7:arrow_clockwise" md="material:refresh"></f7-icon>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-block v-if="loading" class="loading-container">
      <f7-preloader color="multi"></f7-preloader>
      <div class="loading-text">Memuat riwayat...</div>
    </f7-block>

    <f7-block v-else-if="orders.length === 0" class="empty-history">
      <div class="empty-history-container">
        <div class="empty-history-icon">
          <f7-icon ios="f7:doc_text" aurora="f7:doc_text" md="material:history" size="64px" color="#331c2c"></f7-icon>
        </div>
        <div class="empty-title">Belum Ada Riwayat</div>
        <div class="empty-subtitle">Anda belum memiliki pesanan sebelumnya</div>
        <f7-button href="/user/menu-list/" class="browse-button">Jelajahi Menu</f7-button>
      </div>
    </f7-block>

    <f7-block v-else class="history-container">
      <f7-list class="order-list" media-list>
        <f7-list-item
          v-for="(order, index) in orders"
          :key="index"
          :title="'Pesanan #' + order.orderNumber"
          :subtitle="formatDate(order.createdAt)"
          :text="formatStatus(order.status)"
          :after="formatRupiah(order.totalPrice)"
          @click="viewOrderDetail(order._id)"
          class="order-item"
        >
          <template #media>
            <div class="order-status" :class="getStatusClass(order.status)">
              {{ formatStatusShort(order.status) }}
            </div>
          </template>
        </f7-list-item>
      </f7-list>
    </f7-block>

    <f7-popup v-model:opened="detailPopupOpened" class="order-detail-popup">
      <f7-page class="detail-popup-bg">
        <f7-navbar :title="'Detail Pesanan #' + currentOrder?.orderNumber" class="popup-navbar">
          <f7-nav-right>
            <f7-link popup-close class="popup-close-btn">Tutup</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block v-if="currentOrder" class="order-detail-content">
          <div class="order-summary">
            <div class="summary-row">
              <span>Tanggal Pesanan</span>
              <span class="summary-value">{{ formatDateTime(currentOrder.createdAt) }}</span>
            </div>
            <div class="summary-row">
              <span>Status Pesanan</span>
              <span class="summary-value" :class="getStatusClass(currentOrder.status)">
                {{ formatStatus(currentOrder.status) }}
              </span>
            </div>
            <div class="summary-row">
              <span>Metode Pembayaran</span>
              <span class="summary-value">{{ currentOrder.paymentMethod }}</span>
            </div>
          </div>

          <div class="order-items">
            <div class="section-title">Item Pesanan</div>
            <div class="items-list">
              <div v-for="(item, index) in currentOrder.items" :key="index" class="order-item-detail">
                <div class="item-info">
                  <div class="item-name">{{ item.menuItem.name }} × {{ item.quantity }}</div>
                  <div class="item-addons" v-if="item.addons.length > 0">
                    {{ formatAddons(item.addons) }}
                  </div>
                </div>
                <div class="item-price">{{ formatRupiah(item.price) }}</div>
              </div>
            </div>
          </div>

          <div class="order-total">
            <div class="summary-row">
              <span>Total Item</span>
              <span class="summary-value">{{ currentOrder.totalItems }}</span>
            </div>
            <div class="summary-row total-price">
              <span>Total Harga</span>
              <span class="summary-value">{{ formatRupiah(currentOrder.totalPrice) }}</span>
            </div>
          </div>

          <div v-if="currentOrder.status === 'pending'" class="order-actions">
            <f7-button large fill round color="red" @click="cancelOrder(currentOrder._id)" class="cancel-order-btn">
              Batalkan Pesanan
            </f7-button>
          </div>

          <div v-if="currentOrder.status === 'completed' && !currentOrder.reviewed" class="order-actions">
            <f7-button large fill round color="primary" @click="openReviewPopup" class="review-order-btn">
              Beri Ulasan
            </f7-button>
          </div>
        </f7-block>
      </f7-page>
    </f7-popup>

    <f7-popup v-model:opened="reviewPopupOpened" class="review-popup">
      <f7-page class="review-popup-bg">
        <f7-navbar title="Beri Ulasan" class="popup-navbar">
          <f7-nav-right>
            <f7-link popup-close class="popup-close-btn">Tutup</f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-block class="review-content">
          <div class="rating-section">
            <div class="section-title">Rating</div>
            <div class="stars-rating">
              <f7-icon
                v-for="star in 5"
                :key="star"
                :ios="star <= reviewRating ? 'f7:star_fill' : 'f7:star'"
                :aurora="star <= reviewRating ? 'f7:star_fill' : 'f7:star'"
                :md="star <= reviewRating ? 'material:star' : 'material:star_outline'"
                size="32"
                color="#FFD700"
                @click="reviewRating = star"
                class="star-icon"
              ></f7-icon>
            </div>
          </div>

          <div class="review-section">
            <div class="section-title">Ulasan</div>
            <f7-textarea
              placeholder="Bagaimana pengalaman Anda dengan pesanan ini?"
              :value="reviewComment"
              @input="reviewComment = $event.target.value"
              class="review-textarea"
            ></f7-textarea>
          </div>

          <f7-button large fill round color="primary" @click="submitReview" class="submit-review-btn">
            Kirim Ulasan
          </f7-button>
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
      loading: false,
      detailPopupOpened: false,
      currentOrder: null,
      reviewPopupOpened: false,
      reviewRating: 0,
      reviewComment: '',
      isProcessing: false
    };
  },
  computed: {
    sortedOrders() {
      return [...this.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    },
    formatDateTime(dateString) {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    },
    formatStatus(status) {
      const statusMap = {
        'pending': 'Menunggu Konfirmasi',
        'processing': 'Sedang Diproses',
        'completed': 'Selesai',
        'cancelled': 'Dibatalkan',
        'rejected': 'Ditolak'
      };
      return statusMap[status] || status;
    },
    formatStatusShort(status) {
      const statusMap = {
        'pending': 'Menunggu',
        'processing': 'Proses',
        'completed': 'Selesai',
        'cancelled': 'Batal',
        'rejected': 'Tolak'
      };
      return statusMap[status] || status;
    },
    getStatusClass(status) {
      return {
        'pending': 'status-pending',
        'processing': 'status-processing',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled',
        'rejected': 'status-rejected'
      }[status];
    },
    formatAddons(addons) {
      if (!addons || addons.length === 0) return 'Tanpa tambahan';
      return addons.map(a => a.name).join(', ');
    },
    async loadOrderHistory() {
      this.loading = true;
      try {
        const { value: token } = await Preferences.get({ key: 'token' });
        
        if (!token) {
          // Load from local storage if not logged in
          const { value: localOrders } = await Preferences.get({ key: '/user/order-history/' });
          this.orders = localOrders ? JSON.parse(localOrders) : [];
          this.loading = false;
          return;
        }

        const response = await fetch('https://ngopilosofi-production.up.railway.app/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch order history');

        const data = await response.json();
        this.orders = data.map(order => ({
          ...order,
          orderNumber: order._id.substring(0, 8).toUpperCase()
        }));

        // Save to local storage
        await Preferences.set({
          key: '/user/order-history/',
          value: JSON.stringify(this.orders)
        });

      } catch (error) {
        console.error('Error loading order history:', error);
        
        // Fallback to local storage if online fetch fails
        const { value: localOrders } = await Preferences.get({ key: '/user/order-history/' });
        this.orders = localOrders ? JSON.parse(localOrders) : [];
        
        if (navigator.onLine) {
          this.showToast('Gagal memuat riwayat pesanan');
        }
      } finally {
        this.loading = false;
      }
    },
    async refreshHistory() {
      if (this.loading) return;
      await this.loadOrderHistory();
      this.showToast('Riwayat diperbarui');
    },
    async viewOrderDetail(orderId) {
      try {
        const { value: token } = await Preferences.get({ key: 'token' });
        
        if (!token) {
          // Find in local orders
          this.currentOrder = this.orders.find(o => o._id === orderId);
          if (this.currentOrder) {
            this.detailPopupOpened = true;
          }
          return;
        }

        const response = await fetch(`https://ngopilosofi-production.up.railway.app/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch order details');

        const data = await response.json();
        this.currentOrder = {
          ...data,
          orderNumber: data._id.substring(0, 8).toUpperCase()
        };
        this.detailPopupOpened = true;

      } catch (error) {
        console.error('Error fetching order details:', error);
        
        // Fallback to local order data
        this.currentOrder = this.orders.find(o => o._id === orderId);
        if (this.currentOrder) {
          this.detailPopupOpened = true;
        } else {
          this.showToast('Gagal memuat detail pesanan');
        }
      }
    },
    async cancelOrder(orderId) {
      this.showConfirmDialog(
        'Apakah Anda yakin ingin membatalkan pesanan ini?',
        'Konfirmasi Pembatalan',
        async () => {
          this.isProcessing = true;
          try {
            const { value: token } = await Preferences.get({ key: 'token' });
            
            if (!token) {
              // Update locally
              const orderIndex = this.orders.findIndex(o => o._id === orderId);
              if (orderIndex !== -1) {
                this.orders[orderIndex].status = 'cancelled';
                await Preferences.set({
                  key: '/user/order-history/',
                  value: JSON.stringify(this.orders)
                });
                this.detailPopupOpened = false;
                this.showToast('Pesanan dibatalkan (offline)');
              }
              return;
            }

            const response = await fetch(`https://ngopilosofi-production.up.railway.app/api/orders/${orderId}/cancel`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (!response.ok) throw new Error('Failed to cancel order');

            await this.loadOrderHistory();
            this.detailPopupOpened = false;
            this.showToast('Pesanan berhasil dibatalkan');

          } catch (error) {
            console.error('Error cancelling order:', error);
            this.showToast('Gagal membatalkan pesanan');
          } finally {
            this.isProcessing = false;
          }
        }
      );
    },
    openReviewPopup() {
      this.reviewRating = 0;
      this.reviewComment = '';
      this.reviewPopupOpened = true;
    },
    async submitReview() {
      if (this.reviewRating === 0) {
        this.showToast('Silakan beri rating terlebih dahulu');
        return;
      }

      this.isProcessing = true;
      try {
        const { value: token } = await Preferences.get({ key: 'token' });
        
        if (!token) {
          // Save review locally
          const orderIndex = this.orders.findIndex(o => o._id === this.currentOrder._id);
          if (orderIndex !== -1) {
            this.orders[orderIndex].reviewed = true;
            this.orders[orderIndex].review = {
              rating: this.reviewRating,
              comment: this.reviewComment,
              createdAt: new Date().toISOString()
            };
            await Preferences.set({
              key: '/user/order-history/',
              value: JSON.stringify(this.orders)
            });
            this.currentOrder.reviewed = true;
            this.reviewPopupOpened = false;
            this.showToast('Ulasan disimpan (offline)');
          }
          return;
        }

        const response = await fetch(`https://ngopilosofi-production.up.railway.app/api/orders/${this.currentOrder._id}/review`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            rating: this.reviewRating,
            comment: this.reviewComment
          })
        });

        if (!response.ok) throw new Error('Failed to submit review');

        await this.loadOrderHistory();
        this.reviewPopupOpened = false;
        this.showToast('Ulasan berhasil dikirim');

      } catch (error) {
        console.error('Error submitting review:', error);
        this.showToast('Gagal mengirim ulasan');
      } finally {
        this.isProcessing = false;
      }
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
    },
    setupOnlineHandler() {
      window.addEventListener('online', async () => {
        if (navigator.onLine) {
          try {
            await this.loadOrderHistory();
            this.showToast('Data disinkronisasi');
          } catch (error) {
            console.error('Error syncing data:', error);
          }
        }
      });
    }
  },
  async mounted() {
    await this.loadOrderHistory();
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

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 60vh;
}

.loading-text {
  margin-top: 16px;
  font-size: 16px;
  color: #331c2c;
}

.empty-history {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
}

.empty-history-container {
  text-align: center;
  padding: 20px;
}

.empty-history-icon {
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

.history-container {
  padding-bottom: 20px;
}

.order-list {
  margin: 0;
}

.order-item {
  background-color: white;
  border-radius: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.order-item:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.order-item .item-title {
  font-weight: 600;
  font-size: 16px;
  color: #331c2c;
}

.order-item .item-subtitle {
  font-size: 14px;
  color: #636e72;
  margin-top: 4px;
}

.order-item .item-text {
  font-size: 13px;
  color: #2d3436;
  margin-top: 4px;
}

.order-item .item-after {
  font-weight: 600;
  font-size: 16px;
  color: #331c2c;
}

.order-status {
  width: 60px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.status-pending {
  background-color: #f39c12;
}

.status-processing {
  background-color: #3498db;
}

.status-completed {
  background-color: #2ecc71;
}

.status-cancelled {
  background-color: #e74c3c;
}

.status-rejected {
  background-color: #7f8c8d;
}

.order-detail-popup {
  --f7-popup-border-radius: 16px 16px 0 0;
  --f7-popup-tablet-border-radius: 16px;
}

.detail-popup-bg {
  background-color: #ede0d1;
}

.popup-navbar {
  background-color: #331c2c;
  color: white;
}

.popup-navbar .right a {
  color: white;
  font-weight: 500;
}

.popup-close-btn {
  font-size: 16px;
}

.order-detail-content {
  padding-bottom: 30px;
}

.order-summary {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 15px;
  color: #2d3436;
}

.summary-value {
  font-weight: 500;
  color: #331c2c;
}

.order-items {
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
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f2f6;
}

.items-list {
  margin-top: 8px;
}

.order-item-detail {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f2f6;
}

.order-item-detail:last-child {
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

.order-total {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
}

.order-total .summary-row {
  font-size: 15px;
  margin-bottom: 8px;
}

.order-total .summary-row.total-price {
  font-size: 17px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #ddd;
}

.order-actions {
  margin-top: 24px;
}

.cancel-order-btn {
  --f7-button-bg-color: #e74c3c;
  --f7-button-text-color: white;
  --f7-button-height: 48px;
  --f7-button-font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.review-order-btn {
  --f7-button-bg-color: #331c2c;
  --f7-button-text-color: white;
  --f7-button-height: 48px;
  --f7-button-font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
}

.review-popup {
  --f7-popup-border-radius: 16px 16px 0 0;
  --f7-popup-tablet-border-radius: 16px;
}

.review-popup-bg {
  background-color: #ede0d1;
}

.review-content {
  padding-bottom: 30px;
}

.rating-section {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stars-rating {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.star-icon {
  margin: 0 4px;
  cursor: pointer;
}

.review-section {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.review-textarea {
  --f7-textarea-height: 120px;
  --f7-textarea-font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
}

.submit-review-btn {
  --f7-button-bg-color: #331c2c;
  --f7-button-text-color: white;
  --f7-button-height: 48px;
  --f7-button-font-size: 16px;
  font-weight: 600;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
}
</style>