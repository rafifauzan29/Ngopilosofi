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
            'Perpaduan sempurna antara kopi robusta, susu segar, dan gula aren asli yang memberikan rasa manis alami dengan aroma khas kopi yang nikmat.',
        tambahan: [
            { nama: 'Extra Shot Espresso', harga: 5000 },
            { nama: 'Susu Almond', harga: 7000 },
        ],
    },
    {
        nama: 'Signature Latte',
        harga: 22000,
        gambar: 'images/menu/signaturelatte.jpeg',
        kategori: ['Kopi'],
        favorite: false,
        deskripsi:
            'Latte dengan racikan khusus menggunakan biji kopi pilihan dan susu segar yang menghasilkan tekstur creamy dengan lapisan foam yang sempurna.',
        tambahan: [
            { nama: 'Syrup Vanilla', harga: 4000 },
            { nama: 'Topping Boba', harga: 6000 },
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
