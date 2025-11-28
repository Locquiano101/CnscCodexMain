import { BriefcaseBusiness, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <Card className="bg-white overflow-hidden flex-1 flex flex-col">
      <CardHeader className="sticky top-0 z-10 bg-white border-b">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <div className="p-2.5 bg-amber-100 rounded-lg">
              <BriefcaseBusiness className="w-5 h-5 text-amber-600" />
            </div>
            <CardTitle className="text-xl">Collection Fee</CardTitle>
          </div>
          <Button
            onClick={() => handleAddClick("collection")}
            className="bg-amber-700 hover:bg-amber-800 text-white"
          >
            Add Collection Fees
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 overflow-auto flex flex-col gap-3">
        {financialReport?.collections?.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No collections found
          </div>
        ) : (
          financialReport.collections.map((item, index) => (
            <Card
              key={`reimbursement-${index}`}
              className="bg-amber-50 border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={() => {
                setSelectedTransaction(item);
                setSelectedType("collections");
                setViewModalOpen(true);
              }}
            >
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
