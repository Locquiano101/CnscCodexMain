import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_ROUTER } from "../../../../App";

function RoomForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(
    initial || { name: "", building: "", campus: "", type: "room", capacity: "", notes: "" }
  );

  useEffect(() => {
    setForm(
      initial || { name: "", building: "", campus: "", type: "room", capacity: "", notes: "" }
    );
  }, [initial]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl">
        <div className="px-5 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {initial ? "Edit Room/Location" : "Add Room/Location"}
          </h3>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const payload = {
              ...form,
              capacity:
                form.capacity === "" || form.capacity === null
                  ? undefined
                  : Number(form.capacity),
            };
            onSubmit(payload);
          }}
        >
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Building</label>
              <input
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.building}
                onChange={(e) => setForm((f) => ({ ...f, building: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Campus</label>
              <input
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.campus}
                onChange={(e) => setForm((f) => ({ ...f, campus: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                className="mt-1 block bg-white border border-gray-300 text-gray-900 text-sm rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 pl-3 pr-8 py-2 w-full"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="room">Room</option>
                <option value="hall">Hall</option>
                <option value="lab">Laboratory</option>
                <option value="outdoor">Outdoor</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                min="0"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                rows={3}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-md border border-gray-300 text-sm hover:bg-gray-100"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "Saving…" : initial ? "Save changes" : "Create room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SduRoomsLocations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [campus, setCampus] = useState("");
  const [active, setActive] = useState("all"); // all|true|false
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (q.trim()) params.q = q.trim();
      if (campus.trim()) params.campus = campus.trim();
      if (active !== "all") params.active = active === "true" ? "true" : "false";
      const res = await axios.get(`${API_ROUTER}/admin/rooms`, {
        withCredentials: true,
        params,
      });
      setItems(res.data.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filters change (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      fetchRooms();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, campus, active]);

  const filtered = useMemo(() => items, [items]);

  const handleCreate = async (payload) => {
    try {
      setSubmitting(true);
      await axios.post(`${API_ROUTER}/admin/rooms`, payload, { withCredentials: true });
      setShowForm(false);
      setEditItem(null);
      await fetchRooms();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      setSubmitting(true);
      await axios.patch(`${API_ROUTER}/admin/rooms/${id}`, payload, { withCredentials: true });
      setShowForm(false);
      setEditItem(null);
      await fetchRooms();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActive = async (id, nextActive) => {
    try {
      await axios.patch(
        `${API_ROUTER}/admin/rooms/${id}/active`,
        { active: nextActive },
        { withCredentials: true }
      );
      await fetchRooms();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="p-6" style={{ backgroundColor: '#F5F5F9' }}>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gray-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Rooms / Locations</h2>
            <p className="text-sm text-gray-500">Manage the master list of rooms and locations per campus.</p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <input
              className="w-full sm:w-64 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search name or building..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <input
              className="w-36 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Campus"
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
            />
            <select
              className="block bg-white border border-gray-300 text-gray-900 text-sm rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 pl-3 pr-8 py-2 w-36"
              value={active}
              onChange={(e) => setActive(e.target.value)}
            >
              <option value="all">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button
              className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
              onClick={fetchRooms}
              disabled={loading}
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
            <button
              className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700"
              onClick={() => {
                setEditItem(null);
                setShowForm(true);
              }}
            >
              Add Room
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Building</th>
                <th className="text-left px-4 py-3 font-semibold">Campus</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-left px-4 py-3 font-semibold">Capacity</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    No rooms found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{r.name}</td>
                    <td className="px-4 py-3">{r.building || "—"}</td>
                    <td className="px-4 py-3">{r.campus}</td>
                    <td className="px-4 py-3 capitalize">{r.type || "room"}</td>
                    <td className="px-4 py-3">{r.capacity ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          r.active
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
                        }`}
                      >
                        {r.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-100"
                          onClick={() => {
                            setEditItem(r);
                            setShowForm(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className={`px-2.5 py-1.5 text-xs rounded-md ${
                            r.active
                              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                          onClick={() => handleSetActive(r._id, !r.active)}
                        >
                          {r.active ? "Deactivate" : "Reactivate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <RoomForm
          initial={editItem}
          submitting={submitting}
          onCancel={() => {
            setShowForm(false);
            setEditItem(null);
          }}
          onSubmit={(payload) =>
            editItem ? handleUpdate(editItem._id, payload) : handleCreate(payload)
          }
        />
      )}
    </div>
  );
}

export default SduRoomsLocations;