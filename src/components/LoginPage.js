import React from 'react';
import './style.css'; // Import the CSS file for additional styling

const LoginPage = () => {
  const redirectToNextPage = (type) => {
    if (type === 'pcs') {
      window.location.href = '/pcs-login'; // Redirect to PCS login page
    } else {
      window.location.href = '/hybrid-login'; // Redirect to Hybrid login page
    }
  };

  return (
    <div
      className="login-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/solar2.jpg)`, // Correct path for background image
        backgroundSize: 'cover', // Ensures image covers the full container
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '100vh', // Makes container take full viewport height
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1>eCOS</h1>
      <h2>Choose Customer Type</h2>
      <div className="account-types">
        <div className="account-box" id="pcs-user" onClick={() => redirectToNextPage('pcs')}>
          <img src={`${process.env.PUBLIC_URL}/images/login blue.png`} alt="PCS User Icon" />
          <span>PCS User</span>
        </div>
        <div className="account-box" id="hybrid-user" onClick={() => redirectToNextPage('hybrid')}>
          <img src={`${process.env.PUBLIC_URL}/images/login red.png`} alt="Hybrid User Icon" />
          <span>Hybrid User</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
