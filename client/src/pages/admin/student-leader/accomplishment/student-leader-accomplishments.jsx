import axios from "axios";
import { API_ROUTER } from "../../../../App";

import { useState, useEffect } from "react";
import { OrganizationalDevelopmentModal } from "./add-organizational-development";
import { Award, Target, Users, FileText, Heart, Calendar } from "lucide-react";
import { StudentAccomplishmentDetailed } from "./detailed-accomplishment";

export function StudentLeaderAccomplishmentReport({ orgData }) {
  const [proposals, setProposals] = useState([]);
  const [accomplishmentData, setAccomplishmentData] = useState(null); // ✅ store report object
  const [individualAccomplishment, setIndividualAccomplishment] = useState([]); // ✅ store sub individualAccomplishment
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedAccomplishment, setSelectedAccomplishment] = useState(null);

  const [showOrgDevelopmentModal, setShowOrgDevelopmentModal] = useState(false);

  const fetchAccomplishmentInformation = async () => {
    try {
      // Accomplishment Report
      const getAccomplishment = await axios.get(
        `${API_ROUTER}/getAccomplishment/${orgData._id}`
      );

      setAccomplishmentData(getAccomplishment.data); // ✅ full report
      console.log(getAccomplishment.data); // ✅ full report
      setIndividualAccomplishment(getAccomplishment.data.accomplishments); // ✅ safe list
    } catch (error) {
      console.error(error.response || error);
    }
  };

  const fetchProposalInformation = async () => {
    try {
      // Proposals
      const res = await axios.get(
        `${API_ROUTER}/getStudentLeaderAccomplishmentReady/${orgData._id}`
      );
      setProposals(res.data);

      setProposals(res.data);
    } catch (error) {
      console.error(error.response || error);
    }
  };

  useEffect(() => {
    fetchAccomplishmentInformation();
    fetchProposalInformation();
  }, []);

  // ✅ Categories
  const categories = [
    "All",
    ...new Set(individualAccomplishment.map((acc) => acc.category)),
  ];

  // ✅ Filtered
  const filteredAccomplishments =
    selectedCategory === "All"
      ? individualAccomplishment
      : individualAccomplishment.filter(
          (acc) => acc.category === selectedCategory
        );

  // ✅ Stats
  const categoryStats = individualAccomplishment.reduce(
    (acc, accomplishment) => {
      acc[accomplishment.category] = (acc[accomplishment.category] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="h-full w-full overflow-hidden  flex flex-col bg-gray-100">
      {/* Header Section */}
      <div className="flex-shrink-0 border-b p-4 border-gray-200 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-3xl font-bold text-gray-900">
            Accomplishment Reports Analytics
          </h1>
          <button
            onClick={() => setShowOrgDevelopmentModal(true)}
            className="bg-amber-700 py-2 px-4  text-white font-semibold hover:bg-amber-600 transition-colors"
          >
            Add Accomplishment
          </button>
        </div>
        <p className="text-gray-600">
          Total Accomplishments: {individualAccomplishment.length} | Grand Total
          Points: {individualAccomplishment?.grandTotal || 0}
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1  p-4 px-2  gap-4  overflow-auto flex flex-col ">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-2">
          <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Accomplishments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {individualAccomplishment.length}
                </p>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white  rounded-lg shadow-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Points
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {accomplishmentData?.grandTotal || 0}
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(categoryStats).length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Most Recent</p>
                <p className="text-sm font-bold text-gray-900 ">
                  {individualAccomplishment.length > 0
                    ? formatDate(
                        Math.max(
                          ...individualAccomplishment.map(
                            (acc) => new Date(acc.createdAt)
                          )
                        )
                      )
                    : "N/A"}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 border-2 border-gray-300 shadow-md text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                selectedCategory === category
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-200"
              }`}
            >
              {category}{" "}
              {category !== "All" && `(${categoryStats[category] || 0})`}
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="w-full  grid grid-cols-5 gap-2  overflow-hidden">
          {/* Left: Accomplishments List */}
          <div className="col-span-1 flex gap-2 flex-col overflow-auto pr-1">
            {filteredAccomplishments.length > 0 ? (
              filteredAccomplishments.map((accomplishment) => (
                <div
                  key={accomplishment._id}
                  onClick={() => setSelectedAccomplishment(accomplishment)}
                  className={`bg-white shadow-sm hover:shadow-md border transition-all duration-200 p-4 cursor-pointer ${
                    selectedAccomplishment?._id === accomplishment._id
                      ? "border-amber-500 ring-blue-200"
                      : "border-white hover:border-amber-200"
                  }`}
                >
                  {/* Category Badge */}
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3 ${getCategoryColor(
                      accomplishment.category
                    )}`}
                  >
                    {getCategoryIcon(accomplishment.category)}
                    {accomplishment.category}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {accomplishment.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-3 line-clamp-2 text-sm leading-relaxed">
                    {accomplishment.description}
                  </p>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {accomplishment.awardedPoints} Points
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {accomplishment.documents &&
                        accomplishment.documents.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {accomplishment.documents.length}
                          </div>
                        )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(accomplishment.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No individualAccomplishment found
                </h3>
                <p className="text-gray-500 max-w-sm">
                  {selectedCategory === "All"
                    ? "Get started by adding your first accomplishment."
                    : `No individualAccomplishment match the "${selectedCategory}" category.`}
                </p>
              </div>
            )}
          </div>
          <div className="col-span-4 overflow-auto">
            <StudentAccomplishmentDetailed
              getCategoryIcon={getCategoryIcon}
              formatDate={formatDate}
              getCategoryColor={getCategoryColor}
              selectedAccomplishment={selectedAccomplishment}
            />
          </div>
        </div>
      </div>

      {showOrgDevelopmentModal && (
        <OrganizationalDevelopmentModal
          orgData={orgData}
          accomplishmentId={accomplishmentData?._id}
          proposals={proposals}
          onClose={() => setShowOrgDevelopmentModal(false)}
        />
      )}
    </div>
  );
}

// Category icon mapping
const getCategoryIcon = (category) => {
  switch (category) {
    case "Proposed Action Plan":
      return <Target className="w-5 h-5" />;
    case "Organizational Performance":
      return <Award className="w-5 h-5" />;
    case "Organizational Development":
      return <Users className="w-5 h-5" />;
    case "Meetings & Assemblies":
      return <FileText className="w-5 h-5" />;
    case "Service Community":
      return <Heart className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

// Category color mapping
const getCategoryColor = (category) => {
  switch (category) {
    case "Programs, Projects, and Activities (PPAs)":
      return "bg-rose-100 text-rose-800 shadow-xl-rose-200";
    case "External Activities":
      return "bg-indigo-100 text-indigo-800 shadow-xl-indigo-200";
    case "Institutional Involvement":
      return "bg-purple-100 text-purple-800 shadow-xl-purple-200";
    case "Meetings & Assemblies":
      return "bg-amber-100 text-amber-800 shadow-xl-amber-200";
    case "Service Community":
      return "bg-pink-100 text-pink-800 shadow-xl-pink-200";
    default:
      return "bg-gray-100 text-gray-800 shadow-xl-gray-200";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
