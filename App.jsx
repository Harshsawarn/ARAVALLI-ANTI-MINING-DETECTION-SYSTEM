import React, { useState, useEffect } from 'react';
import AravaliViewer from './AravaliViewer';
import jsPDF from 'jspdf';
import './styles.css';

function App() {
  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchSuggestions = async () => {
      if (locationInput.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${locationInput}&limit=5`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [locationInput]);

  const handleSelectSuggestion = (item) => {
    setLocationInput(item.display_name);
    setSuggestions([]);
  };

  
  const handleScan = async () => {
    if (!locationInput) return;
    setLoading(true);
    setScanResult(null); 
    setSuggestions([]); 

    try {
      const res = await fetch("http://localhost:8001/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location_name: locationInput })
      });
      
      const data = await res.json();
      
      if (data.status === "ERROR") {
        alert("System Error: " + data.message);
      } else {
        setScanResult(data);
      }
    } catch (err) {
      alert("Backend Offline. Please ensure main.py is running on port 8001.");
    } finally {
      setLoading(false);
    }
  };

 
  const generateReport = () => {
    if (!scanResult) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text("SATELLITE GUARD: MINING SURVEILLANCE REPORT", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Operational Target: ${locationInput}`, 20, 40);
    doc.text(`Analysis Outcome: ${scanResult.message}`, 20, 50);
    
    if (scanResult.status === "VIOLATION_DETECTED") {
      doc.setTextColor(200, 0, 0);
      doc.text("STATUS: ILLEGAL MINING IDENTIFIED", 20, 65);
      doc.setTextColor(0, 0, 0);
      doc.text(`Detected Mining Pits: ${scanResult.pits_found}`, 20, 75);
      doc.text(`Excavation Volume: ${scanResult.volume_m3} cubic meters`, 20, 85);
      doc.text(`Total Fine Imposed: Rs. ${scanResult.fine_in_cr} Cr`, 20, 95);
    } else {
      doc.setTextColor(0, 150, 0);
      doc.text("STATUS: REGION SECURE / NO MINING TERRAIN", 20, 65);
    }
    
    doc.setTextColor(100, 100, 100);
    doc.text(`AI Confidence Level: ${scanResult.confidence}`, 20, 115);
    doc.save(`Mining_Report_${locationInput.split(',')[0]}.pdf`);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <header className="status-header">
          <div className="pulse-dot"></div>
          <span className="status-text">SYSTEM ACTIVE</span>
        </header>
        
        <h1 className="main-title">Satellite Guard</h1>

        <div className="search-section">
          <label className="input-label">OPERATIONAL TARGET</label>
          <div className="autocomplete-container">
            <input 
              className="location-input"
              value={locationInput} 
              onChange={e => setLocationInput(e.target.value)}
              placeholder="Search hotspots (e.g., Nuh, Bhiwani, Rewari)"
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            />
            
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((item, index) => (
                  <li key={index} onClick={() => handleSelectSuggestion(item)}>
                    {item.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <button className="scan-button" onClick={handleScan} disabled={loading}>
            {loading ? 'ANALYZING SPECTRUM...' : 'INITIATE AI SCAN'}
          </button>
        </div>

       
        {scanResult && (
          <div className="results-card">
            <h3 className={`status-badge ${scanResult.status === "VIOLATION_DETECTED" ? "danger" : "safe"}`}>
              {scanResult.status === "VIOLATION_DETECTED" ? "MINING HOTSPOT DETECTED" : "REGION SECURE"}
            </h3>
            
            <p className="terrain-msg" style={{fontSize: '11px', color: '#aaa', lineHeight: '1.4', marginBottom: '15px'}}>
               {scanResult.message}
            </p>

            {scanResult.status === "VIOLATION_DETECTED" ? (
              <div className="violation-data">
                <div className="data-row">
                  <span>Active Mining Pits</span>
                  <span className="data-val">{scanResult.pits_found}</span>
                </div>
                <div className="data-row">
                  <span>Excavation Volume</span>
                  <span className="data-val">{scanResult.volume_m3} m³</span>
                </div>
                <div className="fine-display">
                  ₹{scanResult.fine_in_cr} <span className="fine-unit">CR FINE</span>
                </div>
              </div>
            ) : (
              <div className="clear-data" style={{padding: '12px', background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.1)', borderRadius: '8px'}}>
                <p className="safe-text" style={{color: '#00ff88', fontSize: '12px', margin: 0}}>
                  STATUS: Target area is outside monitored Aravali hotspots. No hill terrain or illegal pits identified.
                </p>
              </div>
            )}
            
            <div className="confidence-footer" style={{marginTop: '20px', borderTop: '1px solid #333', paddingTop: '10px', display: 'flex', justifyContent: 'space-between'}}>
              <span style={{fontSize: '10px', color: '#666'}}>AI CONFIDENCE</span>
              <span style={{fontSize: '10px', color: '#007bff'}}>{scanResult.confidence}</span>
            </div>

            <button className="report-button" onClick={generateReport}>
              EXPORT DATA REPORT (PDF)
            </button>
          </div>
        )}
      </aside>

      <main className="map-viewport">
        
        <AravaliViewer data={scanResult} />
      </main>
    </div>
  );
}

export default App;