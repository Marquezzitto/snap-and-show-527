import { expect, test } from "bun:test";
import { collectPublicOverrides, visibleProductIds } from "./sitemap-catalog";

test("sitemap excludes hidden catalog products", () => {
  expect(visibleProductIds([{ id: "p-0203" }, { id: "p-0263" }], [{ product_id: "p-0263", visivel: false }])).toEqual(["p-0203"]);
});
test("sitemap reads every public override batch", async () => {
  const offsets = [];
  const rows = await collectPublicOverrides(async (offset) => {
    offsets.push(offset);
    return offset < 3 ? [{ product_id: `p-${offset}`, visivel: true }] : [];
  }, 1);
  expect(offsets).toEqual([0, 1, 2, 3]);
  expect(rows.length).toBe(3);
});
test("later query failure rejects instead of producing partial sitemap data", async () => {
  await expect(collectPublicOverrides(async (offset) => {
    if (offset) throw new Error("Public read failed");
    return [{ product_id: "p-0203", visivel: true }];
  }, 1)).rejects.toThrow("Public read failed");
});