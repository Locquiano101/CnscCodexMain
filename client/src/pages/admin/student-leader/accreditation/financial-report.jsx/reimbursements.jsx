import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function StudentReimbursement({
  financialReport,
  handleAddClick,
  setSelectedTransaction,
  setSelectedType,
  setViewModalOpen,
  formatCurrency,
}) {
  return (
    <Card className="bg-white overflow-hidden flex-1 flex flex-col">
      <CardHeader className="sticky top-0 z-10 bg-white border-b">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <div className="p-2.5 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <CardTitle className="text-xl">Reimbursements</CardTitle>
          </div>
          <Button
            onClick={() => handleAddClick("reimbursement")}
            className="bg-green-700 hover:bg-green-800 text-white"
          >
            Add Reimbursement
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-auto flex flex-col gap-3">
        {financialReport.reimbursements.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No reimbursements found
          </div>
        ) : (
          financialReport.reimbursements.map((item, index) => (
            <Card
              key={`reimbursement-${index}`}
              className="bg-green-50 border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => {
                setSelectedTransaction(item);
                setSelectedType("reimbursement");
                setViewModalOpen(true);
              }}
            >
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
