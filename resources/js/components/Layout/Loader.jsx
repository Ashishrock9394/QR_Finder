import React from "react";
import '../../../css/QRLoader.css';

const Loader = () => {
  return (
    <div className="qr-loader-container">
      <div className="qr-scanner">
        {/* QR finder squares */}
        <div className="qr-box top-left"></div>
        <div className="qr-box top-right"></div>
        <div className="qr-box bottom-left"></div>

        {/* QR inner dots */}
        <div className="qr-dots">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="qr-dot"></div>
          ))}
        </div>

        {/* Scanner line */}
        <div className="scanner-line"></div>
      </div>
      <p className="loading-text">Loading...</p>
    </div>
  );
};

export default Loader;
