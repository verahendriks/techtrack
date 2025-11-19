<script>
  // --- Imports ---
  import { onMount } from "svelte"; // Hook die wordt uitgevoerd zodra de component in de browser wordt weergegeven
  import { getSunshineRanking } from "$lib/rankingCities"; // Asynchrone service voor data ophalen
  import BarChart from "../components/barChart.svelte"; // Visualisatiecomponent

  // Reactieve variabelen die de huidige status van de applicatie bijhouden
  let top10Data = []; // Dataset met top 10 steden
  let loading = true; // Laadstatus
  let loadingError = ""; // Foutmelding bij mislukte fetch

  // Wordt uitgevoerd zodra de component in de browser wordt weergegeven
  onMount(async () => {
    try {
      const results = await getSunshineRanking(); // Ophalen van data
      top10Data = results; // Update state
    } catch (e) {
      loadingError = "Fout bij het laden van data."; // Foutmelding
    } finally {
      loading = false; // Altijd laadstatus beëindigen
    }
  });
</script>

<main>
  <h1>Waar in Europa moet ik heen om te bakken? 🥵🏝️🍹🌞</h1>
  <p>Last minute op vakantie? Bekijk hier de ideale zonbestemming!</p>

  {#if loadingError}
    <!-- Foutmelding -->
    <p style="color: red;">{loadingError}</p>
  {:else if loading}
    <!-- Laadstatus -->
    <p>Laden en berekenen van zonuren...</p>
  {:else if top10Data.length > 0}
    <!-- Data beschikbaar -->
    <div class="chart-container">
      <BarChart data={top10Data} />
    </div>
  {:else}
    <!-- Geen data -->
    <p>Geen data beschikbaar om te tonen.</p>
  {/if}
</main>
