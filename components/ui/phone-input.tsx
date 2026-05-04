"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import * as RPNI from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Custom Input to strip italics and match luxury theme
const LuxuryInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      className={cn(
        "flex h-12 w-full bg-transparent px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border-b border-border font-sans italic-none",
        className
      )}
      style={{ fontStyle: 'normal' }} // Explicitly override any inherited italics
      ref={ref}
      {...props}
    />
  )
);
LuxuryInput.displayName = "LuxuryInput";

export function PhoneInput({ className, value, onChange, ...props }: any) {
  return (
    <RPNI.default
      className={cn("flex gap-2", className)}
      flags={flags}
      countrySelectComponent={CountrySelect}
      inputComponent={LuxuryInput}
      placeholder="Enter phone number"
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

function CountrySelect({ value, onChange, options }: any) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((option: any) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[80px] h-12 justify-between rounded-none border-x-0 border-t-0 border-b border-border bg-transparent px-2 hover:bg-primary/5"
        >
          {selectedOption ? (
            <span className="flex items-center gap-2">
              <FlagComponent country={selectedOption.value} countryName={selectedOption.label} />
            </span>
          ) : (
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 rounded-none border-primary/20">
        <Command>
          <CommandInput placeholder="Search country..." className="h-12 border-none" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options.map((option: any) => (
                <CommandItem
                  key={option.value || "ZZ"}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="flex gap-2 cursor-pointer py-3"
                >
                  <FlagComponent country={option.value} countryName={option.label} />
                  <span className="flex-1 text-xs uppercase tracking-widest">{option.label}</span>
                  {option.value && (
                    <span className="text-muted-foreground text-[10px]">
                      +{RPNI.getCountryCallingCode(option.value)}
                    </span>
                  )}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const FlagComponent = ({ country, countryName }: { country: RPNI.Country; countryName: string }) => {
  const Flag = flags[country];
  return (
    <span className="flex h-4 w-6 overflow-hidden bg-muted">
      {Flag ? <Flag title={countryName} /> : <span className="text-[10px]">{country}</span>}
    </span>
  );
};