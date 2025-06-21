import Link from "next/link";
import { Navbar } from "@/components/Common/Navbar";
import { Slideshow } from "@/components/Common/Slideshow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Recycle,
  Truck,
  ShoppingCart,
  BarChart3,
  MapPin,
  Shield,
  Leaf,
  Users,
  Clock,
  Factory,
  Store,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Eye,
  Target,
  Heart,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Background with overlay */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-blue-400/20 to-emerald-400/20"></div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-10"></div>
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section with Slideshow */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Slideshow />
        </section>

        {/* Connecting Section */}
        <section className="py-16 bg-gradient-to-r from-green-500 to-emerald-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-8 md:space-x-16">
              <div className="flex items-center space-x-4 text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Factory className="h-8 w-8" />
                </div>
                <span className="text-2xl font-bold">Industries</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <Recycle className="h-3 w-3 text-green-600" />
                </div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>

              <div className="flex items-center space-x-4 text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Store className="h-8 w-8" />
                </div>
                <span className="text-2xl font-bold">Customers</span>
              </div>
            </div>

            <div className="text-center mt-8 text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Connecting the Circular Economy
              </h2>
              <p className="text-xl md:text-2xl opacity-90">
                From waste to wealth, from industry to customer - we are building
                a sustainable future together
              </p>
            </div>
          </div>
        </section>

        {/* Industry Dashboard Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Factory className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Industry Waste Management
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Streamline your industrial waste management with our smart pickup
              system, real-time tracking, and comprehensive dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-6 w-6 text-green-600" />
                  <span>Smart Pickup Requests</span>
                </CardTitle>
                <CardDescription>
                  Request waste pickups with automatic collector assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Auto-location detection</li>
                  <li>• Real-time status tracking</li>
                  <li>• Flexible scheduling</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <span>Real-Time Dashboard</span>
                </CardTitle>
                <CardDescription>
                  Monitor your waste management activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Live pickup tracking</li>
                  <li>• Waste collection analytics</li>
                  <li>• Performance metrics</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-6 w-6 text-orange-600" />
                  <span>GPS Tracking</span>
                </CardTitle>
                <CardDescription>
                  Track collectors and pickups in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Live collector locations</li>
                  <li>• Route optimization</li>
                  <li>• Delivery notifications</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              asChild
            >
              <Link href="/login">Industry Portal</Link>
            </Button>
          </div>
        </section>

        {/* Customer Shop Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                  <Store className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                EcoCycle Marketplace
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Shop eco-friendly products made from recycled materials. Support
                sustainability while getting quality products for your garden
                and home.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Leaf className="h-6 w-6 text-green-600" />
                    <span>Organic Fertilizers</span>
                  </CardTitle>
                  <CardDescription>
                    Premium compost and organic fertilizers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Made from recycled organic waste</li>
                    <li>• Rich in nutrients</li>
                    <li>• Environmentally friendly</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Recycle className="h-6 w-6 text-blue-600" />
                    <span>Garden Supplies</span>
                  </CardTitle>
                  <CardDescription>
                    Sustainable gardening products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Biodegradable plant pots</li>
                    <li>• Recycled mulch</li>
                    <li>• Eco-friendly tools</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="h-6 w-6 text-orange-600" />
                    <span>Easy Shopping</span>
                  </CardTitle>
                  <CardDescription>
                    Seamless online shopping experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Secure Stripe payments</li>
                    <li>• Order tracking</li>
                    <li>• Fast delivery</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
                asChild
              >
                <Link href="/shop/products">Explore Shop Products</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                About EcoCycle Hub
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We are revolutionizing waste management by connecting industries
                with efficient collection services and transforming waste into
                valuable products for consumers.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle>Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    To create a world where waste becomes a valuable resource,
                    fostering a truly circular economy that benefits both
                    businesses and the environment.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle>Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    To provide innovative waste management solutions that
                    connect industries, collectors, and consumers in a
                    sustainable ecosystem that reduces environmental impact.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle>Our Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Sustainability, innovation, transparency, and community. We
                    believe in creating value for all stakeholders while
                    protecting our planet for future generations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose EcoCycle Hub?
              </h2>
              <p className="text-lg text-gray-600">
                Advanced features for efficient waste management and sustainable
                shopping
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Multi-Role Platform
                </h3>
                <p className="text-gray-600 text-sm">
                  Separate dashboards for industries, collectors, admins, and
                  customers
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Real-Time Updates
                </h3>
                <p className="text-gray-600 text-sm">
                  Live tracking of pickups, orders, and notifications
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
                <p className="text-gray-600 text-sm">
                  Safe and secure transactions with Stripe integration
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">GPS Integration</h3>
                <p className="text-gray-600 text-sm">
                  Advanced location tracking and route optimization
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <Recycle className="text-white h-5 w-5" />
                  </div>
                  <span className="text-xl font-bold">EcoCycle Hub</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Smart waste management and sustainable marketplace for a
                  greener future.
                </p>

                {/* Social Media Icons */}
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">For Industries</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      href="/industry/dashboard"
                      className="hover:text-green-400 transition-colors"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/industry/request"
                      className="hover:text-green-400 transition-colors"
                    >
                      Request Pickup
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/industry/history"
                      className="hover:text-green-400 transition-colors"
                    >
                      Pickup History
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Marketplace</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      href="/shop/products"
                      className="hover:text-green-400 transition-colors"
                    >
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shop/cart"
                      className="hover:text-green-400 transition-colors"
                    >
                      Shopping Cart
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shop/orders"
                      className="hover:text-green-400 transition-colors"
                    >
                      Order History
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a
                      href="#about"
                      className="hover:text-green-400 transition-colors"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contact"
                      className="hover:text-green-400 transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <a
                      href="#privacy"
                      className="hover:text-green-400 transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 EcoCycle Hub. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
