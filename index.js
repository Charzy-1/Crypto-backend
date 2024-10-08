require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());

// Enable CORS for specific origins with multiple origin URLs
app.use(cors({
  origin: ['https://leos-exchange.com', 'https://leosexchange.com'], // Allow both domains
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // If you're using cookies or authorization headers
}));

// Handle preflight requests for all routes
app.options('*', cors());

// Log MongoDB URI to check if it's being loaded correctly
console.log("MongoDB URI:", process.env.MONGO_URI);

// MongoDB connection using environment variable
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Schema for storing the rates
const rateSchema = new mongoose.Schema({
  country: String,
  code: String,
  buy: String,
  sell: String,
  type: String
});

const Rate = mongoose.model("Rate", rateSchema);

// Endpoint to get rates
app.get("/api/rates", async (req, res) => {
  try {
    const rates = await Rate.find();
    res.json(rates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Endpoint to update rates
app.post("/api/rates/update", async (req, res) => {
  try {
    const { country, code, buy, sell, type } = req.body;
    const updatedRate = await Rate.findOneAndUpdate(
      { country, type },
      { buy, sell, code }, // Include 'code' in the update
      { new: true, upsert: true }
    );
    res.json(updatedRate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Endpoint to delete rates
app.delete("/api/rates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRate = await Rate.findByIdAndDelete(id);

    if (!deletedRate) {
      return res.status(404).json({ message: 'Rate not found' });
    }
    
    res.json({ message: 'Rate deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start the server on Render.com
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
