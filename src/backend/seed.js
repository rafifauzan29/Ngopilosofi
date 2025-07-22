require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');

const menuItems = [
    {
        nama: 'Kopi Susu Aren',
        harga: 18000,
        gambar: '/images/menu/kopisusuaren.webp',
        kategori: ['Paling Laku'],
        favorite: false,
        deskripsi:
            'Perpaduan sempurna antara kopi robusta, susu segar, dan gula aren asli.',
        tambahan: [
            { nama: 'Extra Shot Espresso', harga: 5000 },
        ],
    },
    {
        nama: 'Signature Latte',
        harga: 22000,
        gambar: 'images/menu/signaturelatte.jpeg',
        kategori: ['Kopi'],
        favorite: false,
        deskripsi:
            'Latte dengan racikan khusus menggunakan biji kopi pilihan dan susu segar',
        tambahan: [
            { nama: 'Syrup Vanilla', harga: 4000 },
        ],
    },
    {
        nama: 'Espresso',
        harga: 15000,
        gambar: 'images/menu/ekspresso.jpeg',
        kategori: ['Kopi'],
        favorite: false,
        deskripsi:
            'Ekstrak kopi murni yang diseduh dengan tekanan tinggi, menghasilkan minuman pekat dengan crema yang tebal dan rasa yang intens.',
        tambahan: [{ nama: 'Extra Shot', harga: 5000 }],
    },
    {
        nama: 'Susu Coklat',
        harga: 17000,
        gambar: 'images/menu/susucoklat.webp',
        kategori: ['Susu'],
        favorite: false,
        deskripsi:
            'Minuman susu dengan coklat premium yang lembut, cocok untuk menemani saat santai maupun bekerja.',
        tambahan: [{ nama: 'Whipped Cream', harga: 4000 }],
    },
    {
        nama: 'Roti Bakar Coklat',
        harga: 20000,
        gambar: 'images/menu/rotibakar.jpeg',
        kategori: ['Makanan'],
        favorite: false,
        deskripsi:
            'Roti gandum panggang dengan isian coklat leleh yang melimpah, disajikan hangat dengan taburan gula halus.',
        tambahan: [{ nama: 'Keju Tambahan', harga: 5000 }],
    },
    {
        nama: 'Creamy Latte',
        harga: 23000,
        gambar: 'images/menu/creamylatte.png',
        kategori: ['Baru', 'Kopi'],
        favorite: false,
        deskripsi:
            'Creamy Latte dengan perpaduan espresso dan susu creamy yang lembut, disajikan hangat atau dingin untuk menyegarkan harimu.',
        tambahan: [{ nama: 'Extra Shot Espresso', harga: 5000 }],
    },
    {
        nama: 'Avocado Coffee',
        harga: 25000,
        gambar: '/images/menu/avocadocoffee.webp',
        kategori: ['Kopi', 'Baru'],
        favorite: false,
        deskripsi: 'Kopi dengan campuran alpukat segar dan susu manis.',
        tambahan: [{ nama: 'Topping Coklat', harga: 4000 }],
    },
    {
        nama: 'Kopi Hitam Gula Batu',
        harga: 16000,
        gambar: '/images/menu/kopihitam.webp',
        kategori: ['Kopi'],
        favorite: false,
        deskripsi: 'Kopi hitam klasik disajikan dengan gula batu sebagai pemanis alami.',
        tambahan: [{ nama: 'Extra Kopi', harga: 3000 }],
    },
    {
        nama: 'Susu Kurma',
        harga: 19000,
        gambar: '/images/menu/susukurma.jpeg',
        kategori: ['Susu', 'Baru'],
        favorite: false,
        deskripsi: 'Susu segar dengan sari kurma asli yang menyehatkan dan mengenyangkan.',
        tambahan: [{ nama: 'Chia Seed', harga: 4000 }],
    },
    {
        nama: 'Roti Bakar Keju',
        harga: 21000,
        gambar: '/images/menu/rotikeju.jpeg',
        kategori: ['Makanan'],
        favorite: false,
        deskripsi: 'Roti bakar dengan keju meleleh dan topping gurih.',
        tambahan: [{ nama: 'Susu Kental Manis', harga: 3000 }],
    },
    {
        nama: 'Cappuccino Hazelnut',
        harga: 24000,
        gambar: '/images/menu/cappuccinohazelnut.jpeg',
        kategori: ['Kopi', 'Paling Laku'],
        favorite: false,
        deskripsi: 'Cappuccino creamy dengan rasa hazelnut khas.',
        tambahan: [{ nama: 'Syrup Caramel', harga: 4000 }],
    },
    {
        nama: 'Es Kopi Jelly',
        harga: 20000,
        gambar: '/images/menu/eskopijelly.jpeg',
        kategori: ['Kopi'],
        favorite: false,
        deskripsi: 'Kopi dingin disajikan dengan jelly kopi kenyal.',
        tambahan: [{ nama: 'Extra Jelly', harga: 3000 }],
    },
    {
        nama: 'Green Tea Latte',
        harga: 22000,
        gambar: '/images/menu/greentealatte.webp',
        kategori: ['Baru'],
        favorite: false,
        deskripsi: 'Matcha latte lembut dengan aroma teh hijau khas Jepang.',
        tambahan: [{ nama: 'Boba', harga: 5000 }],
    },
    {
        nama: 'Roti Bakar Kacang',
        harga: 20000,
        gambar: '/images/menu/rotikacang.webp',
        kategori: ['Makanan'],
        favorite: false,
        deskripsi: 'Roti bakar dengan isian kacang manis gurih.',
        tambahan: [{ nama: 'Meses Coklat', harga: 3000 }],
    },
    {
        nama: 'Vanilla Milkshake',
        harga: 21000,
        gambar: '/images/menu/vanillamilkshake.webp',
        kategori: ['Susu'],
        favorite: false,
        deskripsi: 'Milkshake vanilla dengan tekstur lembut dan manis.',
        tambahan: [{ nama: 'Es Krim Tambahan', harga: 6000 }],
    },
    {
        nama: 'Kopi Susu Karamel',
        harga: 23000,
        gambar: '/images/menu/kopikaramel.jpeg',
        kategori: ['Kopi'],
        favorite: false,
        deskripsi: 'Kopi susu segar dengan sirup karamel yang nikmat.',
        tambahan: [{ nama: 'Extra Karamel', harga: 5000 }],
    },
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);


        await MenuItem.deleteMany({});
        await MenuItem.insertMany(menuItems);

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
