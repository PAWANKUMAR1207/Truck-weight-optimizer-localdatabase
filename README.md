# Truck Utilization Calculator

A web-based truck utilization calculator with SQLite database storage for tracking and analyzing fleet performance metrics.

## Features

- **Calculator**: Enter SKU details (name, quantity, volume, weight, destination) and calculate truck utilization
- **Analytics Dashboard**: View charts showing utilization trends and destination statistics
- **History Tracking**: See all past calculations stored in the local SQLite database
- **Data Visualization**: Interactive charts using Chart.js
- **CSV Export**: Download calculation summaries for external analysis

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

## Installation

1. **Clone or download** this project to your laptop
2. **Open terminal/command prompt** and navigate to the project folder
3. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Application

### Method 1: Direct Node.js (Recommended)
1. **Start the server**:
   ```bash
   node server.js
   ```

2. **Open your web browser** and go to:
   ```
   http://localhost:9000
   ```

### Method 2: Using Python wrapper
1. **Start with Python**:
   ```bash
   python main.py
   ```

2. **Open your web browser** and go to:
   ```
   http://localhost:9000
   ```

The application runs entirely on port 9000 for both backend API and frontend interface.

## Project Structure

```
├── server.js          # Main Express server (port 9000)
├── database.js        # SQLite database functions
├── logic.js          # Truck utilization calculation logic
├── public/
│   └── index.html    # Frontend interface with tabs
├── truckdata.db      # SQLite database (created automatically)
├── package.json      # Node.js dependencies
└── README.md         # This file
```

## Usage

### Calculator Tab
1. Enter SKU information (name, quantity, volume in cubic meters, weight in kg)
2. Add destination for tracking
3. Select truck type or enter custom dimensions
4. Click "Calculate Utilization" to see results
5. Results are automatically saved to the database

### Analytics Tab
- View utilization trends over time
- See destination statistics and patterns
- Charts update automatically as you add more calculations

### History Tab
- Browse all past calculations
- Export data to CSV format
- Filter and search through historical records

## Database

The application uses SQLite for local data storage:
- **Database file**: `truckdata.db` (created automatically)
- **Location**: Same folder as the application
- **Tables**: Stores calculations, SKUs, and metadata
- **Backup**: Copy the `.db` file to backup your data

## Troubleshooting

**Server won't start**:
- Check if port 9000 is available
- Make sure Node.js is installed: `node --version`
- Verify dependencies are installed: `npm install`

**Database issues**:
- The SQLite database is created automatically
- If corrupted, delete `truckdata.db` and restart the server

**Browser connection**:
- Ensure you're using `http://localhost:9000` (not https)
- Try a different browser if pages don't load

## Development

To modify the application:
- **Frontend**: Edit `public/index.html`
- **Backend API**: Edit `server.js`
- **Calculations**: Edit `logic.js`
- **Database**: Edit `database.js`

Restart the server after making changes to see updates.