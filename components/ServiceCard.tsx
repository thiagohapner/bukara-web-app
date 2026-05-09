"use client";

import Link from "next/link";
import Image from "next/image";
import { BukaraService } from "@/lib/data";

const PLACEHOLDER_COLORS = ["#e8f7f6", "#f5ede8"];
const PLACEHOLDER_LABELS = ["SRV", "SWZ"];

interface ServiceCardProps {
  service: BukaraService;
  index: number;
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-[#9B242A] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function ServiceCard({ service, index }: ServiceCardProps) {
  const isEven = index % 2 === 0;
  const imageBg = PLACEHOLDER_COLORS[index % 2];
  const imageLabel = PLACEHOLDER_LABELS[index % 2];

  const heroImage = service.images?.[0];

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
      {service.badge && (
        <span className="inline-flex self-start text-[12px] font-bold bg-[#065194] text-white rounded-full px-3 py-1.5 leading-none tracking-wide mb-4">
          {service.badge}
        </span>
      )}

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
              <CheckIcon />
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
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="service-card border border-slate-100 rounded-2xl overflow-hidden bg-white w-full flex flex-col sm:flex-row">
      {imageBlock}
      {contentBlock}
    </div>
  );
}
