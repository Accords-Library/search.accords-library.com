import { PricePickerFragment } from "core/graphql/generated";

export const convertPrice = (
  pricePicker: PricePickerFragment,
  targetCurrency: NonNullable<NonNullable<PricePickerFragment["currency"]>["data"]>
): number => {
  if (pricePicker.amount && pricePicker.currency?.data?.attributes && targetCurrency.attributes)
    return (
      (pricePicker.amount * pricePicker.currency.data.attributes.rate_to_usd) /
      targetCurrency.attributes.rate_to_usd
    );
  return 0;
};

export const convertMmToInch = (mm: number | null | undefined): string =>
  mm ? (mm * 0.03937008).toPrecision(3) : "";

export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min)) + min;

export const isInteger = (value: string): boolean => /^[+-]?[0-9]+$/u.test(value);

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
