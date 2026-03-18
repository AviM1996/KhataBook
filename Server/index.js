const express = require('express');
const cors = require('cors');
const config = require("./apps/config/config");
const connectDB = require('./apps/config/db.config');
const router = require('./apps/routes')
const cookieParser = require("cookie-parser");

connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // 🔥 exact frontend URL
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api', router);

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = config.port || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
