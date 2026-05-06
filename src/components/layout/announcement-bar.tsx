"use client";

import { useEffect, useState } from "react";

const messages = [
  "Complimentary worldwide shipping on orders over ₹15,000",
  "New In · The Spring Collection - In Atelier Now",
  "Atelier hours: Tuesday to Saturday, by appointment",
];

export function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % messages.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="bg-charcoal text-bone">
      <div className="container flex h-9 items-center justify-center overflow-hidden">
        <p
          key={i}
          className="animate-fade-in text-[10px] uppercase tracking-editorial"
          aria-live="polite"
        >
          {messages[i]}
        </p>
      </div>
    </div>
  );
}
