import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_ROUTER } from "../../../../config/api.js";

// Use the same API base constant used elsewhere to ensure correct host in dev/prod
const API_BASE = API_ROUTER;

export default function SduAccreditationRequirementsManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [customs, setCustoms] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Add Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addDescription, setAddDescription] = useState("");
  // Removed addFile (SDU does not upload initial requirement documents)
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Edit state (optional future)
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  // Removed editFile (SDU does not replace requirement documents)
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { includeDisabled: true };
      if (search) params.q = search; // future usage
      const { data } = await axios.get(
        `${API_BASE}/admin/accreditation/requirements`,
        { params, withCredentials: true }
      );
      const tpl = [];
      const cust = [];
      (data.items || []).forEach((r) =>
        r.type === "template" ? tpl.push(r) : cust.push(r)
      );
      const filterFn = (item) => {
        if (statusFilter === "enabled") return item.enabled === true;
        if (statusFilter === "disabled") return item.enabled === false;
        return true;
      };

      let filteredTemplates = tpl.filter(filterFn);
      const filteredCustoms = cust.filter(filterFn);
      // Fallback: if no templates returned, query visible endpoint
      if (filteredTemplates.length === 0) {
        try {
          const vis = await axios.get(
            `${API_BASE}/accreditation/requirements/visible`,
            { withCredentials: true }
          );
          if ((vis.data || []).length > 0) {
            filteredTemplates = vis.data.map((r) => ({
              _id: r.key,
              key: r.key,
              title: r.title,
              enabled: true,
              type: r.type || "template",
            }));
          }
        } catch (e) {
          console.log(e);
        }
      }
      setTemplates(filteredTemplates);
      setCustoms(filteredCustoms);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Failed to load requirements."
      );
      setTemplates([]);
      setCustoms([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchAll, 350); // debounce search
    return () => clearTimeout(t);
  }, [fetchAll]);

  // Toggle enable/disable
  async function toggleEnabled(req) {
    const newEnabled = !req.enabled;
    try {
      await axios.patch(
        `${API_BASE}/admin/accreditation/requirements/${req._id}/enable`,
        { enabled: newEnabled },
        { withCredentials: true }
      );
      fetchAll();
    } catch (e) {
      alert(
        "Toggle failed: " +
          (e.response?.data?.message || e.message || "Unknown error")
      );
    }
  }

  // Delete custom requirement
  async function deleteRequirement(req) {
    if (!req.removable) return;
    if (
      !window.confirm(`Delete requirement "${req.title}"? This is permanent.`)
    )
      return;
    try {
      await axios.delete(
        `${API_BASE}/admin/accreditation/requirements/${req._id}`,
        { withCredentials: true }
      );
      fetchAll();
    } catch (e) {
      alert(
        "Delete failed: " +
          (e.response?.data?.message || e.message || "Unknown error")
      );
    }
  }

  // Create custom
  async function handleCreate(e) {
    e.preventDefault();
    setCreateError(null);
    if (!addTitle.trim()) {
      setCreateError("Title is required.");
      return;
    }
    setCreating(true);
    try {
      const fd = new FormData();
      fd.append("title", addTitle.trim());
      if (addDescription.trim())
        fd.append("description", addDescription.trim());
      // No file append (SDU does not upload requirement documents)
      await axios.post(`${API_BASE}/admin/accreditation/requirements`, fd, {
        withCredentials: true,
      });
      // Reset & close
      setAddTitle("");
      setAddDescription("");
      // addFile reset removed
      setShowAdd(false);
      fetchAll();
    } catch (e) {
      setCreateError(
        e.response?.data?.message || e.message || "Create failed."
      );
    } finally {
      setCreating(false);
    }
  }

  // Begin edit
  function startEdit(r) {
    setEditingId(r._id);
    setEditTitle(r.title);
    setEditDescription(r.description || "");
    // editFile state removed
    setUpdateError(null);
  }

  // Save edit
  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingId) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      const fd = new FormData();
      fd.append("title", editTitle.trim());
      fd.append("description", editDescription.trim());
      // No file append during update
      await axios.patch(
        `${API_BASE}/admin/accreditation/requirements/${editingId}`,
        fd,
        { withCredentials: true }
      );
      setEditingId(null);
      setEditTitle("");
      setEditDescription("");
      // editFile reset removed
      fetchAll();
    } catch (e) {
      setUpdateError(
        e.response?.data?.message || e.message || "Update failed."
      );
    } finally {
      setUpdating(false);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    // editFile reset removed
  }

  return (
    <div className="p-6" style={{ backgroundColor: "#F5F5F9" }}>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gray-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Accreditation Requirements
            </h2>
            <p className="text-sm text-gray-500">
              Manage core templates and add custom document-based requirements.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              className="w-56 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Add Requirement
            </button>
            <button
              onClick={fetchAll}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-100"
              disabled={loading}
              title="Reload requirements from server"
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-8">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {/* Templates */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Core Templates
            </h3>
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Title</th>
                    <th className="text-left px-3 py-2 font-medium">Key</th>
                    <th className="text-left px-3 py-2 font-medium">Status</th>
                    <th className="text-left px-3 py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {templates.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{t.title}</td>
                      <td className="px-3 py-2 text-gray-500">{t.key}</td>
                      <td className="px-3 py-2">
                        {t.enabled ? (
                          <span className="inline-block px-2 py-1 rounded text-green-700 bg-green-50 border border-green-200">
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded text-gray-700 bg-gray-100 border border-gray-200">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => toggleEnabled(t)}
                          className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
                        >
                          {t.enabled ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {templates.length === 0 && !loading && (
                    <tr>
                      <td
                        className="px-3 py-3 text-center text-gray-500"
                        colSpan={4}
                      >
                        No templates found (check seeding or gating).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Custom Requirements */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Custom Requirements
            </h3>
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Title</th>
                    <th className="text-left px-3 py-2 font-medium">
                      Description
                    </th>
                    <th className="text-left px-3 py-2 font-medium">Status</th>
                    <th className="text-left px-3 py-2 font-medium">
                      Document
                    </th>
                    <th className="text-left px-3 py-2 font-medium">Version</th>
                    <th className="text-left px-3 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customs.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{c.title}</td>
                      <td className="px-3 py-2 text-gray-600">
                        {c.description || "—"}
                      </td>
                      <td className="px-3 py-2">
                        {c.enabled ? (
                          <span className="inline-block px-2 py-1 rounded text-green-700 bg-green-50 border border-green-200">
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded text-gray-700 bg-gray-100 border border-gray-200">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {c.document?.fileName ? c.document.fileName : "—"}
                      </td>
                      <td className="px-3 py-2">{c.version || 1}</td>
                      <td className="px-3 py-2 space-x-1">
                        <button
                          onClick={() => toggleEnabled(c)}
                          className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
                        >
                          {c.enabled ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => startEdit(c)}
                          className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        {c.removable && (
                          <button
                            onClick={() => deleteRequirement(c)}
                            className="text-xs px-2 py-1 rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {customs.length === 0 && !loading && (
                    <tr>
                      <td
                        className="px-3 py-3 text-center text-gray-500"
                        colSpan={6}
                      >
                        No custom requirements.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {loading && (
          <div className="px-4 pb-4 text-sm text-gray-500">Loading…</div>
        )}
        {!loading && (
          <div className="px-4 pb-4 text-xs text-gray-400">
            Templates: {templates.length} • Customs: {customs.length}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg border border-gray-200">
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <h3 className="text-base font-semibold text-gray-900">
                Add Custom Requirement
              </h3>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Title *
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  maxLength={120}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  maxLength={500}
                />
              </div>
              {/* File input removed: SDU does not upload requirement documents */}
              {createError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                  {createError}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (creating) return;
                    setShowAdd(false);
                    setAddTitle("");
                    setAddDescription("");
                    // addFile reset removed
                    setCreateError(null);
                  }}
                  className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50"
                >
                  {creating ? "Saving…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg border border-gray-200">
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <h3 className="text-base font-semibold text-gray-900">
                Edit Requirement
              </h3>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Title *
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={120}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  maxLength={500}
                />
              </div>
              {/* Replace document section removed: SDU does not manage requirement files */}
              {updateError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                  {updateError}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-100"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50"
                >
                  {updating ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
