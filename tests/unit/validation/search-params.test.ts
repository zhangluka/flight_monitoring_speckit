import { validateSearchParams } from "@/lib/validation/search-params";

describe("validateSearchParams", () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().slice(0, 10);

  it("必填：缺少出发地时返回 invalid", () => {
    const r = validateSearchParams({ origin: "", destination: "上海", date: dateStr });
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/补全|出发|目的地|日期/);
  });

  it("必填：缺少目的地时返回 invalid", () => {
    const r = validateSearchParams({ origin: "北京", destination: "", date: dateStr });
    expect(r.valid).toBe(false);
  });

  it("必填：缺少日期时返回 invalid", () => {
    const r = validateSearchParams({ origin: "北京", destination: "上海", date: "" });
    expect(r.valid).toBe(false);
  });

  it("出发地与目的地不能相同", () => {
    const r = validateSearchParams({ origin: "北京", destination: "北京", date: dateStr });
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/不能相同/);
  });

  it("日期为过去时返回 invalid", () => {
    const past = "2020-01-01";
    const r = validateSearchParams({ origin: "北京", destination: "上海", date: past });
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/日期|今日|之后/);
  });

  it("全部有效时返回 valid", () => {
    const r = validateSearchParams({ origin: "北京", destination: "上海", date: dateStr });
    expect(r.valid).toBe(true);
    expect(r.error).toBeUndefined();
  });
});
