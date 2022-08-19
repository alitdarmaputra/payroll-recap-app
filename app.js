const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const indexRouter = require("./routes/index.routes");

app.use("/api/v1", indexRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
