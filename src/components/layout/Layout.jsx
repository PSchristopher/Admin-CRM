import Main from "./Main.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import Sidebar from "./Sidebar.jsx";
import Login from "../../pages/login/Login.jsx";
import Signup from "../../pages/login/Signup.jsx";
import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider.jsx";

const Layout = () => {
  const { isAuthenticated, isLoadingUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Auth status:', { isAuthenticated, isLoadingUser, currentPath: location.pathname });
    
    // Only redirect if we're not already on the correct page
    if (!isLoadingUser) {
      if (!isAuthenticated && !location.pathname.includes('/login') && !location.pathname.includes('/signup')) {
        console.log('Redirecting to login');
        navigate("/login", { replace: true });
      } else if (isAuthenticated && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup')) {
        console.log('Redirecting to dashboard');
        navigate("/catalog/product/manage", { replace: true });
      }
    }
  }, [isAuthenticated, isLoadingUser, navigate, location.pathname]);

  if (isLoadingUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Login />} />
        </Routes>
      ) : (
        <>
          <Sidebar />
          <div className="admin_body">
            <Navbar />
            <Main />
            <Footer />
          </div>
        </>
      )}
    </>
  );
};

export default Layout;