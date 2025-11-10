const swaggerAutogen = require("swagger-autogen");

const outputFile = "./swagger-output.json";

const endpointFiles = ["./index.js"]

try {
    swaggerAutogen(outputFile, endpointFiles);
    console.log("Swagger documentation generated")
} catch (error) {
    console.log(error)
}