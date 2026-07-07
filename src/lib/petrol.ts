export interface FuelPrice {
  cityTe: string;
  cityEn: string;
  petrol: number;
  diesel: number;
}

export const FUEL_PRICES: FuelPrice[] = [
  { cityTe: "విశాఖపట్నం", cityEn: "Visakhapatnam", petrol: 109.15, diesel: 97.02 },
  { cityTe: "హైదరాబాద్", cityEn: "Hyderabad", petrol: 109.66, diesel: 97.82 },
  { cityTe: "విజయవాడ", cityEn: "Vijayawada", petrol: 110.22, diesel: 98.15 },
  { cityTe: "గుంటూరు", cityEn: "Guntur", petrol: 110.45, diesel: 98.34 },
  { cityTe: "తిరుపతి", cityEn: "Tirupati", petrol: 111.12, diesel: 98.98 },
  { cityTe: "వరంగల్", cityEn: "Warangal", petrol: 109.18, diesel: 97.35 }
];

export function getFuelPriceForCity(cityEn: string): FuelPrice {
  const clean = cityEn.toLowerCase();
  const found = FUEL_PRICES.find(f => f.cityEn.toLowerCase() === clean);
  return found ?? FUEL_PRICES[0]; // fallback to Visakhapatnam
}
