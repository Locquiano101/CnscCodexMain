import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_ROUTER, DOCU_API_ROUTER } from '../../../../config/api.js';
import { FileText, AlertCircle, Search, ChevronDown, Loader2, CheckCircle2, XCircle, X } from 'lucide-react';

export default function SduCustomRequirementViewer({ selectedOrg }) {
  const { reqKey } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requirement, setRequirement] = useState(null);
  const [submissions, setSubmissions] = useState([]); // all submissions for requirement
  const [selectedOrgId, setSelectedOrgId] = useState(null); // organizationProfile id (string)
  const [orgs, setOrgs] = useState([]);
  const [orgSearch, setOrgSearch] = useState("");
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [orgLoading, setOrgLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  // Modal + decision state (added to fix undefined errors)
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [decisionNote, setDecisionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Auto-select org from parent context if provided
  useEffect(() => {
    if (selectedOrg && selectedOrg._id && !selectedOrgId) {
      setSelectedOrgId(selectedOrg._id);
    }
  }, [selectedOrg, selectedOrgId]);

  useEffect(() => {
    let cancel = false;
    async function loadRequirement() {
      try {
        setLoading(true);
        setError(null);
        // Use admin listing to get full metadata if available; fallback to visible
        const adminRes = await axios.get(`${API_ROUTER}/admin/accreditation/requirements?includeDisabled=true`, { withCredentials: true });
        if (cancel) return;
        const items = adminRes.data.items || [];
        const found = items.find(r => r.key === reqKey);
        if (found) {
          setRequirement(found);
        } else {
          const vis = await axios.get(`${API_ROUTER}/accreditation/requirements/visible`, { withCredentials: true });
          const fallback = (vis.data || []).find(r => r.key === reqKey);
          setRequirement(fallback || null);
        }
      } catch (e) {
        if (!cancel) setError(e.response?.data?.message || e.message);
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    loadRequirement();
    return () => { cancel = true; };
  }, [reqKey]);

  // Load organizations (active) for selection
  useEffect(() => {
    let cancel = false;
    async function loadOrgs() {
      setOrgLoading(true);
      try {
        const res = await axios.get(`${API_ROUTER}/getAllActiveOrganizationProfile`, { withCredentials: true });
        if (cancel) return;
        // Normalize response to array; backend may return object wrapper
        const raw = res.data;
        const normalized = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
            ? raw.items
            : Array.isArray(raw?.organizations)
              ? raw.organizations
              : [];
        setOrgs(normalized);
      } catch (e) {
        console.warn('Failed to load organizations', e.message);
      } finally {
        if (!cancel) setOrgLoading(false);
      }
    }
    loadOrgs();
    return () => { cancel = true; };
  }, []);

  // Load submissions list for requirement
  useEffect(() => {
    let cancel = false;
    async function loadSubs() {
      if (!requirement) return;
      try {
        const res = await axios.get(`${API_ROUTER}/admin/accreditation/requirements/${requirement.key}/submissions`, { withCredentials: true });
        if (cancel) return;
        setSubmissions(res.data?.items || []);
      } catch (e) {
        console.warn('Failed to load submissions', e.message);
      }
    }
    loadSubs();
    return () => { cancel = true; };
  }, [requirement]);

  const orgArray = Array.isArray(orgs) ? orgs : [];
  const filteredOrgs = orgArray.filter(o => {
    if (!orgSearch) return true;
    const name = (o.organizationName || o.organization || '').toLowerCase();
    return name.includes(orgSearch.toLowerCase());
  });

  const selectedSubmission = submissions.find(s => s.organizationProfile === selectedOrgId);
  // Multi-stage status styling maps
  const statusClassMap = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    Rejected: 'bg-red-50 text-red-700 border-red-300',
    RevisionRequested: 'bg-orange-50 text-orange-700 border-orange-300',
    DeanApproved: 'bg-indigo-50 text-indigo-700 border-indigo-300',
    AdviserApproved: 'bg-blue-50 text-blue-700 border-blue-300',
    Pending: 'bg-amber-50 text-amber-700 border-amber-300'
  };
  const displayStatusMap = {
    DeanApproved: 'Awaiting SDU Approval',
    AdviserApproved: 'Awaiting Dean Approval',
    RevisionRequested: 'Revision Requested'
  };
  const pillClass = selectedSubmission ? statusClassMap[selectedSubmission.status] || 'bg-amber-50 text-amber-700 border-amber-300' : '';
  const displayStatus = selectedSubmission ? (displayStatusMap[selectedSubmission.status] || selectedSubmission.status) : '';
  const submissionIframeSrc = selectedSubmission?.accessibleUrl
    ? `${DOCU_API_ROUTER}${selectedSubmission.accessibleUrl.replace('/uploads','')}` // ensure base concatenation if accessibleUrl already starts with /uploads
    : null;

  if (loading) {
    return <div className="p-6 animate-pulse text-gray-500">Loading requirement...</div>;
  }
  if (error) {
    return (
      <div className="p-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        <AlertCircle className="w-5 h-5" />
        <div>
          <p className="font-semibold">Error loading requirement</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  if (!requirement) {
    return <div className="p-6 text-sm text-gray-500">Requirement not found or not enabled.</div>;
  }

  return (
    <div className="p-6 overflow-y-auto h-full">
      {/* Unified requirement card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 space-y-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-600 text-white"><FileText className="w-6 h-6"/></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                {requirement.title}
                {selectedSubmission && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${pillClass}`}>{displayStatus}</span>
                )}
              </h1>
              <p className="text-xs uppercase tracking-wide text-gray-500">Custom Requirement • Key: {requirement.key}</p>
            </div>
          </div>
          {/* Action buttons top-right (modal triggers) */}
          <div className="flex items-center gap-2 self-start">
            {selectedSubmission && selectedSubmission.status === 'DeanApproved' && (
              <button
                onClick={() => { setDecisionNote(''); setShowApproveModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 text-white shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Final Approve
              </button>
            )}
            {selectedSubmission && selectedSubmission.status === 'DeanApproved' && (
              <button
                onClick={() => { setDecisionNote(''); setShowRevisionModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition-colors"
              >
                <XCircle className="w-4 h-4" /> Request Revision
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {requirement.description && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{requirement.description}</p>
          </div>
        )}

        {/* Organization selector (hidden when parent already provides selection) */}
        {/* Organization selector (hidden when parent already provides selection) */}
        {!selectedOrg && (
        <div className="relative">
          <button
            onClick={() => setOrgDropdownOpen(o => !o)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md bg-gray-50 hover:bg-gray-100"
          >
            {selectedOrgId ? (orgs.find(o => o._id === selectedOrgId)?.organizationName || orgs.find(o => o._id === selectedOrgId)?.organization) : 'Choose an organization...'}
            <ChevronDown className={`w-4 h-4 transition-transform ${orgDropdownOpen ? 'rotate-180' : ''}`}/>
          </button>
          {orgDropdownOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white border rounded-md shadow-lg p-2 space-y-2 max-h-64 overflow-y-auto">
              <div className="flex items-center gap-2 px-2">
                <Search className="w-4 h-4 text-gray-400"/>
                <input
                  value={orgSearch}
                  onChange={e => setOrgSearch(e.target.value)}
                  placeholder="Search org..."
                  className="flex-1 text-sm outline-none"
                />
              </div>
              {orgLoading && <div className="py-4 flex items-center justify-center text-xs text-gray-500"><Loader2 className="w-4 h-4 animate-spin mr-2"/>Loading...</div>}
              {!orgLoading && filteredOrgs.map(o => (
                <button
                  key={o._id}
                  onClick={() => { setSelectedOrgId(o._id); setOrgDropdownOpen(false); setPreviewError(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-md text-sm hover:bg-blue-50"
                >{o.organizationName || o.organization}</button>
              ))}
              {!orgLoading && filteredOrgs.length === 0 && (
                <div className="py-2 text-xs text-gray-400">No matches</div>
              )}
            </div>
          )}
        </div>
        )}
        {/* Submission details */}
        {selectedOrgId && (
          <div className="space-y-4">
            {!selectedSubmission && (
              <div className="text-xs text-gray-500">No submission yet for this organization.</div>
            )}
            {selectedSubmission && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Status: <span className="capitalize">{displayStatus}</span></span>
                  {selectedSubmission.fileName && (
                    <a
                      href={`${DOCU_API_ROUTER}/${selectedOrgId}/${selectedSubmission.fileName}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 underline"
                    >Download</a>
                  )}
                </div>
                {selectedSubmission.fileName && (
                  <div className="border rounded-lg overflow-hidden bg-gray-50 shadow-inner">
                    <iframe
                      src={`${DOCU_API_ROUTER}/${selectedOrgId}/${selectedSubmission.fileName}#toolbar=0&navpanes=0&scrollbar=0`}
                      title="Submission Preview"
                      className="w-full h-[500px]"
                      onError={() => setPreviewError(true)}
                    />
                  </div>
                )}
                {previewError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    Preview failed. File may be stored in legacy path or missing. Try download link or ask student to re-upload.
                  </div>
                )}
                {selectedSubmission.logs && selectedSubmission.logs.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Logs</h4>
                    <ul className="max-h-32 overflow-y-auto space-y-1 text-[11px] text-gray-600">
                      {selectedSubmission.logs.map((log,i)=>(
                        <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1"></span>{log}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {!selectedOrgId && (
          <div className="text-xs text-gray-400">Select an organization to view its submission, if any.</div>
        )}
      </div>
      {showApproveModal && (
        <DecisionModal
          type="approve"
          note={decisionNote}
          setNote={setDecisionNote}
          submitting={submitting}
          onClose={() => setShowApproveModal(false)}
          onConfirm={async () => {
            if (!selectedSubmission?.id) return;
            setSubmitting(true);
            try {
              await axios.patch(`${API_ROUTER}/admin/accreditation/requirements/${requirement.key}/submissions/${selectedSubmission.id}/status`, { status: 'Approved', note: decisionNote || undefined }, { withCredentials: true });
              const res = await axios.get(`${API_ROUTER}/admin/accreditation/requirements/${requirement.key}/submissions`, { withCredentials: true });
              setSubmissions(res.data?.items || []);
              setShowApproveModal(false); setDecisionNote('');
            } catch (e) { alert(e.response?.data?.message || e.message || 'Approve failed'); } finally { setSubmitting(false); }
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
            if (!selectedSubmission?.id) return;
            setSubmitting(true);
            try {
              await axios.patch(`${API_ROUTER}/admin/accreditation/requirements/${requirement.key}/submissions/${selectedSubmission.id}/status`, { status: 'RevisionRequested', note: decisionNote || undefined }, { withCredentials: true });
              const res = await axios.get(`${API_ROUTER}/admin/accreditation/requirements/${requirement.key}/submissions`, { withCredentials: true });
              setSubmissions(res.data?.items || []);
              setShowRevisionModal(false); setDecisionNote('');
            } catch (e) { alert(e.response?.data?.message || e.message || 'Revision request failed'); } finally { setSubmitting(false); }
          }}
        />
      )}
    </div>
  );
}

// Append state for modals near top-level component (below existing hooks)
// We inject new hooks earlier in file – ensure they exist:
// (Adding here for clarity if not already defined)
// NOTE: This patch assumes we insert these declarations near top; if missing, add them.

// Decision modal shared component
function DecisionModal({ type, onClose, onConfirm, submitting, note, setNote }) {
  const titleMap = { approve: 'Approve Submission', revision: 'Request Revision' };
  const approve = type === 'approve';
  const actionLabel = approve ? 'Confirm Approval' : 'Send Revision Request';
  const actionColor = approve ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">{titleMap[type]}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition" disabled={submitting}><X className="w-5 h-5"/></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {approve ? (
            <p className="text-sm text-gray-600">You are about to mark this document as Approved. Optionally leave a note for the log.</p>
          ) : (
            <p className="text-sm text-gray-600">Provide clear revision instructions. This will set status to Revision Requested.</p>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Optional Note / Instructions</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={4}
              placeholder={approve ? 'e.g. Meets all criteria.' : 'e.g. Please clarify section 2 and attach signed roster.'}
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

// Auto-select organization from prop if provided
// We append useEffect after component definition, but need it inside: move above return earlier
