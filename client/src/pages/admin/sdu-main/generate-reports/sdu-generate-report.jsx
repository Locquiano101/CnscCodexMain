import React, { useState } from "react";
import { FileText, Award, Download, Calendar } from "lucide-react";
import { AccreditationReportsView } from "./accreditation-reports.jsx";
import { AccomplishmentReportsView } from "./accomplishment-reports.jsx";
import { CalendarReportsView } from "./calendar-reports.jsx";
import { FinancialReportsView } from "./financial-report.jsx";

export function SduGenerateReports() {
  // Make Accomplishment the default active tab
  const [activeTab, setActiveTab] = useState("financial");

  // Enable both Accreditation and Accomplishment reports in tabs
  const tabs = [
    {
      id: "accomplishment",
      label: "Accomplishment Reports",
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: "accreditation",
      label: "Accreditation Reports",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "calendar",
      label: "Calendar Reports",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: "financial",
      label: "Financial Reports",
      icon: <Calendar className="w-4 h-4" />,
    },
  ];

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden"
      style={{ backgroundColor: "#F5F5F9" }}
    >
      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Swap content: show accreditation when accomplishment tab is active, and vice-versa */}
        {activeTab === "accreditation" && <AccomplishmentReportsView />}
        {activeTab === "accomplishment" && <AccreditationReportsView />}
        {activeTab === "calendar" && <CalendarReportsView />}
        {activeTab === "financial" && <FinancialReportsView />}
      </div>
    </div>
  );
}
