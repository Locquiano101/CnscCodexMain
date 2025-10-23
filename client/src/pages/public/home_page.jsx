import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./login_form";
import { RegistrationForm } from "./registration_form";
import backgroundImage from "./../../assets/cnscsch.jpg";
import { OrganizationComponent } from "./organization_profile";
import { CalendarComponent } from "./proposal_calendar";
import { EventComponent } from "./public_post";
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
    <div className="relative h-screen w-screen ">
      {/* Desktop Navigation */}
      <div className="hidden md:flex h-full w-full items-center justify-center z-10 relative">
        <DesktopNavigation scrollToSection={scrollToSection} />
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
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Fixed Navigation Bar */}
      <div className="fixed top-0 left-0 w-full z-50 text-white font-bold">
        <div className="h-16 flex justify-end items-center px-16">
          <nav className="hidden md:flex items-center justify-center space-x-8 py-4">
            {sections.map((section, index) => (
              <React.Fragment key={section}>
                {index > 0 && <div className="h-6 w-0.5 bg-white/30" />}
                <button
                  onClick={() => goToSection(index)}
                  className={`relative group transition-colors duration-300 ${
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
      <div className="relative h-screen max-w-screen flex">
        <div
          className="h-full flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSection * 100}%)` }}
        >
          {/* Section 1 - Organizations */}
          <div className="min-w-full h-full  pt-16 flex-shrink-0">
            <div
              id="section1"
              className=" justify-center items-center flex flex-col h-full"
            >
              <OrganizationComponent />
            </div>
          </div>

          {/* Section 2 - Latest Posts */}
          <div className="min-w-full h-full  pt-16 flex-shrink-0">
            <div
              id="section2"
              className=" justify-center items-center flex flex-col h-full"
            >
              <EventComponent />
            </div>
          </div>

          {/* Section 3 - Event Calendar */}
          <div className="w-full flex-shrink-0">
            <div
              id="section3"
              className=" justify-center w-full items-center flex flex-col h-full"
            >
              <CalendarComponent />
            </div>
          </div>

          {/* Section 0 - Login */}
          <div className="min-w-full h-full  pt-16 flex-shrink-0">
            <div id="section0">
              <div className="h-screen w-full flex justify-center items-center">
                <div className="h-full flex flex-col items-start px-8 justify-center w-1/3">
                  <p className="stroked-text-cnsc text-[100px] leading-[90px]">
                    CNSC
                  </p>
                  <p className="stroked-text-codex text-[100px] -mt-6">CODEX</p>
                  <h1 className="text-white text-2xl font-bold italic mt-2 mb-5">
                    Document Tracking and Data Management for Student
                    Organizations
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
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4">
        {/* Left Chevron */}
        <button
          onClick={goToPrevious}
          disabled={currentSection === 0}
          className={`p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 ${
            currentSection === 0
              ? "opacity-30 cursor-not-allowed"
              : "opacity-70 hover:opacity-100 hover:bg-white/20"
          }`}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        {/* Indicators */}
        <div className="flex gap-3">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSection(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSection === index
                  ? "bg-yellow-300 w-8"
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
          className={`p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 ${
            currentSection === sections.length - 1
              ? "opacity-30 cursor-not-allowed"
              : "opacity-70 hover:opacity-100 hover:bg-white/20"
          }`}
        >
          <ChevronRight className="w-6 h-6 text-white" />
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
          <OrganizationComponent />
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
