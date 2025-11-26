<script>
  // ------------------------------------------------------------------
  // Imports
  // ------------------------------------------------------------------
  import { onMount } from "svelte";
  import { getRanking } from "$lib/rankingCities";

  import BarChart from "../components/barChart.svelte";

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  let allCitiesData = []; // De volledige bron-dataset (alle steden)
  let top10Data = []; // De gefilterde dataset die we aan de grafiek geven

  let isLoading = true; // Houdt bij of we nog aan het laden zijn
  let loadingError = ""; // Bevat de foutmelding als er iets misgaat

  // Huidige configuratie van de weergave
  let currentMetric = "averageHours";
  let currentLabel = "Meeste zonuren";
  let currentSubtitle =
    "Het gemiddeld aantal zonuren per dag over de komende zeven dagen";

  // ------------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------------
  onMount(async () => {
    try {
      // 1. Haal alle data op (dit gebeurt asynchroon via de API of Cache)
      const results = await getRanking();

      // 2. Sla de resultaten op in de status
      allCitiesData = results;

      // 3. Bereken direct de eerste ranglijst
      updateRanking();
    } catch (error) {
      loadingError = "Er is een fout opgetreden bij het laden van de weerdata.";
      console.error("Fout in +page.svelte:", error);
    } finally {
      // Dit wordt altijd uitgevoerd, succes of fout, om de spinner te stoppen
      isLoading = false;
    }
  });

  // ------------------------------------------------------------------
  // Interactie Logica
  // ------------------------------------------------------------------

  // Functie: Wissel van metriek (bijv. van Zon naar Temperatuur)
  function setMetric(metric, label) {
    currentMetric = metric;
    currentLabel = label;

    // Pas de subtitel aan op basis van de gekozen metriek
    if (metric === "averageHours") {
      currentSubtitle =
        "Het gemiddeld aantal zonuren per dag over de komende zeven dagen";
    } else if (metric === "maxTemp") {
      currentSubtitle =
        "De hoogst verwachte temperatuur in de komende zeven dagen";
    } else if (metric === "maxUV") {
      currentSubtitle =
        "De maximale verwachte UV-index (zonkracht) in de komende zeven dagen";
    }

    // Herbereken de top 10 op basis van de nieuwe keuze
    updateRanking();
  }

  // Functie: Sorteer de data en pak de beste 10
  function updateRanking() {
    // Veiligheidscheck: als er nog geen data is, doe niets
    if (!allCitiesData || allCitiesData.length === 0) return;

    // 1. Maak een kopie van de array
    let sortedCities = [...allCitiesData];

    // 2. Sorteer van hoog naar laag op basis van de huidige metriek
    sortedCities.sort((cityA, cityB) => {
      return cityB[currentMetric] - cityA[currentMetric];
    });

    // 3. Pak alleen de eerste 10 resultaten (slice)
    top10Data = sortedCities.slice(0, 10);
  }
</script>

<main>
  <div class="header-group">
    <h1>Waar in Europa moet ik heen om te bakken? 🥵🏝️🍹☀️</h1>
    <p class="subtitle">
      Last minute op vakantie? Bekijk hier de ideale zonbestemming!
    </p>
  </div>

  {#if loadingError}
    <div class="error-message">
      <p>{loadingError}</p>
    </div>
  {:else if isLoading}
    <div class="loading-container">
      <div class="spinner"></div>
    </div>
  {:else}
    <div class="controls">
      <button
        class:active={currentMetric === "averageHours"}
        on:click={() => setMetric("averageHours", "Meeste zonuren")}
      >
        ☀️ Meeste Zon
      </button>

      <button
        class:active={currentMetric === "maxTemp"}
        on:click={() => setMetric("maxTemp", "Hoogste temperatuur")}
      >
        🥵 Hoogste temperatuur
      </button>

      <button
        class:active={currentMetric === "maxUV"}
        on:click={() => setMetric("maxUV", "Maximale UV")}
      >
        ⛱️ Maximale UV
      </button>
    </div>

    <div class="chart-container">
      <h2>Top 10: {currentLabel}</h2>
      <p class="subtitle">{currentSubtitle}</p>

      <BarChart
        data={top10Data}
        selectedMetric={currentMetric}
        yLabel={currentLabel}
      />
    </div>
  {/if}
</main>
