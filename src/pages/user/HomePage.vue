<template>
  <f7-page class="page-bg">
    <f7-navbar title="Ngopilosofi" class="navbar-custom" />

    <f7-block class="banner-block">
      <div class="banner-text">
        <h1>Selamat Datang di Ngopilosofi ☕</h1>
        <p>Temukan kopi favorit dan camilan lezat pilihan kami.</p>
        <f7-link href="/user/menu-list/" class="button button-fill btn-order">
          Pesan Sekarang
        </f7-link>
      </div>
    </f7-block>

    <f7-block class="point-block">
      <div class="point-info">
        <span>Poin Saya: <strong>{{ userPoint }}</strong></span>
        <f7-link href="/user/point/" class="button button-outline btn-point">
          Lihat Detail
        </f7-link>
      </div>
    </f7-block>

    <f7-block>
      <h2 class="section-title">Kategori Populer</h2>
      <div class="kategori-grid">
        <div
          v-for="kategori in kategoriPopuler"
          :key="kategori"
          class="kategori-card"
          @click="goToKategori(kategori)"
        >
          <f7-icon ios="f7:star_fill" md="material:star" color="#331c2c" size="large" />
          <div class="kategori-name">{{ kategori }}</div>
        </div>
      </div>
    </f7-block>

    <f7-block>
      <h2 class="section-title">Menu Terbaru</h2>
      <div class="menu-favorite-grid">
        <div
          v-for="item in terbaruItems"
          :key="item.id"
          class="menu-favorite-card"
          @click="openDetail(item)"
        >
          <img :src="formatImagePath(item.gambar)" alt="Menu Image" />
          <div class="menu-fav-name">{{ item.nama }}</div>
          <div class="menu-fav-price">{{ formatRupiah(item.harga) }}</div>
        </div>
      </div>
      <div v-if="terbaruItems.length === 0" class="no-favorite-text">
        Belum ada menu terbaru, coba kunjungi nanti!
      </div>
    </f7-block>
  </f7-page>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      kategoriPopuler: ['Kopi', 'Susu', 'Makanan', 'Snack', 'Minuman'],
      semuaMenu: [],
      userPoint: 0,
    };
  },
  computed: {
    terbaruItems() {
      if (!this.semuaMenu || this.semuaMenu.length === 0) return [];
      return this.semuaMenu.filter((item) => {
        if (Array.isArray(item.kategori)) {
          return item.kategori.includes('Baru');
        }
        return item.kategori === 'Baru';
      });
    },
  },
  methods: {
    formatRupiah(angka) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(angka);
    },
    goToKategori(kategori) {
      this.$f7router.navigate('/menu-list', { query: { kategori } });
    },
    openDetail(item) {
      this.$f7router.navigate('/detail-produk', {
        props: { produk: item },
      });
    },
    formatImagePath(path) {
      if (path && !path.startsWith('/')) {
        return '/' + path;
      }
      return path;
    },
  },
  mounted() {
    const storedMenu = JSON.parse(localStorage.getItem('/menu/all/') || '[]');
    this.semuaMenu = storedMenu;

    const point = parseInt(localStorage.getItem('user_point') || '0');
    this.userPoint = point;
  },
};
</script>

<style scoped>
.page-bg {
  background-color: #ede0d1;
}

.banner-block {
  background: #331c2c;
  color: white;
  text-align: center;
  padding: 30px 20px;
  border-radius: 0 0 20px 20px;
}

.banner-text h1 {
  font-weight: 700;
  margin-bottom: 10px;
}

.banner-text p {
  margin-bottom: 20px;
  font-size: 1.1em;
}

.btn-order {
  color: #ffffff;
  font-weight: 600;
}

.point-block {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f1ed;
  padding: 15px 20px;
  border-radius: 15px;
  margin: 15px 10px;
}

.point-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #331c2c;
}

.btn-point {
  font-weight: 600;
  color: #331c2c;
}

.kategori-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.kategori-card {
  background: #f5f1ed;
  padding: 15px 20px;
  border-radius: 15px;
  text-align: center;
  cursor: pointer;
  width: 80px;
  user-select: none;
  transition: background-color 0.3s ease;
}

.kategori-card:hover {
  background-color: #e6d7c5;
}

.kategori-name {
  margin-top: 8px;
  font-weight: 600;
  color: #331c2c;
}

.menu-favorite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 18px;
  margin-top: 15px;
}

.menu-favorite-card {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 2px 7px rgb(0 0 0 / 0.1);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.menu-favorite-card:hover {
  transform: scale(1.05);
}

.menu-favorite-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.menu-fav-name {
  padding: 10px 10px 0 10px;
  font-weight: 600;
  color: #331c2c;
}

.menu-fav-price {
  padding: 0 10px 10px 10px;
  color: #9c7b4f;
  font-weight: 700;
}

.no-favorite-text {
  margin-top: 15px;
  font-style: italic;
  color: #999;
  text-align: center;
}
</style>
