const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Bağlantı
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('MongoDB bağlandı kral'))
.catch(err => console.log('Mongo Hata:', err));

// Product Model - Basit versiyon
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  description: String,
  category: String
});

const Product = mongoose.model('Product', productSchema);

// ANA SAYFA TEST ROUTE
app.get('/', (req, res) => {
  res.json({ message: 'Marneuli Backend çalışıyor kral 🔥' });
});

// TÜM ÜRÜNLERİ GETİR
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// TEK ÜRÜN GETİR
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// ÜRÜN EKLE - Test için
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: 'Ürün eklenemedi' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
