import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import './style1.css';

function PCSLogin() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(1);

  // States for form fields
  const [projectName, setProjectName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [maxSolarSize, setMaxSolarSize] = useState('');
  const [startYear, setStartYear] = useState(null);
  const [endYear, setEndYear] = useState(null);
  const [yearMessage, setYearMessage] = useState('Maximum 25 years');
  const [yearsSelected, setYearsSelected] = useState('');

  const handlePageClick = (pageNumber) => {
    setActivePage(pageNumber);
    // Direct navigation based on page number clicked
    if (pageNumber === 1) navigate('/pcs-login');
    else if (pageNumber === 2) navigate('/electricity');
    else if (pageNumber === 3) navigate('/ess');
    else if (pageNumber === 4) navigate('/economic');
    else if (pageNumber === 5) navigate('/report');
  };

  // Load saved data on component mount
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('basicInfo'));
    console.log('Retrieved data from localStorage:', savedData); // Debug log
    if (savedData) {
      setProjectName(savedData.projectName || '');
      setCustomerName(savedData.customerName || '');
      setAddress(savedData.address || '');
      setMaxSolarSize(savedData.maxSolarSize || '');
      setStartYear(savedData.startYear ? new Date(savedData.startYear) : null);
      setEndYear(savedData.endYear ? new Date(savedData.endYear) : null);
    }
  }, []);

  // Save data to localStorage whenever fields change
  useEffect(() => {
    const basicInfo = {
      projectName,
      customerName,
      address,
      maxSolarSize,
      startYear,
      endYear,
    };
  
    if (
      projectName ||
      customerName ||
      address ||
      maxSolarSize
    ) {
      localStorage.setItem('basicInfo', JSON.stringify(basicInfo));
      console.log('Saved to localStorage:', basicInfo);
    }
  }, [projectName, customerName, address, maxSolarSize, startYear, endYear]);
  

  const handleStartYearChange = (date) => {
    setStartYear(date);
    if (endYear && date) {
      updateProjectLifecycle(date, endYear);
    }
  };

  const handleEndYearChange = (date) => {
    setEndYear(date);
    if (startYear && date) {
      updateProjectLifecycle(startYear, date);
    }
  };

  const updateProjectLifecycle = (startDate, endDate) => {
    const start = startDate.getFullYear();
    const end = endDate.getFullYear();
    const years = end - start;

    if (years > 25) {
      alert('The project lifecycle cannot exceed 25 years.');
      setEndYear(null);
      setYearMessage('Maximum 25 years');
      setYearsSelected('');
    } else if (years >= 0) {
      setYearMessage(`Lasts for ${years} years`);
      setYearsSelected(`Selected period: ${years} years`);
    }
  };

  const handleCancel = () => alert('Cancelled');
  const handleNext = () => navigate('/electricity'); // Navigate to next page

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

      {/* Info Box */}
      <div className="info-box">
        <h2>Basic Info</h2>
        <div className="form-row">
          <label className="label-left">
            Project Name
            <input
              type="text"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </label>
          <label className="label-left">
            Customer Name
            <input
              type="text"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </label>
        </div>
        <div className="form-row">
          <label className="label-left">
            Address
            <input
              type="text"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <label className="label-left">
            Maximum Solar Inverter Size (kW)
            <input
              type="number"
              placeholder="Enter maximum size"
              value={maxSolarSize}
              onChange={(e) => setMaxSolarSize(e.target.value)}
            />
          </label>
        </div>
        <div className="form-row">
          <label className="label-left">
            Project Lifecycle
            <div className="year-input">
              <DatePicker
                selected={startYear}
                onChange={handleStartYearChange}
                dateFormat="yyyy"
                showYearPicker
                placeholderText="Start Year"
                className="year-input-box"
              />
            </div>
            <div className="year-input">
              <DatePicker
                selected={endYear}
                onChange={handleEndYearChange}
                dateFormat="yyyy"
                showYearPicker
                placeholderText="End Year"
                className="year-input-box"
              />
            </div>
            <div className="year-message">{yearMessage}</div>
            <div className="years-selected">{yearsSelected}</div>
          </label>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <button className="cancel-button" onClick={handleCancel}>Cancel</button>
        <button className="next-button" onClick={handleNext}>Next</button>
      </footer>
    </div>
  );
}

export default PCSLogin;

