require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const urlModel = require("./urlModel");



const mongoURI = process.env.MONGO_URI;


mongoose.connect(mongoURI)
  .then(() => console.log(" Connected to MongoDB Atlas"))
  .catch((err) => console.error(" MongoDB connection error:", err));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.post("/shorten", async (req, res) => {

  

    const { longURL } = req.body;
    console.log("Received longURL:", longURL);

    const shortCode = Math.random().toString(36).substring(2, 7);
    const shortURL = `http://localhost:5000/${shortCode}`;
    console.log("Generated shortURL:", shortURL);

    

    try {


        const newURL = new urlModel({ longURL, shortURL:shortCode });
        console.log("Saving to MongoDB:", newURL);
        await newURL.save();

        console.log("Saved successfully:", newURL);
        res.json({ shortURL: `http://localhost:5000/${shortCode}` });
    } catch (err) {
        console.error("Error while saving:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

app.get("/:shortCode", async (req, res) => {
    const { shortCode } = req.params;

    try {
        const urlEntry = await urlModel.findOne({ shortURL: shortCode });

        if (urlEntry) {
            let finalURL = urlEntry.longURL;
            if (!/^https?:\/\//i.test(finalURL)) {
                finalURL = "https://" + finalURL;
            }
            return res.redirect(finalURL);
        } else {
            return res.status(404).send("URL not found");
        }
    } catch (err) {
        console.error("Error during redirection:", err);
        res.status(500).send("Server error");
    }
});



app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
