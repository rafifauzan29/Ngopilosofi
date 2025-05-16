<template>
  <f7-page class="page-bg">
    <f7-navbar title="Poin Saya" back-link="Kembali" />

    <f7-block class="point-info-block">
      <h2>Total Poin Anda</h2>
      <div class="total-point">{{ userPoint }}</div>
      <p class="note">Poin dapat ditukar dengan promo atau diskon tertentu saat pemesanan.</p>
    </f7-block>

    <f7-block-title>Riwayat Poin</f7-block-title>
    <f7-list class="history-list">
      <f7-list-item
        v-for="(item, index) in pointHistory"
        :key="index"
        :title="item.keterangan"
        :after="item.jumlah + ' pts'"
        :footer="formatTanggal(item.tanggal)"
      />
      <f7-list-item
        v-if="pointHistory.length === 0"
        title="Belum ada riwayat poin"
      />
    </f7-list>
  </f7-page>
</template>

<script>
export default {
  name: 'PointPage',
  data() {
    return {
      userPoint: 0,
      pointHistory: [],
    };
  },
  methods: {
    formatTanggal(tanggal) {
      const date = new Date(tanggal);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
  },
  mounted() {
    this.userPoint = parseInt(localStorage.getItem('user_point') || '0');

    const history = JSON.parse(localStorage.getItem('point_history') || '[]');
    this.pointHistory = history;
  },
};
</script>

<style scoped>
.page-bg {
  background-color: #ede0d1;
}

.point-info-block {
  text-align: center;
  padding: 30px 15px;
  background: #f5f1ed;
  border-radius: 15px;
  margin: 20px 15px;
}

.total-point {
  font-size: 48px;
  font-weight: bold;
  color: #331c2c;
  margin: 15px 0;
}

.note {
  color: #666;
  font-size: 14px;
  font-style: italic;
  margin-top: 10px;
}

.history-list {
  margin: 0 15px;
}
</style>
