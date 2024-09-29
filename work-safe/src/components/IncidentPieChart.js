// PieChart.js
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Registering required components
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ incidents }) => {
  // Count incidents for each day of the week
  const countByDay = Array(7).fill(0); // Sunday to Saturday

  incidents.forEach((incident) => {
    const date = new Date(incident.date);
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    countByDay[day]++;
  });

  const data = {
    labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    datasets: [
      {
        label: 'Incident Count by Day',
        data: countByDay,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF5733',
        ],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="chart-container" style={{ width: '500px', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ textAlign: 'center' }}>Incident Count by Day of the Week</h2>
      <div style={{ width: '100%', height: '100%' }}>
        <Pie 
          data={data} 
          options={{
            responsive: true,
            maintainAspectRatio: false, // Disable aspect ratio
          }} 
        />
      </div>
    </div>
  );
};

export default PieChart;
