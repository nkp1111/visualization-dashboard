import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as d3 from "d3";
import * as topojson from "topojson-client";

import { getCoordinatesOfCountry } from "../lib/getCoordOfCountry.js"

const MARGIN = { top: 20, bottom: 60, left: 50, right: 20 }
const HEIGHT = 600;

export default function WorldMap({ data = [] }) {

  const d3ContainerRef3 = useRef();  // svg reference
  const [countryData, setCountryData] = useState({});
  const [aggregatedData, setAggregatedData] = useState([]);

  const [chosenTrend, setChosenTrend] = useState("all");
  const handleTrendChange = (newTrend) => {
    setChosenTrend(() => newTrend);
  }

  useEffect(() => {
    // get data for making world map
    const worldUrl = "https://unpkg.com/world-atlas@2.0.2/countries-50m.json"
    d3.json(worldUrl).then(data => {
      // const { countries, land } = data.objects;
      setCountryData(data)
    })
  }, []);

  useEffect(() => {
    const aggregatedDataLocal = Array.from(
      d3.group(data, d => d.country),
      ([key, values]) => {
        const [lat, lng] = getCoordinatesOfCountry(key);
        return {
          country: key,
          lat,
          lng,
          intensity: d3.mean(values, d => d.intensity),
          relevance: d3.mean(values, d => d.relevance),
          likelihood: d3.mean(values, d => d.likelihood),
        };
      }
    );

    setAggregatedData(aggregatedDataLocal);
  }, [data]);

  useEffect(() => {
    if (d3ContainerRef3.current && countryData.objects) {
      const svg = d3.select(d3ContainerRef3.current)
        .attr("height", HEIGHT)
        .style("background-color", "transparent");

      const svgEl = svg.node();
      const { width } = svgEl.getBoundingClientRect();  // get svg width for margin
      const innerWidth = width - MARGIN.left - MARGIN.right;
      const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

      svg.selectAll("*").remove(); // remove old graph elements
      const mainEl = svg.append("g")
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

      const { countries, land } = countryData.objects;
      const dataset = topojson.feature(countryData, land);

      const projection = d3.geoEqualEarth()
        .translate([innerWidth / 2, innerHeight / 2])
        .scale(innerWidth / 2 / Math.PI);
      const path = d3.geoPath(projection);
      const interiors = topojson.mesh(countryData, countries, (a, b) => a !== b);
      const graticule = d3.geoGraticule();

      mainEl.append("path")
        .attr("class", "sphere")
        .attr("d", path({ type: "Sphere" }));

      mainEl.append("path")
        .attr("class", "graticules")
        .attr("d", path(graticule()));

      mainEl.append("g")
        .selectAll("path")
        .data(dataset.features)
        .enter()
        .append("path")
        .attr("class", "land")
        .attr("d", (d) => path(d));

      mainEl.append("path")
        .attr("class", "interiors")
        .attr("d", d => path(interiors));

      const mapCoord = aggregatedData.map(d => {
        const [x, y] = projection([d.lng, d.lat]);
        d.x = x;
        d.y = y;
        return d;
      });

      const xValue = d => d.x;
      const yValue = d => d.y;

      const MaxRadius = 15; // max radius for circle
      const radiusValue1 = d => d.intensity;
      const radiusValue2 = d => d.relevance;
      const radiusValue3 = d => d.likelihood;

      let maxRadiusValue = d3.max(mapCoord, d => Math.max(radiusValue1(d), radiusValue2(d), radiusValue3(d)));

      if (chosenTrend !== "all") {
        const radiusMetric = chosenTrend === "intensity" ? radiusValue1 :
          chosenTrend === "relevance" ? radiusValue2 : radiusValue3;
        maxRadiusValue = d3.max(mapCoord, d => radiusMetric(d));
      }

      const radiusScale = d3.scaleSqrt()
        .domain([0, maxRadiusValue])
        .range([0, MaxRadius]);

      const metrics = [
        { label: "intensity", class: "stroke-red-500", color: "#ef4444", radiusMetric: radiusValue1 },
        { label: "relevance", class: "stroke-blue-500", color: "#3b82f6", radiusMetric: radiusValue2 },
        { label: "likelihood", class: "stroke-green-500", color: "#22c55e", radiusMetric: radiusValue3 },
      ];

      // Clear previous circles
      mainEl.selectAll("circle").remove();
      // Add the legend
      const legendGroup = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${innerWidth - 50}, 30)`);

      metrics.forEach((metric, index) => {
        if (chosenTrend === "all" || chosenTrend === metric.label) {
          mainEl.append("g")
            .attr("class", `circle-${metric.label}`)
            .selectAll("circle")
            .data(mapCoord)
            .enter()
            .append("circle")
            .attr("r", (d) => radiusScale(metric.radiusMetric(d)))
            .attr("cx", xValue)
            .attr("cy", yValue)
            .attr("opacity", 0.5)
            .attr("fill", metric.color);

          // add legend
          const legendRow = legendGroup.append("g")
            .attr("class", "legend-row")
            .attr("transform", `translate(0, ${index * 20})`);
          legendRow.append("circle")
            .attr("r", 8)
            .attr("transform", "translate(0, 3)")
            .attr("fill", metric.color);
          legendRow.append("text")
            .attr("x", 15)
            .attr("y", 8)
            // .attr("dy", "0.35em")
            .attr("class", "stroke-base-content")
            .text(metric.label);
        }
      });
    }
  }, [countryData, aggregatedData, chosenTrend]);

  return (
    <article className="my-5 w-full border-2 border-base-200 p-3">
      <h3 className="text-xl text-base-content mt-3">Events contribution of all countries</h3>

      <div className="flex gap-5 items-center my-3 ps-6">
        {["relevance", "intensity", "likelihood", "all"].map(trend => (
          <label key={trend} className="flex items-center gap-2">
            <input
              type="radio"
              name="radio-7"
              value={trend}
              className="radio radio-info"
              onChange={(e) => handleTrendChange(e.target.value)}
              checked={chosenTrend === trend}
            />
            <span className="cursor-pointer">{trend.charAt(0).toUpperCase() + trend.slice(1)}</span>
          </label>
        ))}
      </div>

      <svg
        className="d3-component w-full stroke-base-content"
        ref={d3ContainerRef3}
      />
    </article>
  )
}


WorldMap.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
}