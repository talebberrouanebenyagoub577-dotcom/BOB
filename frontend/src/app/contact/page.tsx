"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-14">
        <h1 className="font-extrabold text-navy text-4xl text-center mb-8">
          تواصلي معنا
        </h1>

        {sent ? (
          <div className="text-center space-y-4 py-12">
            <p className="text-5xl">✅</p>
            <p className="font-bold text-navy text-xl">تم إرسال رسالتك!</p>
            <p className="text-navy/60">سنرد عليكِ في أقرب وقت ممكن.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-bold text-navy mb-1.5">الاسم</label>
              <input
                required
                type="text"
                className="w-full border-2 border-navy/20 rounded-xl px-4 py-3 text-navy focus:border-gold outline-none"
                placeholder="اسمك الكريم"
              />
            </div>
            <div>
              <label className="block font-bold text-navy mb-1.5">البريد الإلكتروني</label>
              <input
                required
                type="email"
                dir="ltr"
                className="w-full border-2 border-navy/20 rounded-xl px-4 py-3 text-navy focus:border-gold outline-none"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block font-bold text-navy mb-1.5">الرسالة</label>
              <textarea
                required
                rows={5}
                className="w-full border-2 border-navy/20 rounded-xl px-4 py-3 text-navy focus:border-gold outline-none resize-none"
                placeholder="اكتبي رسالتك هنا..."
              />
            </div>
            <button type="submit" className="btn-gold w-full text-lg">
              إرسال الرسالة
            </button>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}
