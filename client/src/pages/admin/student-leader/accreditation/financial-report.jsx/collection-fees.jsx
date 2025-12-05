import { BriefcaseBusiness } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddCollectionFeeModal } from "./add-transaction";

// Helper to format currency
// Helper to format currency
export function AddCollectionFees({
  financialReport,
  setSelectedTransaction,
  setSelectedType,
  formatCurrency,
  orgData,
  setViewModalOpen,
  collectibleFees,
}) {
  const [collectionFeeModal, setCollectionModal] = useState(false);
  console.log(collectibleFees);

  // Use collectibleFees instead of financialReport?.collections
  const collectionData = collectibleFees || financialReport?.collections || [];

  return (
    <>
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
              className="bg-amber-700 hover:bg-amber-800 !text-white"
              onClick={() => setCollectionModal(true)}
            >
              Add Collection Fees
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto flex flex-col gap-3">
          {collectionData.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No collections found
            </div>
          ) : (
            collectionData.map((item, index) => (
              <Card
                key={`collection-${index}-${item._id}`}
                className={`cursor-pointer hover:opacity-90 transition-colors ${
                  item.isCollected
                    ? "bg-green-50 border-green-200"
                    : "bg-amber-50 border-amber-200"
                }`}
                onClick={() => {
                  setSelectedTransaction(item);
                  setSelectedType("collections");
                  setViewModalOpen(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {item.title ||
                          item.description ||
                          "Untitled Collection"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg">
                        {formatCurrency(item.amount)}
                      </span>
                      <div className="text-xs mt-1">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            item.isCollected
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.isCollected ? "Collected" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
                    <div>
                      {item.date && (
                        <>Date: {new Date(item.date).toLocaleDateString()}</>
                      )}
                    </div>
                    <div>
                      Status:{" "}
                      <span className="font-medium">
                        {item.status || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Additional details if needed */}
                  {item.organizationProfile && (
                    <div className="mt-2 text-xs text-gray-500">
                      Org ID: {item.organizationProfile}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Render the modal conditionally */}
      {collectionFeeModal && (
        <AddCollectionFeeModal
          open={collectionFeeModal}
          onClose={() => setCollectionModal(false)}
          orgData={orgData}
          financialReportId={financialReport?._id}
          formatCurrency={formatCurrency}
        />
      )}
    </>
  );
}
