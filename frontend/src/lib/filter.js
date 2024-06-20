export const applyFilter = (data, filters) => {
  // TODO: apply filter according to condition
  const dataToShow = []
  data.forEach(item => {
    let isPassed = true;

    // end year
    if (filters.end_year.length > 0 && (!item.end_year || item.end_year > filters.end_year?.[0])) {
      isPassed = false;
    }

    // others
    const allFilters = Object.keys(filters).filter(item => item !== "end_year");
    allFilters.forEach(filter => {
      if (filters[filter].length > 0 && (!item[filter] || !filters[filter].includes(item[filter]))) {
        isPassed = false;
      }
    })

    if (isPassed) {
      dataToShow.push(item);
    }
  })
  return dataToShow;
}