import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useCallback, useState } from "react";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { Loading } from "../../../components/Loading";
import { useLocalStorageCache } from "../../../hooks/useLocalStorageCache";
import {
  Country,
  Currency,
  ExchangeRateCache,
  ExchnageRate,
} from "../../../typings";
import { SelectedCountryRow } from "./SelectedCountryRow";
import styles from "./ExchangeRateConverter.module.css";

export const EXCHANGE_RATES_QUERY = gql`
  query GetExchangeRates {
    exchangeRates {
      rates {
        name
        rate
      }
    }
  }
`;

export const KEY_EXCHANGE_RATES = "ac_exchange_rates";
const EXCHNAGE_RATE_EXPIRY_DURATION = 60 * 1000;

const checkTimestampExpiry = (exchangeRateCache: ExchangeRateCache) => {
  const lastUpdatedTs = exchangeRateCache?.lastUpdatedTs;
  return (
    lastUpdatedTs != null &&
    Date.now() - lastUpdatedTs > EXCHNAGE_RATE_EXPIRY_DURATION
  );
};

interface Props {
  countries: Array<Country>;
  onCountryRemoved: (country: Country) => void;
}

const convertToSek = (
  inputAmount: number,
  currencies: Array<Currency>,
  exchangeRates: Array<ExchnageRate>,
) => {
  return currencies.map((currency) => {
    const exchangeRate = exchangeRates.find(
      ({ name }) => name === currency.code,
    );
    return {
      // @ts-ignore
      amount: inputAmount * exchangeRate.rate,
      currency,
    };
  });
};

const getValidatedAmount = (amount: number) => {
  return Number.isNaN(amount) || amount < 0 ? 0 : amount;
};

export const ExchangeRateConverter = ({
  countries,
  onCountryRemoved,
}: Props) => {
  const [
    exchangeRateCache,
    setExchangeRateCache,
  ] = useLocalStorageCache<ExchangeRateCache>({
    key: KEY_EXCHANGE_RATES,
    cacheExpiryCheker: checkTimestampExpiry,
  });

  const { loading, error } = useQuery(EXCHANGE_RATES_QUERY, {
    skip: !!exchangeRateCache,
    onCompleted: (data) => {
      setExchangeRateCache({
        lastUpdatedTs: Date.now(),
        exchangeRates: [...data.exchangeRates.rates],
      });
    },
  });

  const [inputAmount, setInputAmount] = useState(1);

  const inputAmountHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputAmount(Number(event.target.value));
  };

  const countryRemovedHandler = useCallback(
    (country) => {
      onCountryRemoved(country);
    },
    [onCountryRemoved],
  );

  let content = <></>;
  if (exchangeRateCache?.exchangeRates && countries.length > 0) {
    content = (
      <>
        <input
          type="number"
          onChange={inputAmountHandler}
          value={inputAmount}
          min={1}
          placeholder="Enter amount to convert"
        />
        SEK
        <ul className={styles.countryList}>
          {countries.map((country) => (
            <SelectedCountryRow
              key={country.name}
              country={country}
              convertedRates={convertToSek(
                getValidatedAmount(inputAmount),
                country.currencies,
                exchangeRateCache.exchangeRates,
              )}
              onClick={countryRemovedHandler}
            />
          ))}
        </ul>
      </>
    );
  }
  if (loading) {
    content = <Loading />;
  } else if (error) {
    content = <ErrorMessage message={error.message} />;
  }

  return <div className={styles.container}>{content}</div>;
};
