import { useEffect, useState } from "react";

import { getDataForVisualization } from "./services/data"

function App() {
  const [data, setData] = useState([]);
  useEffect(() => {
    getDataForVisualization()
      .then(fetchedData => {
        if (fetchedData) setData(fetchedData)
      })
      .catch(err => console.log(err));
  }, []);

  console.log('fetched data', data);
  return (
    <main className="bg-base-100 text-base-content">
      <h1 className="text-2xl text-primary text-center mt-10 mb-3">Visualization Dashboard</h1>
    </main>
  )
}

export default App
