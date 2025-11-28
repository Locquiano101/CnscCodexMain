import { TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function StudentDisbursement({
  financialReport,
  handleAddClick,
  setSelectedTransaction,
  setSelectedType,
  setViewModalOpen,
  formatCurrency,
}) {
  return (
    <Card className="bg-white flex-1 flex flex-col overflow-hidden">
      <CardHeader className="sticky top-0 z-10 bg-white border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <CardTitle className="text-xl">Disbursements</CardTitle>
          </div>
          <Button
            onClick={() => handleAddClick("disbursement")}
            className="bg-red-700 hover:bg-red-800 text-white"
          >
            Add Disbursement
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-auto flex flex-col gap-3">
        {financialReport.disbursements.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No disbursements found
          </div>
        ) : (
          financialReport.disbursements.map((item, index) => (
            <Card
              key={`disbursement-${index}`}
              className="bg-red-50 border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => {
                setSelectedTransaction(item);
                setSelectedType("disbursement");
                setViewModalOpen(true);
              }}
            >
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
