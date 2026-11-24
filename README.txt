LOGI-RESCUE AI – navodila

Vsebina:
- index.html: spletni uporabniški vmesnik
- netlify/functions/analyze.mjs: varna povezava z Gemini AI
- netlify.toml: nastavitev objave na Netlify

POMEMBNO:
Aplikacija potrebuje Gemini API ključ. Ključa ne vpisuj v index.html in ga
ne pošiljaj nikomur v klepet.

1. V Google AI Studio odpri https://aistudio.google.com/app/apikey
2. Ustvari API ključ (Create API key) in ga shrani zasebno.
3. Naloži celotno mapo projekta v GitHub ali jo objavi prek Netlify.
   Za Netlify Functions priporočena je povezava Netlify z GitHub repozitorijem.
4. V Netlify odpri Site configuration / Environment variables.
5. Dodaj spremenljivko:
   Key: GEMINI_API_KEY
   Value: tvoj Gemini API ključ
6. Shrani in sproži novo objavo (Deploy).

Ko je objava končana, odpri spletno stran in preizkusi gumb
»Naloži testni primer«, nato »Analiziraj dogodek z AI«.

Opomba:
Gemini API ima lahko omejitve uporabe ali stroške, odvisno od trenutnih
pogojev Google računa in izbranega modela. Preveri jih v Google AI Studio.
To je študijski prototip; rezultate mora preveriti človek.
