import { Link, useLocation } from "react-router-dom";
import { useCart } from "../store/cartStore";

export default function Header() {
  const { itemCount, openDrawer } = useCart();
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "الرئيسية" },
    { to: "/collection", label: "المتجر" },
    { to: "/about", label: "من نحن" },
    { to: "/contact", label: "تواصل معنا" },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo — right side (RTL) */}
        <Link to="/" className="logo">
          <div className="logo-circle">
            <span className="logo-letter">N</span>
          </div>
          <div className="logo-text">
            <span className="logo-ar">نيدها اوتو</span>
            <span className="logo-en">nidha mauto</span>
          </div>
        </Link>

        {/* Nav — center */}
        <nav className="nav">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${pathname === link.to ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Cart — left side (RTL) */}
        <button className="cart-btn" onClick={openDrawer} type="button" aria-label="فتح السلة">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span>السلة</span>
          {itemCount > 0 && (
            <span className="cart-count">{itemCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
