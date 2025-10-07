export function SduMainIndividualProposeActionPlan({ selectedOrg }) {
  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        Selected Organization Data
      </h2>
      <pre className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-800 overflow-x-auto">
        {JSON.stringify(selectedOrg, null, 2)}
      </pre>
    </div>
  );
}
