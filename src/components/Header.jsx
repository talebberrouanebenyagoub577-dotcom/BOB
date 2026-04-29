import { useCart } from "../store/cartStore";

export default function Header() {
  const { itemCount, openDrawer } = useCart();

  return (
    <header className="header">
      <div className="brand">Nidham Auto</div>
      <nav className="nav">
        <a href="#home">الرئيسية</a>
        <a href="#shop">المتجر</a>
        <a href="#contact">تواصل معنا</a>
      </nav>
      <button className="cart-button" onClick={openDrawer} type="button">
        السلة
        <span className="cart-count">{itemCount}</span>
      </button>
    </header>
  );
}
