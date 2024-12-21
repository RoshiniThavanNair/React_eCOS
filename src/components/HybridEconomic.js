import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HybridStyle.css';

function HybridEconomicSettings() {
  const [activePage, setActivePage] = useState(4); // Set the active page to 4 for Economic Settings
  const [discountRate, setDiscountRate] = useState(3.7); // Default Discount Rate
  const [essPrice, setEssPrice] = useState(''); // ESS Price
  const [omPrice, setOmPrice] = useState(''); // O&M Price

  const navigate = useNavigate();

  const handlePrevious = () => navigate('/hybrid-ess'); // Navigate to the previous page (ESS Settings)
  const handleNext = () => navigate('/hybrid-report'); // Navigate to the next page (Report)

  const handlePageClick = (pageNumber) => {
    setActivePage(pageNumber);
    // Direct navigation based on page number clicked
    if (pageNumber === 1) navigate('/hybrid-login');
    else if (pageNumber === 2) navigate('/hybrid-electricity');
    else if (pageNumber === 3) navigate('/hybrid-ess');
    else if (pageNumber === 4) navigate('/hybrid-economic');
    else if (pageNumber === 5) navigate('/hybrid-report');
  };

  return (
    <div className="page-content">
      {/* Header */}
      <header className="header">
        <h1 className="ecos-title">eCOS</h1>
      </header>

      {/* Navigation */}
      <div className="navigation">
        {[1, 2, 3, 4, 5].map((pageNumber) => (
          <div
            key={pageNumber}
            className={`nav-item ${activePage === pageNumber ? 'active' : ''}`}
            onClick={() => handlePageClick(pageNumber)}
          >
            <div className={`circle ${activePage === pageNumber ? 'active-circle' : ''}`}>
              {pageNumber}
            </div>
            <div className={`nav-label ${activePage === pageNumber ? 'active-label' : ''}`}>
              {pageNumber === 1 && 'Basic Info'}
              {pageNumber === 2 && 'Building Parameters & Consumption'}
              {pageNumber === 3 && 'ESS Settings'}
              {pageNumber === 4 && 'Economic Settings'}
              {pageNumber === 5 && 'Report'}
            </div>
          </div>
        ))}
      </div>
      <hr className="separator" />

      {/* Economic Settings Info Box */}
      <div className="info-box" style={{ display: activePage === 4 ? 'block' : 'none' }}>
        <h2>Economic Settings</h2>

        {/* Discount Rate and Currency Unit */}
        <div className="form-row">
          <label className="label-left">
            Currency Unit: MYR; Discount Rate (%)
            <input
              type="number"
              value={discountRate}
              onChange={(e) => setDiscountRate(e.target.value)}
            />
          </label>
        </div>

        <div className="form-row">
          <label className="label-left1">
          Initial Installation Cost
          </label>
        </div>

        {/* Initial Installation Cost */}
        <div className="form-row">
          <label className="label-left">
            ESS Price (MYR/kWh)
            <input
              type="number"
              value={essPrice}
              onChange={(e) => setEssPrice(e.target.value)}
            />
          </label>
        </div>

        <div className="form-row">
          <label className="label-left1">
          O&M Cost
          </label>
        </div>

        {/* O&M Cost */}
        <div className="form-row">
          <label className="label-left">
            ESS O&M Price (MYR/kWh/Year)
            <input
              type="number"
              value={omPrice}
              onChange={(e) => setOmPrice(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <button className="previous-button" onClick={handlePrevious}>Previous</button>
        <button className="next-button" onClick={handleNext}>Next</button>
      </footer>
    </div>
  );
}

export default HybridEconomicSettings;
