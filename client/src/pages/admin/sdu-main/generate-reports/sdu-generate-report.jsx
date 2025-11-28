import React, { useState } from "react";
import { FileText, Award, Download } from "lucide-react";
import { AccreditationReportsView } from "./accreditation-reports.jsx";
import { AccomplishmentReportsView } from "./accomplishment-reports.jsx";

export function SduGenerateReports() {
  const [activeTab, setActiveTab] = useState("accreditation");

  // Temporarily hide accomplishment reports - only show accreditation
  const tabs = [
    {
      id: "accreditation",
      label: "Accreditation Reports",
      icon: <FileText className="w-4 h-4" />,
    },
    // Commented out - will be enabled later
    // {
    //   id: "accomplishment",
    //   label: "Accomplishment Reports",
    //   icon: <Award className="w-4 h-4" />,
    // },
  ];

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export report for:", activeTab);
    alert("Export functionality will be implemented soon!");
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden" style={{ backgroundColor: '#F5F5F9' }}>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-600 mt-1">
              Generate and export accreditation reports
            </p>
          </div>
        </div>
      </div>

      {/* Tabs - Hidden when only one tab */}
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
        {activeTab === "accreditation" && <AccreditationReportsView />}
        {/* Accomplishment reports temporarily hidden */}
        {/* {activeTab === "accomplishment" && <AccomplishmentReportsView />} */}
      </div>
    </div>
  );
}
