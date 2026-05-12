import { useCallback, useEffect, useMemo, useState } from "react";
import "../admin-tailwind.css";
import { BRAND } from "../brand.js";

const ADMIN_JWT_KEY = "nidha_admin_jwt";

/** Empty = same origin (host must proxy `/admin/*` to FastAPI). Set full origin if API is on another subdomain. */
function adminApiOrigin() {
  const v = import.meta.env.VITE_ADMIN_API_BASE;
  if (v == null || String(v).trim() === "") return "";
  return String(v).trim().replace(/\/$/, "");
}

function adminUrl(path) {
  if (!path.startsWith("/")) throw new Error("adminUrl expects a path starting with /");
  const o = adminApiOrigin();
  return o ? `${o}${path}` : path;
}

function defaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  const toIso = (d) => d.toISOString().slice(0, 10);
  return { from: toIso(start), to: toIso(end) };
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

async function responseDetailSnippet(res) {
  try {
    const text = await res.clone().text();
    if (!text) return "";
    try {
      const j = JSON.parse(text);
      if (typeof j?.detail === "string") return j.detail;
      if (Array.isArray(j?.detail))
        return j.detail.map((x) => x?.msg ?? JSON.stringify(x)).join("; ");
    } catch {
      /* not JSON */
    }
    return text.slice(0, 280).trim();
  } catch {
    return "";
  }
}

export default function AdminDashboardPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState("overview");
  const { from: fromDate, to: toDate } = useMemo(() => defaultDateRange(), []);
  const [rangeFrom, setRangeFrom] = useState(fromDate);
  const [rangeTo, setRangeTo] = useState(toDate);
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [clearBusy, setClearBusy] = useState(false);
  const [ordersValidOnly, setOrdersValidOnly] = useState(false);
  const [orderQInput, setOrderQInput] = useState("");
  const [orderQApplied, setOrderQApplied] = useState("");

  useEffect(() => {
    const existing = typeof window !== "undefined" ? sessionStorage.getItem(ADMIN_JWT_KEY) : null;
    if (existing) setToken(existing);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_JWT_KEY);
    setToken("");
    setMetrics(null);
    setOrders([]);
  }, []);

  const fetchDashboard = useCallback(
    async (t) => {
      setLoading(true);
      setError("");
      const q = new URLSearchParams({ from: rangeFrom, to: rangeTo });
      const ordQ = new URLSearchParams({
        limit: "200",
        from_date: rangeFrom,
        to_date: rangeTo,
      });
      if (orderQApplied.trim()) ordQ.set("q", orderQApplied.trim());
      if (ordersValidOnly) ordQ.set("valid_only", "true");

      try {
        const [mRes, oRes] = await Promise.all([
          fetch(adminUrl(`/admin/metrics?${q}`), { headers: authHeaders(t) }),
          fetch(adminUrl(`/admin/orders?${ordQ}`), { headers: authHeaders(t) }),
        ]);
        if (mRes.status === 403 || oRes.status === 403) {
          logout();
          setLoginError("Session expired. Sign in again.");
          setLoading(false);
          return;
        }
        if (!mRes.ok || !oRes.ok) {
          let line = "";
          if (!mRes.ok)
            line += `[metrics HTTP ${mRes.status}] ${(await responseDetailSnippet(mRes)) || "لا رد توضيحي."} `;
          if (!oRes.ok)
            line += `[orders HTTP ${oRes.status}] ${(await responseDetailSnippet(oRes)) || "لا رد توضيحي."} `;
          if (mRes.status >= 500 || oRes.status >= 500) {
            line +=
              "— إذا PostgreSQL لا يعمل: npm run docker:backend أو npm run db:up. إذا كان /health يعمل لكن اللوحة 500 غالباً المستمع على المنفذ 8000 هو Uvicorn محلي وليس Docker — أعد تشغيل npm run dev (يتخطّى المحلي إذا المنفذ محجوز) أو استعمل npm run dev:storefront مع Docker.";
          } else if (mRes.status === 401 || oRes.status === 401) {
            line += "— جلسة غير صالحة: اضغط Sign out ثم سجّل الدخول من جديد.";
          }
          setError(line.trim() || "تعذّر تحميل اللوحة. تحقّق من الـ API والتاريخ.");
          setLoading(false);
          return;
        }
        setMetrics(await mRes.json());
        setOrders(await oRes.json());
      } catch {
        setError(
          "تعذّر الاتصال بالـ API (شبكة أو البروكسي). تأكّد أن FastAPI يعمل على المنفذ 8000 وأن Vite يوجّه /admin/* إليه."
        );
      }
      setLoading(false);
    },
    [rangeFrom, rangeTo, orderQApplied, ordersValidOnly, logout]
  );

  useEffect(() => {
    if (!token) return;
    void fetchDashboard(token);
  }, [token, fetchDashboard]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(adminUrl("/admin/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const detail = res.status === 503 ? "Admin login not configured on server." : "Invalid credentials.";
        setLoginError(detail);
        setLoginLoading(false);
        return;
      }
      const data = await res.json();
      const access = data.access_token;
      sessionStorage.setItem(ADMIN_JWT_KEY, access);
      setToken(access);
      setPassword("");
    } catch {
      setLoginError("Network error.");
    }
    setLoginLoading(false);
  }

  const maxDailyRevenue = useMemo(() => {
    if (!metrics?.daily?.length) return 1;
    return Math.max(...metrics.daily.map((d) => d.revenue), 1);
  }, [metrics]);

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" dir="ltr">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-5"
        >
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{BRAND.nameAr} — لوحة التحكم</h1>
            <p className="text-slate-400 text-sm mt-1">لوحة التحكم (FastAPI على المنفذ 8000 محلياً)</p>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              autoComplete="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-amber-500/60"
            />
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-amber-500/60"
            />
          </div>
          {loginError && <p className="text-rose-400 text-sm">{loginError}</p>}
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 transition-colors disabled:opacity-50"
          >
            {loginLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex" dir="ltr">
      <aside className="w-56 border-r border-slate-800 bg-slate-900/80 shrink-0 hidden md:flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <p className="font-bold text-white">Admin</p>
          <p className="text-xs text-slate-500 mt-0.5">nidhamauto</p>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {[
            ["overview", "Overview"],
            ["orders", "Orders"],
            ["system", "System"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === id ? "bg-amber-500/15 text-amber-400" : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <button
            type="button"
            onClick={logout}
            className="w-full text-left px-3 py-2 text-sm text-slate-500 hover:text-white rounded-lg hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-800 flex items-center px-4 gap-3 bg-slate-900/50">
          <div className="flex md:hidden gap-1">
            {["overview", "orders", "system"].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`text-xs px-2 py-1 rounded capitalize ${
                  tab === id ? "bg-amber-500/20 text-amber-400" : "text-slate-500"
                }`}
              >
                {id}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <label className="text-xs text-slate-500 sr-only md:not-sr-only">From</label>
            <input
              type="date"
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm"
            />
            <label className="text-xs text-slate-500">to</label>
            <input
              type="date"
              value={rangeTo}
              onChange={(e) => setRangeTo(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={() => token && void fetchDashboard(token)}
              disabled={loading}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-sm font-medium border border-slate-700"
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-rose-200 text-sm">
              {error}
            </div>
          )}

          {tab === "overview" && loading && !metrics && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
              Loading metrics…
            </div>
          )}

          {tab === "overview" && metrics && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {metrics.traffic_trust_private_ip && (
                  <span className="text-xs px-2 py-1 rounded-full border border-rose-500/50 text-rose-300 bg-rose-950/40">
                    TRAFFIC_TRUST_PRIVATE_IP: on (dev only)
                  </span>
                )}
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${
                    metrics.vpn_filtering_active
                      ? "border-emerald-500/40 text-emerald-400 bg-emerald-950/40"
                      : "border-amber-500/40 text-amber-300 bg-amber-950/30"
                  }`}
                >
                  MaxMind VPN / DC: {metrics.vpn_filtering_active ? "on" : "off"}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${
                    metrics.ipqs_active
                      ? "border-sky-500/40 text-sky-300 bg-sky-950/30"
                      : "border-slate-600 text-slate-500"
                  }`}
                >
                  IPQS: {metrics.ipqs_active ? "on" : "off"}
                </span>
              </div>
              <p className="text-slate-400 text-sm max-w-3xl">
                الأرقام أدناه لزيارات <strong className="text-white">traffic_valid = true</strong> فقط (KSA + فلترة VPN/DC
                عند تفعيل MaxMind).
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  ["Server clicks (page + CTA)", (metrics.server_clicks_valid ?? 0).toLocaleString()],
                  ["Unique sessions", metrics.unique_sessions_valid.toLocaleString()],
                  ["Page views", metrics.page_views_valid.toLocaleString()],
                  ["Product views", metrics.view_content_valid.toLocaleString()],
                  ["CTA clicks", (metrics.cta_clicks_valid ?? 0).toLocaleString()],
                  ["Add to cart", metrics.add_to_cart_valid.toLocaleString()],
                  ["Checkout starts", metrics.initiate_checkout_valid.toLocaleString()],
                  ["Orders", metrics.orders_valid.toLocaleString()],
                  ["Revenue (SAR)", Math.round(metrics.revenue_valid).toLocaleString()],
                  ["Conversion", `${(metrics.conversion_rate * 100).toFixed(2)}%`],
                  ["AOV (SAR)", metrics.aov_valid.toLocaleString(undefined, { maximumFractionDigits: 0 })],
                  ["Upsell orders", metrics.upsell_orders_valid.toLocaleString()],
                  ["Upsell rate", `${(metrics.upsell_rate_valid * 100).toFixed(1)}%`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{label}</p>
                    <p className="text-2xl font-bold text-white mt-1 tabular-nums">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <h2 className="text-lg font-semibold text-white mb-4">Daily revenue (valid orders)</h2>
                <div className="space-y-2">
                  {metrics.daily.map((d) => (
                    <div key={d.date} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-28 shrink-0">{d.date}</span>
                      <div className="flex-1 h-8 bg-slate-800 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg transition-all"
                          style={{ width: `${Math.max(6, (d.revenue / maxDailyRevenue) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-300 w-24 text-right tabular-nums">
                        {Math.round(d.revenue)} ﷼
                      </span>
                      <span className="text-xs text-slate-500 w-16 text-right">{d.orders} ord</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <h2 className="text-lg font-semibold text-white mb-4">Funnel</h2>
                <div className="grid gap-2 text-sm">
                  {[
                    ["Sessions", metrics.unique_sessions_valid],
                    ["Page views", metrics.page_views_valid],
                    ["Product views", metrics.view_content_valid],
                    ["CTA clicks", metrics.cta_clicks_valid ?? 0],
                    ["Add to cart", metrics.add_to_cart_valid],
                    ["Checkout", metrics.initiate_checkout_valid],
                    ["Orders", metrics.orders_valid],
                  ].map(([label, n], i, arr) => {
                    const prev = i === 0 ? n : arr[i - 1][1];
                    const pct = prev > 0 ? (((n) / prev) * 100).toFixed(0) : "—";
                    return (
                      <div
                        key={label}
                        className="flex justify-between border-b border-slate-800/80 py-2 last:border-0"
                      >
                        <span className="text-slate-400">{label}</span>
                        <span className="text-white font-mono tabular-nums">
                          {n.toLocaleString()}
                          {i > 0 && <span className="text-slate-500 text-xs ml-2">({pct}% prev)</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold text-white">Orders</h2>
                  <p className="text-slate-500 text-xs mt-0.5">نفس نطاق التواريخ أعلاه</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                  <input
                    type="search"
                    placeholder="Order #, phone, name…"
                    value={orderQInput}
                    onChange={(e) => setOrderQInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setOrderQApplied(orderQInput.trim());
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white min-w-[200px]"
                  />
                  <button
                    type="button"
                    onClick={() => setOrderQApplied(orderQInput.trim())}
                    className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 text-sm border border-slate-700"
                  >
                    Search
                  </button>
                  <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={ordersValidOnly}
                      onChange={(e) => setOrdersValidOnly(e.target.checked)}
                      className="rounded border-slate-600"
                    />
                    Valid traffic only
                  </label>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => token && void fetchDashboard(token)}
                    className="rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 px-3 py-2 text-sm border border-amber-500/30"
                  >
                    Reload list
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-left text-slate-500">
                        <th className="px-4 py-3 font-medium">Order</th>
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Total</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Valid</th>
                        <th className="px-4 py-3 font-medium">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr
                          key={o.order_number}
                          className="border-b border-slate-800/80 hover:bg-slate-800/40 cursor-pointer"
                          onClick={() => setSelectedOrder(o)}
                        >
                          <td className="px-4 py-3 font-mono text-amber-400 font-semibold">{o.order_number}</td>
                          <td className="px-4 py-3">
                            <div className="text-white font-medium">{o.name}</div>
                            <div className="text-slate-500 text-xs" dir="ltr">
                              {o.phone}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold text-white">{Math.round(o.total)} ﷼</td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-300 bg-slate-800 px-2 py-1 rounded-md">
                              {o.status || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {o.traffic_valid === true && <span className="text-emerald-400 text-xs font-bold">YES</span>}
                            {o.traffic_valid === false && <span className="text-rose-400 text-xs font-bold">NO</span>}
                            {o.traffic_valid == null && <span className="text-slate-500 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                            {new Date(o.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && <p className="text-center text-slate-500 py-12">No orders in database.</p>}
                </div>
              </div>
            </div>
          )}

          {tab === "system" && (
            <div className="max-w-xl space-y-4">
              <h2 className="text-lg font-semibold text-white">Danger zone</h2>
              <p className="text-slate-400 text-sm">
                يحذف كل الطلبات والأحداث. يتطلب JWT.
              </p>
              <button
                type="button"
                disabled={clearBusy}
                onClick={async () => {
                  if (!token) return;
                  if (!window.confirm("Delete ALL orders and tracking data? This cannot be undone.")) return;
                  setClearBusy(true);
                  try {
                    const res = await fetch(adminUrl("/admin/orders/clear"), {
                      method: "DELETE",
                      headers: authHeaders(token),
                    });
                    if (res.ok) {
                      await fetchDashboard(token);
                      alert("Database cleared.");
                    } else alert("Clear failed (403?).");
                  } finally {
                    setClearBusy(false);
                  }
                }}
                className="rounded-xl border border-rose-500/50 bg-rose-950/40 text-rose-200 px-4 py-3 text-sm font-bold hover:bg-rose-900/50 disabled:opacity-50"
              >
                {clearBusy ? "Clearing…" : "Clear orders & tracking"}
              </button>
            </div>
          )}
        </main>
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-slate-950 border border-slate-700/90 rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/5"
            onClick={(e) => e.stopPropagation()}
            dir="ltr"
          >
            <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 px-6 pt-6 pb-8 border-b border-amber-500/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative flex justify-between items-start gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400/90">COD order</p>
                  <p className="text-2xl font-mono font-black text-white mt-1">{selectedOrder.order_number}</p>
                  <p className="text-slate-400 text-xs mt-2">
                    {new Date(selectedOrder.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="w-10 h-10 rounded-2xl bg-slate-950/60 text-slate-400 hover:text-white border border-slate-700/80 text-lg leading-none"
                  >
                    ×
                  </button>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                      selectedOrder.traffic_valid === true
                        ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                        : selectedOrder.traffic_valid === false
                          ? "border-rose-500/40 text-rose-300 bg-rose-500/10"
                          : "border-slate-600 text-slate-400 bg-slate-800/50"
                    }`}
                  >
                    {selectedOrder.traffic_valid === true
                      ? "KSA valid"
                      : selectedOrder.traffic_valid === false
                        ? "Excluded from metrics"
                        : "Unknown"}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-500 border border-slate-700 rounded-full px-2.5 py-1">
                    status: {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Customer</p>
                    <p className="text-white font-semibold text-lg">{selectedOrder.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void navigator.clipboard.writeText(selectedOrder.phone)}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 shrink-0"
                  >
                    Copy phone
                  </button>
                </div>
                <p className="text-slate-200 font-mono text-sm tracking-wide" dir="ltr">
                  {selectedOrder.phone}
                </p>
                {selectedOrder.city ? (
                  <p className="text-slate-400 text-sm">
                    <span className="text-slate-600">City </span>
                    {selectedOrder.city}
                  </p>
                ) : null}
                {selectedOrder.session_id ? (
                  <p className="text-slate-500 text-[10px] font-mono break-all">session: {selectedOrder.session_id}</p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-3">Line items</p>
                <ul className="space-y-2">
                  {selectedOrder.items.map((it) => (
                    <li
                      key={`${selectedOrder.order_number}-${it.sku}`}
                      className="flex justify-between gap-3 rounded-xl bg-slate-950/70 border border-slate-800/80 px-4 py-3"
                    >
                      <div className="min-w-0" dir="rtl">
                        <p className="text-white text-sm font-semibold leading-snug">{it.name_ar}</p>
                        <p className="text-slate-500 font-mono text-[11px] mt-1" dir="ltr">
                          {it.sku} × {it.qty} @ {Math.round(it.unit_price)} ﷼
                        </p>
                      </div>
                      <p className="text-amber-400 font-bold tabular-nums text-sm shrink-0 pt-0.5">
                        {Math.round(it.unit_price * it.qty)} ﷼
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedOrder.upsell_accepted && (
                <div className="rounded-2xl border border-emerald-500/35 bg-emerald-950/25 px-4 py-3 text-sm text-emerald-200 flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  <span>
                    Upsell accepted
                    {selectedOrder.upsell_sku ? (
                      <span className="font-mono text-emerald-300"> · {selectedOrder.upsell_sku}</span>
                    ) : (
                      ""
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-end gap-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 px-5 py-4">
                <div>
                  <p className="text-slate-500 text-xs font-medium">Total COD</p>
                  <p
                    className="text-amber-400/80 text-[10px] font-mono mt-1 max-w-[200px] truncate"
                    title={selectedOrder.client_ip || ""}
                  >
                    IP {selectedOrder.client_ip || "—"}
                  </p>
                </div>
                <p className="text-3xl font-black text-white tabular-nums">
                  {Math.round(selectedOrder.total)} <span className="text-lg text-amber-500 font-bold">﷼</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
