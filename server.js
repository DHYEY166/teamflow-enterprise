
const express = require('express');
const path = require('path');

const app = express();
// Cloud Run provides the PORT environment variable.
// We must bind to 0.0.0.0 to be accessible.
const port = process.env.PORT || 8080;

// Serve all static files from the current directory
app.use(express.static(__dirname));

// For Single Page Application (SPA) support, 
// route all non-file requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`TeamFlow Enterprise is listening on port ${port}`);
  console.log(`Binding address: 0.0.0.0`);
});
