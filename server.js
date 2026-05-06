// DOSYA: server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Fotoğraf için büyük limit

// MONGO BAGLANTI
mongoose.connect(process.env.MONGO_URL)
 .then(() => console.log('MongoDB bağlandı'))
 .catch(e => console.log('MongoDB HATA:', e.message));

// USER MODEL
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// LISTING MODEL
const listingSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Başlık zorunlu'] },
  price: { type: Number, required: [true, 'Fiyat zorunlu'] },
  description: String,
  images: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paid: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Listing = mongoose.model('Listing', listingSchema);

// TEST ENDPOINT
app.get('/', (req, res) => {
  res.json({ msg: 'Marneuli Store API çalışıyor' });
});

// KAYIT OL
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    res.json({ msg: 'Kayıt başarılı', user: { name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ msg: 'Kayıt hatası', error: e.message });
  }
});

// GİRİŞ YAP
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Kullanıcı bulunamadı' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Şifre yanlış' });

    res.json({ msg: 'Giriş başarılı', user: { _id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ msg: 'Giriş hatası', error: e.message });
  }
});

// İLAN EKLEME - DÜZGÜN HALİ
app.post('/api/listing/create', async (req, res) => {
  console.log('İlan isteği geldi:', req.body);
  try {
    const { title, price, description, images, userId } = req.body;

    if (!title) return res.status(400).json({ msg: 'Başlık zorunlu' });
    if (!price) return res.status(400).json({ msg: 'Fiyat zorunlu' });

    const listing = await Listing.create({
      title,
      price: Number(price),
      description: description || '',
      images: images || [],
      userId: userId || null,
      paid: false // Şimdilik ücretsiz, sonra ödeme ekleriz
    });

    console.log('BAŞARILI: İlan kaydedildi', listing._id);
    res.json({ msg: 'İlan eklendi', listing });

  } catch (e) {
    console.log('SUNUCU HATASI YAKALANDI:', e.message);
    res.status(500).json({ msg: 'Sunucu hatası', error: e.message });
  }
});

// TÜM İLANLARI ÇEK
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (e) {
    res.status(500).json({ msg: 'İlanlar çekilemedi', error: e.message });
  }
});

// TEK İLAN ÇEK
app.get('/api/listing/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ msg: 'İlan bulunamadı' });
    res.json(listing);
  } catch (e) {
    res.status(500).json({ msg: 'İlan çekilemedi', error: e.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda ayakta`));