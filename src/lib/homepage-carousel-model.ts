export interface HomepageSlide {
  id: string;
  productId: string;
  imagePath: string;
}

export function productSlidePath(slide: HomepageSlide) {
  return `/produto/${encodeURIComponent(slide.productId)}`;
}

export function moveSlide(slides: HomepageSlide[], from: number, to: number) {
  if (from < 0 || to < 0 || from >= slides.length || to >= slides.length) return slides;
  const result = [...slides];
  const [slide] = result.splice(from, 1);
  if (!slide) return slides;
  result.splice(to, 0, slide);
  return result;
}