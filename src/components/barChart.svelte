<script>
  // --- Imports ---
  import * as d3 from "d3"; // D3 voor data-visualisatie
  import { formatDuration, formatDate } from "$lib/chartUtils.js"; // Verzameling herbruikbare functies voor grafieken

  export let data; // Input van dataset
  export let height = 400; // Hoogte van de grafiek

  export let selectedMetric = "averageHours";
  export let yLabel = "Gemiddelde zonuren";

  let selectedCity = null; // Geselecteerde stad voor detailpaneel
  let svgContainer; // DOM-container waar de SVG wordt geplaatst

  const colors = {
    averageHours: "#FEA600",
    maxTemp: "#FF4500",
    maxUV: "#000000",
  };

  // Marges rondom de grafiek
  const MARGIN = { top: 20, right: 30, bottom: 100, left: 70 };

  // Hoofd-functie die de grafiek tekent of opnieuw rendert
  function drawChart(chartData) {
    // Stop direct als de container nog niet bestaat of er geen data is
    if (!svgContainer || !chartData?.length) return;

    // Bereken de beschikbare ruimte binnen de container
    const containerWidth = svgContainer.clientWidth;
    const CHART_WIDTH = containerWidth - MARGIN.left - MARGIN.right;
    const CHART_HEIGHT = height - MARGIN.bottom;

    // Nieuwe SVG aanmaken en container resetten
    const svg = d3
      .select(svgContainer)
      .html("") // verwijdert oude grafiek
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // Schalen voor X-as en Y-as
    const xScale = d3
      .scaleBand()
      .domain(chartData.map((d) => d.name))
      .range([0, CHART_WIDTH])
      .padding(0.2);

    const maxValue = d3.max(chartData, (d) => d[selectedMetric]);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([CHART_HEIGHT, 0]);

    const tooltip = d3.select("#d3-tooltip");

    // Bars tekenen + interactie toevoegen
    svg
      .selectAll("rect")
      .data(chartData, (d) => d.name)
      .join("rect")
      .attr("x", (d) => xScale(d.name))
      .attr("y", CHART_HEIGHT) // Start onderaan (voor animatie)
      .attr("width", xScale.bandwidth())
      .attr("fill", colors[selectedMetric] || "#FEA600") // Kleur op basis van gekozen modus

      // Interactie: hover, move, leave
      .on("mouseover", function () {
        d3.select(this).style("opacity", 0.7);
        tooltip.style("opacity", 1);
      })
      .on("mousemove", function (event, d) {
        let val = d[selectedMetric];
        let unit = "";
        if (selectedMetric === "averageHours") {
          val = val.toFixed(1);
          unit = " uur";
        }
        if (selectedMetric === "maxTemp") unit = " °C";
        if (selectedMetric === "totalPrecip") unit = " mm";
        if (selectedMetric === "maxUV") unit = "";

        tooltip.html(`<b>${d.name}</b><br/>${yLabel}: ${val}${unit}`);
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 1);
        tooltip.style("opacity", 0);
      })

      // Klikken: detailpaneel openen
      .on("click", (_, d) => {
        selectedCity = d;
        setTimeout(() => {
          document
            .querySelector(".detail-panel")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      })

      // Animatie bij het laden
      .transition()
      .duration(800)
      .attr("y", (d) => yScale(d[selectedMetric]))
      .attr("height", (d) => CHART_HEIGHT - yScale(d[selectedMetric]));

    // Assen tekenen
    svg
      .append("g")
      .attr("transform", `translate(0,${CHART_HEIGHT})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(yScale));
  }

  // Automatisch opnieuw tekenen wanneer data verandert
  $: if (data && svgContainer && selectedMetric && yLabel) {
    drawChart(data);
  }
</script>

<div class="d3-container">
  <!-- SVG-container.
   Deze lege <div> wordt via bind:this gekoppeld aan "svgContainer".
   D3 vult deze container later met een dynamisch gegenereerde SVG. -->
  <div bind:this={svgContainer}></div>

  <div id="d3-tooltip"></div>

  {#if selectedCity}
    <div class="detail-panel">
      <button class="close-button" on:click={() => (selectedCity = null)}>
        &times;
      </button>

      <h3>Weersvoorspelling voor {selectedCity.name}</h3>

      <!-- Tabel met gedetailleerde daginformatie -->
      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Zonuren</th>
            <th>Max Temp</th>
            <th>Max UV</th>
            <th>Max Wind</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loop door alle dagen heen.
           "index" wordt gebruikt om bijbehorende arrays (sunshine_duration, uv_index_max)
           op dezelfde positie uit te lezen. -->
          {#each selectedCity.rawData.daily.time as date, index}
            <tr>
              <td>{formatDate(date)}</td>
              <td
                >{formatDuration(
                  selectedCity.rawData.daily.sunshine_duration[index]
                )}</td
              >
              <td>{selectedCity.rawData.daily.temperature_2m_max[index]} °C</td>
              <td>{selectedCity.rawData.daily.uv_index_max[index]}</td>
              <td
                >{selectedCity.rawData.daily.wind_speed_10m_max[index]} km/h</td
              >
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
