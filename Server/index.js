const express = require('express');
const cors = require('cors');
const config = require("./apps/shared/config");
const connectDB = require('./apps/config/db.config');
const router = require('./apps/routes')
const cookieParser = require("cookie-parser");
const responseMiddleware = require("./apps/libs/middleware/responseMiddleware");
const globalErrorHandler = require("./apps/libs/middleware/errorMiddleware");
const { connectProducer: connectApiProducer }=require("./apps/libs/kafka/service/api-service/kafka.producer")

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use(responseMiddleware);

app.use('/api', router);

app.get('/', (req, res) => {
  return res.success({
    message: "API is running"
  });
});

app.use((req, res) => {
  return res.notFound("Route not found");
});

app.use(globalErrorHandler);

const PORT = config.port || 5000;

(async () => {
  try {
    await connectApiProducer()
    await connectDB();
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ DB Connection Failed:", err.message);
    process.exit(1);
  }
})()
