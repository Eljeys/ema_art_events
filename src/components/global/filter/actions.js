// components/global/filter/actions.js
"use server";
import { getSMKFilter, getSMKImg } from "@/lib/api"; // <-- Importér getSMKImg

export async function filterData(prev, filter) {
  let items = [];
  let hasImgFilter = false;

  if (filter && filter.length > 0) {
    hasImgFilter = filter.some((f) => f.includes("has_image"));
  }

  if (filter && filter.length > 0) {
    items = await getSMKFilter(filter.join("&filters="), true);
  } else {
    items = await getSMKImg();
  }

  console.log("actions result:", {
    active: filter,
    data: items,
    itemCount: items.length,
  });
  return { active: filter, data: items };
}
