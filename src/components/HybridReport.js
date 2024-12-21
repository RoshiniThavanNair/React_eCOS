import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './HybridStyle.css';
import 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import { jsPDF } from 'jspdf'; // Import jsPDF
import html2canvas from 'html2canvas'; // Import html2canvas
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

function HybridReport() {
  const [activePage, setActivePage] = useState(5);
  const [HybridBasicInfo, setHybridBasicInfo] = useState({});
  const [HybridBuildingParams, setHybridBuildingParams] = useState({});
  const [chartData, setChartData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null); // State to track selected month
  const hybridreportRef = useRef(); // Ref to the report container
  const navigate = useNavigate();

  const handlePrevious = () => navigate('/hybrid-economic');
  const handleExit = () => {
    navigate('/'); // Redirect to the login page
  };

  useEffect(() => {
    const savedHybridBasicInfo = JSON.parse(localStorage.getItem('HybridBasicInfo'));
    const savedHybridBuildingParams = JSON.parse(localStorage.getItem('HybridBuildingParams'));
  
    if (savedHybridBasicInfo) setHybridBasicInfo(savedHybridBasicInfo);
    if (savedHybridBuildingParams) setHybridBuildingParams(savedHybridBuildingParams);
  
    const buildingLoadData = JSON.parse(localStorage.getItem('buildingLoadData')) || [];
  
    if (buildingLoadData.length === 0) {
      setChartData([]);
      return;
    }
  
    const groupedData = groupDataByMonth(buildingLoadData);
  
    const monthlyChartData = Object.keys(groupedData).map((month) => {
      const { days, buildingLoad } = groupedData[month];
      const consumptionWithSolar = buildingLoad.map((load) => load);
  
      return {
        month: parseInt(month),
        data: {
          labels: days,
          datasets: [
            {
              label: 'Building Load (kW)',
              data: buildingLoad,
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.1)',
              fill: true,
            },
            {
              label: 'Consumption with Solar (kW)',
              data: consumptionWithSolar,
              borderColor: 'green',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              fill: true,
            },
          ],
        },
      };
    });
  
    setChartData(monthlyChartData);
  }, []);  

  const groupDataByMonth = (buildingData) => {
    const grouped = {};
    for (let month = 0; month < 12; month++) {
      grouped[month] = {
        days: Array.from({ length: new Date(2024, month + 1, 0).getDate() }, (_, i) => `Day ${i + 1}`),
        buildingLoad: Array(new Date(2024, month + 1, 0).getDate()).fill(0),
      };
    }

    buildingData.forEach((item) => {
      const date = new Date(item.datetime);
      const month = date.getMonth();
      const day = date.getDate() - 1;
      grouped[month].buildingLoad[day] += item.total || 0;
    });

    return grouped;
  };

  const handlePageClick = (pageNumber) => {
    setActivePage(pageNumber);
    const routes = ['/hybrid-login', '/hybrid-electricity', '/hybrid-ess', '/hybrid-economic', '/hybrid-report'];
    navigate(routes[pageNumber - 1]);
  };

  const exportReport = async () => {
    const doc = new jsPDF();
    const reportElement = hybridreportRef.current;

    // Debugging to check the content of reportRef
  console.log('hybridreportRef.current:', reportElement);

    if (reportElement) {
      const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      doc.save('ecos_hybrid_report.pdf');
    } else {
      alert('Report content is not ready for export');
    }

  };

  const handleShare = () => {
    // Assuming the URL to share is the current page URL
    const reportUrl = window.location.href;
    navigator.clipboard.writeText(reportUrl).then(() => {
      alert('Report link copied to clipboard');
    });
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

      {/* Info Box */}
      <div ref={hybridreportRef} className="report-content">
      <div className="info-box">
        <h2>Basic Info</h2>
        <div className="form-row">
          <label className="label-left">
            <strong>Project Name: </strong>{HybridBasicInfo.projectName || 'N/A'}
          </label>
          <label className="label-left">
            <strong>Customer Name: </strong>{HybridBasicInfo.customerName || 'N/A'}
          </label>
        </div>
        <div className="form-row">
          <label className="label-left">
            <strong>Address: </strong>{HybridBasicInfo.address || 'N/A'}
          </label>
          <label className="label-left">
            <strong>Maximum Solar Inverter Size (kW): </strong>{HybridBasicInfo.maxSolarSize || 'N/A'}
          </label>
        </div>
        <div className="form-row">
          <label className="label-left">
            <strong>Project Lifecycle: </strong>{HybridBasicInfo.startYear && HybridBasicInfo.endYear
              ? `${new Date(HybridBasicInfo.startYear).getFullYear()} - ${new Date(HybridBasicInfo.endYear).getFullYear()}`
              : 'N/A'}
          </label>
        </div>
        
      </div>

      <div className="info-box">
        <h2>Building Parameters Settings</h2>

        &nbsp;&nbsp;&nbsp;

        <div className="form-row">
          <label className="label-left1">
            Building Params
          </label>
        </div>

        <div className="form-row">
          <label className="label-left">
            <strong>Original Tariff: </strong>{HybridBuildingParams.originalTariff || 'N/A'}
          </label>
          <label className="label-left">
            <strong>NEM Rate: </strong>{HybridBuildingParams.nemRate || 'N/A'}
          </label>
        </div>
        <div className="form-row">
          <label className="label-left">
            <strong>eCOS Tariff: </strong>{HybridBuildingParams.ecosTariff || 'N/A'}
          </label>
          <label className="label-left">
            <strong>ICPT Rate (First Half Year): </strong>{HybridBuildingParams.icptRate1 || 'N/A'}
          </label>
        </div>
        <div className="form-row">
          <label className="label-left">
            <strong>Factory Region: </strong>{HybridBuildingParams.factoryRegion || 'N/A'}
          </label>
          <label className="label-left">
            <strong>ICPT Rate (Second Half Year): </strong>{HybridBuildingParams.icptRate2 || 'N/A'}
          </label>
        </div>
        <div className="form-row">
          <label className="label-left">
            <strong>KWTBB Rate: </strong>{HybridBuildingParams.kwtbbRate || 'N/A'}
          </label>
        </div>

        &nbsp;&nbsp;&nbsp;

        <div className="form-row">
          <label className="label-left1">
            Bess Params
          </label>
        </div>

        <div className="form-row">
          <label className="label-left">
            <strong>Battery Cost per kWh (RM): </strong>{HybridBuildingParams.batteryCostKwh || 'N/A'}
          </label>
          <label className="label-left">
            <strong>Battery Life (years): </strong>{HybridBuildingParams.batteryLife || 'N/A'}
          </label>
        </div>
        <div className="form-row">
          <label className="label-left">
            <strong>Battery C Rating: </strong>{HybridBuildingParams.batteryRating || 'N/A'}
          </label>
          <label className="label-left">
            <strong>Battery Life Cycles: </strong>{HybridBuildingParams.batteryLifecycles || 'N/A'}
          </label>
        </div>

        &nbsp;&nbsp;&nbsp;

        <div className="form-row">
          <label className="label-left1">
            PCS Params
          </label>
        </div>

        <div className="form-row">
          <label className="label-left">
            <strong>PCS Cost per kW (RM): </strong>{HybridBuildingParams.pcsCostKw || 'N/A'}
          </label>
          <label className="label-left">
            <strong>PCS Life (years): </strong>{HybridBuildingParams.pcsLife || 'N/A'}
          </label>
        </div>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <h2>Consumption Overview</h2>

        {/* Calendar for Month Selection */}
        <div className="month-picker">
          <label>
            Select Month:&nbsp;
            <DatePicker
              selected={selectedMonth}
              onChange={(date) => setSelectedMonth(date)}
              dateFormat="MMMM"
              showMonthYearPicker
              placeholderText="All Months"
            />
          </label>
        </div>

        {/* Graphs */}
        {chartData.length > 0 ? (
          <div className="monthly-graphs">
            {chartData
              .filter((data) => selectedMonth === null || data.month === selectedMonth.getMonth())
              .map((data, index) => (
                <div key={index} className="monthly-graph-container">
                  <h3>{new Date(2024, data.month).toLocaleString('default', { month: 'long' })}</h3>
                  <Line data={data.data} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              ))}
          </div>
        ) : (
          <p>No data available. Please upload building load to generate charts.</p>
        )}
      </div>
    </div>

      {/* Buttons */}
      <div className="actions">
        <button className="export-share-btn export-btn" onClick={exportReport}>
          Export Report
        </button>
        <button className="export-share-btn share-btn" onClick={handleShare}>
          Share Report
        </button>
      </div>

      {/* Footer */}
      <footer className="footer">
        <button className="previous-button" onClick={handlePrevious}>
          Previous
        </button>
        <button onClick={handleExit} className="exit-button">
          Exit
        </button>
      </footer>
    </div>
  );
}


export default HybridReport;
