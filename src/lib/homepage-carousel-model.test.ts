import { describe, expect, test } from "bun:test";
import { moveSlide, productSlidePath } from "./homepage-carousel-model";

describe("carousel product links", () => {
  test("opens the selected product's dedicated page", () => {
    expect(productSlidePath({ id: "banner", productId: "p-0263", imagePath: "" })).toBe("/produto/p-0263");
  });
  test("reordering retains each image's selected product", () => {
    const slides = [{ id: "one", productId: "p-0263", imagePath: "one.jpg" }, { id: "two", productId: "p-0203", imagePath: "two.jpg" }];
    expect(moveSlide(slides, 0, 1)).toEqual([slides[1], slides[0]]);
  });
});