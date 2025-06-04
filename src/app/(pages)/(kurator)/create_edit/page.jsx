import { Kuratorform } from "@/components/kurator_create_edit/KuratorForm";

export default async function CreateEdit() {
  return (
    <section>
      <h1>Opret nyt Event</h1>
      <Kuratorform />
    </section>
  );
}
