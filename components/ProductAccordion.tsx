"use client";

import { useState } from "react";

interface AccordionSection {
  id: string;
  label: string;
  content: React.ReactNode;
}

export default function ProductAccordion({ sections, defaultOpenIds = [] }: { sections: AccordionSection[]; defaultOpenIds?: string[] }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpenIds));

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="border-t border-slate-100">
      {sections.map((section) => {
        const isOpen = openIds.has(section.id);
        return (
          <div key={section.id} className="border-b border-slate-100">
            <button
              type="button"
              className="w-full flex items-center justify-between py-4 text-left cursor-pointer"
              onClick={() => toggle(section.id)}
            >
              <span className="text-base text-slate-900">{section.label}</span>
              <span className="text-xl leading-none text-slate-900 select-none w-5 text-center">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {/* Grid trick: browser knows actual height → perfectly smooth open/close */}
            <div
              style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: "grid-template-rows 280ms ease-in-out",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div className="border-t border-slate-100 pt-4 pb-6">
                  {section.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
