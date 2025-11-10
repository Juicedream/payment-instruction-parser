/**
 * Node modules
 */
const { Router } = require("express");
/**
 * Custom modules
 */
const paymentInstructionParserController = require("../controllers/payment-instruction-parser");
const errorValidator = require("../middlewares/error-validator");

const accountValidation = require("../utils/account-validation");
const instructionValidation = require("../utils/instruction-validation");

const router = Router();

router.post(
  "/",
  accountValidation,
  instructionValidation,
  errorValidator,
  paymentInstructionParserController
);

module.exports = router;
