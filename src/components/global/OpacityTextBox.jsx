"use client";
import { Card, CardContent, CardTitle, cardVariants } from "../ui/card";

const OpacityTextBox = ({ title, content, variant, className }) => {
  return (
    <Card
      className={
        className
          ? `${cardVariants({
              variant: "opacity",
            })} ${className} h-fit flex-col w-[15rem]`
          : `${cardVariants({
              variant: "opacity",
            })}  flex-col w-[15rem]`
      }
    >
      <CardTitle>{title}</CardTitle>

      <CardContent className="whitespace-pre-wrap flex-grow h-fit mb-4">
        {content}
      </CardContent>
    </Card>
  );
};

export default OpacityTextBox;
