import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_ROUTER } from "../../../../App";

export function SduAuditLogsPage() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [hasMore, setHasMore] = useState(false);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
		const [timeRange, setTimeRange] = useState("30d");
		const abortRef = useRef(null);

			const fetchLogs = async () => {
		try {
			setLoading(true);
			setError(null);
					if (abortRef.current) {
						abortRef.current.abort();
					}
					abortRef.current = new AbortController();

					const params = { page, limit, search: debouncedSearch || undefined };
					// Translate timeRange to from/to
					const now = new Date();
					const ranges = {
						"7d": 7,
						"14d": 14,
						"30d": 30,
						"90d": 90,
					};
					if (timeRange !== "all") {
						const days = ranges[timeRange] || 30;
						const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
						params.from = from.toISOString();
						params.to = now.toISOString();
					}

					const res = await axios.get(`${API_ROUTER}/audit-logs`, {
						withCredentials: true,
						params,
						signal: abortRef.current.signal,
					});
				setItems(res.data.items || []);
						setHasMore(Boolean(res.data?.hasMore));
					// if server provides hasMore/nextPage, we can use it (UI remains compatible)
		} catch (err) {
			setError(err?.response?.data?.message || err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLogs();
		// eslint-disable-next-line react-hooks/exhaustive-deps
			}, [page, limit, debouncedSearch, timeRange]);

		// Debounce search input
		useEffect(() => {
			const t = setTimeout(() => {
				setPage(1);
				setDebouncedSearch(search.trim());
			}, 350);
			return () => clearTimeout(t);
		}, [search]);

	// Server returns hasMore instead of total; compute pagination using hasMore

		const actionLabels = {
			"president.status.update": "President profile status updated",
			"roster.status.update": "Roster status updated",
			"roster.revision": "Roster revision note added",
			"roster.complete": "Roster marked complete",
			"roster.member.add": "Roster member added",
			"proposal-conduct.status.update": "Proposal conduct status updated",
			"proposal-conduct.update": "Proposal conduct updated",
			"proposal-conduct.create": "Proposal conduct created",
			"document.status.update": "Document status updated",
			"accomplishment.status.update": "Accomplishment status updated",
			"accomplishment.add": "Accomplishment added",
			"accomplishment.document.add": "Accomplishment document added",
			"accomplishment.document.update": "Accomplishment document updated",
			"accomplishment.grade.update": "Accomplishment grading updated",
			"proposal.approval.update": "Proposal approval updated",
			"proposal.create": "Proposal created",
			"proposal.update": "Proposal updated",
			"accreditation.deactivate.all": "System-wide accreditation deactivated",
			"accreditation.system.reset": "System-wide accreditation reset",
			"accreditation.deadline.update": "Accreditation deadline set",
			"organization.profile.status.update": "Organization profile status updated",
			"financial-report.add": "Financial receipt added",
			"financial-report.inquiry.send": "Financial inquiry sent",
			"user.create": "User created",
			"user.update": "User updated",
			"user.delete": "User deleted",
			"registration.init": "Registration initialized",
			"registration.reinit": "Organization re-registered",
			"registration.confirm": "Registration confirmed",
			"room.create": "Room/location created",
			"room.update": "Room/location updated",
			"room.deactivate": "Room/location deactivated",
			"room.reactivate": "Room/location reactivated",
			"schedule.room.assign": "Schedule room assigned",
			"schedule.room.change": "Schedule room changed",
		};

		const renderMeta = (meta) => {
			if (!meta) return "";
			const parts = [];
			if (meta.newStatus || meta.status) parts.push(`Status: ${meta.newStatus || meta.status}`);
			if (meta.overallStatus) parts.push(`Status: ${meta.overallStatus}`);
			if (meta.isComplete !== undefined) parts.push(`Complete: ${meta.isComplete ? "Yes" : "No"}`);
			const notes = meta.inquiryText || meta.revisionNotes || meta.notes;
			if (notes) parts.push(`Notes: ${String(notes).slice(0, 120)}${String(notes).length > 120 ? "…" : ""}`);
			if (meta.category && meta.title) parts.push(`${meta.category}: ${meta.title}`);
			if (meta.activityTitle) parts.push(`Activity: ${meta.activityTitle}`);
			if (meta.fileName) parts.push(`File: ${meta.fileName}`);
			if (meta.documentId && !meta.fileName) parts.push(`Document: #${String(meta.documentId).slice(-6)}`);
			if (meta.amount !== undefined && meta.type) parts.push(`${meta.type}: ₱${Number(meta.amount).toLocaleString()}`);
			return parts.length ? parts.join(" • ") : JSON.stringify(meta);
		};

		const formatRole = (role) => {
			if (!role) return "—";
			const lowerRole = role.toLowerCase();
			if (lowerRole === "sdu" || lowerRole === "sdu main") return "SDU";
			if (lowerRole === "student leader" || lowerRole === "student-leader" || lowerRole === "studentleader") return "Student Leader";
			if (lowerRole === "dean") return "Dean";
			if (lowerRole === "adviser") return "Adviser";
			if (lowerRole === "sdu coordinator" || lowerRole === "sdu-coordinator") return "SDU Coordinator";
			return role; // fallback to original
		};

		return (
			<div className="p-6 flex-1" style={{ backgroundColor: '#F5F5F9' }}>
				<div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
						{/* Header */}
						<div className="px-4 py-4 sm:px-6 sm:py-5 bg-gray-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">Activity Logs</h2>
								<p className="text-sm text-gray-500">Search and review recent actions across the system.</p>
							</div>
							<div className="flex w-96 sm:w-auto items-center gap-2">
								<input
									className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Search actions, names, orgs..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
								<select
									className="border w-auto border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									value={timeRange}
									onChange={(e) => {
										setPage(1);
										setTimeRange(e.target.value);
									}}
								>
									<option value="7d">Last 7 days</option>
									<option value="14d">Last 14 days</option>
									<option value="30d">Last 30 days</option>
									<option value="90d">Last 90 days</option>
									<option value="all">All time</option>
								</select>
							</div>
						</div>

						{/* Table */}
						<div className="overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead className="bg-gray-50 text-gray-700">
									<tr>
										<th className="text-left px-4 py-3 font-semibold">Date & Time</th>
										<th className="text-left px-4 py-3 font-semibold">User</th>
										<th className="text-left px-4 py-3 font-semibold">Role</th>
										<th className="text-left px-4 py-3 font-semibold">Action</th>
										<th className="text-left px-4 py-3 font-semibold">Object Affected</th>
										{/* <th className="text-left px-4 py-3 font-semibold">Organization</th> */}
										{/* <th className="text-left px-4 py-3 font-semibold">Meta</th> */}
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
									) : items.length === 0 ? (
										<tr>
											<td colSpan={7} className="px-4 py-6 text-center text-gray-500">
												No logs found.
											</td>
										</tr>
									) : (
										items.map((log) => (
											<tr key={log._id} className="hover:bg-gray-50">
												<td className="px-4 py-3 whitespace-nowrap">
													{new Date(log.createdAt).toLocaleString()}
												</td>
												<td className="px-4 py-3">
													{log.actorName || log.actorEmail || "Unknown"}
												</td>
												<td className="px-4 py-3">{formatRole(log.actorPosition)}</td>
												<td className="px-4 py-3">{actionLabels[log.action] || log.action}</td>
												<td className="px-4 py-3">
													{log.targetType || ""}
													{log.targetId ? ` #${String(log.targetId).slice(-6)}` : ""}
												</td>
												{/* <td className="px-4 py-3">{log.organizationName || "—"}</td> */}
												{/* <td className="px-4 py-3 max-w-l truncate">{renderMeta(log.meta)}</td> */}
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>

						{/* Footer / Pagination */}
						<div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="text-sm text-gray-600">
								Showing page {page} {items.length > 0 && `(${items.length} items)`}
							</div>
							<div className="flex items-center gap-2">
								<button
									className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									onClick={() => setPage(1)}
									disabled={page <= 1 || loading}
									title="First page"
								>
									««
								</button>
								<button
									className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page <= 1 || loading}
									title="Previous page"
								>
									‹ Prev
								</button>
								<span className="px-3 py-1.5 text-sm font-medium text-gray-700">
									Page {page}
								</span>
								<button
									className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									onClick={() => setPage((p) => p + 1)}
									disabled={!hasMore || loading}
									title="Next page"
								>
									Next ›
								</button>
							</div>
						</div>
					</div>
				</div>
			);
}

export default SduAuditLogsPage;

