// components/booking/PhoneNumberInput.tsx
"use client";

import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";

// Simplified country data for example. 
// In production, import a full list or use libphonenumber-js for precise max lengths.
const COUNTRIES = [
  { code: "PH", dialCode: "+63", name: "Philippines", maxLength: 10 }, // 10 digits after +63
  { code: "US", dialCode: "+1", name: "United States", maxLength: 10 },
  { code: "GB", dialCode: "+44", name: "United Kingdom", maxLength: 10 },
  { code: "JP", dialCode: "+81", name: "Japan", maxLength: 10 },
];

interface PhoneNumberInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function PhoneNumberInput({ value, onChange }: PhoneNumberInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [localNumber, setLocalNumber] = useState("");

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search)
  );

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Regex to strip non-digits
    const digitsOnly = e.target.value.replace(/\D/g, "");
    
    if (digitsOnly.length <= selectedCountry.maxLength) {
      setLocalNumber(digitsOnly);
      onChange(`${selectedCountry.dialCode}${digitsOnly}`);
    }
  };

  return (
    <div className="flex w-full rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary dark:ring-gray-700 dark:bg-stone-900 transition-all duration-300 ease-in-out">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger className="flex items-center gap-2 rounded-l-md border-r border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-stone-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-stone-700 transition-colors focus:outline-none">
          <span className="font-medium">{selectedCountry.code}</span>
          <span className="text-gray-500 dark:text-gray-400">{selectedCountry.dialCode}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="z-50 w-[250px] rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-stone-800 p-2 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-2 pb-2 mb-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-8 w-full bg-transparent text-sm outline-none placeholder:text-gray-500 dark:text-gray-200"
                placeholder="Search country or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  className="flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-stone-700 dark:text-gray-200"
                  onClick={() => {
                    setSelectedCountry(country);
                    setOpen(false);
                    setSearch("");
                    setLocalNumber(""); // Reset local number on country change to enforce new limits
                    onChange(""); 
                  }}
                >
                  <div className="flex gap-2">
                    <span className="font-medium">{country.code}</span>
                    <span className="text-gray-500 dark:text-gray-400">{country.name}</span>
                  </div>
                  {selectedCountry.code === country.code && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <input
        type="tel"
        className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-0 bg-transparent py-2 px-3 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
        placeholder="Phone number"
        value={localNumber}
        onChange={handleNumberChange}
      />
    </div>
  );
}