import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ROUTER, DOCU_API_ROUTER } from '../../../../App';
import { FileText, CheckCircle2, XCircle, X } from 'lucide-react';

// DeanCustomRequirementViewer: mirrors AdviserCustomRequirementViewer but scoped for Dean oversight.
// Dean can approve or request revision for a specific organization's custom requirement submission.
export default function DeanCustomRequirementViewer({ requirementKey, title, selectedOrg }) {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);
  const orgProfileId = selectedOrg?._id || selectedOrg?.organizationProfile; // unify profile id usage

  // Fetch submission for this custom requirement
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
        console.warn('DeanCustomRequirementViewer: submission fetch failed', e.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchSubmission();
    return () => { ignore = true; };
  }, [orgProfileId, requirementKey]);

  // Status update with optional note; maps Request Revision to status 'Rejected'
  async function updateStatus(next, note) {
    const submissionId = submission?.id || submission?._id;
    if (!submissionId) {
      console.warn('DeanCustomRequirementViewer: missing submission id for status update');
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
    <div className="h-full overflow-auto" style={{ backgroundColor: '#F5F5F9' }}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-600 text-white"><FileText className="w-6 h-6"/></div>
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
          {/* Dean actions: only after AdviserApproved */}
          {submission && submission.status === 'AdviserApproved' && (
            <div className="flex gap-2">
              <button
                onClick={() => { setDecisionNote(''); setShowApproveModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4"/> Mark Dean Approved
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

        <p className="text-sm text-gray-600">Dean oversight for custom accreditation requirement. Review and approve or request clarification/revision.</p>
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
            if (!(submission?.id || submission?._id)) return; setSubmitting(true); await updateStatus('DeanApproved', decisionNote);
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
            if (!(submission?.id || submission?._id)) return; setSubmitting(true); await updateStatus('RevisionRequested', decisionNote);
          }}
        />
      )}
    </div>
  );
}

function DecisionModal({ type, onClose, onConfirm, submitting, note, setNote }) {
  const title = type === 'approve' ? 'Mark Dean Approved' : 'Request Revision';
  const actionLabel = type === 'approve' ? 'Confirm Dean Approval' : 'Send Revision Request';
  const actionColor = type === 'approve' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-orange-600 hover:bg-orange-700';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition" disabled={submitting}><X className="w-5 h-5"/></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {type === 'approve' ? (
            <p className="text-sm text-gray-600">You are about to mark this document as Approved. Optionally leave a note for the log.</p>
          ) : (
            <p className="text-sm text-gray-600">Provide clear revision instructions. This will log as a status change to Rejected (Revision Requested).</p>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Optional Note / Instructions</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={4}
              placeholder={type === 'approve' ? 'e.g. Meets all criteria.' : 'e.g. Please clarify section 2 and attach signed roster.'}
              className="mt-1 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-cnsc-primary-color focus:border-cnsc-primary-color text-sm p-2 resize-y"
              disabled={submitting}
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
          >Cancel</button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className={`px-4 py-2 rounded-md text-sm font-semibold text-white shadow ${actionColor} disabled:opacity-50 flex items-center gap-2`}
          >
            {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
