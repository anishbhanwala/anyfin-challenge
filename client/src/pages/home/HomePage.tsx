import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Loading } from "../../components/Loading";
import { useLocalStorageCache } from "../../hooks/useLocalStorageCache";
import { CountryCache } from "../../typings";

export const COUNTRIES_QUERY = gql`
  query GetCountries {
    countries {
      name
      population
      currencies {
        code
        name
        symbol
      }
    }
  }
`;

export const KEY_COUNTRIES = "ac_countries";
// one day expiry
const COUNTRTY_EXPIRY_DURATION = 24 * 60 * 60 * 1000;

const checkTimestampExpiry = (countryCache: CountryCache) => {
  const lastUpdatedTs = countryCache?.lastUpdatedTs;
  return (
    lastUpdatedTs != null &&
    Date.now() - lastUpdatedTs > COUNTRTY_EXPIRY_DURATION
  );
};

export const HomePage = () => {
  const [countryCache, setCountryCache] = useLocalStorageCache<CountryCache>({
    key: KEY_COUNTRIES,
    cacheExpiryCheker: checkTimestampExpiry,
  });
  const { loading, error } = useQuery(COUNTRIES_QUERY, {
    skip: !!countryCache,
    onCompleted: (data) => {
      setCountryCache({
        lastUpdatedTs: Date.now(),
        countries: data.countries,
      });
    },
  });

  let content = (
    <div>
      <input type="text" placeholder="Enter country name" />;
      {countryCache && countryCache.countries.map((c) => <div>{c.name}</div>)}
    </div>
  );
  if (loading) {
    content = <Loading />;
  } else if (error) {
    content = <ErrorMessage message={error.message} />;
  }

  return <div>{content}</div>;
};
