import { useEffect } from 'react'
import PropTypes from "prop-types"
import * as d3 from "d3";

export default function LineChart({ data }) {

  useEffect(() => {
    console.log(data, "line chart");
  }, []);


  return (
    <div>
      Line Chart
    </div>
  )
}


LineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
}