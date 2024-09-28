// App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [incidentCount, setIncidentCount] = useState(0);
  const [incidents, setIncidents] = useState([]);
  const [expandedIncidentId, setExpandedIncidentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from backend
  useEffect(() => {
    // Fetch incident count and incident list
    const fetchData = async () => {
      try {
        // Fetch incident count
        const countResponse = await fetch('http://localhost:5000/api/incident-count');
        const countData = await countResponse.json();
        console.log("Incident Count:", countData); // Log count response to console
        setIncidentCount(countData.count);

        // Fetch incidents list
        const incidentsResponse = await fetch('http://localhost:5000/api/all-incidents');
        const incidentsData = await incidentsResponse.json();
        console.log("Incidents List:", incidentsData); // Log incidents response to console
        setIncidents(incidentsData.incidents);
      } catch (err) {
        setError('Failed to fetch data');
        console.error("Error fetching data:", err); // Log error if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExpand = (id) => {
    setExpandedIncidentId(expandedIncidentId === id ? null : id);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="App">
      {/* Title */}
      <h1 className="title">Summary</h1>

      {/* Incident Count */}
      <div className="incident-box">
        <span>{incidentCount} incidents this week</span>
      </div>

      {/* Data Visualizations */}
      <div className="visualizations">
        <div className="chart">Chart 1 Placeholder</div>
        <div className="chart">Chart 2 Placeholder</div>
      </div>

      {/* Incident List */}
      <div className="incident-list">
        <h2>Incident List</h2>
        {incidents.map((incident) => (
          <div key={incident.id} className="incident-item">
            <div onClick={() => handleExpand(incident.id)} className="incident-header">
              <span>{new Date(incident.timestamp).toLocaleString()}</span>
            </div>

            {/* Expandable Section */}
            {expandedIncidentId === incident.id && (
              <div className="incident-details">
                <video controls className="incident-video">
                  <source src={incident.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="incident-actions">
                  <button className="report-btn">File Report</button>
                  <button className="resolve-btn">Mark as Resolved</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
