"use client";

import { useState } from "react";

export interface SpecRow { id?: string; spec_section: string; spec_key: string; spec_value: string; sort_order: number; _deleted?: boolean; }
export interface MaterialRow { id?: string; material_name: string; suitability: string; sort_order: number; _deleted?: boolean; }
export interface CuttingRow { id?: string; diameter: string; feed_rate: string; rpm_range: string; sort_order: number; _deleted?: boolean; }

const SUITABILITY_OPTIONS = ["sehr gut geeignet", "gut geeignet", "geeignet", "nicht geeignet"];

interface Props {
  specs: SpecRow[];
  materials: MaterialRow[];
  cutting: CuttingRow[];
  onSpecsChange: (rows: SpecRow[]) => void;
  onMaterialsChange: (rows: MaterialRow[]) => void;
  onCuttingChange: (rows: CuttingRow[]) => void;
  materialTypes: string[];
  onAddMaterialType: (name: string) => Promise<void>;
}

export default function ProductDataEditor({ specs, materials, cutting, onSpecsChange, onMaterialsChange, onCuttingChange, materialTypes, onAddMaterialType }: Props) {
  const [newMaterialName, setNewMaterialName] = useState("");
  const [addingMaterial, setAddingMaterial] = useState(false);

  const techSpecs = specs.filter(s => s.spec_section === "technische_details" || (!s.spec_section && !s._deleted));
  const anwendungSpecs = specs.filter(s => s.spec_section === "anwendung");
  const maschinenSpecs = specs.filter(s => s.spec_section === "maschinen");

  function updateSpec(index: number, value: string) {
    onSpecsChange(specs.map((s, i) => i === index ? { ...s, spec_value: value } : s));
  }

  function removeSpec(index: number) {
    const row = specs[index];
    if (row.id) {
      onSpecsChange(specs.map((s, i) => i === index ? { ...s, _deleted: true } : s));
    } else {
      onSpecsChange(specs.filter((_, i) => i !== index));
    }
  }

  function addSpec(section: string) {
    onSpecsChange([...specs, { spec_section: section, spec_key: "", spec_value: "", sort_order: specs.length }]);
  }

  function isMaterialChecked(name: string) {
    return materials.some(m => m.material_name === name && !m._deleted);
  }

  function getMaterialRow(name: string): MaterialRow | undefined {
    return materials.find(m => m.material_name === name && !m._deleted);
  }

  function toggleMaterial(name: string, checked: boolean) {
    if (checked) {
      const existingDeleted = materials.find(m => m.material_name === name && m._deleted);
      if (existingDeleted) {
        onMaterialsChange(materials.map(m =>
          m.material_name === name && m._deleted ? { ...m, _deleted: false } : m
        ));
      } else {
        onMaterialsChange([...materials, { material_name: name, suitability: "geeignet", sort_order: materials.length }]);
      }
    } else {
      const row = materials.find(m => m.material_name === name && !m._deleted);
      if (!row) return;
      if (row.id) {
        onMaterialsChange(materials.map(m => m === row ? { ...m, _deleted: true } : m));
      } else {
        onMaterialsChange(materials.filter(m => m !== row));
      }
    }
  }

  function updateSuitability(name: string, suitability: string) {
    onMaterialsChange(materials.map(m => m.material_name === name && !m._deleted ? { ...m, suitability } : m));
  }

  async function handleAddMaterialType() {
    const trimmed = newMaterialName.trim();
    if (!trimmed) return;
    setAddingMaterial(true);
    await onAddMaterialType(trimmed);
    setNewMaterialName("");
    setAddingMaterial(false);
  }

  return (
    <div className="space-y-8">
      <Section title="Technische Details">
        {techSpecs.filter(s => !s._deleted).map((row) => {
          const ri = specs.indexOf(row);
          return (
            <div key={ri} className="flex gap-2 items-start">
              <input
                className="flex-1 border border-slate-200 rounded-sm px-2 py-1.5 text-sm"
                placeholder="z.B. Kompressionsgeometrie: 2+6 Schneider"
                value={row.spec_value}
                onChange={e => updateSpec(ri, e.target.value)}
              />
              <button type="button" onClick={() => removeSpec(ri)} className="text-red-400 hover:text-red-600 text-sm pt-1.5">✕</button>
            </div>
          );
        })}
        <button type="button" onClick={() => addSpec("technische_details")} className="text-sm text-teal-600 hover:text-teal-700">
          + Zeile
        </button>
      </Section>

      <Section title="Anwendung">
        {anwendungSpecs.filter(s => !s._deleted).map((row) => {
          const ri = specs.indexOf(row);
          return (
            <div key={ri} className="flex gap-2 items-start">
              <input
                className="flex-1 border border-slate-200 rounded-sm px-2 py-1.5 text-sm"
                placeholder="z.B. Fräsen"
                value={row.spec_value}
                onChange={e => updateSpec(ri, e.target.value)}
              />
              <button type="button" onClick={() => removeSpec(ri)} className="text-sm text-red-400 hover:text-red-600 pt-1.5">✕</button>
            </div>
          );
        })}
        <button type="button" onClick={() => addSpec("anwendung")} className="text-sm text-teal-600 hover:text-teal-700">
          + Zeile
        </button>
      </Section>

      <Section title="Geeignet für Maschinen">
        {maschinenSpecs.filter(s => !s._deleted).map((row) => {
          const ri = specs.indexOf(row);
          return (
            <div key={ri} className="flex gap-2 items-start">
              <input
                className="flex-1 border border-slate-200 rounded-sm px-2 py-1.5 text-sm"
                placeholder="z.B. HOMAG OPTIMAT KAL 310"
                value={row.spec_value}
                onChange={e => updateSpec(ri, e.target.value)}
              />
              <button type="button" onClick={() => removeSpec(ri)} className="text-sm text-red-400 hover:text-red-600 pt-1.5">✕</button>
            </div>
          );
        })}
        <button type="button" onClick={() => addSpec("maschinen")} className="text-sm text-teal-600 hover:text-teal-700">
          + Zeile
        </button>
      </Section>

      <Section title="Materialien">
        <div className="space-y-2">
          {materialTypes.map(name => {
            const checked = isMaterialChecked(name);
            const row = getMaterialRow(name);
            return (
              <div key={name} className="flex gap-3 items-center">
                <label className="flex items-center gap-2 min-w-[200px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => toggleMaterial(name, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700">{name}</span>
                </label>
                {checked && row && (
                  <select
                    className="border border-slate-200 rounded-sm px-2 py-1 text-sm"
                    value={row.suitability}
                    onChange={e => updateSuitability(name, e.target.value)}
                  >
                    {SUITABILITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 items-center mt-4 pt-3 border-t border-slate-100">
          <input
            className="border border-slate-200 rounded-sm px-2 py-1.5 text-sm flex-1 max-w-xs"
            placeholder="Neuer Materialtyp"
            value={newMaterialName}
            onChange={e => setNewMaterialName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddMaterialType(); } }}
          />
          <button
            type="button"
            onClick={handleAddMaterialType}
            disabled={addingMaterial || !newMaterialName.trim()}
            className="text-sm text-teal-600 hover:text-teal-700 disabled:opacity-40"
          >
            {addingMaterial ? "..." : "+ Hinzufügen"}
          </button>
        </div>
      </Section>

      <Section title="Schnittdaten">
        <div className="text-xs text-slate-500 mb-2 grid grid-cols-3 gap-2 font-medium">
          <span>Durchmesser</span><span>Vorschub</span><span>Drehzahl</span>
        </div>
        {cutting.filter(c => !c._deleted).map((row, vi) => {
          const ri = cutting.indexOf(row);
          return (
            <div key={vi} className="flex gap-2 items-start">
              {(["diameter", "feed_rate", "rpm_range"] as const).map(field => (
                <input
                  key={field}
                  className="flex-1 border border-slate-200 rounded-sm px-2 py-1.5 text-sm"
                  value={row[field]}
                  onChange={e => onCuttingChange(cutting.map((c, i) => i === ri ? { ...c, [field]: e.target.value } : c))}
                />
              ))}
              <button type="button" onClick={() => remove(cutting, ri, onCuttingChange)} className="text-red-400 hover:text-red-600 text-sm pt-1.5">✕</button>
            </div>
          );
        })}
        <button type="button" onClick={() => onCuttingChange([...cutting, { diameter: "", feed_rate: "", rpm_range: "", sort_order: cutting.length }])} className="text-sm text-teal-600 hover:text-teal-700">
          + Zeile
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function remove<T extends { id?: string; _deleted?: boolean }>(rows: T[], index: number, onChange: (rows: T[]) => void) {
  const row = rows[index];
  if (row.id) {
    onChange(rows.map((r, i) => i === index ? { ...r, _deleted: true } : r));
  } else {
    onChange(rows.filter((_, i) => i !== index));
  }
}
