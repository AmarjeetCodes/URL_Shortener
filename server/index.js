// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
// const urlModel = require("./urlModel");
// const axios = require('axios');

// const mongoURI = process.env.MONGO_URI;
// //
// // code to check whther the url is reahcable or not

// async function isURLReachable( url){
//     try{
//         const response = await axios.get(url, {
//             timeout: 5000,
//             maxRedirects: 5,
//             headers: {
//                 "User-Agent":
//                     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
//                     "(KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
//                 "Accept": "text/html,application/xhtml+xml",
//             },
//             validateStatus: function (status) {
//                 return status >= 200 && status < 400;
//             }
//         });
//             return true;
        
//     }
//     catch(err){
//         return false;
//     }
// }


// mongoose.connect(mongoURI)
//   .then(() => console.log("Connected to MongoDB Atlas"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// const app = express();
// const PORT = process.env.PORT || 5000;

// // app.use(cors({
// //     origin: 'https://url-shortener-frontend-6vq0.onrender.com',
// //     credentials: true
// // }));
// // cors change
// app.use(cors());

// app.use(bodyParser.json());

// app.post("/shorten", async (req, res) => {
//     let { longURL } = req.body;
//     console.log("Received longURL:", longURL);

//     //adding httpp to go to check
     
//      if (!/^https?:\/\//i.test(longURL)) {
//         longURL = "https://" + longURL;
//     }

//     try {
//         const existing = await urlModel.findOne({ longURL });

//         if (existing) {
//             console.log("Already exists. Returning existing short code.");
//             return res.json({ shortCode: existing.shortURL });
//         }

//         const isReachable = await isURLReachable(longURL);
//         if (!isReachable) {
//             console.log("URL is not reachable.");
//             return res.status(400).json({ error: "Provided URL is not reachable." });
//         }

//         const shortCode = Math.random().toString(36).substring(2, 7);
//         console.log("Generated shortCode:", shortCode);

//         const newURL = new urlModel({ longURL, shortURL: shortCode });
//         console.log("Saving to MongoDB:", newURL);
//         await newURL.save();

//         console.log("Saved successfully:", newURL);
//         return res.json({ shortCode }); // Only sending shortCode
//     } catch (err) {
//         console.error("Error while saving:", err);
//         res.status(500).json({ error: "Internal Server Error", details: err.message });
//     }
// });


// app.get("/:shortCode", async (req, res) => {
//     const { shortCode } = req.params;

//     try {
//         const urlEntry = await urlModel.findOne({ shortURL: shortCode });

//         if (urlEntry) {
//             let finalURL = urlEntry.longURL;
//             if (!/^https?:\/\//i.test(finalURL)) {
//                 finalURL = "https://" + finalURL;
//             }
//             return res.redirect(finalURL);
//         } else {
//             return res.status(404).send("URL not found");
//         }
//     } catch (err) {
//         console.error("Error during redirection:", err);
//         res.status(500).send("Server error");
//     }
// });

// app.listen(PORT, () => {
//     // production change
//     // console.log(`Server running at ${process.env.BASE_URL}`);
//     console.log(`Server running at http://localhost:${PORT}`);
// });



// trying things

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const urlModel = require("./urlModel");
const axios = require("axios");

const mongoURI = process.env.MONGO_URI;
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
 app.use(cors({
      origin: 'https://url-shortener-frontend-6vq0.onrender.com',
      credentials: true
  }));
app.use(bodyParser.json());

// Helper: Check if URL is reachable, fallback to HEAD if GET fails
async function isURLReachable(url) {
  try {
    await axios.get(url, {
      timeout: 5000,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
      validateStatus: status => status >= 200 && status < 500,
    });
    return true;
  } catch (getErr) {
    console.warn(`GET request failed, trying HEAD: ${getErr.message}`);
    try {
      await axios.head(url, {
        timeout: 5000,
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        validateStatus: status => status >= 200 && status < 400,
      });
      return true;
    } catch (headErr) {
      console.error("HEAD request also failed:", headErr.message);
      return false;
    }
  }
}

// Route: Shorten a URL
app.post("/shorten", async (req, res) => {
  let { longURL } = req.body;
  const forceBypass = req.query.force === "true"; // Bonus feature #2
  console.log("Received longURL:", longURL);

  if (!/^https?:\/\//i.test(longURL)) {
    longURL = "https://" + longURL;
  }

  try {
    // Check if already exists
    const existing = await urlModel.findOne({ longURL });
    if (existing) {
      return res.json({ shortCode: existing.shortURL });
    }

    // Reachability check unless force bypass
    if (!forceBypass) {
      const isReachable = await isURLReachable(longURL);
      if (!isReachable) {
        return res.status(400).json({ error: "Provided URL is not reachable." });
      }
    } else {
      console.log("Bypassing reachability check via ?force=true");
    }

    // Generate unique short code
    let shortCode;
    let isUnique = false;
    while (!isUnique) {
      shortCode = Math.random().toString(36).substring(2, 7);
      const existingCode = await urlModel.findOne({ shortURL: shortCode });
      isUnique = !existingCode;
    }

    // Save to DB
    const newURL = new urlModel({ longURL, shortURL: shortCode });
    await newURL.save();

    return res.json({ shortCode });
  } catch (err) {
    console.error("Error while shortening URL:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Route: Redirect from short code
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
    console.error("Redirection error:", err);
    return res.status(500).send("Server error");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
