<script>
  // --- Imports ---
  import * as d3 from "d3"; // D3 voor data-visualisatie
  import {
    formatDuration,
    formatDate,
    kmhToBeaufort,
  } from "$lib/chartUtils.js"; // Verzameling herbruikbare functies voor grafieken

  export let data; // Input van dataset
  export let height = 500; // Hoogte van de grafiek

  export let selectedMetric = "averageHours";
  export let yLabel = "Gemiddelde zonuren";

  let selectedCity = null; // Geselecteerde stad voor detailpaneel
  let svgContainer; // DOM-container waar de SVG wordt geplaatst

  const colors = {
    averageHours: "#FFBC23",
    maxTemp: "#F45023",
    maxUV: "#FF9219",
  };

  // Marges rondom de grafiek
  const MARGIN = { top: 10, right: 15, bottom: 65, left: 145 };

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
    const yScale = d3
      .scaleBand()
      .domain(chartData.map((d) => d.shortName))
      .range([0, CHART_HEIGHT])
      .padding(0.25);

    const maxValue = d3.max(chartData, (d) => d[selectedMetric]);

    const xScale = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([0, CHART_WIDTH]);

    // Gridlijnen toevoegen
    const grid = d3
      .axisBottom(xScale)
      .tickSize(-CHART_HEIGHT)
      .tickFormat("")
      .ticks(5);

    svg
      .append("g")
      .attr("class", "grid-lines")
      .attr("transform", `translate(0,${CHART_HEIGHT})`)
      .call(grid)
      .select(".domain")
      .remove();

    // Balken tekenen
    const tooltip = d3.select("#d3-tooltip");

    svg
      .selectAll("rect")
      .data(chartData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", xScale(0))
      .attr("y", (d) => yScale(d.shortName))
      .attr("height", yScale.bandwidth())
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", colors[selectedMetric] || "#FEA600")
      .attr("width", 0)

      // Interactie
      .on("mouseover", () => tooltip.style("opacity", 1))
      .on("mousemove", (event, d) => {
        let val = d[selectedMetric];
        let unit = "";
        // Formatteren van zonuren
        if (selectedMetric === "averageHours") {
          val = formatDuration(val * 3600);
        }
        if (selectedMetric === "maxTemp") unit = " °C";

        // Bereken de x en y positie BINNEN de container
        const [x, y] = d3.pointer(event, svgContainer.parentElement);

        tooltip
          .style("left", x + 10 + "px")
          .style("top", y + 25 + "px")
          .html(`<b>${d.name}</b><br/>${yLabel}: ${val}${unit}`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0))
      .on("click", (event, d) => {
        if (!d.rawData) {
          console.log("Geen details voor", d.name);
          return;
        }
        selectedCity = d;
        setTimeout(() => {
          document
            .querySelector(".detail-panel")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      })
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .attr("width", (d) => xScale(d[selectedMetric]));

    // Assen
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${CHART_HEIGHT})`)
      .call(d3.axisBottom(xScale).ticks(5));

    const yAxis = svg
      .append("g")
      .attr("class", "axis-y")
      .call(d3.axisLeft(yScale));

    // Opruimen van assen
    xAxis.select(".domain").remove();
    yAxis.select(".domain").remove();
    yAxis.selectAll(".tick line").remove();
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
      <p class="subtitle">De komende zeven dagen</p>

      <!-- Tabel met gedetailleerde daginformatie -->
      <table>
        <thead>
          <tr>
            <th>📅 Datum</th>
            <th>☀️ Zonuren</th>
            <th>🌡️ Temp</th>
            <th>⛱️ UV</th>
            <th>💨 Wind</th>
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
              <td
                >{selectedCity.rawData.daily.temperature_2m_min[index]} / {selectedCity
                  .rawData.daily.temperature_2m_max[index]} °C</td
              >
              <td>{selectedCity.rawData.daily.uv_index_max[index]}</td>
              <td>
                {selectedCity.rawData.daily.wind_speed_10m_max[index]} km/h (Bft
                {kmhToBeaufort(
                  selectedCity.rawData.daily.wind_speed_10m_max[index]
                )})</td
              >
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
