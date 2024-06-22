import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as d3 from "d3";

const MARGIN = { top: 20, bottom: 60, left: 50, right: 20 }
const HEIGHT = 400;

export default function BarGraph({ data = [] }) {

  const d3ContainerRef2 = useRef();  // svg reference
  const [aggregatedData, setAggregatedData] = useState(data);
  const [totalCountryCount, setTotalCountryCount] = useState(0);
  const [resultRange, setResultRange] = useState({ st: 0, lt: 10 });

  useEffect(() => {
    let aggregatedData = Array.from(
      d3.group(data, d => d.country),
      ([key, values]) => ({ country: key, count: values.length })
    )
      .sort((a, b) => b.count - a.count)
      .filter(d => d.country);

    setTotalCountryCount(() => aggregatedData.length);
    aggregatedData = aggregatedData.slice(resultRange.st, resultRange.lt);
    setAggregatedData(aggregatedData);
  }, [data, resultRange]);

  useEffect(() => {
    if (d3ContainerRef2.current) {
      const svg = d3.select(d3ContainerRef2.current)
        .attr("height", HEIGHT)
        .style("background-color", "transparent");

      const svgEl = svg.node();
      const { width } = svgEl.getBoundingClientRect();  // get svg width for margin
      const innerWidth = width - MARGIN.left - MARGIN.right;
      const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

      svg.selectAll("*").remove(); // remove old graph elements
      const mainEl = d3.select(d3ContainerRef2.current).append("g")
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

      // add x-axis to chart
      const xValue = d => d.count;
      const xScale = d3.scaleLinear()  // x-scale
        .domain([0, d3.max(aggregatedData, xValue)])
        .range([0, innerWidth])
        .nice()
      const xAxis = d3.axisBottom(xScale);
      mainEl.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .attr("class", "tick")
        .call(xAxis)

      // add y-axis to chart
      const yValue = d => d.country;
      const yScale = d3.scaleBand()
        .domain(aggregatedData.map(yValue))
        .range([0, innerHeight])
        .paddingInner(0.17);
      const yAxis = d3.axisLeft(yScale)
      mainEl.append("g")
        .attr("class", "tick")
        .call(yAxis)
        .selectAll("text")
        .attr("transform", "scale(0)")  //remove y-axis text

      mainEl.append("g")
        .attr("class", "fill-green-800")
        // .attr("transform", `translate(${0}, ${0})`)
        .selectAll("rect")
        .data(aggregatedData)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d) => yScale(yValue(d)))
        .attr("width", (d) => xScale(xValue(d)))
        .attr("height", yScale.bandwidth())
        .append("title")
        .text((d) => `Count: ${xValue(d)}`);  // Custom title

      mainEl.append("g")
        .attr("class", "stroke-base-content fill-base-content")
        .selectAll("text")
        .data(aggregatedData)
        .enter()
        .append("text")
        .attr("class", "stroke-white translate-y-6")
        .attr("x", 5)
        .attr("y", (d) => yScale(yValue(d)))
        .text((d) => d.country)

      mainEl.append("g")
        .selectAll("line")
        .data(xScale.ticks())
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${xScale(d)}, 0)`)
        .append("line")
        .attr("y2", innerHeight)
        .attr("stroke", "#c0c0bb")

      mainEl.append("text")
        .text("Count")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 50)

      mainEl.append("text")
        .attr("class", "-rotate-90")
        .text("Country")
        .attr("x", -innerHeight / 2)
        .attr("y", -15)
    }

  }, [aggregatedData, resultRange]);

  return (
    <article className="my-5 w-full border-2 border-base-200 p-3">
      <h3 className="text-xl text-base-content mt-3">Number of events of country</h3>

      {/* <div className="my-3 flex gap-2 items-center">
        <label htmlFor="country-range">Country by range</label>
        <select
          className="select select-bordered  w-32"
          id="country-range"
          defaultValue={0}
          onChange={(e) => {
            const index = parseInt(e.target.value);
            setResultRange(() => ({ st: index * 10, lt: (index + 1) * 10 }));
          }}
        >
          {Array(Math.ceil(totalCountryCount / 10)).fill(0).map((_, index) => (
            <option
              key={index}
              value={index}
            >{index * 10} - {(index + 1) * 10}</option>
          ))}
        </select>
      </div> */}

      <svg
        className="d3-component w-full stroke-base-content"
        ref={d3ContainerRef2}
      />
    </article>
  )
}


BarGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
}