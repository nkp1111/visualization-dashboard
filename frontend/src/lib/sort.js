export const sortArray = (array, type = "string", options = { caseInsensitive: false }) => {
  if (!Array.isArray(array)) return [];
  return array.filter(item => item)
    .sort((a, b) => {
      if (type === "string") {
        if (options.caseInsensitive) {
          return a.toLowerCase().localeCompare(b.toLowerCase());
        }
        return a.localeCompare(b);
      }
      else {
        return a - b
      }
    })
}