import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddCashInflowModal } from "./add-transaction";

export function StudentCashInflow({
  financialReport,
  setSelectedTransaction,
  orgData,
  setSelectedType,
  setViewModalOpen,
  formatCurrency,
  cashInFlow, // array of inflow objects like the one you shared
}) {
  const [cashInFlowModal, setCashInflowModal] = useState(false);

  return (
    <>
      <Card className="bg-white overflow-hidden flex-1 flex flex-col">
        <CardHeader className="sticky top-0 z-10 bg-white border-b">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <CardTitle className="text-xl">Cash Inflow</CardTitle>
            </div>
            <Button
              onClick={() => setCashInflowModal(true)}
              className="bg-green-700 hover:bg-green-800 !text-white"
            >
              Add Cash Inflow
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 overflow-auto flex flex-col gap-3">
          {cashInFlow.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No cash inflow found
            </div>
          ) : (
            cashInFlow.map((item, index) => (
              <Card
                key={`cash-inflow-${index}`}
                className="bg-green-50 border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => {
                  setSelectedTransaction(item);
                  setSelectedType("cashInflow");
                  setViewModalOpen(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">
                      {item.collectibleFee.title}
                    </h3>
                    <span className="text-green-600 font-bold">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Paid Roster Members: {item.paidRosterMembers}
                  </div>
                  <div className="text-sm text-gray-600">
                    Date: {new Date(item.date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {cashInFlowModal && (
        <AddCashInflowModal
          orgData={orgData}
          isOpen={cashInFlowModal}
          onClose={() => setCashInflowModal(false)}
          financialReportId={financialReport._id}
          onSubmit={async (formData) => {
            // Let parent save the inflow
            await setSelectedTransaction(formData);
          }}
        />
      )}
    </>
  );
}
