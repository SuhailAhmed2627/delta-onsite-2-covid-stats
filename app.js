var data = [];
const countrySelectDOM = document.getElementById("country-select");
const typeSelectDOM = document.getElementById("type-select");

const getOptionBlock = (value) => {
   const option = document.createElement("option");
   option.value = value;
   option.innerText = value;
   return option;
};

const init = () => {
   data.forEach((item) => {
      countrySelectDOM.appendChild(
         getOptionBlock(
            item.province == null
               ? item.country
               : `${item.country} ${item.province}`
         )
      );
   });
};

const getValues = (country, type) => {
   let values = new Array(7);

   let perDay = [];
   for (const cols = Object.entries(country.timeline[type]); cols.length; ) {
      perDay.push(cols.splice(0, 1).reduce((o, [k, v]) => ((o[k] = v), o), {}));
   }

   for (let i = perDay.length - 2; i >= 0; i--) {
      let v = perDay[i + 1];
      let u = perDay[i];

      values[i] = v[Object.keys(v)[0]] - u[Object.keys(u)[0]];
   }

   return values;
};

const getYcords = (values) => {
   const high =
      (10 ** (Math.max(...values).toString().length - 1) *
         (+Math.max(...values).toString()[0] + 1)) /
      4;

   return [0, high, 2 * high, 3 * high, 4 * high];
};

const displayData = () => {
   let yCords;
   let cases;
   let recoveries;
   let deaths;

   const country = data.filter((item) => {
      if (item.province != null) {
         return `${item.country} ${item.province}` === countrySelectDOM.value;
      }
      return item.country === countrySelectDOM.value;
   })[0];

   for (let i = 1; i < Object.keys(country.timeline.cases).length; i++) {
      document.getElementById(`y-point-${i}`).innerText = Object.keys(
         country.timeline.cases
      )[i];
   }

   if (typeSelectDOM.value == "deaths") {
      deaths = getValues(country, "deaths");
      yCords = getYcords(deaths);
      renderBars(deaths, yCords[1]);
   }

   if (typeSelectDOM.value == "cases") {
      cases = getValues(country, "cases");
      yCords = getYcords(cases);
      renderBars(cases, yCords[1]);
   }

   if (typeSelectDOM.value == "recoveries") {
      recoveries = getValues(country, "recovered");
      yCords = getYcords(recoveries);
      renderBars(recoveries, yCords[1]);
   }

   for (let i = 0; i < 5; i++) {
      document.getElementById(`x-point-${i}`).innerText =
         yCords[4] >= 10000 && i != 0 ? `${yCords[i] / 1000}k` : yCords[i];
   }
};

const renderBars = (values, base) => {
   for (let i = 0; i < values.length; i++) {
      document.getElementById(`bar-${i}`).style.height = `${Math.round(
         (values[i] * 25) / base
      )}%`;
   }
};

function fetchData() {
   fetch("https://disease.sh/v3/covid-19/historical?lastdays=8")
      .then((response) => {
         return response.json();
      })
      .then((info) => {
         data = info;
         init();
      })
      .catch((err) => console.log(err));
}

fetchData();
