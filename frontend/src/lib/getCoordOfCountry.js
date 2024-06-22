import worldData from "world-countries";


export const getCoordinatesOfCountry = (countryName, region) => {
  let coordinates = [0, 0];
  console.log(worldData);
  worldData.forEach(data => {
    const { name, latlng } = data;
    if ([name.common.toLowerCase(), name.official.toLowerCase()].includes(countryName.toLowerCase())) {
      coordinates = latlng;
    }
  })

  return coordinates;
}