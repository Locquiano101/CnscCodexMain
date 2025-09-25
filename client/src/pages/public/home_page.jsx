import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Login from "./login_form";
import { RegistrationForm } from "./registration_form";
import backgroundImage from "./../../assets/cnscsch.jpg";
import { OrganzationComponent } from "./organization_profile";
import { CalendarComponent } from "./proposal_calendar";
import { EventComponent } from "./public_post";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  return (
    <div className="relative h-screen w-screen ">
      {/* Desktop Navigation */}
      <div className="hidden md:flex h-full w-full items-center justify-center z-10 relative">
        <DekstopNavigation scrollToSection={scrollToSection} />
      </div>
      <div className="flex md:hidden h-full w-full items-center justify-center z-10 relative">
        <CellphoneNavigation />
      </div>

      {/* Background Image */}
      <img
        src={backgroundImage}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover brightness-50 z-0"
      />
    </div>
  );
}

function DekstopNavigation({ scrollToSection }) {
  const [showRegistration, setShowRegistration] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-screen overflow-x-hidden">
      {/* Fixed Navigation Bar */}
      <div className="fixed top-0 left-0 w-full z-50 text-white font-bold">
        <div className="h-16 flex justify-end items-center px-16">
          <nav className="hidden md:flex items-center justify-center space-x-8 py-4">
            <button
              onClick={() => scrollToSection("section0")}
              className="relative group  hover:text-yellow-300 transition-colors duration-300 "
            >
              Login
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </button>
            <div className="h-6 w-0.5 bg-white/30" />
            <button
              onClick={() => scrollToSection("section1")}
              className="relative group  hover:text-yellow-300 transition-colors duration-300 "
            >
              Organizations
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </button>
            <div className="h-6 w-0.5 bg-white/30" />
            <button
              onClick={() => scrollToSection("section2")}
              className="relative group  hover:text-yellow-300 transition-colors duration-300"
            >
              Latest Posts
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </button>
            <div className="h-6 w-0.5 bg-white/30" />
            <button
              onClick={() => scrollToSection("section3")}
              className="relative group  hover:text-yellow-300 transition-colors duration-300"
            >
              Event Calendar
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content (with top padding so it doesn’t get hidden under nav) */}
      <div id="section0" className="pt-16">
        <div className="h-screen w-full flex justify-center items-center">
          <div className="h-full flex flex-col items-start px-8 justify-center w-1/3">
            <p className="stroked-text-cnsc text-[100px] leading-[90px]">
              CNSC
            </p>
            <p className="stroked-text-codex text-[100px] -mt-6">CODEX</p>
            <h1 className="text-white text-2xl font-bold italic mt-2 mb-5">
              Document Tracking and Data Management for Student Organizations
            </h1>
          </div>

          <div className="h-full items-center flex justify-center w-1/3">
            {showRegistration ? (
              <RegistrationForm
                onBackToLogin={() => setShowRegistration(false)}
                onShowRegistration={setShowRegistration}
              />
            ) : (
              <Login
                navigate={navigate}
                onShowRegistration={() => setShowRegistration(true)}
              />
            )}
          </div>
        </div>
      </div>

      <div id="section1">
        <OrganzationComponent />
      </div>

      <div id="section2">
        <EventComponent />
      </div>

      <div id="section3">
        <CalendarComponent />
      </div>
    </div>
  );
}

function CellphoneNavigation() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="relative h-screen w-screen ">
      {/* Fixed Background Image - No Movement */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat w-full h-full"
        style={{
          backgroundImage: `url('/cnscbg.jpg')`,
        }}
      />

      {/* Dark Overlay for Better Text Readability */}
      <div className="fixed inset-0 bg-black/30 z-10" />

      {/* Hero Section */}
      <div id="hero" className="relative flex flex-col z-20 min-h-screen ">
        <div className="h-screen flex  px-12 flex-col justify-center items-center">
          <div className="text-white   bg-cnsc-black-color/80 px-6 py-16 text-center flex flex-col items-center space-y-8">
            {/* Title Section */}
            <div className="space-y-2">
              <h1 className="text-cnsc-primary-color font-extrabold text-5xl tracking-wide">
                CNSC{" "}
                <span className="text-cnsc-secondary-color font-bold text-5xl tracking-wide">
                  CODE
                </span>
              </h1>
              <h2></h2>
              <p className="text-sm font-semibold italic max-w-xl mx-auto">
                Document Tracking and Data Management for Student Organizations
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col border items-center justify-center mt-4">
              <button
                onClick={() => scrollToSection("organizations")}
                className="px-4 py-2"
              >
                View Organizations
              </button>
              <div className="w-1/3 border h-full bg-white" />
              <button
                onClick={() => scrollToSection("posts")}
                className="px-4 py-2"
              >
                See Latest Posts & Updates
              </button>
              <div className="w-1/3 border h-full bg-white" />
              <button
                onClick={() => scrollToSection("calendar")}
                className="px-4 py-2"
              >
                View Event Calendar
              </button>
            </div>
          </div>
        </div>
        <div id="organizations" className="min-h-screen bg-blue-100 z-100">
          <OrganzationComponent />
        </div>

        {/* Posts Section */}
        <div id="posts" className="min-h-screen pt-20 bg-green-100 z-100">
          <CalendarComponent />
        </div>

        {/* Calendar Section */}
        <div id="calendar" className="min-h-screen bg-violet-100 ">
          <EventComponent />
        </div>
      </div>

      {/* Organizations Section */}
    </div>
  );
}

// Your component implementations remain the same
