const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Extract KOL ID from URL (using Vercel's dynamic route handling)
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'KOL ID is required' });
  }
  
  const kolId = id.toLowerCase();
  
  // Path to the history file for this KOL
  const filePath = path.join(__dirname, '../..', 'kolsdata', `${kolId}_history.txt`);
  
  console.log('Attempting to read history file:', filePath);
  
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return res.status(404).json({ error: `No history data found for KOL: ${kolId}` });
  }
  
  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.trim().split('\n');
    
    console.log(`Successfully read ${lines.length} lines from ${kolId}_history.txt`);
    
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