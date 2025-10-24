import React from "react";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,0.9)",
  zIndex: 9999,
  flexDirection: "column",
};

const logoStyle = {
  width: 96,
  height: 96,
  marginBottom: 16,
  objectFit: "contain",
};

const spinnerStyle = {
  width: 48,
  height: 48,
  border: "6px solid #e6e6e6",
  borderTop: "6px solid #2b6cb0",
  borderRadius: "50%",
  animation: "loader-spin 1s linear infinite",
};

const textStyle = {
  marginTop: 12,
  color: "#333",
  fontSize: 14,
};

const styleTag = `
@keyframes loader-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
`;

/**
 * Props:
 * - message (optional) : string to show under the logo
 * - logo (optional) : path to logo image (default '/logo.svg')
 */
const Loader = ({ message = "Loading...", logo = "/coin-wallet.png" }) => {
  return (
    <>
      <style>{styleTag}</style>
      <div style={overlayStyle} role="status" aria-live="polite">
        <img src={logo} alt="logo" style={logoStyle} onError={(e)=>{e.target.style.display='none'}} />
        <div style={spinnerStyle} />
        <div style={textStyle}>{message}</div>
      </div>
    </>
  );
};

export default Loader;