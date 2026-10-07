"use client";

import { useEffect, useState } from "react";

const CLOCK_REFRESH_MS = 30_000;

function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function Clock() {
  // Rendu serveur et premier rendu client identiques ("00:00"), l'heure réelle
  // s'affiche après l'hydratation : comportement équivalent à la maquette,
  // où le script ne tourne qu'une fois le DOM chargé.
  const [time, setTime] = useState("00:00");

  useEffect(() => {
    const update = () => setTime(formatTime(new Date()));
    // Premier affichage différé (plutôt qu'un setState synchrone dans l'effet) :
    // l'horloge démarre "00:00" puis se met à jour, comme dans la maquette.
    const immediate = setTimeout(update, 0);
    const interval = setInterval(update, CLOCK_REFRESH_MS);
    return () => {
      clearTimeout(immediate);
      clearInterval(interval);
    };
  }, []);

  return <span>{time}</span>;
}
