// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./truckdata.db');

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS calculations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      truck_type TEXT,
      truck_volume REAL,
      truck_weight REAL,
      total_destinations INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS calculation_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      calculation_id INTEGER,
      destination TEXT,
      trucks_required INTEGER,
      volume_util REAL,
      weight_util REAL,
      under_utilized BOOLEAN,
      FOREIGN KEY (calculation_id) REFERENCES calculations(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS skus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      calculation_id INTEGER,
      name TEXT,
      qty INTEGER,
      volume REAL,
      weight REAL,
      destination TEXT,
      FOREIGN KEY (calculation_id) REFERENCES calculations(id)
    )
  `);
});

// Function to save a calculation with its results and SKUs
function saveCalculation(calculationData, results, skus, callback) {
  const { truckType, truckVolume, truckWeight } = calculationData;
  
  db.run(
    `INSERT INTO calculations (truck_type, truck_volume, truck_weight, total_destinations) 
     VALUES (?, ?, ?, ?)`,
    [truckType, truckVolume, truckWeight, results.length],
    function(err) {
      if (err) {
        return callback(err);
      }
      
      const calculationId = this.lastID;
      
      // Save results
      const resultStmt = db.prepare(`
        INSERT INTO calculation_results (calculation_id, destination, trucks_required, volume_util, weight_util, under_utilized)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      results.forEach(result => {
        resultStmt.run([
          calculationId,
          result.destination,
          result.trucksRequired,
          parseFloat(result.volumeUtil),
          parseFloat(result.weightUtil),
          result.underUtilized
        ]);
      });
      resultStmt.finalize();
      
      // Save SKUs
      const skuStmt = db.prepare(`
        INSERT INTO skus (calculation_id, name, qty, volume, weight, destination)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      skus.forEach(sku => {
        skuStmt.run([
          calculationId,
          sku.name,
          sku.qty,
          sku.volume,
          sku.weight,
          sku.destination
        ]);
      });
      skuStmt.finalize();
      
      callback(null, calculationId);
    }
  );
}

// Function to get calculation history
function getCalculationHistory(callback) {
  db.all(`
    SELECT c.*, 
           COUNT(cr.id) as total_results,
           AVG(cr.volume_util) as avg_volume_util,
           AVG(cr.weight_util) as avg_weight_util
    FROM calculations c
    LEFT JOIN calculation_results cr ON c.id = cr.calculation_id
    GROUP BY c.id
    ORDER BY c.timestamp DESC
    LIMIT 50
  `, callback);
}

// Function to get utilization trends over time
function getUtilizationTrends(callback) {
  db.all(`
    SELECT 
      DATE(c.timestamp) as date,
      AVG(cr.volume_util) as avg_volume_util,
      AVG(cr.weight_util) as avg_weight_util,
      COUNT(c.id) as calculation_count
    FROM calculations c
    JOIN calculation_results cr ON c.id = cr.calculation_id
    WHERE c.timestamp >= datetime('now', '-30 days')
    GROUP BY DATE(c.timestamp)
    ORDER BY date DESC
  `, callback);
}

// Function to get destination utilization statistics
function getDestinationStats(callback) {
  db.all(`
    SELECT 
      cr.destination,
      COUNT(*) as calculation_count,
      AVG(cr.volume_util) as avg_volume_util,
      AVG(cr.weight_util) as avg_weight_util,
      AVG(cr.trucks_required) as avg_trucks_required
    FROM calculation_results cr
    JOIN calculations c ON cr.calculation_id = c.id
    WHERE c.timestamp >= datetime('now', '-30 days')
    GROUP BY cr.destination
    ORDER BY calculation_count DESC
  `, callback);
}

// Function to get truck type usage statistics
function getTruckTypeStats(callback) {
  db.all(`
    SELECT 
      truck_type,
      COUNT(*) as usage_count,
      AVG(truck_volume) as avg_volume,
      AVG(truck_weight) as avg_weight
    FROM calculations
    WHERE timestamp >= datetime('now', '-30 days')
    GROUP BY truck_type
    ORDER BY usage_count DESC
  `, callback);
}

module.exports = {
  db,
  saveCalculation,
  getCalculationHistory,
  getUtilizationTrends,
  getDestinationStats,
  getTruckTypeStats
};
