const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://btl26:2lF930374Z7zzoL2@incidents.ivyx2.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

// Define the Incident schema
const incidentSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  timestamp: {
    type: String,
    default: Date.now
  },
  videoURL: {
    type: String,
    required: true
  },
  resolved: {
    type: Boolean,
    default: false
  },
});

// Create the Incident model from the schema
const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;

// Use CORS
app.use(cors());

// API to get all incidents
app.get('/api/all-incidents', async (req, res) => {
  try {
    // Fetch all incidents from the database
    const incidents = await Incident.find({}).sort({ timestamp: -1 }); // Optional: Sort by most recent incidents
    res.json({ incidents });
    console.log("HELLO")
  } catch (error) {
    console.error('Error fetching all incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// API to get the incidents that occurred this week
app.get('/api/incidents', async (req, res) => {
  try {
    // Get the current date and the start of the week (assuming the week starts on Sunday)
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday as the start of the week
    startOfWeek.setHours(0, 0, 0, 0); // Set time to midnight

    // Find incidents that occurred after the start of the week
    const incidents = await Incident.find({
      timestamp: { $gte: startOfWeek },
    }).sort({ timestamp: -1 }); // Optional: Sort incidents by newest first

    res.json({ incidents });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// API to get the incident count this week
app.get('/api/incident-count', async (req, res) => {
  try {
    // Get the current date and the start of the week (assuming week starts on Sunday)
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday as start of the week
    startOfWeek.setHours(0, 0, 0, 0); // Set time to midnight

    // Find incidents that occurred after the start of the week
    const count = await Incident.countDocuments({
      timestamp: { $gte: startOfWeek },
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching incident count:', error);
    res.status(500).json({ error: 'Failed to fetch incident count' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
