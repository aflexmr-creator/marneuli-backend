const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Bağlantısı
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ HATA: MONGO_URI environment değişkeni tanımlanmamış!');
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Bağlandı'))
.catch(err => console.error('❌ MONGODB BAĞLANTI HATASI:', err));

// İlan Şeması
const ilanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Diğer' },
  imageUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Ilan = mongoose.model('Ilan', ilanSchema);

// Ana sayfa test
app.get('/', (req, res) => {
  res.send('Marneuli Store Backend Çalışıyor 🚀');
});

// TÜM İLANLARI GETİR
app.get('/api/ilanlar', async (req, res) => {
  try {
    const ilanlar = await Ilan.find().sort({ createdAt: -1 });
    console.log(`✅ ${ilanlar.length} ilan getirildi`);
    res.json(ilanlar);
  } catch (error) {
    console.error('HATA: İlanlar getirilemedi:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// YENİ İLAN EKLE - BUNU DÜZELTTİK
app.post('/api/ilanlar', async (req, res) => {
  try {
    console.log('Gelen veri:', req.body);
    
    const { title, price } = req.body;
    if (!title || !price) {
      return res.status(400).json({ error: 'Başlık ve fiyat zorunlu' });
    }

    const yeniIlan = new Ilan({
      title: req.body.title,
      price: req.body.price,
      description: req.body.description || '',
      category: req.body.category || 'Diğer',
      imageUrl: req.body.imageUrl || ''
    });

    const kaydedilenIlan = await yeniIlan.save();
    console.log('BAŞARILI: İlan kaydedildi:', kaydedilenIlan.title);
    res.status(201).json(kaydedilenIlan);
    
  } catch (error) {
    console.error('HATA: İlan kaydedilemedi:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// İLAN SİL
app.delete('/api/ilanlar/:id', async (req, res) => {
  try {
    await Ilan.findByIdAndDelete(req.params.id);
    console.log('BAŞARILI: İlan silindi:', req.params.id);
    res.json({ message: 'İlan silindi' });
  } catch (error) {
    console.error('HATA: İlan silinemedi:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});
