export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Dovoljena je samo metoda POST." }), {
      status: 405, headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { type, location, description, goods, impact } = await req.json();
    if (!type || !description?.trim()) {
      return new Response(JSON.stringify({ error: "Manjkata vrsta ali opis dogodka." }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = Netlify.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Na Netlify še ni nastavljen GEMINI_API_KEY." }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    const prompt = `
Deluj kot LOGI-RESCUE AI, pomočnik za analizo kriznih dogodkov v logistiki.
Odgovarjaj izključno v slovenščini, jasno, stvarno in strukturirano.
Analiziraj samo podatke, ki jih poda uporabnik. Ne izmišljaj si številk, dejstev,
stroškov, časov ali varnostnih okoliščin. Jasno loči POTRJENA DEJSTVA,
NEZNANE PODATKE in PREDPOSTAVKE. Če manjkajo pomembni podatki, to izrecno
navedi in na začetku postavi največ 5 konkretnih dodatnih vprašanj. Vseeno
lahko pripraviš začasno oceno, vendar jo označi kot pogojno in ne podajaj
dokončne priporočene odločitve, kadar ključni podatki manjkajo.

Vhodni podatki:
Vrsta dogodka: ${type}
Lokacija: ${location || "Ni navedena"}
Opis: ${description}
Prizadeto blago/pošiljka: ${goods || "Ni navedeno"}
Znani vpliv na poslovanje: ${impact || "Ni navedeno"}

Pripravi analizo z naslednjimi naslovi in v tem vrstnem redu:
1. POVZETEK DOGODKA
2. POTRJENA DEJSTVA
3. NEZNANI PODATKI IN DODATNA VPRAŠANJA
4. PREDPOSTAVKE (če jih ni, napiši "Ni jih.")
5. OCENA TVEGANJA (nizko / srednje / visoko) in kratka utemeljitev
6. MOŽNE POSLEDICE (dostava, stroški, blago, kupci, poslovanje; neznano označi)
7. TRI MOŽNE REŠITVE (za vsako prednosti in slabosti)
8. PRIPOROČENA REŠITEV IN UTEMELJITEV
9. NAČRT UKREPANJA (jasni zaporedni koraki)
10. OSNUTEK OBVESTILA ZA STRANKO
11. KRATKO KRIZNO POROČILO

Pri nevarnosti za ljudi, požaru, elektriki, poplavi, nevarnih snoveh ali
hladilni verigi najprej opozori na ustrezne varnostne postopke in pristojne
strokovnjake. Ne predlagaj nevarnih posegov. Ne trdi, da si preveril stanje
v realnem času ali zunanje sisteme.`;

    const apiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 5000 }
        })
      }
    );

    const result = await apiResponse.json();
    if (!apiResponse.ok) {
      return new Response(JSON.stringify({
        error: result?.error?.message || "Gemini API je vrnil napako."
      }), { status: apiResponse.status, headers: { "Content-Type": "application/json" } });
    }

    const analysis = result?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "").join("\n").trim();

    if (!analysis) throw new Error("Model ni vrnil besedilnega odgovora.");
    return new Response(JSON.stringify({ analysis }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Nepričakovana napaka." }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
};