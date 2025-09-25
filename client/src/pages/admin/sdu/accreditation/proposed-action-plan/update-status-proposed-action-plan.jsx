import {
  X,
  MapPin,
  DollarSign,
  Calendar,
  Target,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export function RevisionModal({
  show,
  onClose,
  revisionNotes,
  setRevisionNotes,
  submitUpdate,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="bg-amber-500 p-4 text-white rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-bold">Send Revision</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Revision Comments <span className="text-red-500">*</span>
            </label>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              rows={5}
              placeholder="Please provide specific feedback and suggestions for improvement..."
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => submitUpdate({ status: "Revision from the SDU" })}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
            >
              Send Revision Request
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-600 border-2 border-slate-300 hover:border-slate-400 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApprovalModal({
  show,
  onClose,
  selectedProposal,
  selectedOrg,
  submitUpdate,
  formatCurrency,
  formatDate,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} />
              <h3 className="text-xl font-bold">Approve Proposal</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-2">
                  Confirm Proposal Approval
                </h4>
                <p className="text-green-700 text-sm leading-relaxed">
                  You are about to approve "{selectedProposal?.activityTitle}".
                  This action will change the proposal status to "Approved" and
                  notify all the "{selectedOrg?.orgName}".
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <h5 className="font-medium text-slate-800 mb-3">
              Proposal Summary:
            </h5>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Budget:</span>
                <span className="font-medium">
                  {formatCurrency(selectedProposal?.budgetaryRequirements)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Venue:</span>
                <span className="font-medium">{selectedProposal?.venue}</span>
              </div>
              <div className="flex justify-between">
                <span>Proposed Date:</span>
                <span className="font-medium">
                  {formatDate(selectedProposal?.proposedDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => submitUpdate({ status: "Approved" })}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Confirm Approval
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-600 border-2 border-slate-300 hover:border-slate-400 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ViewProposalModal({
  show,
  onClose,
  selectedProposal,
  handleRevision,
  handleApproval,
  formatDate,
  formatCurrency,
  getStatusIcon,
}) {
  if (!show || !selectedProposal) return null;

  const SDG_DESCRIPTIONS = {
    "SDG 1": "End poverty in all its forms everywhere.",
    "SDG 2":
      "End hunger, achieve food security and improved nutrition, and promote sustainable agriculture.",
    "SDG 3": "Ensure healthy lives and promote well-being for all at all ages.",
    "SDG 4":
      "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.",
    "SDG 5": "Achieve gender equality and empower all women and girls.",
    "SDG 6":
      "Ensure availability and sustainable management of water and sanitation for all.",
    "SDG 7":
      "Ensure access to affordable, reliable, sustainable, and modern energy for all.",
    "SDG 8":
      "Promote sustained, inclusive, and sustainable economic growth, full and productive employment, and decent work for all.",
    "SDG 9":
      "Build resilient infrastructure, promote inclusive and sustainable industrialization, and foster innovation.",
    "SDG 10": "Reduce inequality within and among countries.",
    "SDG 11":
      "Make cities and human settlements inclusive, safe, resilient, and sustainable.",
    "SDG 12": "Ensure sustainable consumption and production patterns.",
    "SDG 13": "Take urgent action to combat climate change and its impacts.",
    "SDG 14":
      "Conserve and sustainably use the oceans, seas, and marine resources for sustainable development.",
    "SDG 15":
      "Protect, restore, and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, halt and reverse land degradation, and halt biodiversity loss.",
    "SDG 16":
      "Promote peaceful and inclusive societies for sustainable development, provide access to justice for all, and build effective, accountable, and inclusive institutions at all levels.",
    "SDG 17":
      "Strengthen the means of implementation and revitalize the global partnership for sustainable development.",
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold mb-1">
              {selectedProposal.activityTitle}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                {getStatusIcon(selectedProposal.overallStatus)}
                {selectedProposal.overallStatus}
              </span>
              <span>{formatDate(selectedProposal.proposedDate)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gray-50 p-3 rounded border flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Venue</span>
              </div>
              <p className="font-semibold text-gray-900">
                {selectedProposal.venue}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded border flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={16} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  Budget
                </span>
              </div>
              <p className="font-semibold text-gray-900">
                {formatCurrency(selectedProposal.budgetaryRequirements)}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded border flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  Proposed Date
                </span>
              </div>
              <p className="font-semibold text-gray-900">
                {formatDate(selectedProposal.proposedDate)}
              </p>
            </div>
          </div>

          {/* SDG Alignment */}
          {selectedProposal.alignedSDG?.length > 0 && (
            <div className="bg-white p-3 rounded border">
              <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                <Target size={16} /> Aligned SDGs
              </h4>
              <div className="space-y-1">
                {selectedProposal.alignedSDG.map((sdg, idx) => (
                  <div key={idx} className="flex gap-2 text-sm text-gray-700">
                    <span className="font-semibold">{sdg}:</span>
                    <span>
                      {SDG_DESCRIPTIONS[sdg] || "No description available."}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Objectives & Details */}
          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                <Target size={16} /> Aligned Objectives
              </h5>
              <p className="bg-gray-50 p-2 rounded border text-gray-700 whitespace-pre-wrap">
                {selectedProposal.AlignedObjective}
              </p>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                <FileText size={16} /> Brief Details
              </h5>
              <p className="bg-gray-50 p-2 rounded border text-gray-700 whitespace-pre-wrap">
                {selectedProposal.briefDetails}
              </p>
            </div>

            {selectedProposal.collaboratingEntities?.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                  <Users size={16} /> Collaborating Organizations
                </h5>
                <div className="space-y-1">
                  {selectedProposal.collaboratingEntities.map((entity, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2 rounded border text-gray-700"
                    >
                      <p className="font-semibold">
                        {entity.orgName} ({entity.orgAcronym})
                      </p>
                      <p className="text-sm">{entity.orgDepartment}</p>
                      <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 rounded">
                        Class: {entity.orgClass}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleRevision}
              className="flex-1 bg-amber-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2 hover:bg-amber-600 transition"
            >
              <AlertTriangle size={16} /> Notify Revision
            </button>
            <button
              onClick={handleApproval}
              className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2 hover:bg-emerald-600 transition"
            >
              <CheckCircle size={16} /> Approve Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
