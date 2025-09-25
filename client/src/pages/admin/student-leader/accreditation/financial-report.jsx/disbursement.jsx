import { TrendingDown } from "lucide-react";

export function StudentDisbursement({
  financialReport,
  handleAddClick,
  setSelectedTransaction,
  setSelectedType,
  setViewModalOpen,
  formatCurrency,
}) {
  return (
    <div className="bg-white shadow-lg border border-gray-100 flex-1 flex flex-col overflow-hidden">
      <div className="sticky justify-between top-0 h-16 z-10 bg-white p-4 border-b border-gray-400 flex items-center">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-red-100 rounded-lg">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Disbursements</h2>
        </div>
        <button
          onClick={() => handleAddClick("disbursement")}
          className="bg-red-700 text-white px-5 py-2.5 font-semibold"
        >
          Add Disbursement
        </button>
      </div>
      <div className="flex-1 p-4 overflow-auto flex flex-col gap-3">
        {financialReport.disbursements.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No disbursements found
          </div>
        ) : (
          financialReport.disbursements.map((item, index) => (
            <div
              key={`disbursement-${index}`}
              className="bg-red-50 p-4 border border-red-200 cursor-pointer hover:bg-red-100"
              onClick={() => {
                setSelectedTransaction(item);
                setSelectedType("disbursement");
                setViewModalOpen(true);
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-800">
                  {item.description}
                </h3>
                <span className="text-red-600 font-bold">
                  {formatCurrency(item.amount)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Date Disbursed: {new Date(item.date).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
