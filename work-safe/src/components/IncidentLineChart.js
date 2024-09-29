import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const IncidentLineChart = ({ incidents }) => {
  const [timeframe, setTimeframe] = useState('1 Month');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  const filterIncidents = (timeframe) => {
    const now = new Date();
    return incidents.filter((incident) => {
      const incidentDate = new Date(incident.date);
      switch (timeframe) {
        case '1 Month':
          return incidentDate >= new Date(now.setMonth(now.getMonth() - 1));
        case '6 Months':
          return incidentDate >= new Date(now.setMonth(now.getMonth() - 6));
        case 'YTD':
          return incidentDate.getFullYear() === new Date().getFullYear();
        case 'All Time':
          return true; // Include all incidents
        default:
          return true;
      }
    });
  };

  const groupIncidentsByDay = (incidents) => {
    const dailyCounts = {};
    incidents.forEach((incident) => {
      const incidentDate = new Date(incident.date);
      const dayKey = incidentDate.toLocaleDateString('en-US');
      dailyCounts[dayKey] = (dailyCounts[dayKey] || 0) + 1;
    });
    return dailyCounts;
  };

  const groupIncidentsByWeek = (incidents) => {
    const weeklyCounts = {};
    incidents.forEach((incident) => {
      const incidentDate = new Date(incident.date);
      const weekStart = new Date(incidentDate.setDate(incidentDate.getDate() - incidentDate.getDay()));
      const weekKey = weekStart.toLocaleDateString('en-US');
      weeklyCounts[weekKey] = (weeklyCounts[weekKey] || 0) + 1;
    });
    return weeklyCounts;
  };

  const groupIncidentsByMonth = (incidents) => {
    const monthlyCounts = {};
    incidents.forEach((incident) => {
      const incidentDate = new Date(incident.date);
      const monthKey = incidentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
    });
    return monthlyCounts;
  };

  const generateLabelsAndCounts = (counts, startDate, endDate, groupingFunc) => {
    const labels = [];
    const data = [];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const key = groupingFunc(currentDate);
      labels.push(key);
      data.push(counts[key] || 0); // Fill with 0 if no incidents

      // Move to the next grouping period
      if (timeframe === '1 Month') {
        currentDate.setDate(currentDate.getDate() + 1); // Increment by day
      } else if (timeframe === '6 Months') {
        currentDate.setDate(currentDate.getDate() + 7); // Increment by week
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1); // Increment by month
      }
    }

    return { labels, data };
  };

  useEffect(() => {
    const filteredIncidents = filterIncidents(timeframe);
    let counts = {};
    const endDate = new Date();

    if (timeframe === '1 Month') {
      const startDate = new Date(endDate);
      startDate.setMonth(endDate.getMonth() - 1);
      counts = groupIncidentsByDay(filteredIncidents);
      const { labels, data } = generateLabelsAndCounts(counts, startDate, endDate, (date) => date.toLocaleDateString('en-US'));
      setChartData({
        labels,
        datasets: [{
          label: 'Incident Count',
          data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
        }],
      });
    } else if (timeframe === '6 Months') {
      const startDate = new Date(endDate);
      startDate.setMonth(endDate.getMonth() - 6);
      counts = groupIncidentsByWeek(filteredIncidents);
      const { labels, data } = generateLabelsAndCounts(counts, startDate, endDate, (date) => {
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        return weekStart.toLocaleDateString('en-US');
      });
      setChartData({
        labels,
        datasets: [{
          label: 'Incident Count',
          data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
        }],
      });
    } else {
      const firstIncidentDate = new Date(Math.min(...incidents.map(incident => new Date(incident.date))));
      const startDate = timeframe === 'YTD' ? new Date(endDate.getFullYear(), 0, 1) : firstIncidentDate; // Start of the year or first incident
      counts = groupIncidentsByMonth(filteredIncidents); // Use the monthly count for both
      const { labels, data } = generateLabelsAndCounts(counts, startDate, endDate, (date) => date.toLocaleString('default', { month: 'long', year: 'numeric' }));
      setChartData({
        labels,
        datasets: [{
          label: 'Incident Count',
          data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
        }],
      });
    }
  }, [timeframe, incidents]);

  return (
    <div className='chart-container'>
      <h2>Incident Count Over Time</h2>
      <div>
        <label htmlFor="timeframe">Select Timeframe: </label>
        <select
          id="timeframe"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="1 Month">1 Month</option>
          <option value="6 Months">6 Months</option>
          <option value="YTD">YTD</option>
          <option value="All Time">All Time</option>
        </select>
      </div>
      <Line data={chartData} height={65} />
    </div>
  );
};

export default IncidentLineChart;
