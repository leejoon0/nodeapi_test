const express = require("express");
const app = express();
const port = 3000;

var cors = require("cors");

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/sound/:name", (req, res) => {
  const p = req.params;
  console.log(p);
  const q = req.query;
  console.log(q);

  res.send({ data: p });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
