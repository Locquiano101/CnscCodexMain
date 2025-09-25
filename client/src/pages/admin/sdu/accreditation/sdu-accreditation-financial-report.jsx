export function OrganizationFinancialReport({ selectedOrg }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Financial Report - {selectedOrg.orgName}
      </h1>
      <p className="text-gray-600 mb-6">
        Financial reporting requirements and submissions
      </p>
      <div className="bg-indigo-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Financial Report Details</h3>
        <p>
          Financial reporting for {selectedOrg.orgName} will be displayed here.
        </p>
      </div>
    </div>
  );
}
export function FinancialReportOverview() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Financial Reports Overview
        </h2>
        <p className="text-gray-600">
          Statistics for financial report submissions
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            Financial Report Statistics
          </h3>
          <div className="h-48 bg-white rounded border flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">💰</div>
              <p>Financial statistics</p>
            </div>
          </div>
        </div>
        <div className="bg-pink-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Submission Timeline</h3>
          <div className="h-48 bg-white rounded border flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📅</div>
              <p>Timeline chart</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
