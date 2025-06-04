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

  //   return (
  //     <section className="grid grid-cols-5">
  //       <aside className="grid gap-4 mb-8 place-content-start">
  //         {data.map((item, id) => {
  //           return <FilterDropdown key={id} {...item} action={handleFilter} />;
  //         })}
  //       </aside>
  //       <FilterGallery {...state} />
  //     </section>
  //   );
  // }

  // // GALLERY
  // function FilterGallery({ data }) {
  //   return (
  //     <ul className="col-span-4 grid grid-cols-3 gap-x-8 border px-4 rounded-md">
  //       <li className="contents">
  //         <article className="grid grid-rows-subgrid gap-y-6 row-span-3 py-8">
  //           <h3>Title</h3>
  //           <div className="*:not-last:mb-2">
  //             <p className="font-bold">Artist</p>
  //             <p>Teknik</p>
  //           </div>
  //         </article>
  //       </li>
  //     </ul>
  //   );
}
