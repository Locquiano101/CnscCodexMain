import { TrendingUp } from "lucide-react";

export function StudentReimbursement({
  financialReport,
  handleAddClick,
  setSelectedTransaction,
  setSelectedType,
  setViewModalOpen,
  formatCurrency,
}) {
  return (
    <div className="bg-white border overflow-hidden border-gray-100 flex-1 flex flex-col">
      <div className="sticky flex justify-between w-full h-16 top-0 z-10 bg-white p-6 border-b border-gray-400 items-center gap-3">
        <div className="flex gap-2 items-center">
          <div className="p-2.5 bg-green-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Reimbursements</h2>
        </div>
        <button
          onClick={() => handleAddClick("reimbursement")}
          className="bg-green-700 text-white px-5 py-2.5 font-semibold rounded-md w-45"
        >
          Add Reimbursement
        </button>
      </div>
      <div className="flex-1 p-4 overflow-auto flex flex-col gap-3">
        {financialReport.reimbursements.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No reimbursements found
          </div>
        ) : (
          financialReport.reimbursements.map((item, index) => (
            <div
              key={`reimbursement-${index}`}
              className="bg-green-50 p-4 border border-green-200 cursor-pointer hover:bg-green-100"
              onClick={() => {
                setSelectedTransaction(item);
                setSelectedType("reimbursement");
                setViewModalOpen(true);
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-800">
                  {item.description}
                </h3>
                <span className="text-green-600 font-bold">
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
