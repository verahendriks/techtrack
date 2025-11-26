<script>
  // ------------------------------------------------------------------
  // Imports
  // ------------------------------------------------------------------
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import {
    formatDuration,
    formatDate,
    kmhToBeaufort,
  } from "$lib/chartUtils.js";
  import { loadSearchCities, fetchSingleCityWeather } from "$lib/rankingCities";

  // ------------------------------------------------------------------
  // Props
  // ------------------------------------------------------------------
  export let data;
  export let height = 450;
  export let selectedMetric = "averageHours";
  export let yLabel = "Meeste zonuren";
  export let selectedCity = null;

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  let searchList = [];
  let searchTerm = "";
  let searchResults = [];

  // HTML Element referenties
  let svgContainer;
  let tooltipContainer;

  // Configuratie
  const colors = {
    averageHours: "#FFBC23",
    maxTemp: "#F45023",
    maxUV: "#FF9219",
  };

  // Marges voor de grafiek
  let MARGIN = { top: 20, right: 50, bottom: 50, left: 150 };

  // ------------------------------------------------------------------
  // Lifecycle & Reactivity
  // ------------------------------------------------------------------
  onMount(async () => {
    searchList = await loadSearchCities();
  });

  // Zoekfunctie logica
  $: if (searchTerm.length > 0) {
    searchResults = searchList
      .filter((city) =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5);
  } else {
    searchResults = [];
  }

  // Hertekenen als data verandert
  $: if (data && svgContainer && selectedMetric && yLabel) {
    drawChart(data);
  }

  // ------------------------------------------------------------------
  // Interactie Functies
  // ------------------------------------------------------------------
  async function switchCity(city) {
    searchTerm = "";
    searchResults = [];
    const newData = await fetchSingleCityWeather(city);

    if (newData) {
      selectedCity = newData;
      // Scroll naar detailpaneel
      setTimeout(() => {
        document
          .querySelector(".detail-panel")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 10);
    }
  }

  // Bepaal tekst en label voor de tooltip
  function getRatingAndLabel(dataPoint, metric) {
    const value = dataPoint[metric];

    if (metric === "averageHours") {
      if (value < 5) return { rating: "☁️ Weinig", label: "Zonuren", unit: "" };
      if (value < 9)
        return { rating: "⛅ Redelijk", label: "Zonuren", unit: "" };
      return { rating: "☀️ Veel zon", label: "Zonuren", unit: "" };
    }

    if (metric === "maxTemp") {
      if (value < 18)
        return { rating: "🧥 Fris", label: "Temperatuur", unit: " °C" };
      if (value < 24)
        return { rating: "👕 Aangenaam", label: "Temperatuur", unit: " °C" };
      if (value < 30)
        return { rating: "😎 Warm", label: "Temperatuur", unit: " °C" };
      return { rating: "🥵 Heet", label: "Temperatuur", unit: " °C" };
    }

    if (metric === "maxUV") {
      if (value < 3) return { rating: "🟢 Laag", label: "UV-Index", unit: "" };
      if (value < 6) return { rating: "🟡 Matig", label: "UV-Index", unit: "" };
      if (value < 8) return { rating: "🟠 Sterk", label: "UV-Index", unit: "" };
      return { rating: "🔴 Zeer sterk", label: "UV-Index", unit: "" };
    }

    return { rating: "", label: "", unit: "" };
  }

  // Tooltip tonen (Tabel)
  function showTableTooltip(event, text) {
    const tooltip = d3.select(tooltipContainer);
    tooltip
      .style("opacity", 1)
      .html(text)
      .style("left", event.clientX + 15 + "px")
      .style("top", event.clientY + 15 + "px");
  }

  // Tooltip verbergen
  function hideTableTooltip() {
    d3.select(tooltipContainer).style("opacity", 0);
  }

  // ------------------------------------------------------------------
  // D3 Chart Logica
  // ------------------------------------------------------------------
  function drawChart(chartData) {
    if (!svgContainer || !chartData?.length) return;

    // 1. Bereken dynamische marge
    const maxNameLength = d3.max(
      chartData,
      (dataPoint) => (dataPoint.shortName || dataPoint.name).length
    );
    MARGIN.left = Math.max(110, Math.min(250, maxNameLength * 9));

    // 2. Afmetingen
    const containerWidth = svgContainer.clientWidth;
    const CHART_WIDTH = containerWidth - MARGIN.left - MARGIN.right;
    const CHART_HEIGHT = height - MARGIN.bottom;

    // 3. SVG Opzetten
    const svg = d3
      .select(svgContainer)
      .html("")
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // 4. Schalen (Scales)
    const yScale = d3
      .scaleBand()
      .domain(chartData.map((dataPoint) => dataPoint.shortName))
      .range([0, CHART_HEIGHT])
      .padding(0.25);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (dataPoint) => dataPoint[selectedMetric])])
      .range([0, CHART_WIDTH]);

    // 5. Grid
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

    // 6. Bars tekenen
    const tooltip = d3.select(tooltipContainer);

    svg
      .selectAll("rect")
      .data(chartData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", xScale(0))
      .attr("y", (dataPoint) => yScale(dataPoint.shortName))
      .attr("height", yScale.bandwidth())
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", colors[selectedMetric] || "#FEA600")
      .attr("width", 0)

      // Events
      .on("mouseover", () => tooltip.style("opacity", 1))
      .on("mousemove", (event, dataPoint) => {
        const { rating, label, unit } = getRatingAndLabel(
          dataPoint,
          selectedMetric
        );
        let displayValue = dataPoint[selectedMetric];

        if (selectedMetric === "averageHours") {
          displayValue = formatDuration(displayValue * 3600);
        }

        tooltip
          .style("opacity", 1)
          .html(
            `<b>${dataPoint.name}</b><br/>${label}: ${displayValue}${unit}<br/>${rating}<br/><div class="tooltip-hint">👆 Klik voor details</div>`
          )
          .style("left", event.clientX + 15 + "px")
          .style("top", event.clientY + 15 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0))
      .on("click", (event, dataPoint) => {
        if (!dataPoint.forecast) {
          console.warn("Geen details voor", dataPoint.name);
          return;
        }
        selectedCity = dataPoint;

        // Scrollen
        setTimeout(() => {
          document
            .querySelector(".detail-panel")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 10);
      })
      // Animatie
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .attr("width", (dataPoint) => xScale(dataPoint[selectedMetric]));

    // 7. Assen
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${CHART_HEIGHT})`)
      .call(d3.axisBottom(xScale).ticks(5));

    const yAxis = svg
      .append("g")
      .attr("class", "axis-y")
      .call(d3.axisLeft(yScale));

    xAxis.select(".domain").remove();
    yAxis.select(".domain").remove();
    yAxis.selectAll(".tick line").remove();
  }
</script>

<div class="d3-container">
  <div bind:this={svgContainer}></div>

  <div class="chart-tooltip" bind:this={tooltipContainer}></div>

  {#if selectedCity && selectedCity.forecast}
    <div class="detail-panel">
      <div class="panel-header">
        <div class="header-text">
          <h3>Weersvoorspelling: {selectedCity.name}</h3>
          <p class="subtitle">Verwachting voor de komende zeven dagen</p>
        </div>
        <div class="header-actions">
          <div class="mini-search">
            <input
              type="text"
              placeholder="🔍 Andere stad..."
              bind:value={searchTerm}
            />
            {#if searchResults.length > 0}
              <ul class="mini-results">
                {#each searchResults as city}
                  <button on:click={() => switchCity(city)}>{city.name}</button>
                {/each}
              </ul>
            {/if}
          </div>
          <button class="close-button" on:click={() => (selectedCity = null)}
            >&times;</button
          >
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th
              on:mousemove={(event) =>
                showTableTooltip(
                  event,
                  "<b>Datum</b><br>De dag waarvoor deze voorspelling geldt."
                )}
              on:mouseleave={hideTableTooltip}>📅 Datum</th
            >
            <th
              on:mousemove={(event) =>
                showTableTooltip(
                  event,
                  "<b>Zonuren</b><br>Verwacht aantal uren zon."
                )}
              on:mouseleave={hideTableTooltip}>☀️ Zonuren</th
            >
            <th
              on:mousemove={(event) =>
                showTableTooltip(
                  event,
                  "<b>Temperatuur</b><br>Min / Max temperatuur."
                )}
              on:mouseleave={hideTableTooltip}>🌡️ Temp</th
            >
            <th
              on:mousemove={(event) =>
                showTableTooltip(
                  event,
                  "<b>UV-index</b><br>Maximale zonkracht."
                )}
              on:mouseleave={hideTableTooltip}>⛱️ UV</th
            >
            <th
              on:mousemove={(event) =>
                showTableTooltip(
                  event,
                  "<b>Wind</b><br>Snelheid in km/h (en Beaufort)."
                )}
              on:mouseleave={hideTableTooltip}>💨 Wind</th
            >
          </tr>
        </thead>
        <tbody>
          {#each selectedCity.forecast as day}
            <tr>
              <td>{formatDate(day.date)}</td>

              <td>{formatDuration(day.sunSeconds)}</td>

              <td>
                {#if day.minTemp !== null}
                  {day.minTemp} / {day.maxTemp} °C
                {:else}
                  {day.maxTemp} °C
                {/if}
              </td>

              <td>{day.uvIndex}</td>

              <td>
                {#if day.windSpeed !== null}
                  {day.windSpeed} km/h (Bft {kmhToBeaufort(day.windSpeed)})
                {:else}
                  -
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
