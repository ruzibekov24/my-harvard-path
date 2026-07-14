# Kitob PDF fayllari uchun qo'llanma

Bu papka — o'zingiz yozgan/tuzgan yoki tarqatish huquqiga ega bo'lgan kitoblarning PDF fayllari uchun.

`kitoblar.html` sahifasida ikkita bo'lim bor:
- **Beginner kitoblar** — 10 ta joy (`beginner-01.pdf` dan `beginner-10.pdf` gacha)
- **Lug'at kitoblar** — 9 ta joy (`lugat-01.pdf` dan `lugat-09.pdf` gacha)

Quyidagi fayllardan birortasini shu nom bilan shu yerga (`books/` papkasiga) qo'ysangiz, saytdagi "PDF yuklab olish" tugmasi avtomatik ishlay boshlaydi.

## Kerakli fayllar — Beginner

| Fayl nomi | Nima bo'lishi kerak |
|---|---|
| `beginner-01.pdf` | 1-beginner kitob |
| `beginner-02.pdf` | 2-beginner kitob |
| `beginner-03.pdf` | 3-beginner kitob |
| `beginner-04.pdf` | 4-beginner kitob |
| `beginner-05.pdf` | 5-beginner kitob |
| `beginner-06.pdf` | 6-beginner kitob |
| `beginner-07.pdf` | 7-beginner kitob |
| `beginner-08.pdf` | 8-beginner kitob |
| `beginner-09.pdf` | 9-beginner kitob |
| `beginner-10.pdf` | 10-beginner kitob |

## Kerakli fayllar — Lug'at

| Fayl nomi | Nima bo'lishi kerak |
|---|---|
| `lugat-01.pdf` | 1-lug'at kitobi |
| `lugat-02.pdf` | 2-lug'at kitobi |
| `lugat-03.pdf` | 3-lug'at kitobi |
| `lugat-04.pdf` | 4-lug'at kitobi |
| `lugat-05.pdf` | 5-lug'at kitobi |
| `lugat-06.pdf` | 6-lug'at kitobi |
| `lugat-07.pdf` | 7-lug'at kitobi |
| `lugat-08.pdf` | 8-lug'at kitobi |
| `lugat-09.pdf` | 9-lug'at kitobi |

## Muqova rasmlari (ixtiyoriy, lekin tavsiya etiladi)

`images/` papkasiga mos nomlar bilan (masalan `kitob-beginner-01.jpg`, `kitob-lugat-01.jpg`, ... 400×600px) muqova rasmlarini qo'shsangiz, kartochkalarda placeholder o'rniga haqiqiy muqova ko'rinadi. To'liq ro'yxat uchun `images/README.md` faylga qarang.

## Nom va tavsiflarni o'zgartirish

Har bir kitob kartasida hozircha vaqtinchalik nom turibdi: masalan "Beginner kitob #1 — nomi shu yerga". `kitoblar.html` faylida shu matnni (`<h3>...</h3>`) va tavsifni (`<p>...</p>`) haqiqiy kitob nomi va qisqa tavsifga almashtiring.

## Yangi kitob qo'shish (11-beginner yoki 10-lug'at va h.k.)

`kitoblar.html` faylidagi tegishli bo'limda (`beginner-books` yoki `lugat-books`) bitta `.book-card` blokini nusxalab, ostiga joylashtiring, so'ng rasm/nom/tavsif/PDF havolasini yangilang. Menga (Claude'ga) kitob fayllari yoki nom/tavsiflarni yuborsangiz, buni siz uchun avtomatik qilib beraman.
