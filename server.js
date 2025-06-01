const express = require('express');
const app = express();
const PORT = 9000;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Import calculation logic and database functions
const { calculateUtilization } = require('./logic');
const { 
  saveCalculation, 
  getCalculationHistory, 
  getUtilizationTrends, 
  getDestinationStats, 
  getTruckTypeStats 
} = require('./database');

// Middleware to parse JSON and serve frontend files
app.use(express.json());                    // Parse incoming JSON
app.use(express.static('.'));               // Serve files from root directory
app.use(express.static('public'));          // Serve HTML/CSS/JS from public/

// API endpoint to calculate truck usage and save to database
app.post('/api/calculate', (req, res) => {
  try {
    const results = calculateUtilization(req.body);
    
    // Extract truck information for database storage
    const truckCapacity = {
      small: { volume: 15, weight: 3000 },
      medium: { volume: 30, weight: 7000 },
      large: { volume: 45, weight: 12000 },
    };
    
    let truckInfo;
    if (req.body.truckType === 'custom') {
      truckInfo = {
        truckType: 'custom',
        truckVolume: req.body.customVolume,
        truckWeight: req.body.customWeight
      };
    } else {
      const capacity = truckCapacity[req.body.truckType];
      truckInfo = {
        truckType: req.body.truckType,
        truckVolume: capacity.volume,
        truckWeight: capacity.weight
      };
    }
    
    // Save calculation to database
    saveCalculation(truckInfo, results, req.body.skus, (err, calculationId) => {
      if (err) {
        console.error("❌ Error saving calculation:", err.message);
        // Still return results even if saving fails
        return res.json(results);
      }
      
      console.log(`✅ Calculation saved with ID: ${calculationId}`);
      res.json(results);
    });
    
  } catch (error) {
    console.error("❌ Error during calculation:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get calculation history
app.get('/api/history', (req, res) => {
  getCalculationHistory((err, rows) => {
    if (err) {
      console.error("❌ Error fetching history:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API endpoint to get utilization trends
app.get('/api/trends', (req, res) => {
  getUtilizationTrends((err, rows) => {
    if (err) {
      console.error("❌ Error fetching trends:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API endpoint to get destination statistics
app.get('/api/destination-stats', (req, res) => {
  getDestinationStats((err, rows) => {
    if (err) {
      console.error("❌ Error fetching destination stats:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API endpoint to get truck type usage statistics
app.get('/api/truck-stats', (req, res) => {
  getTruckTypeStats((err, rows) => {
    if (err) {
      console.error("❌ Error fetching truck stats:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Start server on port 5000 to be externally accessible
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚚 Server is running at http://0.0.0.0:${PORT}`);
});
