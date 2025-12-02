import {
  Edit,
  Trash2,
  Camera,
  Plus,
  X,
  User,
  Calendar,
  MapPin,
  Award,
  Clock,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import AddStudentPresident from "./add_president";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";
import { ProportionCropTool } from "./../../../../../components/image_uploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Loading Component
const LoadingScreen = () => {
  return (
    <Card className="bg-white flex items-center justify-center min-h-96">
      <CardContent className="flex flex-col items-center space-y-6 p-8">
        {/* Animated spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin animation-delay-150"></div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Presidents...
          </h3>
          <p className="text-sm text-gray-500">
            Please wait while we fetch the data
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce animation-delay-200"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce animation-delay-400"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function StudentLeaderPresidentListComponent({
  orgData,
  accreditationData,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPresident, setCurrentPresident] = useState(null);
  const [remainingPresidents, setRemainingPresidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const orgId = orgData.organization;

  useEffect(() => {
    const GetAndSetPresidents = async () => {
      if (!orgId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_ROUTER}/getPresidents/${orgId}`
        );
        const data = response.data;

        console.log(orgData);
        if (orgData?.orgPresident?._id) {
          const orgPresidentId = orgData.orgPresident._id;

          const matchedPresident = data.find(
            (president) => president._id === orgPresidentId
          );

          if (matchedPresident) {
            setCurrentPresident(matchedPresident);

            // Remaining presidents (exclude current one)
            const remaining = data.filter(
              (president) => president._id !== orgPresidentId
            );
            setRemainingPresidents(remaining);
          } else {
            // No match found → treat all as previous
            setRemainingPresidents(data);
          }
        } else {
          // No orgPresident → all are previous
          setRemainingPresidents(data);
        }
      } catch (error) {
        console.error("Error fetching presidents:", error);
        setError("Failed to load presidents. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    GetAndSetPresidents();
  }, [orgId, orgData?.orgPresident]);

  const handleEdit = (president) => {
    console.log("Edit clicked for:", president.name);
  };

  const handleAdd = () => {
    setShowAddForm(true);
  };

  const handleDelete = (president) => {
    console.log("Delete clicked for:", president.name);
  };

  // Show loading screen while fetching data
  if (loading) {
    return <LoadingScreen />;
  }

  // Show error message if there's an error
  if (error) {
    return (
      <Card className="bg-white">
        <CardContent className="flex flex-col items-center justify-center min-h-96 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Data
            </h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full w-full gap-6 overflow-auto p-6" style={{ backgroundColor: '#F5F5F9' }}>
      {/* Current President */}
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b-2">
            Current President
          </h2>
        </div>

        {currentPresident ? (
          <Card className="bg-white shadow-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <CurrentPresidentCard
                currentPresident={currentPresident}
                orgData={orgData}
              />
            </CardContent>
          </Card>
        ) : (
          <Card
            onClick={handleAdd}
            className="group bg-gradient-to-br from-indigo-50 to-white border-2 border-dashed border-indigo-300 hover:border-indigo-500 cursor-pointer hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-8 flex flex-col justify-center items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center border border-indigo-300 group-hover:border-indigo-500 group-hover:scale-105 transition-all duration-300">
                <Plus
                  size={44}
                  className="text-indigo-600 group-hover:text-indigo-700"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mt-4 group-hover:text-indigo-700 transition-colors duration-200">
                Add Current President
              </h3>
              <p className="text-sm text-gray-500 mt-2 group-hover:text-gray-600 transition-colors duration-200">
                Click here to assign a new president
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Former Presidents */}
      <div className="mt-10">
        {/* Header with subtle divider */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2">
            Former Presidents
          </h2>
          <Badge variant="secondary" className="text-sm italic">
            {remainingPresidents.length}{" "}
            {remainingPresidents.length === 1 ? "record" : "records"}
          </Badge>
        </div>

        {remainingPresidents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingPresidents.map((president) => (
              <Card
                key={president._id}
                className="bg-white shadow-md hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-4">
                  <PresidentCard
                    president={president}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    showActions={false}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-gray-500 text-base italic">
                No former presidents yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      {showAddForm && (
        <Dialog open={showAddForm} onOpenChange={() => setShowAddForm(false)}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
            <AddStudentPresident
              orgInfo={orgData}
              AccreditationId={accreditationData._id}
              onClose={() => setShowAddForm(false)}
              onSuccess={() => {
                setShowAddForm(false);
                window.location.reload();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

const CurrentPresidentCard = ({ currentPresident, orgData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle empty or missing data gracefully
  const president = currentPresident || {};
  const {
    name = "No Name Available",
    course = "N/A",
    year = "N/A",
    department = "No Department",
    age = "N/A",
    sex = "N/A",
    religion = "N/A",
    nationality = "N/A",
    profilePicture = "/cnscsch.jpg",
    presentAddress = {},
    contactNo = "N/A",
    facebookAccount = "",
    parentGuardian = "N/A",
    sourceOfFinancialSupport = "N/A",
    talentSkills = [],
    classSchedule = [],
  } = president;

  const profilePictureUrl = `${DOCU_API_ROUTER}/${president.organizationProfile}/${profilePicture}`;

  return (
    <div className=" mx-auto bg-white ">
      {/* Header Section */}
      <div className="bg-gray-600 px-6 py-8 rounded-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Profile Image */}
          <div
            className="w-32 h-32 rounded-full overflow-hidden cursor-pointer ring-4 ring-white  hover:scale-105 transition-transform duration-200"
            onClick={handleImageClick}
          >
            <img
              src={profilePictureUrl}
              alt="President"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Basic Info */}
          <div className="text-center md:text-left text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{name}</h1>
            <p className="text-lg text-blue-100 mb-1">{course}</p>
            <p className="text-blue-200">
              {year} • {department}
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="p-6 grid md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Personal Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Age:</span>
              <span className="font-medium">{age}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sex:</span>
              <span className="font-medium">{sex}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Religion:</span>
              <span className="font-medium">{religion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nationality:</span>
              <span className="font-medium">{nationality}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contact:</span>
              <span className="font-medium">+63 {contactNo}</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Additional Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Parent/Guardian:</span>
              <span className="font-medium">{parentGuardian}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Financial Support:</span>
              <span className="font-medium">{sourceOfFinancialSupport}</span>
            </div>
            {facebookAccount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Facebook:</span>
                <a
                  href={facebookAccount}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium truncate max-w-32"
                >
                  View Profile
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Section */}
      {presentAddress?.fullAddress && (
        <div className="px-6 pb-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
            Address
          </h3>
          <p className="text-sm text-gray-700">{presentAddress.fullAddress}</p>
        </div>
      )}

      {/* Skills Section */}
      {talentSkills.length > 0 && (
        <div className="px-6 pb-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
            Skills & Talents
          </h3>
          <div className="flex flex-wrap gap-2">
            {talentSkills.map((talent, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                {talent.skill} ({talent.level})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Class Schedule */}
      {classSchedule.length > 0 && (
        <div className="px-6 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
            Class Schedule
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-2 border text-left">Subject</th>
                  <th className="p-2 border text-left">Place/Room</th>
                  <th className="p-2 border text-left">Day</th>
                  <th className="p-2 border text-left">Class Start</th>
                  <th className="p-2 border text-left">Class End</th>
                </tr>
              </thead>
              <tbody>
                {classSchedule.map((schedule, index) => (
                  <tr
                    key={schedule._id || index}
                    className="even:bg-white odd:bg-gray-50"
                  >
                    <td className="p-2 border">{schedule.subject || "N/A"}</td>
                    <td className="p-2 border">{schedule.place || "N/A"}</td>
                    <td className="p-2 border">{schedule.day || "N/A"}</td>
                    <td className="p-2 border">
                      {schedule.time?.start || "N/A"}
                    </td>
                    <td className="p-2 border">
                      {schedule.time?.end || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Modal */}
      {isModalOpen && (
        <UploadPresidentProfilePicture
          isOpen={isModalOpen}
          onClose={closeModal}
          presidentProfileId={currentPresident._id}
          orgData={orgData}
        />
      )}
    </div>
  );
};

const PresidentCard = ({
  president,
  onEdit,
  onDelete,
  onUploadPhoto,
  showActions = false, // Default to false
}) => {
  if (!president) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6 text-center">
          <div className="text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <p>No president assigned</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white h-full w-full duration-200 relative">
      {/* Action buttons - only show for current president */}
      {showActions && (
        <div className="absolute top-3 right-3 flex gap-1">
          <Button
            onClick={() => onEdit(president)}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-blue-600"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onDelete(president)}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Header with profile picture */}
      <div className="flex items-center justify-center mb-4 relative">
        <div className="relative group">
          {president.profilePicture ? (
            <img
              src={`${DOCU_API_ROUTER}/${president.organizationProfile}/${president.profilePicture}`}
              alt={`${president.name}'s profile`}
              className="w-42 h-auto aspect-square rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}

          {/* Fallback avatar with initials */}
          <div
            className={`min-w-32 h-auto aspect-square bg-indigo-100 rounded-full flex items-center justify-center border-2 border-gray-200 ${
              president.profilePicture ? "hidden" : "flex"
            }`}
          >
            <span className="text-2xl font-bold text-indigo-600">
              {president.name ? president.name.charAt(0).toUpperCase() : "P"}
            </span>
          </div>

          {/* Upload overlay - only show for current president */}
          {showActions && (
            <div
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              onClick={() => onUploadPhoto(president)}
              title="Upload photo"
            >
              <Camera className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Main Info */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          {president.name}
        </h3>
        <Badge
          variant={president.isCurrent ? "default" : "secondary"}
          className={
            president.isCurrent
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-gray-50 hover:bg-gray-100"
          }
        >
          {president.isCurrent ? "Current President" : "Former President"}
        </Badge>
        <div className="text-sm text-gray-600 space-y-1">
          <p>{president.courseYear}</p>
          <p>Age: {president.age}</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
        <div className="text-sm">
          <p className="text-gray-500">Contact:</p>
          <p className="text-gray-700">{president.contactNo}</p>
        </div>

        {president.facebookAccount && (
          <div className="text-sm">
            <p className="text-gray-500">Facebook:</p>
            <a
              href={president.facebookAccount}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs break-all"
            >
              {president.facebookAccount.replace(
                "https://www.facebook.com/",
                "@"
              )}
            </a>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <span className="font-medium">Address:</span>{" "}
            <span>{president.permanentAddress?.fullAddress}</span>
          </p>
          <p>
            <span className="font-medium">Financial Support:</span>{" "}
            {president.sourceOfFinancialSupport}
          </p>
          {president.talentSkills && president.talentSkills.length > 0 && (
            <p>
              <span className="font-medium">Skills:</span>{" "}
              {president.talentSkills.map((skill) => skill.skill).join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export function UploadPresidentProfilePicture({
  isOpen,
  closeModal,
  orgData,
  presidentProfileId,
}) {
  console.log(orgData);
  const cropRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [cropData, setCropData] = useState(null);

  const handleCropComplete = (result) => {
    console.log("Original File:", result.originalFile);
    console.log("Cropped File:", result.croppedFile);
    setCropData(result);
  };

  const handleUpload = async () => {
    let finalCropData = cropData;

    if (!finalCropData && cropRef.current?.hasImage) {
      try {
        console.log("No crop data yet. Cropping now...");
        const result = await cropRef.current.cropImage();
        finalCropData = result;
        console.log("Cropped result:", result);
        setCropData(result);
      } catch (err) {
        console.error("❌ Failed to crop image before upload:", err);
        alert("Please crop the image before uploading.");
        return;
      }
    }
    if (!finalCropData || !finalCropData.croppedFile) {
      alert("Please select and crop an image first.");
      return;
    }
    const formData = new FormData();
    console.log("ay", finalCropData.croppedFile);
    formData.append("profilePicture", finalCropData.name);
    formData.append("organization", orgData.organization);
    formData.append("organizationProfile", orgData._id);
    formData.append("file", finalCropData.croppedFile);

    console.log("=== FormData Contents ===");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(
          `${key}: [FILE] ${value.name} (${value.size} bytes, ${value.type})`
        );
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    setUploading(true);

    try {
      const res = await axios.post(
        `${API_ROUTER}/addPresidentProfile/${presidentProfileId}`,
        formData
      );

      const data = res.data;
      console.log("✅ Upload successful:", data);
      alert("Profile picture uploaded successfully!");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Upload & Crop Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <ProportionCropTool
            title="Crop Your Image"
            cropRef={cropRef}
            onCropComplete={handleCropComplete}
            maxImageHeight={500}
            showReset={true}
          />

          <div className="flex justify-center gap-4">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? "Processing..." : "Upload Image"}
            </Button>
            <Button
              onClick={() => cropRef.current?.resetImage()}
              variant="outline"
            >
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
