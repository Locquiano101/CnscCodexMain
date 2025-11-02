import { BriefcaseBusiness, TrendingUp } from "lucide-react";

// Helper to format currency

export function AddCollectionFees({
  financialReport,
  handleAddClick,
  setSelectedTransaction,
  setSelectedType,
  setViewModalOpen,
  formatCurrency,
}) {
  return (
    <div className="bg-white border overflow-hidden border-gray-100 flex-1 flex flex-col">
      <div className="sticky flex justify-between h-16  w-full top-0 z-10 bg-white p-6 border-b border-gray-400 items-center gap-3">
        <div className="flex gap-2 items-center">
          <div className="p-2.5 bg-amber-100 rounded-lg">
            <BriefcaseBusiness className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Collection Fee</h2>
        </div>
        <button
          onClick={() => handleAddClick("collection")}
          className="bg-amber-700 text-white px-5 py-2.5 font-semibold rounded-md w-45"
        >
          Add Collection Fees
        </button>
      </div>

      <div className="flex-1 p-4 overflow-auto flex flex-col gap-3">
        {financialReport?.collections?.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No collections found
          </div>
        ) : (
          financialReport.collections.map((item, index) => (
            <div
              key={`reimbursement-${index}`}
              className="bg-amber-50 p-4 border border-amber-200 cursor-pointer hover:bg-amber-100"
              onClick={() => {
                setSelectedTransaction(item);
                setSelectedType("collections");
                setViewModalOpen(true);
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-800">
                  {item.description}
                </h3>
                <span className="text-amber-600 font-bold">
                  {formatCurrency(item.amount)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Date Reimbursed: {new Date(item.date).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
