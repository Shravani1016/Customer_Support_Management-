'use client';
import { useState, useEffect } from 'react';

export const COUNTRIES = [
  { iso: 'IN', name: 'India', dialCode: '+91', length: 10 },
  { iso: 'US', name: 'United States', dialCode: '+1', length: 10 },
  { iso: 'GB', name: 'United Kingdom', dialCode: '+44', length: 10 },
  { iso: 'AU', name: 'Australia', dialCode: '+61', length: 9 },
  { iso: 'AE', name: 'UAE', dialCode: '+971', length: 9 },
  { iso: 'SG', name: 'Singapore', dialCode: '+65', length: 8 },
  { iso: 'DE', name: 'Germany', dialCode: '+49', length: 11 },
  { iso: 'FR', name: 'France', dialCode: '+33', length: 9 },
  { iso: 'CA', name: 'Canada', dialCode: '+1', length: 10 },
  { iso: 'JP', name: 'Japan', dialCode: '+81', length: 10 },
] as const;

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
}

function parseValue(value: string) {
  const match = value.match(/^(\+\d{1,4})\s?(.*)$/);
  if (match) {
    const dialCode = match[1];
    const country = COUNTRIES.find((c) => c.dialCode === dialCode) || COUNTRIES[0];
    return { country, number: match[2] };
  }
  return { country: COUNTRIES[0], number: value.replace(/\D/g, '') };
}

export default function PhoneInput({ value, onChange }: PhoneInputProps) {
  const parsed = parseValue(value);
  const [country, setCountry] = useState(parsed.country);
  const [number, setNumber] = useState(parsed.number);

  useEffect(() => {
    const p = parseValue(value);
    setCountry(p.country);
    setNumber(p.number);

    // Legacy values (no leading "+") get silently upgraded to E.164 as soon as
    // this component mounts, so an edit form can be saved without the user
    // ever touching the phone field.
    if (value && !value.trim().startsWith('+')) {
      onChange(`${p.country.dialCode} ${p.number}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  
  const emit = (c: typeof country, n: string) => {
    onChange(n ? `${c.dialCode} ${n}` : '');
  };

  return (
    <div className="flex gap-2">
      <select
        value={country.iso}
        onChange={(e) => {
          const newCountry = COUNTRIES.find((c) => c.iso === e.target.value) || COUNTRIES[0];
          setCountry(newCountry);
          const trimmed = number.slice(0, newCountry.length);
          setNumber(trimmed);
          emit(newCountry, trimmed);
        }}
        className="border dark:border-gray-600 rounded-lg px-2 py-2 text-sm text-black dark:text-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
      >
        {COUNTRIES.map((c) => (
          <option key={c.iso} value={c.iso}>
            {c.dialCode} {c.iso}
          </option>
        ))}
      </select>
      <input
        type="tel"
        placeholder={`Phone (${country.length} digits)`}
        maxLength={country.length}
        value={number}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, country.length);
          setNumber(digits);
          emit(country, digits);
        }}
        className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white dark:bg-gray-900 w-full"
      />
    </div>
  );
}