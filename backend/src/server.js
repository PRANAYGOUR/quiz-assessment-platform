const app = require('./app');
require('dotenv').config();
const pool = require('./config/db'); // Ensures DB attempts connection on start

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 API Health Check: http://localhost:${PORT}/api/health`);
});
