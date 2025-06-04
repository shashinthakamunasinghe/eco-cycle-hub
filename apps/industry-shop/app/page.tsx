"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Recycle,
  Leaf,
  Users,
  ArrowRight,
  MapPin,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight,
  Factory,
  Truck,
  ShoppingBag,
  Award,
  Globe,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

const heroSlides = [
  {
    id: 1,
    title: "Transform Waste into Wealth",
    subtitle: "Join the circular economy revolution",
    description: "Connect industries with waste collectors and turn waste into valuable recycled products",
    cta: "Get Started Today",
  },
  {
    id: 2,
    title: "Smart Waste Management",
    subtitle: "Technology meets sustainability",
    description: "AI-powered waste collection and recycling solutions for a cleaner tomorrow",
    cta: "Learn More",
  },
  {
    id: 3,
    title: "Eco-Friendly Products",
    subtitle: "Shop with purpose",
    description: "Discover amazing products made from recycled materials and support sustainability",
    cta: "Shop Now",
  },
]

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Slideshow with Navigation */}
      <section
        className="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: `url('/images/green-bin-sustainable.jpg')`,
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-green-800/30 to-green-700/20" />

        {/* Transparent Header */}
        <header className="relative z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              {/* Left Navigation */}
              <nav className="hidden md:flex space-x-8">
                <a
                  href="#features"
                  className="text-white hover:text-green-300 transition-colors font-medium drop-shadow-lg"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-white hover:text-green-300 transition-colors font-medium drop-shadow-lg"
                >
                  How It Works
                </a>
              </nav>

              {/* Centered App Name */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <img
                    src="/images/ecocyclehub-logo.jpg"
                    alt="EcoCycleHub Logo"
                    className="h-8 w-8 drop-shadow-lg rounded-full"
                  />
                </div>
                <span className="text-3xl font-bold text-white tracking-wide drop-shadow-lg">EcoCycleHub</span>
              </div>

              {/* Right Navigation */}
              <nav className="hidden md:flex space-x-8">
                <a
                  href="#about"
                  className="text-white hover:text-green-300 transition-colors font-medium drop-shadow-lg"
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="text-white hover:text-green-300 transition-colors font-medium drop-shadow-lg"
                >
                  Contact
                </a>
              </nav>

              {/* Mobile Menu Button */}
              <button className="md:hidden text-white drop-shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Slideshow Content */}
        <div className="relative flex items-center justify-center min-h-[calc(100vh-120px)] text-center px-4 text-white">
          <div className="max-w-4xl mx-auto">
            {/* Content Container with Slide Right Animation */}
            <div className="relative">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`transition-all duration-1000 ease-in-out ${
                    index === currentSlide
                      ? "opacity-100 transform translate-x-0"
                      : index < currentSlide
                        ? "opacity-0 transform -translate-x-full absolute inset-0"
                        : "opacity-0 transform translate-x-full absolute inset-0"
                  }`}
                >
                  <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl">{slide.title}</h1>
                    <p className="text-xl md:text-2xl mb-4 opacity-95 font-medium drop-shadow-lg">{slide.subtitle}</p>
                    <p className="text-lg md:text-xl mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                      {slide.description}
                    </p>
                    <Button
                      size="lg"
                      className="bg-green-600/90 hover:bg-green-700/90 text-white text-lg px-8 py-4 rounded-full font-semibold shadow-2xl hover:shadow-3xl transition-all border-2 border-white/30 backdrop-blur-sm"
                    >
                      {slide.cta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/30 transition-all z-10 border border-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/30 transition-all z-10 border border-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all border border-white/50 ${
                index === currentSlide ? "bg-white scale-125 shadow-lg" : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Industry User Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-6 shadow-lg">
              <Factory className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              For <span className="text-green-600">Industry Partners</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your waste management with our smart, efficient, and sustainable solutions
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Industry Features */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shadow-md">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Location Tracking</h3>
                  <p className="text-gray-600">
                    Automatic location detection and optimized pickup routes for maximum efficiency.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shadow-md">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Scheduling</h3>
                  <p className="text-gray-600">
                    Schedule pickups at your convenience with real-time availability updates.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shadow-md">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-600">
                    Track your environmental impact and cost savings with detailed analytics.
                  </p>
                </div>
              </div>
            </div>

            {/* Industry CTA Card */}
            <Card className="p-8 shadow-2xl border-0 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <Users className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Join Our Network</CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Register your industry and start optimizing your waste management today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Shield className="h-4 w-4 mr-2 text-green-600" />
                    Secure & Reliable
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Award className="h-4 w-4 mr-2 text-green-600" />
                    Certified Process
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Truck className="h-4 w-4 mr-2 text-green-600" />
                    Fast Pickup
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Globe className="h-4 w-4 mr-2 text-green-600" />
                    Eco-Friendly
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Link href="/auth/register" className="w-full">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                      Register Your Industry
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/login" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 py-3 text-lg font-semibold rounded-xl"
                    >
                      Access Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Creative Transition Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-white/10"></div>
          <div
            className="h-full w-full opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fillOpacity='0.1' fillRule='evenodd'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center text-white">
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Factory className="h-6 w-6" />
                </div>
                <span className="text-xl font-semibold">Industries</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-white/50"></div>
                <Recycle className="h-8 w-8" />
                <div className="w-8 h-0.5 bg-white/50"></div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <span className="text-xl font-semibold">Customers</span>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">Connecting the Circular Economy</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              From waste to wealth, from industry to customer - we're building a sustainable future together
            </p>
          </div>
        </div>
      </section>

      {/* Customer Section */}
      <section className="py-20 bg-gradient-to-br from-white to-green-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1500"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-6 shadow-lg">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              For <span className="text-green-600">Eco-Conscious Customers</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover amazing products made from recycled materials and make a positive impact with every purchase
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Customer CTA Card */}
            <Card className="p-8 shadow-2xl border-0 bg-gradient-to-br from-white to-green-50 order-2 lg:order-1">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <Leaf className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Shop Sustainably</CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Browse our collection of eco-friendly products made from recycled materials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Recycle className="h-4 w-4 mr-2 text-green-600" />
                    100% Recycled
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Shield className="h-4 w-4 mr-2 text-green-600" />
                    Quality Assured
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Truck className="h-4 w-4 mr-2 text-green-600" />
                    Fast Delivery
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Award className="h-4 w-4 mr-2 text-green-600" />
                    Eco-Certified
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/shop" className="w-full">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                      Explore Products
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Customer Features */}
            <div className="space-y-8 order-1 lg:order-2">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shadow-md">
                  <Recycle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Recycled Products</h3>
                  <p className="text-gray-600">
                    High-quality products made from recycled materials, giving waste a new life.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shadow-md">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Shopping</h3>
                  <p className="text-gray-600">
                    Safe and secure payment processing with order tracking and customer support.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shadow-md">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Environmental Impact</h3>
                  <p className="text-gray-600">
                    Track your positive environmental impact with every purchase you make.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/images/ecocyclehub-logo.jpg"
                  alt="EcoCycleHub Logo"
                  className="h-8 w-8 text-green-400 rounded-full"
                />
                <span className="text-2xl font-bold">EcoCycleHub</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Building a sustainable future through smart waste management and circular economy solutions.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EcoCycleHub. All rights reserved. Building a sustainable future together.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
