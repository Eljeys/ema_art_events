import Image from "next/image";
import CustomButton from "../components/global/CustomButton";
import OpacityTextBox from "../components/global/OpacityTextBox";
export default function Home() {
  const openingHours = `Tirsdag - søndag 10 - 18 <br />
Onsdag 10 – 20 <br />
Mandag Lukket`;

  const imageUrl =
    "https://iip-thumb.smk.dk/iiif/jp2/s4655m751_kks2020_3_2.tif.jp2/full/!1024,/0/default.jpg";

  return (
    <>
      <div className="home-background-wrapper relative w-full h-full">
        <Image
          src={imageUrl}
          alt="Maleri fra Statens Museum for Kunst"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      <main className="relative z-10 w-full md:gap-(--space-1rem) md:pl-(--space-2rem)">
        <h1 className="md:w-[15ch] h-fit bg-white col-start-1 row-1 text-blue-500 rounded-md">
          Statens Museum for Kunst
        </h1>
        <CustomButton
          className="col-start-1 row-2 text-xl"
          text="Se alle begivenheder"
          link="/events"
        />
        <OpacityTextBox
          className="h-40 w-fit row-3 self-center md:col-start-2 md:row-start-3 md:mb-(--space-4rem)"
          title="Åbningstider"
          content={<p dangerouslySetInnerHTML={{ __html: openingHours }} />}
        />
      </main>
    </>
  );
}
