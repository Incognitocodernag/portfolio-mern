import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const ROLE_COLORS = {
  owner:  "bg-yellow-500/20 text-yellow-500 dark:text-yellow-400",
  admin:  "bg-blue-500/20 text-blue-500 dark:text-blue-400",
  member: "bg-teal-500/20 text-teal-500 dark:text-teal-400",
  viewer: "bg-slate-200 dark:bg-dark-border text-slate-500 dark:text-slate-400",
};

const ROLE_PERMS = {
  owner:  "Full control — manage members, all transactions",
  admin:  "Manage members, add/edit/delete transactions",
  member: "Add transactions, view all",
  viewer: "View only",
};

const Household = () => {
  const { user } = useAuth();
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("create");      // create | join
  const [createForm, setCreateForm] = useState({ name: "", sharedBudget: "" });
  const [joinCode, setJoinCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await api("/household"); setHousehold(d); }
    catch { setHousehold(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createHousehold = async (e) => {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      await api("/household", "POST", {
        name: createForm.name,
        sharedBudget: parseFloat(createForm.sharedBudget) || 0,
      });
      load();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const joinHousehold = async (e) => {
    e.preventDefault(); setError(""); setSubmitting(true);
    try { await api("/household/join", "POST", { inviteCode: joinCode.toUpperCase() }); load(); }
    catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const changeRole = async (memberId, role) => {
    try { const d = await api(`/household/members/${memberId}`, "PATCH", { role }); setHousehold(d); }
    catch (err) { alert(err.message); }
  };

  const removeMember = async (memberId) => {
    if (!confirm("Remove this member?")) return;
    try { await api(`/household/members/${memberId}`, "DELETE"); load(); }
    catch (err) { alert(err.message); }
  };

  const leaveOrDelete = async () => {
    const isOwner = myRole === "owner";
    const msg = isOwner
      ? "Delete this household? This cannot be undone."
      : "Leave this household?";
    if (!confirm(msg)) return;
    try { await api("/household", "DELETE"); setHousehold(null); }
    catch (err) { alert(err.message); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(household.inviteCode);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const myRole = household?.members?.find(
    (m) => m.userId?._id === user?._id || m.userId === user?._id
  )?.role;

  const canManage = ["owner", "admin"].includes(myRole);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-500 dark:text-slate-400">Loading household...</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Household</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Role-Based Access Control — manage your family finances together
        </p>
      </div>

      {/* No household yet */}
      {!household ? (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden">
          {/* Tab header */}
          <div className="flex border-b border-slate-100 dark:border-dark-border">
            {["create","join"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-4 text-sm font-medium capitalize transition-colors ${
                  tab === t
                    ? "text-teal-500 border-b-2 border-teal-500 bg-teal-500/5"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                }`}>
                {t === "create" ? "🏠 Create Household" : "🔗 Join with Code"}
              </button>
            ))}
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {tab === "create" ? (
              <form onSubmit={createHousehold} className="space-y-4 max-w-sm">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Household Name
                  </label>
                  <input placeholder="e.g. The Sharma Family"
                    value={createForm.name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Monthly Shared Budget (₹)
                  </label>
                  <input type="number" min="0" placeholder="0"
                    value={createForm.sharedBudget}
                    onChange={(e) => setCreateForm((f) => ({ ...f, sharedBudget: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-sm" />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all">
                  {submitting ? "Creating..." : "Create Household"}
                </button>
              </form>
            ) : (
              <form onSubmit={joinHousehold} className="space-y-4 max-w-sm">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ask your household owner for the 6-character invite code.
                </p>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Invite Code
                  </label>
                  <input placeholder="e.g. A1B2C3" maxLength={6}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())} required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-sm font-mono tracking-widest uppercase" />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all">
                  {submitting ? "Joining..." : "Join Household"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Has a household */
        <div className="space-y-4">
          {/* Household header card */}
          <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-2xl border border-teal-500/20 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🏠</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{household.name}</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {household.members.length} member{household.members.length !== 1 ? "s" : ""} ·{" "}
                  Shared budget: ₹{(household.sharedBudget || 0).toLocaleString("en-IN")}
                </p>
                <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[myRole]}`}>
                  {myRole === "owner" ? "👑" : myRole === "admin" ? "🛡️" : myRole === "member" ? "👤" : "👁️"}
                  Your role: {myRole}
                </div>
              </div>
              {canManage && (
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Invite Code</p>
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-bold font-mono tracking-widest text-teal-500 dark:text-teal-400">
                      {household.inviteCode}
                    </code>
                    <button onClick={copyCode}
                      className="px-3 py-1 rounded-lg border border-teal-500/30 text-xs text-teal-500 dark:text-teal-400 hover:bg-teal-500/10 transition-colors">
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Role permissions guide */}
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border p-5">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">Role Permissions</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(ROLE_PERMS).map(([role, desc]) => (
                <div key={role} className="rounded-xl p-3 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2 ${ROLE_COLORS[role]}`}>
                    {role}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Members list */}
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border">
            <div className="p-5 border-b border-slate-100 dark:border-dark-border">
              <h4 className="font-semibold text-slate-900 dark:text-white">Members</h4>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-dark-border">
              {household.members.map((m) => {
                const memberUser = m.userId;
                const memberId = typeof memberUser === "object" ? memberUser._id : memberUser;
                const memberName = typeof memberUser === "object" ? memberUser.name : "Member";
                const memberEmail = typeof memberUser === "object" ? memberUser.email : "";
                const isMe = memberId === user?._id;
                const memberInitials = memberName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

                return (
                  <div key={memberId} className="flex items-center gap-3 px-5 py-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {memberInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{memberName}</p>
                        {isMe && <span className="text-[10px] text-slate-400 dark:text-slate-500">(you)</span>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{memberEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[m.role]}`}>
                        {m.role}
                      </span>
                      {canManage && !isMe && m.role !== "owner" && (
                        <>
                          <select value={m.role}
                            onChange={(ev) => changeRole(memberId, ev.target.value)}
                            className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-400">
                            <option value="admin">admin</option>
                            <option value="member">member</option>
                            <option value="viewer">viewer</option>
                          </select>
                          <button onClick={() => removeMember(memberId)}
                            className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center text-red-400 hover:text-red-500 transition-all text-xs">
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leave / Delete */}
          <div className="flex justify-end">
            <button onClick={leaveOrDelete}
              className="px-5 py-2.5 rounded-xl border border-red-300 dark:border-red-500/30 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
              {myRole === "owner" ? "🗑️ Delete Household" : "🚪 Leave Household"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Household;