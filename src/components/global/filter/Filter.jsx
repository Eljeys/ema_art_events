"use client";
import Image from "next/image";
import { startTransition, useActionState } from "react";
import { filterData } from "./actions";
import FilterDropdown from "./FilterDropdown";

// FILTER
export default function Filter({ data, fn }) {
  return (
    <aside className="grid gap-4 mb-8 place-content-start">
      {data.map((item, id) => {
        return <FilterDropdown key={id} {...item} action={fn} />;
      })}
    </aside>
  );
}
