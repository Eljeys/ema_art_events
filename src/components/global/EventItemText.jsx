"use client";
import Link from "next/link";
import Image from "next/image";

import { usePathname } from "next/navigation";
import { useState } from "react";

//Components
import CustomButton from "./CustomButton";

//Framer Motion
import {
  backInOut,
  easeInOut,
  motion,
  useAnimationControls,
} from "framer-motion";

//Shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Label } from "@/components/ui/label";

const EventItemText = ({
  id,
  title,
  description,
  date,
  location,
  totalTickets,
  bookedTickets,
  ...rest
}) => {
  const pathname = usePathname();
  const isEventsPage = pathname?.startsWith("/events");
  const isDashboardPage = pathname?.startsWith("/dashboard");
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    console.log(`Sletter event med ID: ${id}`);
    setOpen(false);
  };

  //Framer motion: Animation read more ... Hover
  const controles = useAnimationControls();
  const handleHover = () => {
    controles.start("animate");
  };
  const handleLeave = () => {
    controles.start("initial");
  };
  return (
    <Card
      className={`mb-2 flex flex-col grid-cols-2 h-full md:ml-0`}
      style={{ minWidth: "250px" }}
    >
      <CardHeader className="pr-(--space-1rem) pl-(--space-1rem) pb-(--space-1rem) relative">
        <CardTitle className="">{title}</CardTitle>
        <CardDescription className="mb-1">{date}</CardDescription>

        <CardDescription>{rest.time || "17.00"}</CardDescription>
      </CardHeader>
      <CardContent className="pr-(--space-1rem) pl-(--space-1rem) flex flex-col flex-grow">
        <p>{location?.name}</p>
        <p className="mb-2">{location?.address}</p>
        <p>{description}</p>
      </CardContent>
      <CardFooter
        className={`grid grid-cols-auto grid-rows-auto gap-(--space-2rem) items-center justify-between pr-(--space-1rem) pl-(--space-1rem) ${
          isDashboardPage
            ? "col-span-1 items-start gap-2"
            : "row-span-1 items-center justify-between"
        }`}
      >
        {isEventsPage ? (
          <>
            <div onMouseOver={handleHover} onMouseLeave={handleLeave}>
              <Link
                href={`/eventView/${id}`}
                className="flex items-start underline"
              >
                Læs mere
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="20"
                  viewBox="0 0 64 16"
                  fill="none"
                  className="ml-(--space-0_5rem) flex flex-start"
                >
                  <motion.path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    variants={{
                      initial: {
                        clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
                      },
                      animate: {
                        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                      },
                      transition: { duration: 1.25, ease: backInOut },
                    }}
                    initial="initial"
                    animate={controles}
                    leaveanimation={controles}
                    d="M54.793 0.299012C54.9805 0.111541 55.2348 0.00622559 55.5 0.00622559C55.7652 0.00622559 56.0195 0.111541 56.207 0.299012L63.207 7.29901C63.3945 7.48654 63.4998 7.74085 63.4998 8.00601C63.4998 8.27118 63.3945 8.52548 63.207 8.71301L56.207 15.713C56.0184 15.8952 55.7658 15.996 55.5036 15.9937C55.2414 15.9914 54.9906 15.8862 54.8052 15.7008C54.6198 15.5154 54.5146 15.2646 54.5123 15.0024C54.5101 14.7402 54.6108 14.4876 54.793 14.299L60.086 9.00601L1 9.29901C0.734784 9.29901 0.48043 9.19366 0.292893 9.00612C0.105357 8.81858 0 8.56423 0 8.29901C0 8.0338 0.105357 7.77944 0.292893 7.59191C0.48043 7.40437 0.734784 7.29901 1 7.29901L60.086 7.00601L54.793 1.71301C54.6055 1.52548 54.5002 1.27118 54.5002 1.00601C54.5002 0.740848 54.6055 0.48654 54.793 0.299012Z"
                    fill="black"
                  />
                </svg>
              </Link>
            </div>
            <div style={{ marginBottom: "auto" }}>
              <CustomButton
                link="/paymentpage"
                text="Tilmeld"
                onClick={() => console.log("Tilmeld")}
              />
            </div>
          </>
        ) : (
          <div
            className="flex items-center gap-2"
            style={{ marginBottom: "auto" }}
          >
            <CustomButton
              text="Rediger"
              link={`/edit_form/${id}`}
              // onClick={() => console.log("Rediger event")}
            />

            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <CustomButton text="Slet" variant="destructive" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Er du sikker på, at du vil slette dette event? Denne
                    handling kan ikke fortrydes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-end">
                  <AlertDialogCancel onClick={() => setOpen(false)}>
                    Annuller
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Slet
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default EventItemText;
