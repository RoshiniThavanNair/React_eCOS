import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './style1.css';
import { Line } from 'react-chartjs-2';
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

function Electricity() {
  const [originalTariff, setOriginalTariff] = useState('');
  const [nemRate, setNemRate] = useState('');
  const [ecosTariff, setEcosTariff] = useState('');
  const [icptRate1, setIcptRate1] = useState('');
  const [factoryRegion, setFactoryRegion] = useState('');
  const [icptRate2, setIcptRate2] = useState('');
  const [kwtbbRate, setKwtbbRate] = useState(0.016);
  const [batteryCostKwh, setBatteryCostKwh] = useState(780.0);
  const [batteryLife, setBatteryLife] = useState(12);
  const [batteryRating, setBatteryRating] = useState(0.5);
  const [batteryLifecycles, setBatteryLifecycles] = useState(6000);
  const [pcsCostKw, setPcsCostKw] = useState(250.0);
  const [pcsLife, setPcsLife] = useState(20);

  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [pvDataOption, setPvDataOption] = useState(null); // Tracks PV data choice
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [pvUploadedFileName, setPvUploadedFileName] = useState('');
  const [pvUploadSuccessMessage, setPvUploadSuccessMessage] = useState('');
  const [activePage, setActivePage] = useState(2); // Track the active page
  const [startDate, setStartDate] = useState(''); // Start Date
  const [endDate, setEndDate] = useState(''); // End Date
  const [buildingLoadData, setBuildingLoadData] = useState([]);
  const [pvGenerationData, setPvGenerationData] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const navigate = useNavigate();

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
    const savedData1 = JSON.parse(localStorage.getItem('buildingParams'));
    console.log('Retrieved data from localStorage:', savedData1); // Debug log
    if (savedData1) {
      setOriginalTariff(savedData1.originalTariff || '');
      setNemRate(savedData1.nemRate || '');
      setEcosTariff(savedData1.ecosTariff || '');
      setIcptRate1(savedData1.icptRate1 || '');
      setIcptRate2(savedData1.icptRate2 || '');
      setFactoryRegion(savedData1.factoryRegion || '');
      setKwtbbRate(savedData1.kwtbbRate || '');
      setBatteryCostKwh(savedData1.batteryCostKwh || '');
      setBatteryLife(savedData1.batteryLife || '');
      setBatteryRating(savedData1.batteryRating || '');
      setBatteryLifecycles(savedData1.batteryLifecycles || '');
      setPcsCostKw(savedData1.pcsCostKw || '');
      setPcsLife(savedData1.pcsLife || '');
    }
  }, []);

  // Save data to localStorage whenever fields change
  useEffect(() => {
    const buildingParams = {
      originalTariff,
      nemRate,
      ecosTariff,
      icptRate1,
      icptRate2,
      factoryRegion,
      kwtbbRate,
      batteryCostKwh,
      batteryLife,
      batteryRating,
      batteryLifecycles,
      pcsCostKw,
      pcsLife,
    };

    if (
      originalTariff ||
      nemRate ||
      ecosTariff ||
      icptRate1 ||
      icptRate2 ||
      factoryRegion ||
      kwtbbRate ||
      batteryCostKwh ||
      batteryLife ||
      batteryRating ||
      batteryLifecycles ||
      pcsCostKw ||
      pcsLife
    ) {
      localStorage.setItem('buildingParams', JSON.stringify(buildingParams));
      console.log('Saved to localStorage:', buildingParams);
    }
  }, [
    originalTariff,
    nemRate,
    ecosTariff,
    icptRate1,
    icptRate2,
    factoryRegion,
    kwtbbRate,
    batteryCostKwh,
    batteryLife,
    batteryRating,
    batteryLifecycles,
    pcsCostKw,
    pcsLife,
  ]);

  const handlePrevious = () => navigate('/pcs-login'); // Navigate to the previous page
  const handleNext = () => navigate('/ess'); // Navigate to the next page (ESS)

  const handleFileUpload = (file) => {
    if (file.size > 200 * 1024 * 1024) {
      setUploadSuccessMessage('File size exceeds the maximum limit of 200MB.');
      return;
    }
    setUploadedFileName(file.name);
    setUploadSuccessMessage('File uploaded successfully.');
    // Parse CSV file here and store in state for building load data
    parseCSV(file, 'building');
  };

  const handlePVFileUpload = (file) => {
    if (file.size > 200 * 1024 * 1024) {
      setPvUploadSuccessMessage('File size exceeds the maximum limit of 200MB.');
      return;
    }
    setPvUploadedFileName(file.name);
    setPvUploadSuccessMessage('File uploaded successfully.');
    // Parse CSV file here and store in state for PV data
    parseCSV(file, 'pv');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDropPVFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePVFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };
  
  
  const handlePVFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handlePVFileUpload(e.target.files[0]);
    }
  };
  

  const parseCSV = (file, type) => {
    // Clear the relevant localStorage keys before parsing new data
    if (type === 'building') {
      localStorage.removeItem('buildingLoadData');
      localStorage.removeItem('buildingLoadMonthlyData');
      console.log('Previous building load data cleared from localStorage');
  } else if (type === 'pv') {
      localStorage.removeItem('pvGenerationData');
      localStorage.removeItem('pvGenerationMonthlyData');
      console.log('Previous PV generation data cleared from localStorage');
  }
    const reader = new FileReader();
    reader.onload = () => {
        const content = reader.result;
        const lines = content.split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).map(line => {
            const values = line.split(',');

            // Parse datetime using native Date
            const parsedDate = new Date(values[0]);
            if (isNaN(parsedDate)) {
                console.error(`Invalid datetime: ${values[0]}`);
                return null; // Skip invalid rows
            }

            return {
                datetime: parsedDate.toISOString(), // Convert to ISO format
                total: parseFloat(values[1]), // Assuming second column is the numeric value
            };
        }).filter(row => row !== null); // Remove null entries caused by invalid rows

        // Process the data by month
        const monthlyData = processMonthlyData(data); // This will aggregate by month

        // Store processed data in localStorage
        if (type === 'building') {
            setBuildingLoadData(data);
            localStorage.setItem('buildingLoadData', JSON.stringify(data)); 
            localStorage.setItem('buildingLoadMonthlyData', JSON.stringify(monthlyData));
            console.log("Building load data saved");
        } else if (type === 'pv') {
            setPvGenerationData(data);
            localStorage.setItem('pvGenerationData', JSON.stringify(data));
            localStorage.setItem('pvGenerationMonthlyData', JSON.stringify(monthlyData));
            console.log("PV generation data saved");
        }
    };
    reader.readAsText(file);
};

// Function to aggregate data by month
const processMonthlyData = (data) => {
    const monthlyData = Array(12).fill(0); // Create an array for each month (January to December)

    data.forEach(entry => {
        const month = new Date(entry.datetime).getMonth();  // Extract month (0 = Jan, 11 = Dec)
        monthlyData[month] += entry.total;  // Aggregate the total for each month
    });

    return monthlyData;
};
  

const generateGraphData = () => {
  if (!startDate || !endDate) {
    alert('Please select both start and end dates before generating the graph.');
    return;
  }

  // Ensure that the end date includes all time on the selected end date
  const adjustedEndDate = new Date(endDate);
  adjustedEndDate.setHours(23, 59, 59, 999); // Set to 23:59:59.999

  if (!buildingLoadData.length && !pvGenerationData.length) {
    alert('Both Building Load and PV Generation files are missing. Please upload at least one file.');
    return;
  }

  // Check for missing data
  if (!buildingLoadData.length && pvGenerationData.length) {
    const proceed = window.confirm('Building Load file is missing. Do you wish to continue without that?');
    if (!proceed) return;
  } else if (buildingLoadData.length && !pvGenerationData.length) {
    const proceed = window.confirm('PV Generation file is missing. Do you wish to continue without that?');
    if (!proceed) return;
  }

  // Filter data for the selected date range
  const filteredBuildingLoadData = buildingLoadData.filter(
    item => new Date(item.datetime) >= new Date(startDate) && new Date(item.datetime) <= adjustedEndDate
  );
  const filteredPVGenerationData = pvGenerationData.filter(
    item => new Date(item.datetime) >= new Date(startDate) && new Date(item.datetime) <= adjustedEndDate
  );

  if (!filteredBuildingLoadData.length && !filteredPVGenerationData.length) {
    alert('No data available for the selected date range.');
    return;
  }

  // Prepare data for the chart
  const chartLabels = filteredBuildingLoadData.length
    ? filteredBuildingLoadData.map(item => item.datetime)
    : filteredPVGenerationData.map(item => item.datetime);

  const buildingLoadValues = filteredBuildingLoadData.map(item => item.total);
  const pvGenerationValues = filteredPVGenerationData.map(item => item.total);

  const datasets = [];

  if (filteredBuildingLoadData.length) {
    datasets.push({
      label: 'Building Load (kW)',
      data: buildingLoadValues,
      borderColor: 'blue',
      fill: false,
    });
  }

  if (filteredPVGenerationData.length) {
    datasets.push({
      label: 'PV Generation (kW)',
      data: pvGenerationValues,
      borderColor: 'orange',
      fill: false,
    });
  }

  if (filteredBuildingLoadData.length && filteredPVGenerationData.length) {
    const consumptionWithSolar = buildingLoadValues.map((load, index) => {
      const pvGeneration = pvGenerationValues[index] || 0;
      return load - pvGeneration; // Consumption with solar = Building load - PV generation
    });

    datasets.push({
      label: 'Consumption with Solar (kW)',
      data: consumptionWithSolar,
      borderColor: 'green',
      fill: false,
    });
  }

  setGraphData({
    labels: chartLabels,
    datasets: datasets,
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Power vs. Time',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Power (kW)',
          },
        },
      },
    },
  });
};

  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  // TOU Data (C1 TOU) - Peak and Off-Peak
  const getTOUData = () => {
    return {
      labels: [
        "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
        "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
      ],
      datasets: [
        {
          label: "TOU Time Zones",
          data: new Array(24).fill(1),  // Set all bars to the same height (value 1)
          backgroundColor: new Array(24).fill(0).map((_, index) => {
            if (index >= 8 && index < 22) return "red"; // Peak
            return "green"; // Off-Peak
          }),
        },
      ],
    };
  };
  
  // ETOU Data (C1 ETOU) - Weekdays and Weekends
  const getETOUData = () => {
    const weekdaysData = {
      labels: [
        "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
        "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
      ],
      datasets: [
        {
          label: "ETOU Time Zones for Weekdays",
          data: new Array(24).fill(1),  // Set all bars to the same height (value 1)
          backgroundColor: new Array(24).fill(0).map((_, index) => {
            if (index >= 8 && index < 11) return "yellow";  // Mid-Peak
            if (index >= 11 && index < 12) return "red"; // Peak
            if (index >= 12 && index < 14) return "yellow";  // Mid-Peak
            if (index >= 14 && index < 17) return "red"; // Peak
            if (index >= 17 && index < 22) return "yellow";  // Mid-Peak
            return "green"; // Off-Peak
          }),
        },
      ],
    };

    const weekendsData = {
      labels: [
        "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
        "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
      ],
      datasets: [
        {
          label: "ETOU Time Zones for Weekends",
          data: new Array(24).fill(1),  // Set all bars to the same height (value 1)
          backgroundColor: new Array(24).fill("green"), // All Off-Peak
        },
      ],
    };

    return { weekdaysData, weekendsData };
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }, // Hide legend
      tooltip: { enabled: true,
        callbacks: {
        // Custom tooltip content
        label: function (context) {
          const color = context.dataset.backgroundColor[context.dataIndex]; // Get the color of the bar
          const tariff = ecosTariff.toLowerCase(); // Get the selected tariff
          let tooltipText = "";

          if (tariff === "c1 etou") {
            if (color === "red") tooltipText = "Demand Charge(RM/kW/Month): 34.00, Energy Charge(sen/kWh): 58.40";
            else if (color === "yellow") tooltipText = "Demand Charge(RM/kW/Month): 28.80, Energy Charge(sen/kWh): 35.70";
            else if (color === "green") tooltipText = "Energy Charge(sen/kWh): 28.10";
          } else if (tariff === "c2 etou") {
            if (color === "red") tooltipText = "Demand Charge(RM/kW/Month): 48.40, Energy Charge(sen/kWh): 63.60";
            else if (color === "yellow") tooltipText = "Demand Charge(RM/kW/Month): 42.60, Energy Charge(sen/kWh): 33.90";
            else if (color === "green") tooltipText = "Energy Charge(sen/kWh): 22.40";
          } else if (tariff === "d etou") {
            if (color === "red") tooltipText = "Demand Charge(RM/kW/Month): 42.10, Energy Charge(sen/kWh): 48.40";
            else if (color === "yellow") tooltipText = "Demand Charge(RM/kW/Month): 37.20, Energy Charge(sen/kWh): 32.70";
            else if (color === "green") tooltipText = "Energy Charge(sen/kWh): 24.90";
          } else if (tariff === "e1 etou") {
            if (color === "red") tooltipText = "Demand Charge(RM/kW/Month): 35.50, Energy Charge(sen/kWh): 56.60";
            else if (color === "yellow") tooltipText = "Demand Charge(RM/kW/Month): 29.60, Energy Charge(sen/kWh): 33.30";
            else if (color === "green") tooltipText = "Energy Charge(sen/kWh): 22.50";
          } else if (tariff === "e2 etou") {
            if (color === "red") tooltipText = "Demand Charge(RM/kW/Month): 40.00, Energy Charge(sen/kWh): 59.20";
            else if (color === "yellow") tooltipText = "Demand Charge(RM/kW/Month): 36.00, Energy Charge(sen/kWh): 33.20";
            else if (color === "green") tooltipText = "Energy Charge(sen/kWh): 21.90";
          } else if (tariff === "e3 etou") {
            if (color === "red") tooltipText = "Demand Charge(RM/kW/Month): 38.30, Energy Charge(sen/kWh): 57.60";
            else if (color === "yellow") tooltipText = "Demand Charge(RM/kW/Month): 35.00, Energy Charge(sen/kWh): 32.70";
            else if (color === "green") tooltipText = "Energy Charge(sen/kWh): 20.20";
          } else {
            tooltipText = "No data for this tariff";
          }

          return tooltipText;
        },
      },

      }, // Disable tooltips completely
    },
    scales: {
      x: {
        title: { display: true, text: "Time (Hourly)" },
        ticks: { autoSkip: false },
      },
      y: {
        display: false, // Hide Y-axis
      },
    },
    maintainAspectRatio: false, // Allow chart to resize freely
    aspectRatio: 2, // Set aspect ratio to make chart taller
    layout: {
      padding: {
        top: 20, // Padding from the top
      },
    },
  };

  const handleTariffChange = (e) => {
    setEcosTariff(e.target.value);
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

      {/* Page Content */}
      <div className="info-box" style={{ display: activePage === 2 ? 'block' : 'none' }}>
        <h2>Building Parameters Settings</h2>
        <div className="form-row">
          <label className="label-left1">
            Building Params
          </label>
        </div>
        
        <div className="form-row">
            <label className="label-left">
              Original Tariff
              <select
                value={originalTariff}
                onChange={(e) => setOriginalTariff(e.target.value)}
              >
                <option value="" >Select Original Tariff</option>
                <option value="c1 tou">C1 TOU</option>
                <option value="c2 tou">C2 TOU</option>
                <option value="d tou">D TOU</option>
                <option value="ds tou">Ds TOU</option>
                <option value="e1 tou">E1 TOU</option>
                <option value="e1s tou">E1s TOU</option>
                <option value="e2 tou">E2 TOU</option>
                <option value="e2s tou">E2s TOU</option>
                <option value="e3 tou">E3 TOU</option>
                <option value="e3s tou">E3s TOU</option>
                <option value="c1 etou">C1 ETOU</option>
                <option value="c2 etou">C2 ETOU</option>
                <option value="d etou">D ETOU</option>
                <option value="ds etou">Ds ETOU</option>
                <option value="e1 etou">E1 ETOU</option>
                <option value="e1s etou">E1s ETOU</option>
                <option value="e2 etou">E2 ETOU</option>
                <option value="e2s etou">E2s ETOU</option>
                <option value="e3 etou">E3 ETOU</option>
                <option value="e3s etou">E3s ETOU</option>
                {/* Add more options as needed */}
              </select>
            </label>

            <label className="label-left">
              NEM Rate
              <input
                type="number"
                value={nemRate}
                onChange={(e) => setNemRate(e.target.value)}
              />
            </label>

        </div>

        <div className="form-row">
            <label className="label-left">
              eCOS Tariff
              <select
                value={ecosTariff}
                onChange={handleTariffChange}
              >
                <option value="" >Select eCOS Tariff</option>
                <option value="c1 tou">C1 TOU</option>
                <option value="c2 tou">C2 TOU</option>
                <option value="d tou">D TOU</option>
                <option value="ds tou">Ds TOU</option>
                <option value="e1 tou">E1 TOU</option>
                <option value="e1s tou">E1s TOU</option>
                <option value="e2 tou">E2 TOU</option>
                <option value="e2s tou">E2s TOU</option>
                <option value="e3 tou">E3 TOU</option>
                <option value="e3s tou">E3s TOU</option>
                <option value="c1 etou">C1 ETOU</option>
                <option value="c2 etou">C2 ETOU</option>
                <option value="d etou">D ETOU</option>
                <option value="ds etou">Ds ETOU</option>
                <option value="e1 etou">E1 ETOU</option>
                <option value="e1s etou">E1s ETOU</option>
                <option value="e2 etou">E2 ETOU</option>
                <option value="e2s etou">E2s ETOU</option>
                <option value="e3 etou">E3 ETOU</option>
                <option value="e3s etou">E3s ETOU</option>
                {/* Add more options as needed */}
              </select>
            </label>

            <label className="label-left">
              ICPT Rate (First Half Year)
              <input
                type="number"
                value={icptRate1}
                onChange={(e) => setIcptRate1(e.target.value)}
              />
            </label>
        </div>

        <div className="form-row">
            <label className="label-left">
              Factory Region
              <select
                value={factoryRegion}
                onChange={(e) => setFactoryRegion(e.target.value)}
              >
                <option value="" >Select Region</option>
                <option value="jhr">Johor(JHR)</option>
                <option value="kdh">Kedah(KDH)</option>
                <option value="ktn">Kelantan(KTN)</option>
                <option value="mlk">Malacca(MLK)</option>
                <option value="nsn">Negeri Sembilan(NSN)</option>
                <option value="phg">Pahang(PHG)</option>
                <option value="png">Penang(PNG)</option>
                <option value="prk">Perak(PRK)</option>
                <option value="pls">Perlis(PLS)</option>
                <option value="sbh">Sabah(SBH)</option>
                <option value="swk">Sarawak(SWK)</option>
                <option value="sgr">Selangor(SGR)</option>
                <option value="trg">Terengganu(TRG)</option>
                <option value="kul">Kuala Lumpur(KUL)</option>
                <option value="lbn">Labuan(LBN)</option>
                <option value="pjy">Putrajaya(PJY)</option>
                
              </select>
            </label>

            <label className="label-left">
              ICPT Rate (Second Half Year)
              <input
                type="number"
                value={icptRate2}
                onChange={(e) => setIcptRate2(e.target.value)}
              />
            </label>
        </div>

        <div className="form-row">
          <label className="label-left">
           KWTBB Rate
            <input
              type="number"
              value={kwtbbRate}
              onChange={(e) => setKwtbbRate(e.target.value)}
            />
          </label>

          <label className="label-left">
          </label>
        </div>

        <div className="form-row">
          <label className="label-left1">
            BESS Params
          </label>
        </div>

        <div className="form-row">
          <label className="label-left">
            Battery Cost per kWh (RM)
            <input
              type="number"
              value={batteryCostKwh}
              onChange={(e) => setBatteryCostKwh(e.target.value)}
            />
          </label>

          <label className="label-left">
           Battery Life (years)
            <input
              type="number"
              value={batteryLife}
              onChange={(e) => setBatteryLife(e.target.value)}
            />
          </label>
        </div>

        <div className="form-row">
          <label className="label-left">
            Battery C Rating
            <input
              type="number"
              value={batteryRating}
              onChange={(e) => setBatteryRating(e.target.value)}
            />
          </label>

          <label className="label-left">
            Battery Life Cycles
            <input
              type="number"
              value={batteryLifecycles}
              onChange={(e) => setBatteryLifecycles(e.target.value)}
            />
          </label>
        </div>

        <div className="form-row">
          <label className="label-left1">
            PCS Params
          </label>
        </div>

        <div className="form-row">
          <label className="label-left">
            PCS Cost per kW (RM)
            <input
              type="number"
              value={pcsCostKw}
              onChange={(e) => setPcsCostKw(e.target.value)}
            />
          </label>

          <label className="label-left">
            PCS Life (years)
            <input
              type="number"
              value={pcsLife}
              onChange={(e) => setPcsLife(e.target.value)}
            />
          </label>
        </div>

      </div>

      {/* Page Content */}
      <div className="info-box" style={{ display: activePage === 2 ? 'block' : 'none' }}>
        <h2>Consumption Settings</h2>
        <div className="form-row">
          <label className="label-left1">
            Upload Building Load, PV Generation and Location Data
          </label>
        </div>

        {/* Download Button */}
        <div className="form-row">
          <label className="label-left1">
            <button
              className="download-template"
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/Building_Load_Template.csv'; // Replace with the actual path
                link.download = 'Building_Load_Template.csv';
                link.click();
              }}
            >
              Download Building Load Template
            </button>
          </label>
        </div>

        <div className="form-row">
          <label className="label-left2">
            Upload Building Load Data (1 Year)
          </label>
        </div>

        {/* Drag and Drop Area */}
        <div
          className="drag-drop-area"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="drag-drop-left">
            <img
              src="/images/upload.png"
              alt="Drag and Drop Logo"
              className="drag-drop-logo"
            />
          </div>
          <div class="upload-text" id="upload-text">
              Drag and drop file here
              <div class="upload-subtext">Limit 200MB file • CSV, XLXS</div>
          </div>
          <div className="drag-drop-right">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              id="file-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="file-input" className="browse-button">
              Browse File
            </label>
          </div>
        </div>

        {/* Uploaded File Info */}
        {uploadedFileName && (
          <div className="upload-info">
            <p>Uploaded File: {uploadedFileName}</p>
            <p className="success-message">{uploadSuccessMessage}</p>
          </div>
        )}

        <div className="form-row">
          <label className="label-left2">Do you have PV Generation Data?</label>
        </div>
        <div className="radio-group">
          <div className="radio-option">
            <input
              type="radio"
              name="pvData"
              value="yes"
              checked={pvDataOption === 'yes'}
              onChange={() => setPvDataOption('yes')}
              id="pv-yes"
            />
            <label htmlFor="pv-yes" className="radio-label">Yes</label>
          </div>
          <div className="radio-option">
            <input
              type="radio"
              name="pvData"
              value="no"
              checked={pvDataOption === 'no'}
              onChange={() => setPvDataOption('no')}
              id="pv-no"
            />
            <label htmlFor="pv-no" className="radio-label">No</label>
          </div>
        </div>

        {pvDataOption === 'yes' && (
          <>
            <div className="form-row">
              <label className="label-left1">
                <button
                  className="download-template"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/PV Generation Template.csv'; // Replace with actual path
                    link.download = 'PV Generation Template.csv';
                    link.click();
                  }}
                >
                  Download PV Generation Template
                </button>
              </label>
            </div>

            <div className="form-row">
              <label className="label-left2">Upload PV Generation Data (1 Year)</label>
            </div>

            <div
              className="drag-drop-area"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropPVFile}
            >
              <div className="drag-drop-left">
                <img
                  src="/images/upload.png"
                  alt="Drag and Drop Logo"
                  className="drag-drop-logo"
                />
              </div>
              <div className="upload-text" id="upload-text">
                Drag and drop file here
                <div className="upload-subtext">Limit 200MB file • CSV, XLXS</div>
              </div>
              <div className="drag-drop-right">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handlePVFileInput}
                  id="pv-file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="pv-file-input" className="browse-button">
                  Browse File
                </label>
              </div>
            </div>

            {pvUploadedFileName && (
              <div className="upload-info">
                <p>Uploaded File: {pvUploadedFileName}</p>
                <p className="success-message">{pvUploadSuccessMessage}</p>
              </div>
            )}
          </>
        )}

        {pvDataOption === 'no' && (
          <div className="form-row">
            <label className="label-left2">
              Latitude
              <input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Enter Latitude"
              />
            </label>
            <label className="label-left2">
              Longitude
              <input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Enter Longitude"
              />
            </label>
          </div>
        )}

      </div>

      <div className="info-box" style={{ display: activePage === 2 ? 'block' : 'none' }}>
        <h2>Data Visualization</h2>

        {/* Show Selected Tariff */}
    <div className="ecos-timezone">
        <h3>Selected eCOS Tariff: {ecosTariff}</h3>
        &nbsp;&nbsp;&nbsp;

        <div className="legend" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
            <div style={{ width: "20px", height: "20px", backgroundColor: "green", marginRight: "10px" }}></div>
            <span>Off-Peak</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
            <div style={{ width: "20px", height: "20px", backgroundColor: "yellow", marginRight: "10px" }}></div>
            <span>Mid-Peak</span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "20px", height: "20px", backgroundColor: "red", marginRight: "10px" }}></div>
            <span>Peak</span>
          </div>
        </div>

        {/* Display TOU or ETOU Charts */}
        &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
        {ecosTariff && ecosTariff.includes("tou") && !ecosTariff.includes("etou") &&(
          <div className="bar-chart" style={{ height: "400px", width: "100%" }}>
            <h4>TOU Time Zones</h4>
            <Bar data={getTOUData()} options={barChartOptions} height={400}/>
          </div>
        )}

        {ecosTariff && ecosTariff.includes("etou") &&(
          <>
          &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
            <div className="bar-chart" style={{ height: "400px", width: "100%" }}>
              <h4>ETOU Time Zones for Weekdays</h4>
              <Bar data={getETOUData().weekdaysData} options={barChartOptions} height={400}/>
            </div>

            &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;

            <div className="bar-chart" style={{ height: "400px", width: "100%" }}>
              <h4>ETOU Time Zones for Weekends</h4>
              <Bar data={getETOUData().weekendsData} options={barChartOptions} height={400}/>
            </div>
          </>
        )}
      </div>

      &nbsp;&nbsp;&nbsp; 
      &nbsp;&nbsp;&nbsp; 

        <div className="form-row">
          <label className="label-left">Start Date
          <input type="date" value={startDate} onChange={handleStartDateChange} />
          </label>

          <label className="label-left">End Date
          <input type="date" value={endDate} onChange={handleEndDateChange} />
          </label>

        </div>

        <div className="form-row">
          <button onClick={generateGraphData} className="generate-plot-button">
            Generate Plot
          </button>
        </div>

        {graphData && (
          <Line
            data={graphData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Power vs. Time',
                },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Time',
                },
              },
            y: {
              title: {
                display: true,
                text: 'Power (kW)',
              },
            },
          },
        }}
      />
    )}
        
    </div>

      {/* Footer */}
      <footer className="footer">
        <button className="previous-button" onClick={handlePrevious}>
          Previous
        </button>
        <button className="next-button" onClick={handleNext}>
          Next
        </button>
      </footer>
    </div>
  );
}

export default Electricity;
