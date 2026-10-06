# Édes Piros – bemutató webshop

Statikus oldal (HTML/CSS/JS), build nélkül. Teszt rendelés + fizetés, valódi tranzakció nincs.

## Feltöltés GitHubra és Vercelre
1. Új GitHub repo → töltsd fel a mappa tartalmát (index.html, style.css, script.js, images/).
2. vercel.com → Add New → Project → válaszd a repót → Framework: **Other** → Deploy.
   (Build command és output directory üresen hagyható.)

## Szerkesztés
- Termékek, árak: `script.js` tetején (`PRODUCTS`, `SIZES`).
- Elkészítési idő: `LEAD_DAYS`.
- Színek: `style.css` tetején (`:root`).
