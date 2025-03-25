// src/layouts/AuthLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function AuthLayout() {
  const { language } = useSelector((state) => state.auth);

  return (
    <div className={language === "ar" ? "rtl font-arabic" : "font-sans"}>
      <Outlet />
    </div>
  );
}

export default AuthLayout;
