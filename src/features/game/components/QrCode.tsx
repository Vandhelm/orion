"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** QR code d'un lien, généré dans le navigateur (aucun service externe). */
export function QrCode({ value, label }: { value: string; label: string }) {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { margin: 1, width: 192, errorCorrectionLevel: "M" }).then((url) => {
      if (!cancelled) setImage(url);
    });
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!image) return null;
  // eslint-disable-next-line @next/next/no-img-element -- image générée localement (data URL), rien à optimiser
  return <img src={image} alt={label} width={192} height={192} className="mx-auto block border-2 border-border [image-rendering:pixelated]" />;
}
