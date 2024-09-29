// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import PieChart from './components/IncidentPieChart';
import LineChart from './components/IncidentLineChart';
import IncidentBarChart from './components/IncidentBarChart'; // Import the new component

function App() {
  const [incidents, setIncidents] = useState([]);
  const [expandedIncidentId, setExpandedIncidentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('week'); // Add state for timeframe
  const [showMenu, setShowMenu] = useState(false); // For hamburger menu popup

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const incidentsResponse = await fetch('http://localhost:5000/api/incidents-test');
        const incidentsData = await incidentsResponse.json();

        console.log("Incidents List:", incidentsData);
        setIncidents(incidentsData);
      } catch (err) {
        setError('Failed to fetch data');
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExpand = (id) => {
    setExpandedIncidentId(expandedIncidentId === id ? null : id);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    setShowMenu(false); // Close menu after selection
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^&\n]{11})/;
    const match = url.match(regExp);
    return match && match[2] ? match[2] : null;
  };

  // Function to check if a date is within a specific range
  const isDateInRange = (date, range) => {
    const now = new Date();
    const incidentDate = new Date(date);

    switch (range) {
      case 'week':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
        return incidentDate >= startOfWeek && incidentDate <= endOfWeek;

      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return incidentDate >= startOfMonth && incidentDate <= endOfMonth;

      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        return incidentDate >= startOfYear && incidentDate <= endOfYear;

      case 'all':
      default:
        return true; // No filter for all time
    }
  };

  // Filter incidents based on selected timeframe
  const filteredIncidents = incidents.filter((incident) =>
    isDateInRange(incident.date, timeframe)
  );

  return (
    <div className="App">
      {/* Hamburger Icon for Filter Menu */}
      <div className="menu-icon" onClick={toggleMenu}>
        &#9776; {/* This is the hamburger icon */}
      </div>

      {/* Popup Menu for Timeframe Filter */}
      {showMenu && (
        <div className="popup-menu">
          <button onClick={() => handleTimeframeChange('week')}>This Week</button>
          <button onClick={() => handleTimeframeChange('month')}>This Month</button>
          <button onClick={() => handleTimeframeChange('year')}>This Year</button>
          <button onClick={() => handleTimeframeChange('all')}>All Time</button>
        </div>
      )}

      {/* Title */}
      <h1 className="title">Safety Report</h1>

      {/* Incident Count */}
      <div className="incident-box">
        <span>{filteredIncidents.length} incidents {timeframe !== 'all' ? `this ${timeframe}` : 'in total'}</span>
      </div>

      {/* Data Visualizations */}
      <div className="visualizations">
        <PieChart incidents={filteredIncidents} /> 
        <IncidentBarChart incidents={filteredIncidents} />
      </div>

      <LineChart incidents={incidents} timeframe={timeframe} /> 

      {/* Incident List */}
      <div className="incident-list">
        <h2>Incident List</h2>
        {filteredIncidents
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((incident, index) => (
          <div
            key={index}
            className={`incident-item`}  // Add 'resolved' class if incident is resolved
          >
            <div onClick={() => handleExpand(index)} className={`incident-header ${incident.resolved ? 'resolved' : ''}`}>
              <span>{`${incident.date} ${incident.timestamp}`}</span>
            </div>

            {/* Expandable Section */}
            {expandedIncidentId === index && (
              <div className="incident-details">
                {incident.videoURL.includes('youtube.com') || incident.videoURL.includes('youtu.be') ? (
                  <iframe
                    className="incident-video"
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(incident.videoURL)}`}
                    title="YouTube Video"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video controls className="incident-video">
                    <source src={incident.videoURL} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
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
