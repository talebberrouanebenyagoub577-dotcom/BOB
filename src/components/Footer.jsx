import { Link } from "react-router-dom";

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
              <span className="footer-brand-name">نيدها اوتو</span>
            </div>
            <p className="footer-desc">
              منظومة قيادة يومية للسوق السعودي. منتجات مختبرة تحل مشاكل
              القيادة الحقيقية. الدفع عند الاستلام لجميع مناطق المملكة.
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
          <p>© 2026 نيدها اوتو — جميع الحقوق محفوظة</p>
          <div className="footer-cod-badge">
            <span>✓</span>
            <span>الدفع عند الاستلام فقط</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
