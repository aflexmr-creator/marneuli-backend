const express = require('express');
const cors = require('cors');
const app = express();

// 1. CORS ve JSON ayarı - 10MB resim için limit artırıldı
app.use(cors()); 
app.use(express.json({ limit: '10mb' })); // RESİM İÇİN ŞART
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
    
    // Boş alan kontrolü
    if (!email || !sifre || !adSoyad || !telefon) {
        return res.status(400).json({ message: 'Tüm alanları doldurun' });
    }
    
    // Email zaten var mı kontrol
    const varMi = kullanicilar.find(k => k.email === email);
    if (varMi) {
        return res.status(400).json({ message: 'Bu email zaten kayıtlı' });
    }
    
    const yeniKullanici = { 
        id: Date.now(), 
        email, 
        sifre, 
        adSoyad, 
        telefon 
    };
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
        kullanici: { 
            email: kullanici.email, 
            adSoyad: kullanici.adSoyad 
        }
    });
});

// 6. TÜM İLANLARI ÇEK - index.html için
app.get('/api/ilanlar', (req, res) => {
    res.json(ilanlar);
});

// 7. İLAN EKLE - RESİM DESTEKLİ GÜNCELLENDİ
app.post('/api/ilanlar', (req, res) => {
    const token = req.headers.authorization;
    
    // Token kontrolü
    if (!token) {
        return res.status(401).json({ message: 'İlan eklemek için giriş yapmalısınız' });
    }
    
    const yeniIlan = req.body;
    
    // Zorunlu alan kontrolü
    if (!yeniIlan.baslik || !yeniIlan.fiyat || !yeniIlan.resim) {
        return res.status(400).json({ message: 'Başlık, fiyat ve resim zorunlu' });
    }
    
    // ID ve tarih ekle
    yeniIlan.id = Date.now();
    yeniIlan.tarih = new Date().toLocaleDateString('tr-TR');
    
    // En başa ekle - yeni ilanlar üstte gözüksün
    ilanlar.unshift(yeniIlan);
    
    console.log('Yeni ilan eklendi:', yeniIlan.baslik);
    res.json({ message: 'İlan başarıyla eklendi', ilan: yeniIlan });
});

// 8. TEK İLAN DETAYI ÇEK - ilan-detay.html için
app.get('/api/ilanlar/:id', (req, res) => {
    const ilanId = parseInt(req.params.id);
    const ilan = ilanlar.find(i => i.id === ilanId);
    
    if (!ilan) {
        return res.status(404).json({ message: 'İlan bulunamadı' });
    }
    
    res.json(ilan);
});

// 9. İLAN SİL
app.delete('/api/ilanlar/:id', (req, res) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ message: 'Giriş yapmalısınız' });
    }
    
    const ilanId = parseInt(req.params.id);
    const index = ilanlar.findIndex(i => i.id === ilanId);
    
    if (index === -1) {
        return res.status(404).json({ message: 'İlan bulunamadı' });
    }
    
    ilanlar.splice(index, 1);
    console.log('İlan silindi:', ilanId);
    res.json({ message: 'İlan silindi' });
});

// 10. Render portu
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});
