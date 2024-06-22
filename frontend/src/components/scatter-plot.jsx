import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as d3 from "d3";


const MARGIN = { top: 20, bottom: 60, left: 70, right: 20 }
const HEIGHT = 600;

export default function ScatterPlot({ data = [] }) {

  const d3ContainerRef4 = useRef();  // svg reference

  const [chosenTrend, setChosenTrend] = useState(["relevance", "intensity"]);
  const handleTrendChange = (newTrend, index) => {
    const newTrendArr = [...chosenTrend];
    // not allow same value on both axis
    // if (index === 1 && newTrendArr[0] !== newTrend) {
    //   newTrendArr[1] = newTrend;
    //   setChosenTrend(() => newTrendArr);
    // }
    // else if (index === 0 && newTrendArr[1] !== newTrend) {
    //   newTrendArr[0] = newTrend;
    //   setChosenTrend(() => newTrendArr);
    // }

    // allow same value on both axis
    newTrendArr[index] = newTrend;
    setChosenTrend(() => newTrendArr);
  }

  useEffect(() => {
    if (d3ContainerRef4.current) {
      const svg = d3.select(d3ContainerRef4.current)
        .attr("height", HEIGHT)
        .style("background-color", "transparent");

      const svgEl = svg.node();
      const { width } = svgEl.getBoundingClientRect();  // get svg width for margin
      const innerWidth = width - MARGIN.left - MARGIN.right;
      const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
      const xAxisLabel = chosenTrend[0];
      const xlabelOffset = 45
      const yAxisLabel = chosenTrend[1];
      const ylabelOffset = 38

      svg.selectAll("*").remove(); // remove old graph elements
      const mainEl = svg.append("g")
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

      const dataset = data.filter(item => item[chosenTrend[0]] && item[chosenTrend[1]]);

      const xValue = d => d[chosenTrend[0]];
      const yValue = d => d[chosenTrend[1]];
      // x-scale
      const xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, xValue))
        .range([0, innerWidth])
        .nice()
      const xAxis = d3.axisBottom(xScale)
      mainEl.append("g")
        .attr("class", "tick")
        .attr("transform", `translate(0, ${innerHeight})`) //  to make x-axis at the bottom otherwise will be at top
        .call(xAxis)

      const yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, yValue))
        .range([0, innerHeight])
        .nice()
      const yAxis = d3.axisLeft(yScale)
      mainEl.append("g")
        .attr("class", "tick")
        .call(yAxis);


      mainEl.append("g")
        .selectAll("line")
        .data(xScale.ticks())
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${xScale(d)}, 0)`)
        .append("line")
        .attr("y2", innerHeight)
        .attr("stroke", "#c0c0bb")

      // y-axis tick marks- horizontal lines
      mainEl.append("g")
        .selectAll("line")
        .data(yScale.ticks())
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(0, ${yScale(d)})`)
        .append("line")
        .attr("x2", innerWidth)
        .attr("stroke", "#c0c0bb")

      // circle 
      mainEl.append("g")
        .attr("class", "mark")
        .selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("class", "fill-red-500")
        .attr("r", 10)
        .attr("cy", (d) => yScale(yValue(d)))
        .attr("cx", (d) => xScale(xValue(d)))
        .append("title")
        .text((d) => `(${xValue(d)}, ${yValue(d)})`)

      // x-axis label
      mainEl.append("text")
        .attr("class", "text-xl stroke-blue-500 capitalize fill-green-500")
        .text(xAxisLabel)
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + xlabelOffset)

      // y-axis label
      mainEl.append("text")
        .attr("class", "text-xl stroke-green-500 capitalize fill-green-500")
        .text(yAxisLabel)
        .attr("transform", `translate(${-ylabelOffset}, ${innerHeight / 2}) rotate(-90)`)

    }
  }, [chosenTrend, data]);

  return (
    <article className="my-5 w-full border-2 border-base-200 p-3">
      <h3 className="text-xl text-base-content mt-3">Relation between relevance, intensity and likelihood</h3>

      <div className="flex gap-5 items-center justify-between my-3 ps-6">
        <fieldset className="flex flex-wrap gap-2">
          {["relevance", "intensity", "likelihood"].map(trend => (
            <label key={trend} className="flex items-center gap-2">
              <input
                type="checkbox"
                name={trend}
                value={trend}
                className="checkbox checkbox-success"
                onChange={(e) => handleTrendChange(trend, 1)}
                checked={chosenTrend[1] === trend}
              // disabled={chosenTrend[0] === trend}
              />
              <span className="cursor-pointer">{trend.charAt(0).toUpperCase() + trend.slice(1)}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="flex flex-wrap gap-2">
          {["relevance", "intensity", "likelihood"].map(trend => (
            <label key={trend} className="flex items-center gap-2">
              <input
                type="checkbox"
                name={trend}
                value={trend}
                className="checkbox checkbox-info"
                onChange={(e) => handleTrendChange(trend, 0)}
                checked={chosenTrend[0] === trend}
              // disabled={chosenTrend[1] === trend}
              />
              <span className="cursor-pointer">{trend.charAt(0).toUpperCase() + trend.slice(1)}</span>
            </label>
          ))}
        </fieldset>
      </div>

      <svg
        className="d3-component w-full stroke-base-content"
        ref={d3ContainerRef4}
      />
    </article>
  )
}


ScatterPlot.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
}