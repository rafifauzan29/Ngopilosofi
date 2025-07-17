# ☕ Ngopilosofi — Philosophy in Every Sip

Aplikasi **mobile & web** berbasis **Framework7 + Vue + Vite + Capacitor** untuk platform pemesanan kopi digital yang modern dan user-friendly. Proyek ini mendukung **PWA** dan dapat dibuild ke aplikasi Android native, dengan fitur-fitur seperti autentikasi, navigasi pintar, cart dinamis, serta UI responsif.

---

## 📦 Teknologi yang Digunakan

* ✅ [Framework7 Vue](https://framework7.io/vue/)
* ⚡ [Vite](https://vitejs.dev/) sebagai bundler
* 📱 [Capacitor](https://capacitorjs.com/) untuk native platform
* 🔐 [Capacitor Preferences](https://capacitorjs.com/docs/apis/preferences) untuk penyimpanan lokal
* 📦 [Pinia](https://pinia.vuejs.org/) untuk state management
* 🎨 CSS Scoped + Safe Area Padding
* 🔔 Framework7 Icons & Notifications

---

## 🛠️ Fitur Aplikasi

### 👤 Autentikasi & Akses

* Login & redirect berbasis token
* Proteksi route menggunakan `beforeEnter`
* Penyimpanan token menggunakan Capacitor Preferences

### 🛒 Keranjang Belanja (Cart)

* Cart state tersentralisasi menggunakan Pinia
* Badge cart real-time muncul di navbar

### 📱 Navigasi Mobile Friendly

* Navbar otomatis tampil/sembunyi berdasarkan route
* Tabbar (toolbar bawah) hanya muncul jika login
* Highlight menu aktif (dengan ikon dan label interaktif)

### 🧱 Layout & UI

* Safe-area support (atas & bawah)
* Custom toolbar, navbar, dan padding halaman
* Ikon Framework7 + badge + warna aktif yang elegan

---

## 📂 Struktur Proyek

```
src/
├── app.vue               # Root app
├── components/           # Komponen UI
├── js/
│   ├── routes.js         # Daftar route
│   └── stores/cart.js    # Store keranjang (Pinia)
├── views/                # Halaman user: home, favorite, profile, dll
public/
├── icons/                # Ikon app dan splash screen
assets-src/               # Sumber asli ikon (untuk `framework7 assets`)
resources/                # Aset tambahan Capacitor (cordova-res)
```

---

## ⚙️ Konfigurasi Framework7 CLI

```
{
  "cwd": "C:\\Users\\rafif\\ngopilosofi",
  "type": ["capacitor"],
  "name": "Ngopilosofi",
  "pkg": "com.ngopilosofi.app",
  "framework": "vue",
  "template": "blank",
  "cssPreProcessor": false,
  "bundler": "vite",
  "capacitor": {
    "platforms": ["android"]
  },
  "theming": {
    "customColor": false,
    "color": "#007aff",
    "darkMode": false,
    "iconFonts": true
  },
  "customBuild": false
}
```

---

## 🚀 Cara Instalasi & Jalankan

### 1️⃣ Clone & Install Dependency

```bash
git clone https://github.com/username/ngopilosofi.git
cd ngopilosofi
npm install
```

### 2️⃣ Jalankan Development Server

```bash
npm run dev
```

### 3️⃣ Build Aplikasi Web

```bash
npm run build
```

---

## 📱 Build Android (via Capacitor)

### Tambahkan Platform Android

```bash
npx cap add android
```

### Build Web & Copy ke Native Android

```bash
npm run build-capacitor-android
```

### Buka Android Studio

```bash
npx cap open android
```

---

## 🎨 Ikon & Splash Screen

Ganti ikon di folder `assets-src/` lalu generate:

```bash
framework7 assets
# atau dengan UI:
framework7 assets --ui
```

---

## 🧾 Aset Tambahan (cordova-res)

Untuk menghasilkan ikon/splash Android:

```bash
npx cordova-res
```

Referensi: [cordova-res documentation](https://github.com/ionic-team/cordova-res)

---

## 📚 Dokumentasi Terkait

* 📘 [Framework7 Vue Docs](https://framework7.io/vue/)
* ⚙️ [Capacitor Docs](https://capacitorjs.com/)
* ⚡ [Vite Docs](https://vitejs.dev/)
* 🎨 [Framework7 Icons](https://framework7.io/icons/)
* 💬 [Forum Framework7](https://forum.framework7.io)

---

## ❤️ Dukung Framework7

Suka Framework7? Dukung pengembangnya di:

* 🌟 [Patreon](https://patreon.com/framework7)
* 👐 [OpenCollective](https://opencollective.com/framework7)

---

> Dibuat dengan semangat & secangkir kopi ☕ oleh tim **Ngopilosofi** — "Philosophy in Every Sip".
