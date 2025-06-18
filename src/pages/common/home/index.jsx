import React, { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { FaRegLightbulb, FaBolt, FaChartBar } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import api from "../../../config/axios";

const EcommerceHome = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // --- NEW: State for login status and dropdown visibility ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(""); // lưu tên
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

  // Khi component mount: kiểm tra localStorage
  useEffect(() => {
    const id = localStorage.getItem("id");
    if (id) {
      setIsLoggedIn(true);
      const storedName = localStorage.getItem("name");
      if (storedName) {
        setUsername(storedName);
      } else {
        // đọc name, nếu null/empty thì dùng "Member"
        const storedName = localStorage.getItem("name");
        setUsername(storedName?.trim() ? storedName : "Member");
        // nếu chưa lưu ở storage, fallback fetch
        if (!storedName) {
          api
            .get("Auth/aboutMe")
            .then((res) => {
              setUsername(res.data.name);
              localStorage.setItem("name", res.data.name);
              const nameFromApi = res.data.name?.trim()
                ? res.data.name
                : "Member";
              setUsername(nameFromApi);
              localStorage.setItem("name", nameFromApi);
            })
            .catch((err) => console.error("Fetch profile lỗi:", err));
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    window.location.href = "/login";
  };

  // Dữ liệu UI (chỉ thay đổi để hiển thị theo mockup, không sửa logic React)
  const preventionCourses = [
    {
      id: 1,
      title: "Understanding Substance Risks",
      level: "Beginner",
      duration: "2 hours",
      description:
        "Learn about the real effects of different substances on your body, mind, and future goals through interactive content and real-world examples.",
      rating: 4.8,
      reviews: 324,
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Handling Peer Pressure",
      level: "Intermediate",
      duration: "3 hours",
      description:
        "Develop confidence and communication skills to navigate social situations and make decisions that align with your values and goals.",
      rating: 4.9,
      reviews: 256,
      color: "bg-purple-600",
    },
    {
      id: 3,
      title: "Healthy Coping Strategies",
      level: "All Levels",
      duration: "2.5 hours",
      description:
        "Discover positive ways to manage stress, emotions, and challenges without turning to harmful substances or behaviors.",
      rating: 4.7,
      reviews: 189,
      color: "bg-yellow-400",
    },
  ];

  const articles = [
    {
      id: 1,
      tag: "Research",
      date: "March 15, 2024",
      title: "How Teen Brain Development Affects Decision Making",
      description:
        "New research reveals why teenagers are more susceptible to risky behaviors and how understanding brain development can help in prevention efforts.",
    },
    {
      id: 2,
      tag: "Guide",
      date: "March 12, 2024",
      title: "A Parent’s Guide to Prevention Conversations",
      description:
        "Learn effective strategies for talking to your teen about substance use, building trust, and creating an open dialogue about difficult topics.",
    },
    {
      id: 3,
      tag: "Success Story",
      date: "March 10, 2024",
      title: "From Struggle to Success: Maya’s Journey",
      description:
        "Read how Maya overcame peer pressure and substance use challenges with the help of our prevention program and supportive community.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <img src={logo} alt="PreventionHub Logo" className="h-10" />
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-600 hover:text-blue-600">
                {" "}
                Home{" "}
              </a>{" "}
              <a href="#" className="text-gray-600 hover:text-blue-600">
                {" "}
                Courses
              </a>{" "}
              <a href="#" className="text-gray-600 hover:text-blue-600">
                {" "}
                Resources
              </a>{" "}
              <a href="#" className="text-gray-600 hover:text-blue-600">
                {" "}
                About
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
              <FiSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none ml-2 text-sm"
              />
            </div>

            {/* --- NEW: Conditional Login/User Avatar section --- */}
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((o) => !o)}
                  className="flex items-center p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <FiUser size={20} className="text-gray-700" />
                  <span className="ml-2 text-gray-700 font-medium hidden md:block">
                    {username}
                  </span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow border">
                    <div className="px-4 py-2 font-semibold text-gray-800">
                      Hello, {username}
                    </div>
                    <a
                      href="#"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      My Orders
                    </a>
                    <div className="border-t my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/login"
                className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 text-sm font-semibold transition"
              >
                Login
              </a>
            )}

            <div className="relative">
              <FiShoppingCart
                size={20}
                className="text-gray-700 hover:text-blue-600 transition cursor-pointer"
              />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cartCount}
              </span>
            </div>

            <a
              href="#assessment"
              className="hidden md:inline-block bg-gradient-to-r from-purple-600 to-blue-500 text-white px-5 py-2 rounded-full hover:opacity-90 transition"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[60vh] bg-gradient-to-r from-purple-600 to-blue-500">
        <div className="container mx-auto h-full px-6 flex items-center">
          <div className="text-white max-w-xl space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Empowering Youth to Make{" "}
              <span className="text-yellow-300">Informed Choices</span>
            </h1>
            <p className="text-lg opacity-90">
              Our mission is to provide comprehensive education, support, and
              resources to help young people understand the risks of substance
              use and develop the skills to make healthy, informed decisions for
              their future.
            </p>
            <div className="flex space-x-4">
              <a
                href="#assessment"
                className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition"
              >
                Take Assessment
              </a>
              <a
                href="#courses"
                className="border border-white px-6 py-3 rounded-full hover:bg-white hover:text-gray-800 transition font-semibold"
              >
                Learn More
              </a>
            </div>
            <div className="flex space-x-8 mt-6">
              <div>
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm opacity-80">Students Helped</div>
              </div>
              <div>
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm opacity-80">Success Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm opacity-80">Support Available</div>
              </div>
            </div>
          </div>
          <div className="hidden lg:block flex-1">
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-12 text-center text-white text-2xl font-semibold">
              Youth Prevention
            </div>
          </div>
        </div>
      </section>

      {/* Featured Prevention Courses */}
      <section id="courses" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">
            Featured Prevention Courses
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Explore our comprehensive courses designed to educate and empower
            young people with the knowledge and skills they need to make healthy
            choices.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {preventionCourses.map((c) => (
              <div
                key={c.id}
                className={`rounded-lg shadow-lg overflow-hidden ${c.color} text-white`}
              >
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center text-sm font-semibold uppercase opacity-90">
                    <span>{c.level}</span>
                    <span>{c.duration}</span>
                  </div>
                  <h3 className="text-xl font-bold">{c.title}</h3>
                  <p className="text-sm opacity-90">{c.description}</p>
                </div>
                <div className="bg-white bg-opacity-20 px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span>★ {c.rating}</span>
                    <span className="opacity-75">({c.reviews})</span>
                  </div>
                  <a
                    href="#"
                    className="underline text-sm font-semibold opacity-90"
                  >
                    Start Course →
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="#all-courses"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition"
            >
              View All Courses
            </a>
          </div>
        </div>
      </section>

      {/* Latest Articles & Resources */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">
            Latest Articles & Resources
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Stay informed with the latest research, tips, and stories about
            substance use prevention and youth empowerment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-lg shadow p-6 space-y-3"
              >
                <div className="flex justify-between items-center text-xs uppercase opacity-70">
                  <span className="font-semibold">{a.tag}</span>
                  <span>{a.date}</span>
                </div>
                <h3 className="text-xl font-bold">{a.title}</h3>
                <p className="text-gray-700 text-sm">{a.description}</p>
                <a
                  href="#"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Read More →
                </a>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="#all-articles"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition"
            >
              View All Articles
            </a>
          </div>
        </div>
      </section>

      {/* Take Your Prevention Assessment */}
      <section
        id="assessment"
        className="py-16 bg-gradient-to-r from-purple-600 to-blue-500"
      >
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-xl shadow-lg p-10 max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">
              Take Your Prevention Assessment
            </h2>
            <p className="text-gray-600">
              Get personalized insights about your risk factors and receive
              customized recommendations for prevention strategies that work
              best for you.
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center space-x-3">
                <FaRegLightbulb className="text-purple-600 text-2xl" />
                <div>
                  <h4 className="font-semibold">Quick Assessment</h4>
                  <p className="text-sm text-gray-500">
                    Complete in just 10 minutes
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaBolt className="text-purple-600 text-2xl" />
                <div>
                  <h4 className="font-semibold">Instant Results</h4>
                  <p className="text-sm text-gray-500">
                    Get immediate feedback
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaChartBar className="text-purple-600 text-2xl" />
                <div>
                  <h4 className="font-semibold">Personalized Plan</h4>
                  <p className="text-sm text-gray-500">
                    Tailored recommendations
                  </p>
                </div>
              </div>
            </div>
            <a
              href="#"
              className="inline-block bg-yellow-400 text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-yellow-500 transition"
            >
              Start Assessment Now
            </a>
            <p className="text-xs text-gray-400">
              100% confidential and secure
            </p>
          </div>
        </div>
      </section>

      {/* What Students Are Saying */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-500">
        <div className="container mx-auto px-6 text-white">
          <h2 className="text-3xl font-bold text-center mb-10">
            What Students Are Saying
          </h2>
          <div className="relative max-w-2xl mx-auto bg-white bg-opacity-10 rounded-xl p-8">
            <button className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition">
              <FiChevronLeft size={20} />
            </button>
            <div className="space-y-6 text-center">
              <p className="text-lg">
                “The courses helped me understand the real risks and make better
                choices for my future.”
              </p>
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center text-purple-600 text-xl">
                  S
                </div>
                <span className="mt-2 font-semibold">Sarah M.</span>
                <span className="text-sm opacity-80">Age 17</span>
              </div>
              <div className="flex justify-center space-x-2">
                <span className="w-3 h-3 bg-white rounded-full opacity-90"></span>
                <span className="w-3 h-3 bg-white rounded-full opacity-50"></span>
                <span className="w-3 h-3 bg-white rounded-full opacity-50"></span>
              </div>
            </div>
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition">
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EcommerceHome;
