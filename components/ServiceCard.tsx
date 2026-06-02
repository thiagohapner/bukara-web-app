"use client";

import Link from "next/link";
import Image from "next/image";
import { BukaraService } from "@/lib/data";
import { Check, ArrowRight } from "lucide-react";

const PLACEHOLDER_COLORS = ["#e8f7f6", "#f5ede8"];
const PLACEHOLDER_LABELS = ["SRV", "SWZ"];

interface ServiceCardProps {
  service: BukaraService;
  index: number;
  variant?: "default" | "panel";
}

function ServiceCheck() {
  return <Check className="w-4 h-4 text-[#9B242A] mt-0.5 flex-shrink-0" strokeWidth={2.5} />;
}

export default function ServiceCard({ service, index, variant = "default" }: ServiceCardProps) {
  const isEven = index % 2 === 0;
  const imageBg = PLACEHOLDER_COLORS[index % 2];
  const imageLabel = PLACEHOLDER_LABELS[index % 2];

  const heroImage = service.images?.[0];

  if (variant === "panel") {
    return (
      <div className="service-card rounded-lg overflow-hidden bg-[#F5F5F7] flex flex-col h-full">
        <div className="p-10 flex flex-col flex-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
            {service.name}
          </h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">{service.tagline}</p>
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Leistungen</p>
            <ul className="flex flex-col gap-1.5">
              {service.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-slate-900">
                  <ServiceCheck />
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-8">
            <span className="text-xs text-slate-400 font-medium">Preis: </span>
            <span className="text-lg font-extrabold text-slate-900">{service.priceLabel}</span>
          </div>
          <Link
            href={`/loesungen/${service.slug}`}
            className="btn-orange inline-flex items-center gap-2 self-start mt-auto"
            style={{ textDecoration: "none" }}
          >
            Zum Service
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>
        <div className="relative w-full" style={{ height: "300px" }}>
          {heroImage ? (
            <Image src={heroImage} alt={service.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: imageBg }}>
              <span className="text-5xl font-black tracking-tighter select-none" style={{ color: "rgba(0,165,151,0.15)" }}>
                {imageLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const imageBlock = (
    <div
      className={`relative flex-shrink-0 flex items-center justify-center w-full sm:w-[42%] h-48 sm:h-auto overflow-hidden ${!isEven ? "sm:order-last" : ""}`}
      style={{ background: imageBg, minHeight: "260px" }}
    >
      {heroImage ? (
        <Image
          src={heroImage}
          alt={service.name}
          fill
          className="object-cover"
        />
      ) : (
        <span
          className="text-5xl font-black tracking-tighter select-none text-center px-4"
          style={{ color: "rgba(0,165,151,0.15)" }}
        >
          {imageLabel}
        </span>
      )}
    </div>
  );

  const contentBlock = (
    <div className={`flex-1 p-8 sm:p-10 flex flex-col justify-center ${!isEven ? "sm:order-first" : ""}`}>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
        {service.name}
      </h2>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">{service.tagline}</p>

      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Leistungen
        </p>
        <ul className="flex flex-col gap-1.5">
          {service.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 text-sm text-slate-900">
              <Check />
              {h}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-7">
        <span className="text-xs text-slate-400 font-medium">Preis: </span>
        <span className="text-lg font-extrabold text-slate-900">{service.priceLabel}</span>
      </div>

      <div>
        <Link
          href={`/loesungen/${service.slug}`}
          className="btn-orange inline-flex items-center gap-2"
          style={{ textDecoration: "none" }}
        >
          Zum Service
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="service-card border border-slate-100 rounded-lg overflow-hidden bg-white w-full flex flex-col sm:flex-row">
      {imageBlock}
      {contentBlock}
    </div>
  );
}
