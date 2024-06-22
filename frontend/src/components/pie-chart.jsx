import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as d3 from "d3";


const MARGIN = { top: 20, bottom: 60, left: 70, right: 20 }
const HEIGHT = 400;

// TODO: add pie chart for other topics too

export default function PieChart({ data = [] }) {
  const [topDataToShow, setTopDataToShow] = useState(8);
  const d3ContainerRef5 = useRef();  // svg reference
  useEffect(() => {
    if (d3ContainerRef5.current) {
      const svg = d3.select(d3ContainerRef5.current)
        .attr("height", HEIGHT)
        .style("background-color", "transparent");

      const svgEl = svg.node();
      const { width } = svgEl.getBoundingClientRect();  // get svg width for margin
      const innerWidth = width - MARGIN.left - MARGIN.right;
      const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
      const radius = Math.min(innerWidth, innerHeight) / 2;

      svg.selectAll("*").remove(); // remove old graph elements
      const mainEl = svg.append("g")
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

      // summation of topics and its total count in db
      let aggregatedData = Array.from(
        d3.group(data, d => d.topic),
        ([key, values]) => ({ topic: key, count: values.length })
      )

      aggregatedData = aggregatedData.filter(item => item.topic);
      const totalCount = aggregatedData.reduce((acc, item) => acc + item.count, 0);

      let topAggregatedData = aggregatedData.sort((a, b) => b.count - a.count).slice(0, topDataToShow);
      topAggregatedData.push({
        topic: "others",
        count: aggregatedData.slice(topDataToShow,).reduce((acc, item) => acc + item.count, 0),
      });
      topAggregatedData = topAggregatedData.sort((a, b) => b.count - a.count);

      const pie = d3.pie()
        .value(d => d.count)(topAggregatedData);

      const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

      const outerArc = d3.arc()
        .innerRadius(radius * 1.1)
        .outerRadius(radius * 1.1);

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      const pie1 = mainEl.append("g")
        .attr("transform", `translate(${width / 2}, ${(HEIGHT / 2) + 10})`)

      pie1.selectAll("polyline")
        .data(pie)
        .enter()
        .append("polyline")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("points", (d, i, nodes) => {
          let posA = arc.centroid(d); // line start at slice
          let posB = outerArc.centroid(d); // line end at outerArc
          let posC = outerArc.centroid(d); // label position
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          posC[0] = radius * 1.3 * (midAngle < Math.PI ? 1 : -1); // adjust label position
          if (i >= nodes.length - 2) {
            const lastLabelAdjustment = (i === nodes.length - 2) ? -10 : -30;
            posC[1] += lastLabelAdjustment; // line end before text (x,y)
          }
          return [posA, posB, posC];
        });

      pie1.selectAll("path")
        .data(pie)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => color(i))
        .append("title")
        .text(d => `${d.data.topic} - ${Math.round((d.data.count / totalCount) * 10000) / 100}%`);

      const labelPositions = [];
      pie1.selectAll("text")
        .data(pie)
        .enter()
        .append("text")
        .attr("class", "capitalize stroke-white text-base stroke-1")
        .attr("transform", (d, i, nodes) => {
          const pos = outerArc.centroid(d);
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          pos[0] = radius * 1.35 * (midAngle < Math.PI ? 1 : -1);
          console.log(d)

          // Check for collisions and adjust position
          let collide = true;
          while (collide) {
            collide = false;
            for (const p of labelPositions) {
              if (Math.abs(p[1] - pos[1]) < 5) { // Minimum distance between labels
                pos[1] += 5; // Adjust position to avoid collision
                collide = true;
              }
            }
          }

          if (i >= nodes.length - 2) {
            const lastLabelAdjustment = (i === nodes.length - 2) ? -35 : -10;
            pos[1] += lastLabelAdjustment;
          }

          labelPositions.push(pos);
          return `translate(${pos})`;
        })
        .attr("text-anchor", d => {
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          return midAngle < Math.PI ? "start" : "end";
        })
        .attr("alignment-baseline", "middle")
        // .attr("dy", "0.35em")
        .text(d => d.data.topic + ": " + Math.round((d.data.count / totalCount) * 10000) / 100 + "%");


      // mainEl.append("text")
      //   .text("All Topics")
      //   .attr("x", 300)
      //   .attr("y", 10)
      //   .attr("class", "text-xl")
    }
  }, [data]);

  return (
    <article className="my-5 w-full border-2 border-base-200 p-3">
      <h3 className="text-xl text-base-content mt-3">Distribution of Topics</h3>

      <svg
        className="d3-component w-full stroke-base-content"
        ref={d3ContainerRef5}
      />
    </article>
  )
}


PieChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
}