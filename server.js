const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// MONGO BAĞLANTISI
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB bağlandı kral'))
  .catch(err => console.error('MongoDB hata:', err));

// USER MODELİ
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// ANA SAYFA TEST
app.get('/', (req, res) => {
  res.send('Marneuli Store Backend Çalışıyor Kral 🔥');
});

// KAYIT ENDPOINTİ
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Email var mı kontrol
    const varMi = await User.findOne({ email });
    if (varMi) {
      return res.status(400).json({ error: 'Bu email zaten kayıtlı' });
    }

    const user = new User({ name, email, phone, password });
    await user.save();
    
    res.status(201).json({ 
      message: 'Kayıt başarılı kral', 
      user: { name: user.name, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN ENDPOINTİ - LAZIM OLUR
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }
    
    res.json({ 
      message: 'Giriş başarılı', 
      user: { name: user.name, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SERVER BAŞLAT
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor kral`);
});
