import { Badge } from "@/components/ui/badge";

/**
 * Get the appropriate badge variant based on role and status
 * @param {string} viewerRole - The role viewing the status
 * @param {string} status - The current status
 * @returns {string} Badge variant name
 */
export const getStatusVariant = (viewerRole, status) => {
  const role = viewerRole?.toLowerCase();
  const currentStatus = status?.toLowerCase();

  // Approved statuses
  if (
    currentStatus === "approved by adviser" ||
    currentStatus === "approved dean" ||
    currentStatus === "approvedsdu" ||
    currentStatus === "submitted" ||
    currentStatus === "conduct approved" ||
    currentStatus === "proposal approved"
  ) {
    return "approved";
  }

  // Revision/pending statuses
  if (
    currentStatus === "revision from adviser" ||
    currentStatus === "revision from dean" ||
    currentStatus === "revision from sdu" ||
    currentStatus === "revision resubmit by student"
  ) {
    return "for-revision";
  }

  // In progress/default
  return "pending";
};

/**
 * StatusBadge Component - displays status with appropriate styling
 * @param {Object} props
 * @param {string} props.status - The status text to display
 * @param {string} props.viewerRole - The role viewing the status (optional)
 * @param {string} props.variant - Override variant (optional)
 * @param {string} props.className - Additional classes (optional)
 */
export function StatusBadge({ status, viewerRole, variant, className, ...props }) {
  const badgeVariant = variant || getStatusVariant(viewerRole, status);
  
  return (
    <Badge variant={badgeVariant} className={className} {...props}>
      {status || "Unknown"}
    </Badge>
  );
}

// Legacy function for backwards compatibility
export const getRoleStatusColor = (viewerRole, status) => {
  const variant = getStatusVariant(viewerRole, status);
  
  // Map variants to old Tailwind classes for components not yet migrated
  const colorMap = {
    approved: "bg-green-100 text-green-800 rounded-full",
    "for-revision": "bg-amber-100 text-amber-800 rounded-full",
    pending: "bg-blue-100 text-blue-800 rounded-full",
    default: "bg-gray-100 text-gray-800 rounded-full",
  };
  
  return colorMap[variant] || colorMap.default;
};
