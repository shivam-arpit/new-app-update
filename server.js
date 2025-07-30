const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const dataRoutes = require("./routes/dataRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes"); // New

// Routes
app.use("/api/data", dataRoutes);
app.use("/api/dashboard", dashboardRoutes); // New dashboard endpoints

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
app.get('/api/dashboard/test', (req, res) => {
  res.json({ message: "This route works!" });
});