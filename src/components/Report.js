import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './style1.css';
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

function Report() {
  const [activePage, setActivePage] = useState(5);
  const [basicInfo, setBasicInfo] = useState({});
  const [buildingParams, setBuildingParams] = useState({});
  const [chartData, setChartData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null); // State to track selected month
  const reportRef = useRef(); // Ref to the report container
  const navigate = useNavigate();

  const handlePrevious = () => navigate('/economic');
  const handleExit = () => {
    navigate('/'); // Redirect to the login page
  };

  useEffect(() => {
    const savedBasicInfo = JSON.parse(localStorage.getItem('basicInfo'));
    const savedBuildingParams = JSON.parse(localStorage.getItem('buildingParams'));
  
    if (savedBasicInfo) setBasicInfo(savedBasicInfo);
    if (savedBuildingParams) setBuildingParams(savedBuildingParams);
  
    const buildingLoadData = JSON.parse(localStorage.getItem('buildingLoadData')) || [];
    const pvGenerationData = JSON.parse(localStorage.getItem('pvGenerationData')) || [];
  
    if (buildingLoadData.length === 0 && pvGenerationData.length === 0) {
      setChartData([]);
      return;
    }
  
    const groupedData = groupDataByMonth(buildingLoadData, pvGenerationData);
  
    const monthlyChartData = Object.keys(groupedData).map((month) => {
      const { days, buildingLoad, pvGeneration } = groupedData[month];
      const consumptionWithSolar = buildingLoad.map((load, index) => load - (pvGeneration[index] || 0));
  
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
              label: 'PV Generation (kW)',
              data: pvGeneration,
              borderColor: 'orange',
              backgroundColor: 'rgba(255, 165, 0, 0.1)',
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

  const groupDataByMonth = (buildingData, pvData) => {
    const grouped = {};
    for (let month = 0; month < 12; month++) {
      grouped[month] = {
        days: Array.from({ length: new Date(2024, month + 1, 0).getDate() }, (_, i) => `Day ${i + 1}`),
        buildingLoad: Array(new Date(2024, month + 1, 0).getDate()).fill(0),
        pvGeneration: Array(new Date(2024, month + 1, 0).getDate()).fill(0),
      };
    }

    buildingData.forEach((item) => {
      const date = new Date(item.datetime);
      const month = date.getMonth();
      const day = date.getDate() - 1;
      grouped[month].buildingLoad[day] += item.total || 0;
    });

    pvData.forEach((item) => {
      const date = new Date(item.datetime);
      const month = date.getMonth();
      const day = date.getDate() - 1;
      grouped[month].pvGeneration[day] += item.total || 0;
    });

    return grouped;
  };

  const handlePageClick = (pageNumber) => {
    setActivePage(pageNumber);
    const routes = ['/pcs-login', '/electricity', '/ess', '/economic', '/report'];
    navigate(routes[pageNumber - 1]);
  };

  const exportReport = async () => {
    const doc = new jsPDF();
    const reportElement = reportRef.current;

    // Debugging to check the content of reportRef
  console.log('reportRef.current:', reportElement);

    if (reportElement) {
      const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      doc.save('ecos_report.pdf');
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
      <div ref={reportRef} className="report-content">
      <div className="info-box">
        <h2>Basic Info</h2>
        <div className="form-row">
          <label className="label-left">
            <strong>Project Name: </strong>{basicInfo.projectName || 'N/A'}
          </label>
          <label className="label-left">
            <strong>Customer Name: </strong>{basicInfo.customerName || 'N/A'}
          </label>
        </div>
        <div className="form-row">
          <label className="label-left">
            <strong>Address: </strong>{basicInfo.address || 'N/A'}
          </label>
          <label className="label-left">
            <strong>Maximum Solar Inverter Size (kW): </strong>{basicInfo.maxSolarSize || 'N/A'}
          </label>
        </div>
        <div className="form-row">
          <label className="label-left">
            <strong>Project Lifecycle: </strong>{basicInfo.startYear && basicInfo.endYear
              ? `${new Date(basicInfo.startYear).getFullYear()} - ${new Date(basicInfo.endYear).getFullYear()}`
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
            <strong>Original Tariff: </strong>{buildingParams.originalTariff || 'N/A'}
          </label>
          <label className="label-left">
            <strong>NEM Rate: </strong>{buildingParams.nemRate || 'N/A'}
          </label>
        </div>
        <div className="form-row">
          <label className="label-left">
            <strong>eCOS Tariff: </strong>{buildingParams.ecosTariff || 'N/A'}
          </label>
          <label className="label-left">
            <strong>ICPT Rate (First Half Year): </strong>{buildingParams.icptRate1 || 'N/A'}
          </label>
        </div>
        <div className="form-row">
          <label className="label-left">
            <strong>Factory Region: </strong>{buildingParams.factoryRegion || 'N/A'}
          </label>
          <label className="label-left">
            <strong>ICPT Rate (Second Half Year): </strong>{buildingParams.icptRate2 || 'N/A'}
          </label>
        </div>
        <div className="form-row">
          <label className="label-left">
            <strong>KWTBB Rate: </strong>{buildingParams.kwtbbRate || 'N/A'}
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
            <strong>Battery Cost per kWh (RM): </strong>{buildingParams.batteryCostKwh || 'N/A'}
          </label>
          <label className="label-left">
            <strong>Battery Life (years): </strong>{buildingParams.batteryLife || 'N/A'}
          </label>
        </div>
        <div className="form-row">
          <label className="label-left">
            <strong>Battery C Rating: </strong>{buildingParams.batteryRating || 'N/A'}
          </label>
          <label className="label-left">
            <strong>Battery Life Cycles: </strong>{buildingParams.batteryLifecycles || 'N/A'}
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
            <strong>PCS Cost per kW (RM): </strong>{buildingParams.pcsCostKw || 'N/A'}
          </label>
          <label className="label-left">
            <strong>PCS Life (years): </strong>{buildingParams.pcsLife || 'N/A'}
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
          <p>No data available. Please upload building load and PV generation data to generate charts.</p>
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


export default Report;
