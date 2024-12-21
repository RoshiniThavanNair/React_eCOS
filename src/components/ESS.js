import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style1.css';
import Papa from 'papaparse'; // Import PapaParse to handle CSV parsing

function ESSSettings() {
  const [activePage, setActivePage] = useState(3); // Set the active page to 3 for ESS Settings
  const [batteryData, setBatteryData] = useState([]); // State to store parsed CSV data
  const [selectedBattery, setSelectedBattery] = useState(''); // State to store selected battery model
  const [endOfChargeSOC, setEndOfChargeSOC] = useState(95); // Default value for End-of-Charge SOC
  const [endOfDischargeSOC, setEndOfDischargeSOC] = useState(5); // Default value for End-of-Discharge SOC
  const [rte, setRte] = useState(89); // Default value for RTE
  const [essCapacityPlanningMode, setEssCapacityPlanningMode] = useState(''); // State for ESS Capacity Planning Mode
  const [essCapacity, setEssCapacity] = useState(''); // State for ESS Capacity input
  const [maxEssCapacity, setMaxEssCapacity] = useState(''); // State for Maximum ESS Capacity input
  const navigate = useNavigate();

  const handlePrevious = () => navigate('/electricity'); // Navigate to the previous page (Building Parameters & Consumption)
  const handleNext = () => navigate('/economic'); // Direct navigation to the next page (Economic Settings)

  const handlePageClick = (pageNumber) => {
    setActivePage(pageNumber);
    // Direct navigation based on page number clicked
    if (pageNumber === 1) navigate('/pcs-login');
    else if (pageNumber === 2) navigate('/electricity');
    else if (pageNumber === 3) navigate('/ess');
    else if (pageNumber === 4) navigate('/economic');
    else if (pageNumber === 5) navigate('/report');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const data = result.data;
          setBatteryData(data); // Store parsed CSV data
        },
        header: true, // Use headers from the CSV
      });
    }
  };

  const handleBatteryModelChange = (event) => {
    const selectedModel = event.target.value;
    setSelectedBattery(selectedModel);

    // Find the selected battery model data
    const battery = batteryData.find(bat => bat['Battery Model'] === selectedModel);
    if (battery) {
      // Update the SOC and RTE values based on selected battery model
      setEndOfChargeSOC(battery['End-of-Charge SOC'] || 95);  // Set to 95 if not found
      setEndOfDischargeSOC(battery['End-of-Discharge SOC'] || 5);  // Set to 5 if not found
      setRte(battery['RTE'] || 89);  // Set to 89 if not found
    }
  };

  const handleEssCapacityPlanningModeChange = (event) => {
    const selectedMode = event.target.value;
    setEssCapacityPlanningMode(selectedMode);
    if (selectedMode === 'Specified ESS Capacity') {
      setMaxEssCapacity(''); // Clear Maximum ESS Capacity if Specified is selected
    } else {
      setEssCapacity(''); // Clear ESS Capacity if Recommended is selected
    }
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

      {/* ESS Settings Info Box */}
      <div className="info-box" style={{ display: activePage === 3 ? 'block' : 'none' }}>
        <h2>ESS Settings</h2>

        {/* Upload Battery Model CSV */}
        <div className="form-row">
          <label className="label-left">
            Upload Battery Model CSV:
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          </label>
        </div>

        {/* Battery Model Selection Box and Other Fields */}
        <div className="form-row">
          <div className="field">
            <label className="label-left">
              Battery Model
              <select value={selectedBattery} onChange={handleBatteryModelChange}>
                <option value="">Select Battery Model</option>
                {batteryData.map((battery, index) => (
                  <option key={index} value={battery['Battery Model']}>
                    {battery['Battery Model']}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* End-of-Charge SOC, End-of-Discharge SOC, RTE */}
        <div className="horizontal-box">
          <div className="field">
            <label className="label-left">
              End-of-Charge SOC (%)
              <input
                type="number"
                value={endOfChargeSOC}
                readOnly
              />
            </label>
          </div>

          <div className="field">
            <label className="label-left">
              End-of-Discharge SOC (%)
              <input
                type="number"
                value={endOfDischargeSOC}
                readOnly
              />
            </label>
          </div>

          <div className="field">
            <label className="label-left">
              RTE (%)
              <input
                type="number"
                value={rte}
                readOnly
              />
            </label>
          </div>
        </div>

        {/* ESS Capacity Planning Mode */}
        <div className="horizontal-box">
          <div className="field">
            <label className="label-left">
              ESS Capacity Planning Mode
              <select value={essCapacityPlanningMode} onChange={handleEssCapacityPlanningModeChange}>
                <option value="">Select ESS Capacity Planning Mode</option>
                <option value="Specified ESS Capacity">Specified ESS Capacity</option>
                <option value="Recommended ESS Capacity">Recommended ESS Capacity</option>
              </select>
            </label>
          </div>
        </div>

        {/* ESS Capacity or Maximum ESS Capacity Input */}
        {essCapacityPlanningMode === 'Specified ESS Capacity' && (
          <div className="horizontal-box">
            <div className="field">
              <label className="label-left">
                ESS Capacity (kWh)
                <input
                  type="number"
                  value={essCapacity}
                  onChange={(e) => setEssCapacity(e.target.value)}
                />
              </label>
            </div>
          </div>
        )}

        {essCapacityPlanningMode === 'Recommended ESS Capacity' && (
          <div className="horizontal-box">
            <div className="field">
              <label className="label-left">
                Maximum ESS Capacity (kWh)
                <input
                  type="number"
                  value={maxEssCapacity}
                  onChange={(e) => setMaxEssCapacity(e.target.value)}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <button className="previous-button" onClick={handlePrevious}>Previous</button>
        <button className="next-button" onClick={handleNext}>Next</button>
      </footer>
    </div>
  );
}

export default ESSSettings;
