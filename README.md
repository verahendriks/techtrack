# ☀️ Waar in Europa moet ik heen om te bakken?

Een interactieve datavisualisatie die helpt de ideale zonbestemming te vinden op basis van actuele weersvoorspellingen. Gebouwd met **SvelteKit** en **D3.js**.

[**🔗 Bekijk de Live Demo**](https://techtrack-ochre.vercel.app)

<img width="2918" height="1494" alt="Scherm­afbeelding 2025-11-26 om 10 11 17" src="https://github.com/user-attachments/assets/b9725001-26e2-495e-9327-db4526c7acb7" />

## 📝 Beschrijving
Deze applicatie haalt real-time weerdata op voor tientallen Europese steden en visualiseert deze in een interactieve ranglijst. Gebruikers kunnen sorteren op wat zij belangrijk vinden voor hun vakantie:
* **Zonuren:** Waar schijnt de zon het meest?
* **Temperatuur:** Waar is het het heetst?
* **UV-Index:** Waar is de zonkracht het sterkst?

Door op een stad te klikken, krijgt de gebruiker een gedetailleerde voorspelling voor de komende 7 dagen. Hier kan de gebruiker ook een gedetailleerde voorspelling voor een andere stad opzoeken.

## ✨ Kenmerken
* **Data-Driven Visualisatie:** Een dynamische staafdiagram gebouwd met **D3.js**.
* **Live Data:** Koppeling met de [Open-Meteo API](https://open-meteo.com/) voor actuele voorspellingen.
* **Zoekfunctie:** Mogelijkheid om specifieke steden te zoeken die niet in de top 10 staan.
* **Smart Caching:** Implementatie van `localStorage` om API-verzoeken te minimaliseren en de laadtijd bij terugkomst te minderen.
* **Rate Limiting:** Ingebouwde vertraging tussen API-calls om binnen de limieten van de server te blijven.

## 🛠️ Technische Stack
* **Framework:** SvelteKit (Vite)
* **Visualisatie:** D3.js (v7)
* **Data:** GeoJSON & REST API
* **Taal:** JavaScript (ES6 Modules)
* **Styling:** CSS

## ⚙️ Installatie & Gebruik

Wil je dit project lokaal draaien? Volg deze stappen:

1.  **Clone de repository:**
    ```bash
    git clone https://github.com/verahendriks/techtrack.git
    cd techtrack
    ```

2.  **Installeer dependencies:**
    ```bash
    npm install
    ```

3.  **Start de development server:**
    ```bash
    npm run dev
    ```

4.  **Open je browser:**
    Ga naar `http://localhost:5173` om de applicatie te bekijken.

## 📂 Projectstructuur
* `src/lib/config.js` - Centrale configuratie.
* `src/lib/rankingCities.js` - Logica voor data ophalen, cachen en sorteren.
* `src/lib/dataProcessor.js` - Pure functies voor het transformeren van API-data.
* `src/lib/chartUtils.js` - Hulpfuncties voor formattering (tijd, datum, windkracht).
* `src/components/barChart.svelte` - D3.js logica en visualisatie.
* `src/routes/+page.svelte` - Hoofdpagina en state management.
* `static/data/europeanCities.geojson` - Dataset met de top-steden voor de ranglijst.
* `static/data/searchCities.geojson` - Dataset met alle beschikbare steden voor de zoekfunctie.

## 📚 Proces & Onderzoek
De documentatie van het ontwerpproces is te vinden in de [Wiki van deze repository](https://github.com/verahendriks/techtrack/wiki/techtrack%E2%80%90wiki).

## 👤 Auteur
* **Naam:** Vera Hendriks
* **Studentnummer:** 500853130
* **Vak:** Tech Track - Information Design (2025)
* **School:** Hogeschool van Amsterdam

## ⚖️ Licentie
Dit project is gemaakt voor educatieve doeleinden. Data wordt geleverd door Open-Meteo (CC BY 4.0).
