import { useState, useEffect } from "react";
import { API_ROUTER } from "../../App";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  X,
  ArrowLeft,
} from "lucide-react";

export function CalendarComponent() {
  const [proposalCalendar, setProposalCalendar] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${API_ROUTER}/getAllProposalConduct/`,
          { withCredentials: true }
        );

        // Ensure we always set an array
        setProposalCalendar(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setProposalCalendar([]);
      }
    };

    fetchUserData();
  }, []);

  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const getEventsForDate = (date) => {
    if (!proposalCalendar || proposalCalendar.length === 0) return [];

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    return proposalCalendar.filter((event) => {
      const proposedDate =
        event?.ProposedIndividualActionPlan?.proposedDate?.split("T")[0];
      return proposedDate === dateStr;
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Conduct Approved":
        return "bg-gray-800";
      case "Pending":
        return "bg-gray-500";
      case "Revision Update from Student Leader":
        return "bg-gray-600";
      default:
        return "bg-gray-400";
    }
  };

  const formatDateForDisplay = (isoString) => {
    if (!isoString) return "No Date";
    const date = new Date(isoString);
    return isNaN(date)
      ? "Invalid Date"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  const handleDayClick = (events) => {
    if (!events || events.length === 0) return;

    if (events.length === 1) {
      setSelectedEvent(events[0]);
      setSelectedDayEvents(null);
    } else {
      setSelectedDayEvents({
        events,
        date: formatDateForDisplay(
          events[0]?.ProposedIndividualActionPlan?.proposedDate
        ),
      });
      setSelectedEvent(null);
    }
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => {
      setSelectedEvent(null);
      setSelectedDayEvents(null);
    }, 300);
  };

  const selectEventFromDay = (event) => {
    setSelectedEvent(event);
    setSelectedDayEvents(null);
  };

  const goBackToDayEvents = () => {
    setSelectedEvent(null);
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Day headers
    dayNames.forEach((day) => {
      days.push(
        <div
          key={day}
          className="p-3 text-center font-semibold text-gray-800 bg-gray-200"
        >
          {day}
        </div>
      );
    });

    // Empty slots before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-3 bg-gray-50"></div>);
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const events = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`p-2 min-h-[120px] border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
            isToday ? "bg-gray-200 border-gray-400" : "bg-white"
          }`}
          onClick={() => handleDayClick(events, date)}
        >
          <div
            className={`text-sm font-medium mb-1 ${
              isToday ? "text-gray-900" : "text-gray-800"
            }`}
          >
            {day}
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[80px]">
            {events.map((event) => (
              <div
                key={event?._id || Math.random()}
                className={`text-xs p-1 rounded text-white truncate ${getStatusColor(
                  event?.overallStatus
                )}`}
                title={`${
                  event?.ProposedIndividualActionPlan?.activityTitle ||
                  "Untitled"
                } - ${event?.overallStatus || "No Status"}`}
              >
                {event?.ProposedIndividualActionPlan?.activityTitle ||
                  "Untitled"}
              </div>
            ))}

            {events.length > 3 && (
              <div className="text-xs text-gray-600 text-center bg-gray-100 rounded px-1">
                +{events.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full max-w-3/4 ">
      {/* CNSC CODEX Title */}
      <div className="flex flex-wrap items-center justify-center text-center mb-2">
        <h1 className="text-xl md:text-3xl font-extrabold tracking-wide">
          <span className="text-[#500000] drop-shadow-[1px_1px_0_white]">
            CNSC{" "}
          </span>
          <span className="text-[#ee8f00] mr-2 drop-shadow-[1px_1px_0_white]">
            CODEX{" "}
          </span>
          <span className="text-white drop-shadow-[1px_1px_0_#ee8f00]">
            EVENT CALENDAR
          </span>
        </h1>
      </div>

      <div className="w-full mx-auto flex gap-3 p-2">
        {/* Calendar Section */}
        <div className="bg-white flex-1 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-cnsc-primary-color text-white p-3 flex justify-between items-center">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-cnsc-secondary-color rounded-full transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-lg font-bold">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-cnsc-secondary-color rounded-full transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0">{renderCalendarGrid()}</div>
        </div>

        {/* Multiple Events View */}
        {selectedDayEvents && !selectedEvent && (
          <div className="flex flex-col bg-white rounded-lg shadow-md w-80">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-cnsc-primary-color text-white rounded-t-lg">
              <h3 className="text-md font-bold">
                Events on {selectedDayEvents.date}
              </h3>
              <button
                onClick={closePanel}
                className="p-1 hover:bg-cnsc-secondary-color rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-3 space-y-3">
              {selectedDayEvents.events.map((event) => (
                <div
                  key={event?._id || Math.random()}
                  className="border border-gray-200 rounded p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => selectEventFromDay(event)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-cnsc-primary-color text-sm leading-tight">
                      {event?.ProposedIndividualActionPlan?.activityTitle ||
                        "Untitled"}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded text-xs text-white ml-1 ${getStatusColor(
                        event?.overallStatus
                      )}`}
                    >
                      {event?.overallStatus || "No Status"}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-cnsc-secondary-color" />
                      <span>
                        {event?.ProposedIndividualActionPlan?.venue ||
                          "No Venue"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-cnsc-primary-color">
                        Budget:
                      </span>
                      <span className="text-cnsc-secondary-color font-medium">
                        ₱
                        {event?.ProposedIndividualActionPlan
                          ?.budgetaryRequirements
                          ? event.ProposedIndividualActionPlan.budgetaryRequirements.toLocaleString()
                          : "0"}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1 line-clamp-2 text-xs">
                      {event?.ProposedIndividualActionPlan?.briefDetails ||
                        "No details provided."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Single Event View */}
        {selectedEvent && (
          <div className="flex flex-col bg-white shadow-md rounded-lg w-80">
            <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-cnsc-primary-color text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                {selectedDayEvents && (
                  <button
                    onClick={goBackToDayEvents}
                    className="p-1 hover:bg-cnsc-secondary-color rounded-full transition-colors"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <h2 className="text-md font-semibold leading-tight">
                  Event Details
                </h2>
              </div>
              <button
                onClick={closePanel}
                className="p-1 hover:bg-cnsc-secondary-color rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-cnsc-primary-color leading-tight">
                  {selectedEvent?.ProposedIndividualActionPlan?.activityTitle ||
                    "Untitled"}
                </h3>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Proponent Organization
                </p>
                <p className="font-medium text-cnsc-primary-color text-sm">
                  {selectedEvent?.organizationProfile?.orgName ||
                    "Unknown Organization"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <Calendar size={14} className="text-cnsc-secondary-color" />
                  <span>
                    {formatDateForDisplay(
                      selectedEvent?.ProposedIndividualActionPlan?.proposedDate
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <MapPin size={14} className="text-cnsc-secondary-color" />
                  <span>
                    {selectedEvent?.ProposedIndividualActionPlan?.venue ||
                      "No Venue"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <span className="font-medium text-cnsc-primary-color">
                    Budget:
                  </span>
                  <span className="text-cnsc-secondary-color font-medium">
                    ₱
                    {selectedEvent?.ProposedIndividualActionPlan
                      ?.budgetaryRequirements
                      ? selectedEvent.ProposedIndividualActionPlan.budgetaryRequirements.toLocaleString()
                      : "0"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <span className="font-medium text-cnsc-primary-color">
                    Status:
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium text-white ${getStatusColor(
                      selectedEvent?.overallStatus
                    )}`}
                  >
                    {selectedEvent?.overallStatus || "No Status"}
                  </span>
                </div>
              </div>

              <div>
                <p className="font-medium text-cnsc-primary-color mb-1 text-sm">
                  Aligned SDGs
                </p>
                <div className="flex flex-wrap gap-1">
                  {(
                    selectedEvent?.ProposedIndividualActionPlan?.alignedSDG ||
                    []
                  ).map((sdg, index) => {
                    try {
                      if (typeof sdg === "string" && sdg.startsWith("[")) {
                        const parsed = JSON.parse(sdg);
                        return parsed.map((parsedSdg, subIndex) => (
                          <span
                            key={`${index}-${subIndex}`}
                            className="rounded bg-cnsc-secondary-color bg-opacity-10 px-2 py-1 text-xs text-cnsc-primary-color border border-cnsc-secondary-color border-opacity-20"
                          >
                            {parsedSdg}
                          </span>
                        ));
                      }
                    } catch {
                      // fallback to raw
                    }
                    return (
                      <span
                        key={index}
                        className="rounded bg-cnsc-secondary-color bg-opacity-10 px-2 py-1 text-xs text-cnsc-primary-color border border-cnsc-secondary-color border-opacity-20"
                      >
                        {sdg || "N/A"}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="font-medium text-cnsc-primary-color mb-1 text-sm">
                  Brief Details
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedEvent?.ProposedIndividualActionPlan?.briefDetails ||
                    "No details provided."}
                </p>
              </div>

              <div>
                <p className="font-medium text-cnsc-primary-color mb-1 text-sm">
                  Aligned Objective
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedEvent?.ProposedIndividualActionPlan
                    ?.AlignedObjective || "No objective provided."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {panelOpen && (
        <div
          className="bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closePanel}
        />
      )}
    </div>
  );
}
