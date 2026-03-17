const express = require('express');
const cors = require('cors');
const config = require("./apps/config/config");
const connectDB = require('./apps/config/db.config');
const router = require('./apps/routes')

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', router);

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = config.port || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
