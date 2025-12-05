import React, { useState } from "react";
import Login from "./login_form";
import { RegistrationForm } from "./registration_form";
import backgroundImage from "./../../assets/cnscsch.jpg";
import { OrganizationComponent } from "./organization_profile";
import { CalendarComponent } from "./proposal_calendar";
import { EventComponent } from "./event_component";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomePage() {
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
    <div className="relative h-screen  w-screen">
      {/* Desktop Navigation */}
      <div className="hidden md:flex h-full w-full  items-center  justify-center z-10 relative">
        <DesktopNavigation scrollToSection={scrollToSection} />
      </div>
      
      {/* Mobile Navigation */}
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

function DesktopNavigation() {
  const [currentSection, setCurrentSection] = useState(0);
  const [showRegistration, setShowRegistration] = useState(false);

  const sections = ["Organizations", "Latest Posts", "Event Calendar", "Login"];

  const goToSection = (index) => {
    if (index >= 0 && index < sections.length) {
      setCurrentSection(index);
    }
  };

  const goToPrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const goToNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  return (
    <div className="relative h-full w-full  flex overflow-hidden">
      {/* Fixed Navigation Bar */}
      <div className="fixed top-0 left-0 w-full z-50 text-white font-bold">
        <div className="h-16 flex justify-end items-center px-4 md:px-8 lg:px-16">
          <nav className="hidden md:flex items-center justify-center space-x-4 lg:space-x-8 py-4">
            {sections.map((section, index) => (
              <React.Fragment key={section}>
                {index > 0 && <div className="h-6 w-0.5 bg-white/30" />}
                <button
                  onClick={() => goToSection(index)}
                  className={`relative group transition-colors duration-300 text-sm lg:text-base ${
                    currentSection === index
                      ? "text-yellow-300"
                      : "hover:text-yellow-300"
                  }`}
                >
                  {section}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-yellow-300 transition-transform duration-300 origin-left ${
                      currentSection === index
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="flex h-full w-full">
        <div
          className="h-full w-full   flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSection * 100}%)` }}
        >
          {/* Section 1 - Organizations */}
          <div className="w-full h-full pt-16 flex-shrink-0">
            <div
              id="section1"
              className="justify-center pb-12 items-center flex flex-col h-full px-4"
            >
              <OrganizationComponent />
            </div>
          </div>

          {/* Section 2 - Latest Posts */}
          <div className="w-full h-full  pt-16 flex-shrink-0">
            <div
              id="section2"
              className="justify-center items-center flex flex-col h-full px-4"
            >
              <EventComponent />
            </div>
          </div>

          {/* Section 3 - Event Calendar */}
          <div className="w-screen h-full  pt-16 flex-shrink-0">
            <div
              id="section3"
              className="justify-center w-full items-center flex flex-col h-full px-4"
            >
              <CalendarComponent />
            </div>
          </div>

          {/* Section 4 - Login */}
          <div className="w-screen h-full pt-16 flex-shrink-0">
            <div id="section0">
              <div className="h-screen w-full flex flex-col lg:flex-row justify-center items-center px-4 md:px-8">
                {/* Text Section */}
                <div className="flex flex-col items-center lg:items-start justify-center w-full lg:w-1/3 mb-8 lg:mb-0">
                  <p className="text-yellow-300 text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[100px] leading-tight font-bold">
                    CNSC
                  </p>
                  <p className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[100px] leading-tight font-bold -mt-2 md:-mt-4">
                    CODEX
                  </p>
                  <h1 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold italic mt-2 mb-5 text-center lg:text-left max-w-md">
                    Document Tracking and Data Management for Student Organizations
                  </h1>
                </div>

                {/* Login/Registration Form Section */}
                <div className="flex items-center justify-center w-full lg:w-1/3 px-4">
                  {showRegistration ? (
                    <RegistrationForm
                      onBackToLogin={() => setShowRegistration(false)}
                      onShowRegistration={setShowRegistration}
                    />
                  ) : (
                    <Login
                      onShowRegistration={() => setShowRegistration(true)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Circular Indicators with Chevrons */}
      <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 md:gap-4">
        {/* Left Chevron */}
        <button
          onClick={goToPrevious}
          disabled={currentSection === 0}
          className={`p-1.5 md:p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 ${
            currentSection === 0
              ? "opacity-30 cursor-not-allowed"
              : "opacity-70 hover:opacity-100 hover:bg-white/20"
          }`}
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>

        {/* Indicators */}
        <div className="flex gap-2 md:gap-3">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSection(index)}
              className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                currentSection === index
                  ? "bg-yellow-300 w-6 md:w-8"
                  : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to section ${index + 1}`}
            />
          ))}
        </div>

        {/* Right Chevron */}
        <button
          onClick={goToNext}
          disabled={currentSection === sections.length - 1}
          className={`p-1.5 md:p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 ${
            currentSection === sections.length - 1
              ? "opacity-30 cursor-not-allowed"
              : "opacity-70 hover:opacity-100 hover:bg-white/20"
          }`}
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>
      </div>
    </div>
  );
}

function CellphoneNavigation() {
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
    <div className="relative h-screen w-screen">
      {/* Fixed Background with gradient fallback */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-blue-900 to-purple-900 w-full h-full" />

      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/40 z-10" />

      {/* Scrollable Content */}
      <div className="relative z-20 overflow-y-auto h-screen">
        {/* Hero Section */}
        <div id="hero" className="min-h-screen flex items-center justify-center px-4 sm:px-6">
          <div className="text-white bg-black/60 backdrop-blur-sm px-6 sm:px-8 py-12 sm:py-16 rounded-lg text-center flex flex-col items-center space-y-6 sm:space-y-8 max-w-lg w-full">
            {/* Title Section */}
            <div className="space-y-2">
              <h1 className="text-yellow-300 font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-wide">
                CNSC{" "}
                <span className="text-white font-bold">CODEX</span>
              </h1>
              <p className="text-xs sm:text-sm font-semibold italic px-4">
                Document Tracking and Data Management for Student Organizations
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col border border-white/30 rounded-lg overflow-hidden w-full">
              <button
                onClick={() => scrollToSection("organizations")}
                className="px-4 py-3 sm:py-4 hover:bg-white/10 transition-colors text-sm sm:text-base"
              >
                View Organizations
              </button>
              <div className="w-full border-t border-white/30" />
              <button
                onClick={() => scrollToSection("posts")}
                className="px-4 py-3 sm:py-4 hover:bg-white/10 transition-colors text-sm sm:text-base"
              >
                See Latest Posts & Updates
              </button>
              <div className="w-full border-t border-white/30" />
              <button
                onClick={() => scrollToSection("calendar")}
                className="px-4 py-3 sm:py-4 hover:bg-white/10 transition-colors text-sm sm:text-base"
              >
                View Event Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Organizations Section */}
        <div id="organizations" className="min-h-screen bg-blue-900/80 backdrop-blur-sm py-8 sm:py-12">
          <OrganizationComponent />
        </div>

        {/* Posts Section */}
        <div id="posts" className="min-h-screen bg-green-900/80 backdrop-blur-sm py-8 sm:py-12">
          <CalendarComponent />
        </div>

        {/* Calendar Section */}
        <div id="calendar" className="min-h-screen bg-violet-900/80 backdrop-blur-sm py-8 sm:py-12">
          <EventComponent />
        </div>
      </div>
    </div>
  );
}
