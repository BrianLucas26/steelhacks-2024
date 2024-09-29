// src/components/IncidentBarChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'; // Import from chart.js instead

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const IncidentBarChart = ({ incidents }) => {
  // Prepare data for the chart
  const cameraIDCounts = {};

  incidents.forEach((incident) => {
    const cameraID = incident.cameraID;
    if (cameraIDCounts[cameraID]) {
      cameraIDCounts[cameraID] += 1;
    } else {
      cameraIDCounts[cameraID] = 1;
    }
  });

  const data = {
    labels: Object.keys(cameraIDCounts),
    datasets: [
      {
        label: 'Number of Incidents',
        data: Object.values(cameraIDCounts),
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Customize color
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="chart-container" style={{ width: '500px', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2>Incidents by Camera ID</h2>
      <Bar data={data} options={options} width={100} height={50} />
    </div>
  );
};

export default IncidentBarChart;
