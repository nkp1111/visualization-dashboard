import { serverUrl } from "../constant"


export const getDataForVisualization = async () => {
  try {
    const url = serverUrl + "/api/v1/data";
    const response = await fetch(url);
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error while fetching data", error);
    return;
  }
}