/**
 * Node Modules
 */
const express = require("express");
const dotenv = require("dotenv");
const paymentInstructionParserRoute = require("./routes/payment-instruction-parser");

//Load env files
dotenv.config();
/**
 * Express app
 */
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/**
 * Swagger
 */
const swaggerUI = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");


/**
 * Routes
 */
app.get("/", (req, res) => {
  res.send("<h1> The payment instruction parser server is up and running...</h1> <p>Click <a href='/docs'>here</a> for the documentation</p>")
})
app.use("/payment-instructions", paymentInstructionParserRoute);

/**
 * API Documentation
 */
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

const port = process.env.PORT || 5000;

app.listen(port, () =>
  console.log(`Payment instruction parser running on port: ${port}`)
);
