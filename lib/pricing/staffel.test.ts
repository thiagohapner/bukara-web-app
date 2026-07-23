import { describe, it, expect } from "vitest";
import { parseStaffelSpecs } from "./staffel";

// The four real spec rows for reference SKU 908-00009-00-0 (en-dash ranges, U+2013).
const referenceSpecs = [
  { spec_key: "Verpackungseinheit", spec_value: "10 Stück" },
  { spec_key: "Staffelpreis bis 50 Stück", spec_value: "4,54 €" },
  { spec_key: "Staffelpreis 60–100 Stück", spec_value: "4,13 €" },
  { spec_key: "Staffelpreis 110–250 Stück", spec_value: "3,72 €" },
];

describe("parseStaffelSpecs", () => {
  it("parses the four reference rows into packagingUnit + sorted tiers", () => {
    const result = parseStaffelSpecs(referenceSpecs);
    expect(result).not.toBeNull();
    expect(result!.packagingUnit).toBe(10);
    expect(result!.tiers).toEqual([
      { minQty: 10, maxQty: 50, unitPrice: 4.54 }, // "bis 50" -> min = packagingUnit
      { minQty: 60, maxQty: 100, unitPrice: 4.13 },
      { minQty: 110, maxQty: 250, unitPrice: 3.72 },
    ]);
  });

  it("accepts an ASCII hyphen range as well as the en dash", () => {
    const result = parseStaffelSpecs([
      { spec_key: "Verpackungseinheit", spec_value: "10 Stück" },
      { spec_key: "Staffelpreis 60-100 Stück", spec_value: "4,13 €" },
    ]);
    expect(result!.tiers).toEqual([{ minQty: 60, maxQty: 100, unitPrice: 4.13 }]);
  });

  it("parses an open-ended 'ab N' tier as maxQty null", () => {
    const result = parseStaffelSpecs([
      { spec_key: "Verpackungseinheit", spec_value: "10 Stück" },
      { spec_key: "Staffelpreis bis 50 Stück", spec_value: "4,54 €" },
      { spec_key: "Staffelpreis ab 300 Stück", spec_value: "3,00 €" },
    ]);
    expect(result!.tiers).toEqual([
      { minQty: 10, maxQty: 50, unitPrice: 4.54 },
      { minQty: 300, maxQty: null, unitPrice: 3.0 },
    ]);
  });

  it("uses minQty = 1 for a 'bis' tier when there is no Verpackungseinheit", () => {
    const result = parseStaffelSpecs([
      { spec_key: "Staffelpreis bis 50 Stück", spec_value: "4,54 €" },
    ]);
    expect(result!.packagingUnit).toBeNull();
    expect(result!.tiers).toEqual([{ minQty: 1, maxQty: 50, unitPrice: 4.54 }]);
  });

  it("skips malformed rows (unparseable price) without fabricating a tier", () => {
    const result = parseStaffelSpecs([
      { spec_key: "Verpackungseinheit", spec_value: "10 Stück" },
      { spec_key: "Staffelpreis bis 50 Stück", spec_value: "4,54 €" },
      { spec_key: "Staffelpreis 60–100 Stück", spec_value: "auf Anfrage" }, // malformed
    ]);
    expect(result!.tiers).toEqual([{ minQty: 10, maxQty: 50, unitPrice: 4.54 }]);
  });

  it("returns null when no Staffelpreis tier rows are present", () => {
    expect(
      parseStaffelSpecs([
        { spec_key: "Verpackungseinheit", spec_value: "10 Stück" },
        { spec_key: "Werkstoff", spec_value: "Hartmetall" },
      ]),
    ).toBeNull();
    expect(parseStaffelSpecs([])).toBeNull();
  });
});
