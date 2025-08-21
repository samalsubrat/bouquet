"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
// @ts-expect-error - dom-to-image-more doesn't have TypeScript definitions
import domtoimage from "dom-to-image-more";

type Flower = {
  id: number;
  src: string;
  x: number;
  y: number;
};

export default function Home() {
  const [hueValue, setHueValue] = useState([0]);
  const [bouquetFlowers, setBouquetFlowers] = useState<Flower[]>([]);
  const bouquetRef = useRef<HTMLDivElement>(null);

  const flowers = [
    "/flowers/Frame1.png",
    "/flowers/Frame2.png",
    "/flowers/Frame4.png",
    "/flowers/Frame6.png",
    "/flowers/Frame7.png",
    "/flowers/Frame8.png",
  ];

  const handleDragStart = (e: React.DragEvent, src: string) => {
    e.dataTransfer.setData("flowerSrc", src);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = (bouquetRef.current as HTMLDivElement).getBoundingClientRect();
    const src = e.dataTransfer.getData("flowerSrc");
    const x = e.clientX - rect.left - 50;
    const y = e.clientY - rect.top - 50;

    setBouquetFlowers((prev) => [
      ...prev,
      { id: Date.now(), src, x, y },
    ]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDownload = async () => {
  if (!bouquetRef.current) return;

  const nodesWithOutline = bouquetRef.current.querySelectorAll("[style], .outline-dashed, .border");
  nodesWithOutline.forEach((node: Element) => {
    const htmlElement = node as HTMLElement;
    htmlElement.dataset._outline = htmlElement.style.outline || "";
    htmlElement.style.outline = "none";
    htmlElement.dataset._border = htmlElement.style.border || "";
    htmlElement.style.border = "none";
  });

  try {
    const dataUrl = await domtoimage.toPng(bouquetRef.current, {
      quality: 1,
      bgcolor: "transparent",
      cacheBust: true,
    });
    const link = document.createElement("a");
    link.download = "my-bouquet.png";
    link.href = dataUrl;
    link.click();
  } finally {
    nodesWithOutline.forEach((node: Element) => {
      const htmlElement = node as HTMLElement;
      htmlElement.style.outline = htmlElement.dataset._outline || "";
      htmlElement.style.border = htmlElement.dataset._border || "";
    });
  }
};


  return (
    <>
      <div
        className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center gap-20"
        style={{ backgroundImage: "url('/bg.png')" }}
      >
        {/* LEFT FLOWER PANEL */}
        <div className="flex md:flex-col gap-10">
          {flowers.slice(0, 3).map((src, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => handleDragStart(e, src)}
              className="bg-white/30 backdrop-blur-sm rounded-full border border-purple-950 cursor-grab"
            >
              <Image src={src} width={188} height={188} alt={`f${i}`} />
            </div>
          ))}
        </div>

        {/* BOUQUET AREA */}
        <div>
          <div
            ref={bouquetRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="relative bg-purple-100/10 backdrop-blur-[4px] flex items-center justify-center rounded-xl outline-2 outline-purple-950 outline-dashed shadow-2xl mt-16"
          >
            <Image
              src="/bouquet-purple.png"
              alt="hi"
              width={650}
              height={800}
              draggable="false"
              style={{
                filter: `hue-rotate(${hueValue[0] * 3.6}deg)`,
                transition: "filter 0.2s ease",
              }}
            />

            {/* Placed flowers */}
            {bouquetFlowers.map((flower) => (
              <Image
                key={flower.id}
                src={flower.src}
                alt="flower"
                width={96}
                height={96}
                className="absolute pointer-events-none"
                style={{ left: flower.x, top: flower.y }}
              />
            ))}
          </div>

          <h1 className="my-2 text-center text-white text-xl font-[family-name:var(--font-pixelify-sans)] backdrop-blur-xl rounded-lg">
            Change Color
          </h1>
          <Slider
            value={hueValue}
            onValueChange={setHueValue}
            max={100}
            step={1}
            className="mb-4"
          />
          <Button
            className="w-full bg-purple-950 hover:bg-purple-800 text-lg shadow-xl"
            onClick={handleDownload}
          >
            Download the cute bouquet
          </Button>
        </div>

        {/* RIGHT FLOWER PANEL */}
        <div className="flex md:flex-col gap-10">
          {flowers.slice(3).map((src, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => handleDragStart(e, src)}
              className="bg-white/30 backdrop-blur-sm rounded-full border border-purple-950 cursor-grab"
            >
              <Image src={src} width={188} height={188} alt={`f${i}`} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
