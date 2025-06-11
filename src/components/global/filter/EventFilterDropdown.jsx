// src/components/global/filter/EventFilterDropdown.jsx
"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Antager du bruger Shadcn UI

export default function EventFilterDropdown({
  name,
  label: { singular, plural },
  items,
  onValueChange,
  selectedValue,
}) {
  return (
    <Select onValueChange={onValueChange} value={selectedValue || "all"}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={`Vælg ${singular.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{plural}</SelectLabel>
          <SelectItem value="all">Alle {plural.toLowerCase()}</SelectItem>
          {items.map((item) => {
            const value =
              typeof item === "object" && item !== null ? item.id : item;
            const displayLabel =
              typeof item === "object" && item !== null ? item.name : item;
            return (
              <SelectItem value={String(value)} key={String(value)}>
                {displayLabel}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
