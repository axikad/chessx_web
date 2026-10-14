import { useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type CarouselSlide = { id: string; content: ReactNode; label?: string };
export type CarouselProps = { slides: CarouselSlide[]; autoPlayMs?: number; className?: string };

export function Carousel({ slides, autoPlayMs, className = '' }: CarouselProps) {
  const [active, setActive] = useState(0);
  const total = slides.length;
  const goTo = (index: number) => setActive((index + total) % total);

  useEffect(() => {
    if (!autoPlayMs || total < 2) return;
    const timer = window.setInterval(() => goTo(active + 1), autoPlayMs);
    return () => window.clearInterval(timer);
  }, [active, autoPlayMs, total]);

  if (!total) return null;
  return <section className={`relative overflow-hidden rounded-xl ${className}`} aria-roledescription="carousel" aria-label="Content carousel">
    <div className="transition-transform duration-300" key={slides[active].id}>{slides[active].content}</div>
    {total > 1 && <><button type="button" onClick={() => goTo(active - 1)} aria-label="Previous slide" className="absolute left-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-slate-950/35 text-white backdrop-blur transition-colors hover:bg-slate-950/60"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={() => goTo(active + 1)} aria-label="Next slide" className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-slate-950/35 text-white backdrop-blur transition-colors hover:bg-slate-950/60"><ChevronRight className="h-4 w-4" /></button><div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">{slides.map((slide, index) => <button type="button" key={slide.id} onClick={() => goTo(index)} aria-label={slide.label ?? `Go to slide ${index + 1}`} aria-current={index === active} className={`h-1.5 rounded-full transition-all ${index === active ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`} />)}</div></>}
  </section>;
}
