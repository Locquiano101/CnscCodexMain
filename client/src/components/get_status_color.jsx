export const getRoleStatusColor = (viewerRole, status) => {
  const role = viewerRole?.toLowerCase();
  const currentStatus = status?.toLowerCase();

  // === Adviser ===
  if (role === "adviser") {
    if (currentStatus === "approved by adviser")
      return "bg-green-100 text-green-800 rounded-full";
    if (currentStatus === "revision from adviser")
      return "bg-amber-100 text-amber-800 rounded-full";
    // Others should see adviser-related statuses as "in progress"
    return "bg-blue-100 text-blue-800 rounded-full";
  }

  // === Dean ===
  if (role === "dean") {
    if (currentStatus === "Approved Dean")
      return "bg-green-100 text-green-800 rounded-full";
    if (currentStatus === "revision from dean")
      return "bg-amber-100 text-amber-800 rounded-full";
    return "bg-blue-100 text-blue-800 rounded-full";
  }

  // === SDU ===
  if (role === "sdu" || role === "sdu-coordinator") {
    if (currentStatus === "ApprovedSDU")
      return "bg-green-100 text-green-800 rounded-full";
    if (currentStatus === "Revision from SDU")
      return "bg-amber-100 text-amber-800 rounded-full";
    return "bg-blue-100 text-blue-800 rounded-full";
  }

  // === Student ===
  if (role === "student" || role === "student-leader") {
    if (currentStatus === "revision resubmit by student")
      return "bg-amber-100 text-amber-800 rounded-full";
    if (currentStatus === "submitted")
      return "bg-green-100 text-green-800 rounded-full";
    return "bg-blue-100 text-blue-800 rounded-full";
  }

  if (
    currentStatus === "Conduct Approved" ||
    currentStatus === "Proposal Approved" ||
    currentStatus === "Proposal Approved"
  )
    // Default / fallback
    return "bg-green-100 text-green-800 rounded-full";
  return "bg-gray-100 text-gray-800 rounded-full";
};
