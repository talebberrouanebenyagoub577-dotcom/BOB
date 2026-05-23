import { Link, useLocation } from "react-router-dom";
import { BRAND } from "../brand.js";

export default function Header() {
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
        <Link to="/" className="logo">
          <img
            src="/brand/nidhamauto-logo.png"
            alt={`${BRAND.nameAr} — ${BRAND.nameEn}`}
            className="logo-img"
          />
        </Link>

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
      </div>
    </header>
  );
}
