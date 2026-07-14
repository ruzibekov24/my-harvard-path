# Rasmlar uchun qo'llanma

Bu papka bo'sh — saytdagi barcha rasm joylari hozircha shtrixli "placeholder" ko'rinishida ko'rsatilgan (har bir sahifada kamida 1 tadan). Quyidagi fayllardan birortasini shu nomlar bilan shu yerga qo'ysangiz, sayt avtomatik ravishda haqiqiy rasmni ko'rsata boshlaydi (HTML'da har bir joy `images/nom.jpg` deb ishora qilingan).

Tavsiya: Unsplash, Pexels yoki Wikimedia Commons kabi bepul-litsenziyali saytlardan yuklab oling (mualliflik huquqi muammosisiz).

## Kerakli fayllar

| Fayl nomi | Sahifa | Tavsiya etilgan o'lcham | Nima bo'lishi kerak |
|---|---|---|---|
| `ilyos-kichik.jpg` | index.html | 640×480px | Muallif surati (kichik) |
| `ilyos-portret.jpg` | about.html | 600×800px | Muallif portreti |
| `kundalik-yozuv-jarayoni.jpg` | about.html | 1200×675px | Yozish/kanal jarayoni bilan bog'liq rasm |
| `harvard-hovlisi.jpg` | harvard-yoli.html | 1200×675px | Harvard Yard (universitet hovlisi) |
| `flex-ishtirokchilari.jpg` | flex.html | 680×510px | FLEX dasturi ishtirokchilari / intervyu sahnasi |
| `ingliz-tili-banner.jpg` | ingliz-tili.html | 1600×450px | Til o'rganish bilan bog'liq banner |
| `lugat-banner.jpg` | lugat-va-iboralar.html | 1600×450px | Lug'at/kitob bilan bog'liq banner |
| `blog-banner.jpg` | blog.html | 1600×450px | Yozish/blog bilan bog'liq banner |
| `faq-rasm.jpg` | faq.html | 680×510px | Savol-javob bilan bog'liq rasm |
| `kitob-beginner-01.jpg` ... `kitob-beginner-10.jpg` | kitoblar.html | 400×600px | Beginner kitoblar muqovalari (1-10) |
| `kitob-lugat-01.jpg` ... `kitob-lugat-09.jpg` | kitoblar.html | 400×600px | Lug'at kitoblar muqovalari (1-9) |
| `kitob-on-writing-well.jpg` | kitoblar.html | 400×600px | "On Writing Well" muqovasi |
| `kitob-they-say-i-say.jpg` | kitoblar.html | 400×600px | "They Say / I Say" muqovasi |
| `kitob-50-harvard-essays.jpg` | kitoblar.html | 400×600px | "50 Successful Harvard Application Essays" muqovasi |
| `kitob-word-power.jpg` | kitoblar.html | 400×600px | "Word Power Made Easy" muqovasi |
| `kitob-atomic-habits.jpg` | kitoblar.html | 400×600px | "Atomic Habits" muqovasi |
| `kitob-grit.jpg` | kitoblar.html | 400×600px | "Grit" muqovasi |

## Rasm qo'yishni qanday amalga oshirish mumkin

Placeholder o'rniga haqiqiy rasmni qo'yish uchun, tegishli HTML faylida quyidagi blokni:

```html
<div class="img-placeholder ph-16x9">
  <svg class="ph-icon" ...></svg>
  <span class="ph-file">images/misol.jpg</span>
  <span class="ph-hint">...</span>
</div>
```

shunga almashtiring:

```html
<img src="images/misol.jpg" alt="Tavsif" style="border-radius:6px; width:100%;">
```

Agar rasmlarni menga (Claude'ga) tashlasangiz, bu almashtirishni men avtomatik qilib beraman.
