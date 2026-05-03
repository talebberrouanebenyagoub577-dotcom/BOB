"use client";

import { useEffect, useState } from "react";

interface OrderItem {
  sku: string;
  qty: number;
  unit_price: number;
}

interface Order {
  order_number: string;
  name: string;
  phone: string;
  city: string;
  total: number;
  status: string;
  upsell_accepted: boolean;
  upsell_sku: string | null;
  items: OrderItem[];
  created_at: string;
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authed, setAuthed] = useState(false);

  async function fetchOrders(t: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/admin/orders?token=${t}&limit=200`);
      if (res.status === 403) { setError("رمز خاطئ"); setLoading(false); return; }
      if (!res.ok) throw new Error();
      setOrders(await res.json());
      setAuthed(true);
    } catch {
      setError("خطأ في الاتصال");
    }
    setLoading(false);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-extrabold text-center text-navy">لوحة الطلبات</h1>
          <input
            type="password"
            placeholder="رمز الدخول"
            value={token}
            onChange={e => setToken(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchOrders(token)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 text-right"
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            onClick={() => fetchOrders(token)}
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded-xl transition"
          >
            {loading ? "جارٍ التحميل..." : "دخول"}
          </button>
        </div>
      </div>
    );
  }

  const total = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-gray-800">لوحة الطلبات</h1>
          <button onClick={() => fetchOrders(token)} className="text-sm bg-white border rounded-xl px-4 py-2 hover:bg-gray-50">
            تحديث
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <p className="text-3xl font-black text-yellow-500">{orders.length}</p>
            <p className="text-gray-500 text-sm mt-1">إجمالي الطلبات</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <p className="text-3xl font-black text-green-500">{total.toFixed(0)}</p>
            <p className="text-gray-500 text-sm mt-1">إجمالي المبيعات (ر.س)</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 text-center col-span-2 md:col-span-1">
            <p className="text-3xl font-black text-blue-500">
              {orders.filter(o => o.upsell_accepted).length}
            </p>
            <p className="text-gray-500 text-sm mt-1">قبلوا Upsell</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["رقم الطلب","الاسم","الهاتف","المدينة","المجموع","Upsell","التاريخ"].map(h => (
                    <th key={h} className="px-4 py-3 text-right font-bold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(o => (
                  <tr key={o.order_number} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-gray-800">{o.order_number}</td>
                    <td className="px-4 py-3 font-medium">{o.name}</td>
                    <td className="px-4 py-3 font-mono text-gray-600" dir="ltr">{o.phone}</td>
                    <td className="px-4 py-3 text-gray-700">{o.city || "—"}</td>
                    <td className="px-4 py-3 font-bold text-green-600">{o.total} ر.س</td>
                    <td className="px-4 py-3">
                      {o.upsell_accepted
                        ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">نعم</span>
                        : <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">لا</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(o.created_at).toLocaleString("ar-SA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="text-center text-gray-400 py-12">لا توجد طلبات بعد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
