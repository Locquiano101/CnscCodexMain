import { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { API_ROUTER } from "../App";

export function EmailModal({
  open,
  onClose,
  title = "Compose Email",
  description,
  sendButtonLabel = "Send Email",
  onSuccess, // callback after success
  route = "accreditationEmailInquiry",
  Subject,
  onError,
  orgData,
  user, // callback after failure
}) {
  if (!open) return null;
  const [loading, setLoading] = useState(false);

  console.log(orgData);
  // In-house emailData state
  const [emailData, setEmailData] = useState({
    orgId: orgData._id,
    to: orgData.orgName,
    orgName: orgData.orgName,
    userPosition: user.position, // You might want to pre-fill this with org president's email
    userName: user.name, // You might want to pre-fill this with org president's email
    inquirySubject: Subject,
    inquiryText: ``,
  });

  if (!open) return null;

  // Internal email handler
  const handleSendEmail = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_ROUTER}/${route}`, emailData);
      console.log("📧 Email Sent:", res.data);

      if (onSuccess) onSuccess(res.data);
      onClose(); // auto-close after success
    } catch (err) {
      console.error("❌ Failed to send email:", err);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-700 mb-4">{description}</p>
        )}

        {/* Form */}
        <div className="flex flex-col gap-4">
          <label>
            <p>Organization name:</p>
            <input
              type="text"
              placeholder="To"
              className="w-full border rounded px-3 py-2 text-sm"
              value={emailData.to}
              onChange={(e) =>
                setEmailData({ ...emailData, to: e.target.value })
              }
              disabled={loading}
            />
          </label>
          <label>
            <p>Subject:</p>
            <input
              type="text"
              placeholder="Subject"
              className="w-full border rounded px-3 py-2 text-sm"
              value={emailData.inquirySubject}
              onChange={(e) =>
                setEmailData({ ...emailData, inquirySubject: e.target.value })
              }
              disabled={loading}
            />
          </label>
          <label>
            <p>Message:</p>
            <textarea
              placeholder="Message"
              rows={5}
              className="w-full border rounded px-3 py-2 text-sm"
              value={emailData.inquiryText}
              onChange={(e) =>
                setEmailData({ ...emailData, inquiryText: e.target.value })
              }
              disabled={loading}
            ></textarea>
          </label>
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 text-sm rounded ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            onClick={handleSendEmail}
            disabled={loading}
          >
            {loading ? "Sending..." : sendButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
