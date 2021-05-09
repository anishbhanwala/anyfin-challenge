import axios from "axios";

export class CountryService {
  countriesCache = null;

  fetchAll() {
    if (this.countriesCache !== null) {
      return Promise.resolve(this.countriesCache);
    }

    const timeout = axios.defaults.timeout || 10000;

    return axios
      .get("https://restcountries.eu/rest/v2/all", {
        timeout,
      })
      .then((data) => {
        this.countriesCache = data.map(({ name, population, currencies }) => {
          return { name, population, currencies };
        });

        return this.countriesCache;
      });
  }
}