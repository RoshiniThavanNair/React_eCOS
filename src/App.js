import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import PCSLogin from './components/PCSLogin'; // Import PCSLogin component
import HybridLogin from './components/HybridLogin'; // Import HybridLogin component
import Electricity from './components/Electricity'; // Import Electricity component
import ESS from './components/ESS'; // Import ESS component
import Economic from './components/Economic'; // Import Economic component
import Report from './components/Report'; // Import Report component
import HybridElectricity from './components/HybridElectricity'; // Import Electricity component
import HybridESS from './components/HybridESS'; // Import ESS component
import HybridEconomic from './components/HybridEconomic'; // Import Economic component
import HybridReport from './components/HybridReport'; // Import Report component

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/pcs-login" element={<PCSLogin />} />
                <Route path="/hybrid-login" element={<HybridLogin />} />
                <Route path="/electricity" element={<Electricity />} /> {/* Route for Electricity page */}
                <Route path="/ess" element={<ESS />} /> {/* Route for ESS Settings page */}
                <Route path="/economic" element={<Economic />} /> {/* Route for Economic Settings page */}
                <Route path="/report" element={<Report />} /> {/* Route for Report page */}
                <Route path="/hybrid-electricity" element={<HybridElectricity />} /> {/* Route for Electricity page */}
                <Route path="/hybrid-ess" element={<HybridESS />} /> {/* Route for ESS Settings page */}
                <Route path="/hybrid-economic" element={<HybridEconomic />} /> {/* Route for Economic Settings page */}
                <Route path="/hybrid-report" element={<HybridReport />} /> {/* Route for Report page */}
                {/* Add other routes as needed */}
            </Routes>
        </Router>
    );
}

export default App;