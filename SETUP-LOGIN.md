# Telegram orqali kirish — sozlash qo'llanmasi

Bu safar qo'shilgan Telegram login va XP tizimi ishlashi uchun Cloudflare Pages'da 3 ta narsani sozlash kerak. Bot tokenni bu faylga yoki chatga yozmang — faqat Cloudflare dashboard'ga kiritiladi.

## 1. Bot domenini tasdiqlash (BotFather)
Telegram'da @BotFather bilan yozishib:
```
/setdomain
@GoingToHarvard_bot
my-harvard-path.pages.dev
```
(agar custom domen bo'lsa, o'shani yozing — masalan `myharvardpath.uz`)

## 2. KV namespace yaratish
Cloudflare dashboard → Workers & Pages → loyihangiz → **Settings → Functions → KV namespace bindings**:
- "Create a KV namespace" — nomi: `mhp-users` (yoki xohlagan nom)
- **Variable name**: `MHP_KV` (aynan shu nom, kod shuni kutadi)
- Namespace'ni tanlang → Save

## 3. Environment o'zgaruvchilar (Secrets)
Xuddi shu loyihada **Settings → Environment variables**:
| Nomi | Qiymati |
|---|---|
| `BOT_TOKEN` | @BotFather bergan bot tokeningiz (masalan `123456:AA...`) — "Encrypt" qilib qo'ying |
| `SESSION_SECRET` | O'zingiz o'ylab topgan uzun tasodifiy matn (masalan 32+ belgili), sessiya imzosi uchun — "Encrypt" qilib qo'ying |

Ikkalasini ham **Production** va **Preview** muhitlari uchun alohida kiriting.

## 4. Qayta deploy qilish
O'zgaruvchilarni qo'shgandan keyin loyihani qayta deploy qiling (Cloudflare Pages avtomatik oladi, lekin birinchi marta qo'lda "Retry deployment" qilish kerak bo'lishi mumkin).

## Qanday ishlaydi
- Har bir sahifaning yuqori navigatsiyasida Telegram "Kirish" tugmasi chiqadi.
- Foydalanuvchi tugmani bosib Telegram orqali tasdiqlaydi.
- `functions/api/telegram-auth.js` Telegram'dan kelgan ma'lumotni **bot tokeningiz bilan HMAC-SHA256** orqali tekshiradi (soxta kirishlarni oldini oladi).
- Tasdiqlangandan so'ng foydalanuvchi `MHP_KV`'da saqlanadi: ism, XP, o'qigan kitoblar ro'yxati.
- Kitoblar sahifasida "O'qidim" belgisini bossa, agar tizimga kirgan bo'lsa, +10 XP serverga yoziladi (`functions/api/progress.js`).
- Kirmagan foydalanuvchilar uchun ham "O'qidim" belgisi ishlayveradi — faqat brauzerning o'zida (localStorage) saqlanadi, XP berilmaydi.

## Fayllar
```
functions/
  _lib.js              — HMAC tekshiruvi, sessiya tokeni yordamchilari
  api/telegram-auth.js — Telegram login tasdiqlash
  api/me.js             — joriy foydalanuvchini olish
  api/progress.js       — XP / o'qilgan kitob yangilash
  api/logout.js         — chiqish
```

## Keyingi qadam (ixtiyoriy)
Hozircha XP faqat kitob o'qish uchun beriladi. Xohlasangiz, keyingi safar reyting jadvali (leaderboard) sahifasini ham qo'shsak bo'ladi — buning uchun qo'shimcha backend kerak emas, mavjud `MHP_KV`'dagi ma'lumotdan foydalanamiz.
