const express = require('express');
const cors = require('cors');
const app = express();

// 1. CORS - Netlify'dan gelen isteklere izin ver
app.use(cors()); 
app.use(express.json());

// 2. Sahte veritabanı - Render restart olunca silinir
let kullanicilar = [];
let ilanlar = [];

// 3. TEST ENDPOINT - Backend çalışıyor mu kontrol için
app.get('/', (req, res) => {
    res.json({ message: 'Marneuli Backend Çalışıyor' });
});

// 4. KAYIT OL ENDPOINT
app.post('/api/register', (req, res) => {
    const { email, sifre, adSoyad, telefon } = req.body;
    
    // Email kontrolü
    if (!email || !sifre || !adSoyad || !telefon) {
        return res.status(400).json({ message: 'Tüm alanları doldurun' });
    }
    
    const varMi = kullanicilar.find(k => k.email === email);
    if (varMi) {
        return res.status(400).json({ message: 'Bu email zaten kayıtlı' });
    }
    
    const yeniKullanici = { id: Date.now(), email, sifre, adSoyad, telefon };
    kullanicilar.push(yeniKullanici);
    
    console.log('Yeni kayıt:', email);
    res.json({ message: 'Kayıt başarılı' });
});

// 5. GİRİŞ YAP ENDPOINT
app.post('/api/login', (req, res) => {
    const { email, sifre } = req.body;
    
    if (!email || !sifre) {
        return res.status(400).json({ message: 'Email ve şifre girin' });
    }
    
    const kullanici = kullanicilar.find(k => k.email === email && k.sifre === sifre);
    if (!kullanici) {
        return res.status(400).json({ message: 'Email veya şifre hatalı' });
    }
    
    console.log('Giriş yapıldı:', email);
    res.json({ 
        message: 'Giriş başarılı', 
        token: 'token-' + kullanici.id,
        kullanici: { email: kullanici.email, adSoyad: kullanici.adSoyad }
    });
});

// 6. İLANLARI ÇEK - index.html için
app.get('/api/ilanlar', (req, res) => {
    res.json(ilanlar);
});

// 7. İLAN EKLE
app.post('/api/ilanlar', (req, res) => {
    const yeniIlan = req.body;
    ilanlar.push(yeniIlan);
    res.json({ message: 'İlan eklendi', ilan: yeniIlan });
});

// 8. Render portu
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});
