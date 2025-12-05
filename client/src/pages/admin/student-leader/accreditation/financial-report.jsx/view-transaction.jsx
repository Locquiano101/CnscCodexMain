import { DOCU_API_ROUTER } from "../../../../../App";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ViewTransactionModal({ isOpen, onClose, transaction, type }) {
  if (!isOpen || !transaction) return null;

  const isReimbursement = type === "reimbursement";
  const isDisbursement = type === "disbursement";

  const fileUrl = transaction?.document?.fileName
    ? `${DOCU_API_ROUTER}/${transaction.organizationProfile}/${transaction.document.fileName}`
    : transaction?.file;

  const headerTitle = isReimbursement
    ? "Cash Inflow Details"
    : isDisbursement
    ? "Cash Outflow Details"
    : "Collection Details";

  const nameLabel = isReimbursement
    ? "Requestor"
    : isDisbursement
    ? "Recipient"
    : "Payer";

  const amountColor = isDisbursement ? "text-red-600" : "text-green-600";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-white">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {headerTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Description</p>
              <p className="text-gray-900">{transaction.description}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600">Amount</p>
              <p className={`text-lg font-bold ${amountColor}`}>
                ₱
                {Number(transaction.amount).toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600">Date</p>
              <p className="text-gray-900">
                {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600">
                Expense Type
              </p>
              <p className="text-gray-900">
                {transaction.expenseType || "Uncategorized"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600">{nameLabel}</p>
              <p className="text-gray-900">{transaction.name}</p>
            </div>

            {fileUrl && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Document
                </p>
                <iframe
                  src={fileUrl}
                  className="w-full h-96 border rounded-lg"
                  title="Transaction Document"
                />
                <div className="mt-2">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open in New Tab
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-gray-50 px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
