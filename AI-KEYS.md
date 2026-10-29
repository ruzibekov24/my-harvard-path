# AI kalitlarini almashtirish (bitta joy)

Sayt va mobil ilova (Yo'ldosh AI, qabul ehtimoli) bir xil AI sozlamasidan foydalanadi: `functions/_ai.js`.
**Kalitni almashtirish uchun kodga tegmaysiz**, faqat Cloudflare'da o'zgartirasiz.

## Kalit qo'yish / almashtirish
1. Cloudflare dashboard → Workers & Pages → `my-harvard-path` → **Settings → Environment variables**
2. `GEMINI_API_KEYS` ni toping (yo'q bo'lsa qo'shing, **Encrypt** qiling) va qiymatga kalit(lar)ni yozing:
   ```
   AIzaSy...birinchi,AIzaSy...ikkinchi,AIzaSy...uchinchi
   ```
   - Vergul bilan ajratiladi. Birinchisi asosiy.
   - Birinchi kalitning kvotasi tugasa (429), tizim o'zi keyingisiga o'tadi.
   - Eski `GEMINI_API_KEY` nomi ham ishlayveradi (u ro'yxatga qo'shiladi).
3. Ixtiyoriy zaxira: `ANTHROPIC_API_KEY`. Gemini kalitlarining hammasi ishlamasa Claude javob beradi.
4. **Deployments → Retry deployment** (Production va Preview uchun).

Kalitni Google AI Studio'dan oling: https://aistudio.google.com/apikey

## Modelni almashtirish
Faqat `functions/_ai.js` boshidagi `GEMINI_MODELS` ro'yxatini o'zgartiring (birinchisi asosiy, qolganlari zaxira).

## Tekshirish
```
curl -s -X POST https://my-harvard-path.pages.dev/api/mentor -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"Salom"}],"context":{"name":"Test"}}'
```
Xato bo'lsa javobdagi `detail` oxirgi sababni ko'rsatadi (masalan `gemini-3.8-flash: 429` = kvota tugagan).
