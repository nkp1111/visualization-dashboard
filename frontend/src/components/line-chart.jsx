import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as d3 from "d3";

const MARGIN = { top: 20, bottom: 50, left: 50, right: 20 }
const HEIGHT = 400;

export default function LineChart({ data = [] }) {

  const d3ContainerRef = useRef();
  const [dataset, setDataset] = useState([]);

  useEffect(() => {
    setDataset(() => data.filter(d => d.end_year).sort((a, b) => a.end_year - b.end_year));
  }, [data]);

  useEffect(() => {
    const format = d3.timeFormat("%Y")

    if (d3ContainerRef.current) {
      const svg = d3.select(d3ContainerRef.current)
        .attr("height", HEIGHT)
        .style("background-color", "transparent");

      const svgEl = svg.node();
      const { width } = svgEl.getBoundingClientRect();
      const innerWidth = width - MARGIN.left - MARGIN.right;
      const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

      svg.selectAll("*").remove();
      const mainEl = d3.select(d3ContainerRef.current).append("g")
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

      // add x-axis to chart
      const xValue = d => new Date(d.end_year, 0);
      const xScale = d3.scaleTime()  // x-scale
        .domain(d3.extent(dataset, xValue))
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
      const extent1 = d3.extent(dataset, yValue1);
      const extent2 = d3.extent(dataset, yValue2);
      const extent3 = d3.extent(dataset, yValue3);
      const yScale = d3.scaleLinear()
        .domain([Math.min(extent1[0], extent2[0], extent3[0]), Math.max(extent1[1], extent2[1], extent3[1])]) // to do
        .range([innerHeight, 0])
        .nice()
      const yAxis = d3.axisLeft(yScale)
      mainEl.append("g")
        .attr("class", "tick")
        .call(yAxis);

      const line1 = d3.line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue1(d)))
        .curve(d3.curveNatural)

      const line2 = d3.line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue2(d)))
        .curve(d3.curveNatural)

      const line3 = d3.line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue3(d)))
        .curve(d3.curveNatural)

      mainEl.append("path")
        .attr("class", "line-path stroke-red-500")
        .datum(dataset)
        .attr("d", line1)
        .attr("fill", "none")
        .attr("stroke-width", 2)

      mainEl.append("path")
        .attr("class", "line-path stroke-green-500")
        .datum(dataset)
        .attr("d", line2)
        .attr("fill", "none")
        .attr("stroke-width", 2)

      mainEl.append("path")
        .attr("class", "line-path stroke-blue-500")
        .datum(dataset)
        .attr("d", line3)
        .attr("fill", "none")
        .attr("stroke-width", 2)
    }
  }, [data]);


  return (
    <article className="my-5 w-full border-2 border-base-200 p-3">
      <h3 className="text-base-content mt-2">Trends of <em>Relevance</em>, <em>Intensity</em>, and <em>Likelihood</em> over time</h3>
      <div className="flex gap-5 items-center mt-2 ps-6">
        <label className="flex items-center gap-2">
          <input type="radio" name="radio-7" value="relevance" className="radio radio-info" />
          <span className="cursor-pointer">Relevance</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="radio-7" value="intensity" className="radio radio-info" />
          <span className="cursor-pointer">Intensity</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="radio-7" value="likelihood" className="radio radio-info" />
          <span className="cursor-pointer">Likelihood</span>
        </label>
      </div>
      <svg
        className="d3-component w-full"
        ref={d3ContainerRef}
      />
    </article>
  )
}


LineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
}