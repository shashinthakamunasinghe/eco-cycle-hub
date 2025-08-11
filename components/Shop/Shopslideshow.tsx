"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    id: 1,
    title: "50% Off Home Items",
    subtitle: "Limited time offer on all eco-friendly home products",
    image: "/placeholder.svg?height=200&width=800",
    cta: "Shop Now",
    link: "/products?category=home item",
  },
  {
    id: 2,
    title: "New Eco-Friendly Garden Tools",
    subtitle: "Made from 100% recycled materials",
    image: "/placeholder.svg?height=200&width=800",
    cta: "Explore",
    link: "/products?category=tools",
  },
  {
    id: 3,
    title: "Free Shipping on Orders Over $50",
    subtitle: "Get your sustainable products delivered for free",
    image: "/placeholder.svg?height=200&width=800",
    cta: "Start Shopping",
    link: "/products",
  },
];

export function ShopSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-48 md:h-64 overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600">
      {slides.map((slide, index) => (
        <div
          key={`shop-slide-${slide.id}`}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            transform: `translateX(${(index - currentSlide) * 100}%)`,
          }}
        >
          <div className="relative h-full">
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h2 className="text-2xl md:text-4xl font-bold mb-2">
                  {slide.title}
                </h2>
                <p className="text-sm md:text-lg mb-4">{slide.subtitle}</p>
                <Button
                  size="sm"
                  className="bg-white text-green-600 hover:bg-gray-100"
                  asChild
                >
                  <a href={slide.link}>{slide.cta}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={`shop-dot-${index}`}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            title={`Go to slide ${index + 1}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
