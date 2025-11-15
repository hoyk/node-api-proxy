const url = require("url");
const express = require("express");
const cors = require("cors");
const request = require("request");
const rateLimit = require("express-rate-limit");

const PORT = process.env.PORT || 5000;
const app = express();

// Rate Limiting
// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1min
//   max: 30,
// });
// app.use(limiter);

app.set("trust proxy", 1);

// Add bodyParser (express.json())
// app.use(express.json({ limit: "500kb" }));

// Enable cors
app.use(cors());

app.all("*", (req, res, next) => {
  if (req.method === "OPTIONS") {
    // CORS preflight
    res.send();
  } else {
    let targetURL = req.header("Target-Endpoint");
    if (!targetURL) {
      res
        .status(500)
        .json({ error: "There is no Target-Endpoint header in the request" });
      return;
    }

    request(
      {
        url: targetURL + url.parse(req.url, true).path,
        method: req.method,
        json: req.body,
        headers: {
          Authorization: req.header("Authorization"),
        },
      },
      (error, response, body) => {
        if (error) {
          console.error("error: " + response.statusCode);
        }
      }
    ).pipe(res);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
