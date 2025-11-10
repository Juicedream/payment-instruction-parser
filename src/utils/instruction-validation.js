/**
 * Node modules
 */
const {body} = require('express-validator');

/**
 * Custom Modules
 */
const ERROR = require("../core/errors/app-error")
const {removeExtraSpaces, parseInstructionWithValidation} = require("./helper");

const instructionValidation = body("instruction").custom((value, {req}) => {
    const {accounts} = req;
    if(!accounts || !accounts.length){
        req.unchangedAccounts = [];
        return null;
    }

    accounts.forEach((account) => {
        account.currency = account.currency.toUpperCase();
        account.balanceBefore = account.balance
    })
    if (!value || typeof value !== "string" || value.trim().length < 1) {
        req.validationError = ERROR.MALFORMED_INSTRUCTION_INSTRUCTION_MISSING;
        req.unchangedAccounts = accounts;
        return null
    }

    // Clean and parse
    const instruction = removeExtraSpaces(value.trim());
    const parsed = parseInstructionWithValidation(instruction);

    // Check if parsing was successful
    if (!parsed.valid) {
        req.validationError = parsed.error;
        req.unchangedAccounts = accounts;
        return null
    }

    

    // Store parsed data in request for controller to use
    req.instruction = {
        type: parsed.type.toString().toUpperCase(),
        amount: parsed.amount,
        currency: parsed.currency.toString().toUpperCase(),
        debit_account: parsed.debit_account,
        credit_account: parsed.credit_account,
        execute_by: parsed.execute_by, // null if not provided
    };

    return true;
});


module.exports = instructionValidation;
