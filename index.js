const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());

// Enable CORS for specific origins (in this case, for localhost:5173)
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests only from this origin
  methods: ['GET', 'POST'], // Define the allowed methods
}));

// Replace <password> with your actual password, URL-encoded (e.g., @ -> %40)
mongoose.connect("mongodb+srv://Charzy123:Password%40123@charzy.xosj8.mongodb.net/myDatabase?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Schema for storing the rates
const rateSchema = new mongoose.Schema({
  country: String,
  code: String,
  buy: String,
  sell: String,
  type: String // 'btc' or 'usdt'
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
      { buy, sell },
      { new: true, upsert: true } // Create the document if it doesn't exist
    );
    res.json(updatedRate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start the server on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
