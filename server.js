require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');

const app = express();

// ŞART OLAN MIDDLEWARE'LER
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MONGODB BAĞLANTI
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB bağlandı kral'))
  .catch(err => console.log('MongoDB hata:', err));

// MODELLER
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const adSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  image: String,
  userId: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Ad = mongoose.model('Ad', adSchema);

// RESİM YÜKLEME İÇİN MULTER
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ROUTE'LAR

// 1. KAYIT OL
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email zaten kayıtlı' });
    }

    const user = new User({ email, password });
    await user.save();
    
    res.json({ success: true, message: 'Kayıt başarılı', userId: user._id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// 2. GİRİŞ YAP
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Email veya şifre hatalı' });
    }
    
    res.json({ success: true, message: 'Giriş başarılı', userId: user._id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// 3. İLAN EKLE
app.post('/api/ads', async (req, res) => {
  try {
    const { title, description, price, image, userId } = req.body;
    
    const ad = new Ad({ title, description, price, image, userId });
    await ad.save();
    
    res.json({ success: true, message: 'İlan eklendi', ad });
  } catch (err) {
    res.status(500).json({ success: false, message: 'İlan eklenemedi' });
  }
});

// 4. İLANLARI LİSTELE
app.get('/api/listings', async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ success: false, message: 'İlanlar çekilemedi' });
  }
});

// 5. RESİM YÜKLE - Base64 olarak döner
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resim yok' });
    }
    
    const base64Image = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    
    res.json({ success: true, url: imageUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Resim yüklenemedi' });
  }
});

// TEST ROUTE
app.get('/', (req, res) => {
  res.send('Marneuli Store API çalışıyor kral 💪');
});

// SERVER BAŞLAT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
