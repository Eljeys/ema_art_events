"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

import CustomButton from "@/components/global/CustomButton";
import Step from "./Step";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";

// Definer skema med Zod til validering
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Titel skal være mindst 2 tegn.",
  }),
  locationId: z.string().min(1, {
    message: "Lokation er påkrævet.",
  }),
  date: z.date({
    required_error: "Dato er påkrævet.",
  }),
  description: z.string().optional(),
});

export function Kuratorform({ onSubmit, eventsLocations }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      locationId: "",
      date: undefined,
      description: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        <Step number="1" text="Dato og tid for event" />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titel på event</FormLabel>
              <FormControl>
                <Input placeholder="Huttelihu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokation</FormLabel>
              <Select>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Vælg en lokation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem></SelectItem>) :
                  <SelectItem disabled value="">
                    Ingen lokationer fundet.
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Dato</FormLabel>
              <FormControl>
                <DatePicker field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beskrivelse</FormLabel>
              <FormControl>
                <Textarea placeholder="Indtast beskrivelse her..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <CustomButton type="submit"></CustomButton>
      </form>
    </Form>
  );
}
