import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // Dette er shadcn/ui's Calendar
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Tilføj 'filter' og 'buttonClassName' til props
export function DatePicker({
  field,
  placeholder,
  filter,
  buttonClassName,
  locale,
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal",
            buttonClassName || "w-full", // Brug buttonClassName hvis den er der, ellers standard w-full
            !field.value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {field.value ? (
            // Sørg for at formatere med den korrekte locale
            format(field.value, "PPP", { locale: locale })
          ) : (
            <span>{placeholder || "Vælg dato"}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={field.value}
          onSelect={field.onChange}
          initialFocus
          disabled={filter} // Send 'filter' prop'en direkte til Calendar's 'disabled'
          locale={locale} // Send locale videre til Calendar
        />
      </PopoverContent>
    </Popover>
  );
}
