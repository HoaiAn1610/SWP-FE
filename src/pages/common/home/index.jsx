import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiUser, FiShoppingCart } from "react-icons/fi";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const EcommerceHome = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // --- NEW: State for login status and dropdown visibility ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // --- NEW: Effect to handle clicks outside the dropdown to close it ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const categories = [
    {
      id: 1,
      name: "Electronics",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661",
    },
    {
      id: 2,
      name: "Fashion",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050",
    },
    {
      id: 3,
      name: "Home & Living",
      image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a",
    },
    {
      id: 4,
      name: "Sports",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 199.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 299.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    },
    {
      id: 3,
      name: "Camera Lens",
      price: 599.99,
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    },
    {
      id: 4,
      name: "Sneakers",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    },
  ];

  const promotions = [
    {
      id: 1,
      title: "Summer Sale",
      description: "Up to 50% off",
      image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a",
    },
    {
      id: 2,
      title: "New Arrivals",
      description: "Check out latest collection",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <img
                src="https://images.unsplash.com/photo-1614680376739-414d95ff43df"
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-600 hover:text-blue-600">
                  Home
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-600">
                  Products
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-600">
                  About
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-600">
                  Contact
                </a>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
                <FiSearch className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="bg-transparent outline-none ml-2 text-sm"
                />
              </div>

              {/* --- NEW: Conditional Login/User Avatar section --- */}
              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  {/* Avatar Button */}
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <FiUser size={20} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Profile
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Orders
                      </a>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {}}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Login Button
                <button className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 text-sm font-semibold transition">
                  Login
                </button>
              )}

              <div className="relative">
                <FiShoppingCart
                  size={20}
                  className="hover:text-blue-600 cursor-pointer"
                />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative h-[60vh] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="container mx-auto px-4 h-full flex items-center relative">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-xl mb-8">
              Shop the latest trends with unbeatable prices
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full transform transition hover:scale-105">
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer transform transition hover:-translate-y-2"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent group-hover:from-blue-600"></div>
                <h3 className="absolute bottom-4 left-4 text-white text-xl font-semibold">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover transform transition group-hover:scale-110"
                  />
                  <button className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition">
                    Quick View
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-blue-600 font-bold">${product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotions */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="relative h-80 rounded-lg overflow-hidden"
              >
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-3xl font-bold mb-2">{promo.title}</h3>
                    <p className="text-xl">{promo.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">About Us</h4>
              <p className="text-gray-400">
                Your one-stop shop for all your needs. Quality products at
                competitive prices.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li>1234 Street Name</li>
                <li>City, State 12345</li>
                <li>Phone: (123) 456-7890</li>
                <li>Email: info@example.com</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 w-full rounded-l outline-none text-gray-900"
                />
                <button className="bg-blue-600 px-4 py-2 rounded-r hover:bg-blue-700">
                  Subscribe
                </button>
              </div>
              <div className="flex space-x-4 mt-6">
                <FaFacebook className="text-2xl hover:text-blue-600 cursor-pointer" />
                <FaTwitter className="text-2xl hover:text-blue-400 cursor-pointer" />
                <FaInstagram className="text-2xl hover:text-pink-600 cursor-pointer" />
                <FaLinkedin className="text-2xl hover:text-blue-500 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EcommerceHome;
