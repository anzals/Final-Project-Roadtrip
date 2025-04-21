import "./../styles/Layout.css";
import Header from "./Header";
import Footer from "./Footer";

// Ensures a consistent layout with each page
function Layout({ children }) {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">{children}</main> 
      <Footer />
    </div>
  );
}

export default Layout;
