import React, { useEffect, useState } from "react";

type DashboardBannerProps = {
  images?: string[];
  className?: string;
  intervalMs?: number;
};

export default function DashboardBanner({ images = [], className = "", intervalMs = 5000 }: DashboardBannerProps) {
  const imgs = images.slice(0, 3);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (imgs.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % imgs.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [imgs.length, intervalMs]);

  const containerClasses = `bg-white rounded-t-2xl shadow overflow-hidden h-64 sm:h-72 md:h-80 lg:h-96`;

  if (imgs.length === 0) {
    return <div className={`${containerClasses} ${className}`} />;
  }

  return (
    <div className={`${containerClasses} ${className}`} style={{ minHeight: 240, position: 'relative' }}>
      {imgs.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`banner-${i}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 700ms ease-in-out, transform 700ms ease-in-out',
            opacity: i === index ? 1 : 0,
            transform: i === index ? 'scale(1)' : 'scale(1.02)'
          }}
        />
      ))}
    </div>
  );
}
