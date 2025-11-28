import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ROUTER, DOCU_API_ROUTER } from '../../../../config/api.js';
import { FileText, CheckCircle2, XCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Minimal custom requirement viewer for Adviser role.
// Advisers only interact with their own organization's submission.
export default function AdviserCustomRequirementViewer({ requirementKey, title, orgData, user }) {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);
  const orgProfileId = orgData?._id || user?.organizationProfile || user?.organization?._id;

  useEffect(() => {
    let ignore = false;
    async function fetchSubmission() {
      if (!orgProfileId) return;
      try {
        const { data } = await axios.get(
          `${API_ROUTER}/accreditation/requirements/${requirementKey}/submission/${orgProfileId}`,
          { withCredentials: true }
        );
        if (!ignore) setSubmission(data.submission);
      } catch (e) {
        console.warn('AdviserCustomRequirementViewer: submission fetch failed', e.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchSubmission();
    return () => { ignore = true; };
  }, [orgProfileId, requirementKey]);

  async function updateStatus(next, note) {
    const submissionId = submission?.id || submission?._id; // backend returns raw doc (_id) on fetch
    if (!submissionId) {
      console.warn('AdviserCustomRequirementViewer: missing submission id for status update');
      return;
    }
    try {
      await axios.patch(
        `${API_ROUTER}/admin/accreditation/requirements/${requirementKey}/submissions/${submissionId}/status`,
        { status: next, note: note || undefined },
        { withCredentials: true }
      );
      const { data } = await axios.get(
        `${API_ROUTER}/accreditation/requirements/${requirementKey}/submission/${orgProfileId}`,
        { withCredentials: true }
      );
      setSubmission(data.submission);
      setShowApproveModal(false);
      setShowRevisionModal(false);
      setDecisionNote('');
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Status update failed');
    } finally {
      setSubmitting(false);
    }
  }

  // Modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [decisionNote, setDecisionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const statusStyles = {
    Approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    AdviserApproved: 'bg-slate-100 text-slate-700 border border-slate-300',
    DeanApproved: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    RevisionRequested: 'bg-orange-50 text-orange-700 border border-orange-200',
    Rejected: 'bg-red-50 text-red-700 border border-red-200',
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-600 text-white"><FileText className="w-6 h-6"/></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                {title}
                {submission?.status && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[submission.status] || 'bg-gray-100 text-gray-600 border'}`}>{submission.status}</span>
                )}
              </h1>
              <p className="text-xs uppercase tracking-wide text-gray-500">Custom Requirement • Key: {requirementKey}</p>
            </div>
          </div>
          {/* Adviser action buttons: only at Pending stage */}
          {submission && submission.status === 'Pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => { setDecisionNote(''); setShowApproveModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4"/> Mark Adviser Approved
              </button>
              <button
                onClick={() => { setDecisionNote(''); setShowRevisionModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
              >
                <XCircle className="w-4 h-4"/> Request Revision
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600">Review the submitted document for this requirement and approve or reject it. Rejections should be accompanied by communication outside this screen for now.</p>
        {loading && <div className="text-sm text-gray-500">Loading submission...</div>}

        {!loading && !submission && (
          <div className="p-4 rounded-md bg-gray-50 border text-sm text-gray-600">No submission yet.</div>
        )}

        {submission?.document?.fileName && (
          <div className="space-y-3">
            <div className="border rounded-lg overflow-hidden bg-gray-50 shadow-inner">
              <iframe
                src={`${DOCU_API_ROUTER}/${orgProfileId}/${submission.document.fileName}#toolbar=0&navpanes=0&scrollbar=0`}
                title="Submission Preview"
                className="w-full h-[520px]"
                onError={() => setPreviewError(true)}
              />
            </div>
            {previewError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">Preview failed. File may be missing or in legacy path; ask student to re-upload.</div>
            )}
            {submission.logs && submission.logs.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Logs</h4>
                <ul className="max-h-32 overflow-y-auto space-y-1 text-[11px] text-gray-600">
                  {submission.logs.map((log,i)=>(
                    <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1"></span>{log}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Decision Modals */}
      {showApproveModal && (
        <DecisionModal
          type="approve"
          note={decisionNote}
          setNote={setDecisionNote}
          submitting={submitting}
          onClose={() => setShowApproveModal(false)}
          onConfirm={async () => {
            if (!(submission?.id || submission?._id)) return;
            setSubmitting(true);
            await updateStatus('AdviserApproved', decisionNote);
          }}
        />
      )}
      {showRevisionModal && (
        <DecisionModal
          type="revision"
          note={decisionNote}
          setNote={setDecisionNote}
          submitting={submitting}
          onClose={() => setShowRevisionModal(false)}
          onConfirm={async () => {
            if (!(submission?.id || submission?._id)) return;
            setSubmitting(true);
            await updateStatus('RevisionRequested', decisionNote);
          }}
        />
      )}
    </div>
  );
}

// Shared modal component (simple inline implementation to mimic existing style conventions)
function DecisionModal({ type, onClose, onConfirm, submitting, note, setNote }) {
  const title = type === 'approve' ? 'Mark Adviser Approved' : 'Request Revision';
  const actionLabel = type === 'approve' ? 'Confirm Adviser Approval' : 'Send Revision Request';
  const actionColor = type === 'approve' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700';
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {type === 'approve' 
              ? 'You are about to mark this document as Approved. Optionally leave a note for the log.'
              : 'Provide clear revision instructions. This will log as a status change to Rejected (Revision Requested).'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="note" className="text-xs font-semibold uppercase tracking-wide">
              Optional Note / Instructions
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={4}
              placeholder={type === 'approve' ? 'e.g. Meets all criteria.' : 'e.g. Please clarify section 2 and attach signed roster.'}
              className="mt-2 resize-y"
              disabled={submitting}
            />
          </div>
        </div>
        <DialogFooter className="flex gap-3">
          <Button
            onClick={onClose}
            disabled={submitting}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={submitting}
            className={`${actionColor} disabled:opacity-50`}
          >
            {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"/>}
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
