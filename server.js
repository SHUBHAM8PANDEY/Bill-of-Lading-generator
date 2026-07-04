const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const bolRoutes = require("./routes/bolRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static assets
app.use(express.static(path.join(__dirname, "public")));

// Body parsers (form submit)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use("/", bolRoutes);

app.listen(PORT, () => {
  console.log(`Bill of Lading app running on http://localhost:${PORT}`);
});
