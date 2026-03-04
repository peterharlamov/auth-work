const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.status(200).send("OK: service is running ✅");
});

app.get("/paid", (req, res) => {
  res.status(200).send({
    message: "Payment redirect works ✅",
    query: req.query,
    time: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});