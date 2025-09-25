import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";

// Example Usage Component
const ExampleUsage = () => {
  const [submittedData, setSubmittedData] = useState(null);
  const formRef = useRef();

  const handleSubmit = () => {
    const data = formRef.current.getFormData();
    console.log("Submitted data:", data);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Philippine Address Form Example
          </h1>

          <div>
            <PhilippineAddressForm ref={formRef} />

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Submit Address
              </button>
            </div>
          </div>

          {/* Display submitted data */}
          {submittedData && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Submitted Address Data (also logged to console):
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">
                    Present Address:
                  </h3>
                  <p className="text-gray-600">
                    {submittedData.presentAddress.fullAddress}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">
                    Permanent Address:
                  </h3>
                  <p className="text-gray-600">
                    {submittedData.permanentAddress.fullAddress}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">
                    Same as Present:
                  </h3>
                  <p className="text-gray-600">
                    {submittedData.sameAsPresent ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExampleUsage;
