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
          {
            withCredentials: true,
          }
        );
        setProposalCalendar(response.data);
      } catch (error) {}
    };

    fetchUserData();
  }, []);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    return proposalCalendar.filter((event) => {
      const eventDate =
        event.ProposedIndividualActionPlan.proposedDate.split("T")[0];
      return eventDate === dateStr;
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
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDayClick = (events, date) => {
    if (events.length === 0) return;

    if (events.length === 1) {
      setSelectedEvent(events[0]);
      setSelectedDayEvents(null);
    } else {
      setSelectedDayEvents({
        events,
        date: formatDateForDisplay(
          events[0].ProposedIndividualActionPlan.proposedDate
        ),
      });
      setSelectedEvent(null);
    }
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    // Delay clearing the content until animation is complete
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
    // selectedDayEvents should still be set, so it will show the day events view
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-3 bg-gray-50"></div>);
    }

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
            {events.map((event, index) => (
              <div
                key={event._id}
                className={`text-xs p-1 rounded text-white truncate ${getStatusColor(
                  event.overallStatus
                )}`}
                title={`${event.ProposedIndividualActionPlan.activityTitle} - ${event.overallStatus}`}
              >
                {event.ProposedIndividualActionPlan.activityTitle}
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
    <div className="min-h-screen  bg-gray-300 flex flex-col gap-4 ">
      {/* Main Calendar Content */}
      <h2 className="text-3xl  font-bold text-gray-900 mb-4 text-center">
        Event Calendar
      </h2>
      {/* Sliding Panel */}
      <div className="h-full mx-auto container flex gap-4  p-12">
        <div className="bg-white flex-1 rounded-lg shadow-lg overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-xl font-bold">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0">{renderCalendarGrid()}</div>
        </div>
        {/* Multiple Events View */}
        {selectedDayEvents && !selectedEvent && (
          <div className="flex flex-col bg-white rounded-xl shadow-md">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b rounded-xl border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                Events on {selectedDayEvents.date}
              </h3>
              <button
                onClick={closePanel}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Events List */}
            <div className="w-fit overflow-y-auto p-6 space-y-4">
              {selectedDayEvents.events.map((event, index) => (
                <div
                  key={event._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => selectEventFromDay(event)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 text-sm leading-tight">
                      {event.ProposedIndividualActionPlan.activityTitle}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded text-xs text-white ml-2 ${getStatusColor(
                        event.overallStatus
                      )}`}
                    >
                      {event.overallStatus}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} />
                      <span>{event.ProposedIndividualActionPlan.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Budget:</span>
                      <span>
                        ₱
                        {event.ProposedIndividualActionPlan.budgetaryRequirements.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {event.ProposedIndividualActionPlan.briefDetails}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Single Event View */}
        {selectedEvent && (
          <div className="flex flex-col bg-white shadow-md rounded-xl ">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-300">
              <div className="flex items-center gap-3">
                {selectedDayEvents && (
                  <button
                    onClick={goBackToDayEvents}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <h2 className="text-lg font-semibold text-gray-800 leading-tight">
                  Event Details
                </h2>
              </div>
              <button
                onClick={closePanel}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Event Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 leading-tight">
                  {selectedEvent.ProposedIndividualActionPlan.activityTitle}
                </h3>
              </div>

              {/* Organization */}
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Proponent Organization
                </p>
                <p className="font-medium text-gray-800">
                  {selectedEvent.organizationProfile.orgName}
                </p>
              </div>

              {/* Date, Venue, Budget, Status */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={16} />
                  <span className="text-sm">
                    {formatDateForDisplay(
                      selectedEvent.ProposedIndividualActionPlan.proposedDate
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={16} />
                  <span className="text-sm">
                    {selectedEvent.ProposedIndividualActionPlan.venue}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-medium text-sm">Budget:</span>
                  <span className="text-sm">
                    ₱
                    {selectedEvent.ProposedIndividualActionPlan.budgetaryRequirements.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-medium text-sm">Status:</span>
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium text-white ${getStatusColor(
                      selectedEvent.overallStatus
                    )}`}
                  >
                    {selectedEvent.overallStatus}
                  </span>
                </div>
              </div>

              {/* SDGs */}
              <div>
                <p className="font-medium text-gray-700 mb-2">Aligned SDGs</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.ProposedIndividualActionPlan.alignedSDG.map(
                    (sdg, index) => {
                      try {
                        if (typeof sdg === "string" && sdg.startsWith("[")) {
                          const parsed = JSON.parse(sdg);
                          return parsed.map((parsedSdg, subIndex) => (
                            <span
                              key={`${index}-${subIndex}`}
                              className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800"
                            >
                              {parsedSdg}
                            </span>
                          ));
                        }
                      } catch {
                        // fallback to string
                      }
                      return (
                        <span
                          key={index}
                          className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800"
                        >
                          {sdg}
                        </span>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Brief Details */}
              <div>
                <p className="font-medium text-gray-700 mb-2">Brief Details</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedEvent.ProposedIndividualActionPlan.briefDetails}
                </p>
              </div>

              {/* Objective */}
              <div>
                <p className="font-medium text-gray-700 mb-2">
                  Aligned Objective
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedEvent.ProposedIndividualActionPlan.AlignedObjective}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {panelOpen && (
        <div
          className=" bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closePanel}
        />
      )}
    </div>
  );
}
