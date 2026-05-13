import { Link } from "react-router-dom";
import { BRAND } from "../brand.js";

const showAdminNavLink =
  import.meta.env.DEV === true ||
  String(import.meta.env.VITE_SHOW_ADMIN_LINK || "").trim() === "true";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-circle">
                <span className="footer-logo-letter">N</span>
              </div>
              <span className="footer-brand-name">{BRAND.nameAr}</span>
            </div>
            <p className="footer-desc">
              {BRAND.footerBlurbAr}
            </p>
            <p style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.15)" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.38)", marginBottom: 6 }}>
                التواصل الهاتفي
              </span>
              <a href={`tel:${BRAND.contactPhoneIntl}`} dir="ltr" style={{ fontSize: 17, fontWeight: 900, color: "var(--gold)", fontVariantNumeric: "tabular-nums" }}>
                {BRAND.contactPhoneIntl}
              </a>
            </p>
          </div>

          {/* Pages */}
          <div className="footer-col">
            <h4>الصفحات</h4>
            <div className="footer-links">
              <Link to="/">الرئيسية</Link>
              <Link to="/collection">المتجر</Link>
              <Link to="/about">من نحن</Link>
              <Link to="/contact">تواصل معنا</Link>
              {showAdminNavLink && (
                <Link to="/admin" className="text-slate-500">
                  لوحة التحكم
                </Link>
              )}
            </div>
          </div>

          {/* Policies */}
          <div className="footer-col">
            <h4>السياسات</h4>
            <div className="footer-links">
              <Link to="/policies/shipping">الشحن والتوصيل</Link>
              <Link to="/policies/returns">الإرجاع والاسترداد</Link>
              <Link to="/policies/cod">سياسة COD</Link>
              <Link to="/policies/privacy">الخصوصية</Link>
              <Link to="/policies/terms">الشروط والأحكام</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {BRAND.nameAr} — جميع الحقوق محفوظة</p>
          <div className="footer-cod-badge">
            <span>✓</span>
            <span>الدفع عند الاستلام فقط</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
