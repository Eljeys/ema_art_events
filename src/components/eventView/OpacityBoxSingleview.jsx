"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardTitle, cardVariants } from "../ui/card";
import { getEventId } from "../../lib/api";

const OpacityBoxSingleview = ({ eventId, content }) => {
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEventId(eventId);
        setEventDetails(data);
      } catch (err) {
        setError(err.message || "Fejl ved hentning af event data");
        setEventDetails(null);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleImageClick = async (imageId) => {
    setImageData({ description: `Beskrivelse for billede ${imageId}` });
  };

  if (loading) {
    return (
      <Card className={cardVariants({ variant: "opacity" })}>
        <CardTitle>Titel her</CardTitle>
        <CardContent> Content her</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cardVariants({ variant: "opacity" })}>
        <CardContent>Fejl: {error}</CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardVariants({ variant: "opacity" })}>
      <CardTitle>{eventDetails?.title || "Intet event valgt"}</CardTitle>
      <CardContent>
        <pre>{eventDetails?.description || "Ingen detaljer tilgængelige"}</pre>
      </CardContent>
    </Card>
  );
};

export default OpacityBoxSingleview;
