const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Extract KOL ID from the path
  const kolId = req.url.split('/').pop().toLowerCase();
  
  if (!kolId) {
    return res.status(400).json({ error: 'KOL ID is required' });
  }
  
  // Path to the history file for this KOL
  const filePath = path.join(__dirname, '..', 'kolsdata', `${kolId}_history.txt`);
  
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `No history data found for KOL: ${kolId}` });
  }
  
  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.trim().split('\n');
    
    // Parse each line into a data point
    const historyData = lines.map(line => {
      const parts = line.split(', ');
      return {
        date: parts[0],
        value: parseInt(parts[1], 10),
        views: parts.length > 2 ? parseInt(parts[2], 10) : null
      };
    });
    
    // Return the parsed data
    res.status(200).json(historyData);
  } catch (error) {
    console.error(`Error reading history data for ${kolId}:`, error);
    res.status(500).json({ error: 'Failed to read history data' });
  }
}; 