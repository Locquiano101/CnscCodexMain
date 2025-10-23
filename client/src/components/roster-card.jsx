import { DOCU_API_ROUTER } from "../App";
import { Mail, Phone, MapPin, Calendar, User } from "lucide-react";

export const RosterMemberCard = ({ member, orgId }) => (
  <div className="flex flex-col items-center bg-white rounded-xl  border-2 border-gray-300 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300  group px-6 py-8">
    {/* Profile Section */}
    <div className="flex flex-col items-center mb-4">
      <div className="relative">
        <img
          src={
            member.profilePicture
              ? `${DOCU_API_ROUTER}/${orgId}/${member.profilePicture}`
              : "/cnsc-logo.png"
          }
          alt={member.name}
          className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
        />
        <div
          className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${
            member.status === "Active" ? "bg-green-500" : "bg-gray-400"
          }`}
        />
      </div>
    </div>

    {/* Name & Position */}
    <div className="flex flex-col items-center text-center mb-4">
      <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
      <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full">
        {member.position}
      </span>
      {member.studentId && (
        <p className="text-xs text-gray-500 mt-2">ID: {member.studentId}</p>
      )}
    </div>

    {/* Contact Info */}
    <div className="flex flex-col w-full gap-3">
      <div className="flex items-center gap-3 text-sm text-gray-600 group/item hover:text-indigo-600 transition-colors">
        <Mail className="w-4 h-4 text-gray-400 group-hover/item:text-indigo-500 flex-shrink-0" />
        <span className="truncate">{member.email}</span>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600 group/item hover:text-indigo-600 transition-colors">
        <Phone className="w-4 h-4 text-gray-400 group-hover/item:text-indigo-500 flex-shrink-0" />
        <span>{member.contactNumber}</span>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600 group/item hover:text-indigo-600 transition-colors">
        <MapPin className="w-4 h-4 text-gray-400 group-hover/item:text-indigo-500 flex-shrink-0" />
        <span className="line-clamp-1">{member.address}</span>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600">
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span>
          {member.birthDate
            ? new Date(member.birthDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Not provided"}
        </span>
      </div>
    </div>
  </div>
);
