import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as d3 from "d3";

const MARGIN = { top: 20, bottom: 60, left: 60, right: 20 }
const HEIGHT = 400;

export default function LineChart({ data = [] }) {

  const d3ContainerRef = useRef();  // svg reference
  const [dataset, setDataset] = useState([]);
  // change line chart based on trend to view
  const [chosenTrend, setChosenTrend] = useState("all");
  const handleTrendChange = (newTrend) => {
    setChosenTrend(() => newTrend);
  }

  useEffect(() => {
    // filter and sort data for end year for line chart
    setDataset(() => data.filter(d => d.end_year).sort((a, b) => a.end_year - b.end_year));
  }, [data]);

  useEffect(() => {
    const format = d3.timeFormat("%Y"); // format time to get only year
    const aggregatedData = Array.from(  // group data according to end year
      d3.group(dataset, d => d.end_year),
      ([key, values]) => ({
        year: new Date(key, 0, 1),
        intensity: d3.mean(values, d => d.intensity),
        relevance: d3.mean(values, d => d.relevance),
        likelihood: d3.mean(values, d => d.likelihood),
      })
    );

    if (d3ContainerRef.current) {
      const svg = d3.select(d3ContainerRef.current)
        .attr("height", HEIGHT)
        .style("background-color", "transparent");

      const svgEl = svg.node();
      const { width } = svgEl.getBoundingClientRect();  // get svg width for margin
      const innerWidth = width - MARGIN.left - MARGIN.right;
      const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

      svg.selectAll("*").remove(); // remove old graph elements
      const mainEl = d3.select(d3ContainerRef.current).append("g")
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

      // add x-axis to chart
      const xValue = d => d.year;
      const xScale = d3.scaleTime()  // x-scale
        .domain(d3.extent(aggregatedData, xValue))
        .range([0, innerWidth])
        .nice()
      const xAxis = d3.axisBottom(xScale)
        .tickFormat((d) => format(d));
      mainEl.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .attr("class", "tick")
        .call(xAxis)

      // add y-axis to chart
      const yValue1 = d => d.intensity;
      const yValue2 = d => d.relevance;
      const yValue3 = d => d.likelihood;

      // Calculate the minimum and maximum values for each y-value
      let minYValue = d3.min(aggregatedData, d => Math.min(yValue1(d), yValue2(d), yValue3(d)));
      let maxYValue = d3.max(aggregatedData, d => Math.max(yValue1(d), yValue2(d), yValue3(d)));

      switch (chosenTrend) {
        case "intensity":
          minYValue = d3.min(aggregatedData, d => yValue1(d));
          maxYValue = d3.max(aggregatedData, d => yValue1(d));
          break;
        case "relevance":
          minYValue = d3.min(aggregatedData, d => yValue2(d));
          maxYValue = d3.max(aggregatedData, d => yValue2(d));
          break;
        case "likelihood":
          minYValue = d3.min(aggregatedData, d => yValue3(d));
          maxYValue = d3.max(aggregatedData, d => yValue3(d));
          break;
        default:
          console.log("All trend chosen")
          break;
      }

      const yExtent = [minYValue, maxYValue];
      const yScale = d3.scaleLinear()
        .domain(yExtent)
        .range([innerHeight, 0])
        .nice()
      const yAxis = d3.axisLeft(yScale)
      mainEl.append("g")
        .attr("class", "tick")
        .call(yAxis);


      // Add the legend
      const legendGroup = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${innerWidth - 50}, 30)`);


      // adding lines on chart
      const lineGenerator = (yMetric) => {
        return d3.line()
          .x(d => xScale(xValue(d)))
          .y(d => yScale(yMetric(d)))
          .curve(d3.curveNatural)
      }
      const metrics = [
        { label: "intensity", class: "stroke-red-500", color: "#ef4444", yMetric: yValue1 },
        { label: "relevance", class: "stroke-blue-500", color: "#3b82f6", yMetric: yValue2 },
        { label: "likelihood", class: "stroke-green-500", color: "#22c55e", yMetric: yValue3 },
      ]
      metrics.forEach((metric, index) => {
        // add line on condition
        if (["all", metric.label].includes(chosenTrend)) {
          // create line
          const line = lineGenerator(metric.yMetric);
          // add line 
          mainEl.append("path")
            .attr("class", `${metric.class}`)
            .datum(aggregatedData)
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round");
          // add legend
          const legendRow = legendGroup.append("g")
            .attr("class", "legend-row")
            .attr("transform", `translate(0, ${index * 20})`);
          legendRow.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", metric.color);
          legendRow.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .attr("class", "stroke-base-content")
            .text(metric.label);
        }
      })

      // adding labels on chart
      const xAxisLabelOffset = 50;
      const yAxisLabelOffset = 35;
      const labels = [
        { text: "End Year", x: innerWidth / 2, y: innerHeight + xAxisLabelOffset, class: "" },
        { text: "Trends", y: -yAxisLabelOffset, x: -innerHeight / 2, class: `-rotate-90 ` },
      ]
      labels.forEach(label => {
        mainEl.append("text")
          .attr("class", `label ${label.class}`)
          .text(label.text)
          .attr("x", label.x)
          .attr("y", label.y)
      })


    }

  }, [data, chosenTrend]);


  return (
    <article className="my-5 w-full border-2 border-base-200 p-3">
      <h3 className="text-xl text-base-content mt-3">Trends of <em>Relevance</em>, <em>Intensity</em>, and <em>Likelihood</em> over time</h3>
      <div className="flex gap-5 items-center my-3 ps-6">
        <label className="flex items-center gap-2">
          <input type="radio"
            name="radio-7"
            value="relevance"
            className="radio radio-info"
            onChange={(e) => handleTrendChange(e.target.value)}
            checked={chosenTrend === "relevance"} />
          <span className="cursor-pointer">Relevance</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio"
            name="radio-7"
            value="intensity"
            className="radio radio-info"
            onChange={(e) => handleTrendChange(e.target.value)}
            checked={chosenTrend === "intensity"} />
          <span className="cursor-pointer">Intensity</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio"
            name="radio-7"
            value="likelihood"
            className="radio radio-info"
            onChange={(e) => handleTrendChange(e.target.value)}
            checked={chosenTrend === "likelihood"} />
          <span className="cursor-pointer">Likelihood</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio"
            name="radio-7"
            value="all"
            className="radio radio-info"
            onChange={(e) => handleTrendChange(e.target.value)}
            checked={chosenTrend === "all"} />
          <span className="cursor-pointer">All</span>
        </label>
      </div>
      <svg
        className="d3-component w-full stroke-base-content"
        ref={d3ContainerRef}
      />
    </article>
  )
}


LineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
}