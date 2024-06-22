import { useEffect, useState } from "react";

import { getDataForVisualization } from "./services/data"
import LineChart from "./components/line-chart";
import BarGraph from "./components/bar-graph"
import Filter from "./components/filter";
import WorldMap from "./components/world-map";
import ScatterPlot from "./components/scatter-plot";
import PieChart from "./components/pie-chart";

function App() {
  const [data, setData] = useState([]);
  const [dataToShow, setDataToShow] = useState([]);
  useEffect(() => {
    getDataForVisualization()
      .then(fetchedData => {
        if (fetchedData) setData(fetchedData.data)
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <main className="bg-base-100 text-base-content">
      <h1 className="text-3xl font-bold text-primary text-center mt-10 mb-3">Visualization Dashboard</h1>

      <p className="text-center">The objective is to create visualization dashboard using D3 framework.</p>

      {data && data.length > 0 ? (
        <div className="lg:w-3/4 w-full md:px-16 px-8 mx-auto flex flex-col overflow-x-hidden">
          <Filter
            data={data}
            setDataToShow={setDataToShow}
          />

          <LineChart data={dataToShow} />

          <BarGraph data={data} />

          <WorldMap data={data} />

          <ScatterPlot data={data} />

          <PieChart data={data} />
        </div>
      ) : (
        <div className="flex flex-col mt-20 items-center">
          <span className="loading loading-spinner loading-lg bg-error"></span>
          <span>No data found, check database connection...</span>
        </div>
      )}


    </main>
  )
}

export default App
