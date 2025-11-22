<script>
  // --- Imports ---
  import { onMount } from "svelte"; // Hook die wordt uitgevoerd zodra de component in de browser wordt weergegeven
  import { getSunshineRanking } from "$lib/rankingCities"; // Asynchrone service voor data ophalen
  import BarChart from "../components/barChart.svelte"; // Visualisatiecomponent

  let allCitiesData = []; // Hier worden alle steden bewaard
  let top10Data = []; // Dit is de set die we naar de grafiek sturen

  let loading = true;
  let loadingError = "";

  // Huidige instelling (standaard op Zon)
  let currentMetric = "averageHours";
  let currentLabel = "Gemiddelde zonuren";

  // Wordt uitgevoerd zodra de component in de browser wordt weergegeven
  onMount(async () => {
    try {
      // Haal alle steden op
      const results = await getSunshineRanking();
      allCitiesData = results;

      // Maak direct de eerste ranking
      updateRanking();
    } catch (e) {
      loadingError = "Fout bij het laden van data.";
      console.error(e);
    } finally {
      loading = false;
    }
  });

  // Functie die wordt aangeroepen als je op een knop klikt
  function setMetric(metric, label) {
    currentMetric = metric;
    currentLabel = label;
    updateRanking();
  }

  // Deze functie sorteert de lijst en pakt de top 10
  function updateRanking() {
    if (!allCitiesData || allCitiesData.length === 0) return;

    // 1. Maak een kopie van de lijst om te sorteren
    let sorted = [...allCitiesData];

    // 2. Sorteer van hoog naar laag op basis van de gekozen metric
    sorted.sort((a, b) => b[currentMetric] - a[currentMetric]);

    // 3. Pak alleen de eerste 10
    top10Data = sorted.slice(0, 10);
  }
</script>

<main>
  <div class="header-group">
    <h1>Waar in Europa moet ik heen om te bakken? 🥵🏝️🍹🌞</h1>
    <p>Last minute op vakantie? Bekijk hier de ideale zonbestemming!</p>
  </div>

  {#if loadingError}
    <p style="color: red;">{loadingError}</p>
  {:else if loading}
    <p>Even geduld, de weersvoorspelling wordt geladen...</p>
  {:else}
    <div class="controls">
      <button
        class:active={currentMetric === "averageHours"}
        on:click={() => setMetric("averageHours", "Gemiddelde zonuren")}
      >
        ☀️ Meeste Zon
      </button>

      <button
        class:active={currentMetric === "maxTemp"}
        on:click={() => setMetric("maxTemp", "Hoogste Temperatuur")}
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

      <BarChart
        data={top10Data}
        selectedMetric={currentMetric}
        yLabel={currentLabel}
      />
    </div>
  {/if}
</main>
