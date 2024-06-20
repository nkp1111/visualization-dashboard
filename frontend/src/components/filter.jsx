import { useEffect, useState } from 'react'
import PropTypes from 'prop-types';


import { sortArray } from "../lib/sort";
import { applyFilter } from "../lib/filter";

const FILTERS = {
  end_year: [],
  topic: [],
  sector: [],
  region: [],
  pestle: [],
  source: [],
  country: [],
  city: [],
}

export default function Filter({
  data = [],
  setDataToShow,
}) {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const handleModalChange = (show = true) => {
    const body = document.querySelector("body");
    if (show) {
      setShowFilterModal(true);
      body.classList.add("overflow-hidden", "before:fixed", "before:bg-base-content/50", "before:top-0", "before:left-0", "before:right-0", "before:bottom-0", "before:z-[25]", "before:filter", "before:backdrop-blur-sm")
    } else {
      setShowFilterModal(false);
      body.classList.remove("overflow-hidden", "before:fixed", "before:bg-base-content/50", "before:top-0", "before:left-0", "before:right-0", "before:bottom-0", "before:z-[25]", "before:filter", "before:backdrop-blur-sm")
    }
  }

  const [filterCriteria, setFilterCriteria] = useState(FILTERS);
  const [appliedFilter, setAppliedFilter] = useState(FILTERS);

  useEffect(() => {
    // go through data to get filters
    const endYears = [];
    const topics = [];
    const sectors = [];
    const regions = [];
    const pestles = [];
    const sources = [];
    const countries = [];
    const cities = [];
    data?.forEach(item => {
      const { end_year, topic, sector, region, source, country, pestle, city } = item;
      if (end_year && !endYears.includes(end_year)) endYears.push(end_year);
      if (topic && !topics.includes(topic)) topics.push(topic);
      if (sector && !sectors.includes(sector)) sectors.push(sector);
      if (region && !regions.includes(region)) regions.push(region);
      if (source && !sources.includes(source)) sources.push(source);
      if (country && !countries.includes(country)) countries.push(country);
      if (pestle && !pestles.includes(pestle)) pestles.push(pestle);
      if (city && !cities.includes(city)) cities.push(city);
    })

    setFilterCriteria({
      end_year: sortArray(endYears, "number"),
      topic: sortArray(topics),
      sector: sortArray(sectors),
      region: sortArray(regions),
      pestle: sortArray(pestles),
      source: sortArray(sources),
      country: sortArray(countries),
      city: sortArray(cities),
    })
  }, [data]);



  // by default show all data result
  useEffect(() => {
    const filteredData = applyFilter(data, appliedFilter);
    setDataToShow(() => filteredData);
  }, [appliedFilter, data, setDataToShow]);

  return (
    <section className="ms-auto">
      <h2 className="text-secondary text-lg uppercase flex gap-2 items-center cursor-pointer group"
        onClick={() => handleModalChange()}>
        <span>Filter</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="6" viewBox="0 0 11 6" fill="none" className="w-auto h-[9px] group-hover:scale-105 transition-[scale] duration-300 ease-linear">
          <rect width="11" height="1" className="fill-secondary"></rect>
          <rect x="1" y="2.5" width="9" height="1" className="fill-secondary"></rect>
          <rect x="3" y="5" width="5" height="1" className="fill-secondary"></rect>
        </svg>
      </h2>

      <aside className={`flex flex-wrap flex-col gap-3 sm:w-96 w-full fixed z-30 right-0 top-0 bottom-0 ${showFilterModal ? "block" : "hidden"} bg-base-100`}>

        <h3 className="text-secondary text-lg uppercase flex gap-2 items-center justify-between p-5">
          <span>Filter</span>
          <span className="cursor-pointer" onClick={() => handleModalChange(false)}>
            <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg" role="presentation">
              <line x1="1.35355" y1="0.445275" x2="14.0815" y2="13.1732" className="stroke-primary"></line>
              <line x1="1.01656" y1="13.3359" x2="13.7445" y2="0.607978" className="stroke-primary"></line>
            </svg>
          </span>
        </h3>

        <div className="flex-1 overflow-y-auto overflow-x-hidden justify-start p-5 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {Object.keys(filterCriteria).map(title => {
            const filtersOfTitle = filterCriteria[title];
            return (
              <div key={title} className="collapse collapse-arrow bg-base-200 mt-2">
                <input type="checkbox" name="my-accordion-2" />
                <div className="collapse-title text-xl font-medium m-1 btn whitespace-nowrap capitalize bg-transparent text-start ">
                  {title.replace("_", " ")}
                </div>
                <div className="collapse-content">
                  {filtersOfTitle.map((item) =>
                    title === "end_year" ? (
                      <div className="form-control" key={item}>
                        <label className="label cursor-pointer">
                          <span className="label-text">{item}</span>
                          <input
                            type="radio"
                            name="end_year"
                            className="radio radio-primary"
                            checked={appliedFilter.end_year?.[0] === item}
                            onChange={() => setAppliedFilter((pre) => ({ ...pre, end_year: [item] }))}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="form-control" key={item}>
                        <label className="label cursor-pointer">
                          <span className="label-text">{item}</span>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={appliedFilter[title].includes(item)}
                            onChange={
                              (e) => {
                                const checked = e.target.checked;
                                setAppliedFilter((pre) => {
                                  const updatedItem = checked
                                    ? [...pre[title], item]
                                    : pre[title].filter(titleItem => titleItem !== item);
                                  return { ...pre, [title]: updatedItem }
                                })
                              }
                            }
                          />
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="shadow-sm flex">
          <button className="btn rounded-none bg-primary-content text-primary flex-1 uppercase hover:bg-primary-content hover:opacity-95">clear filters</button>
          <button className="btn rounded-none bg-primary text-primary-content flex-1 uppercase hover:bg-primary hover:opacity-95">apply</button>
        </div>
      </aside>
    </section>
  )
}



Filter.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  setDataToShow: PropTypes.func.isRequired,
}