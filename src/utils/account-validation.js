/**
 * Node modules
 */
const {body} = require("express-validator");
/**
 * Custom modules
 */
const ERROR = require("../core/errors/app-error");


/**
 * Custom functions
 */
const {validateId, checkDuplicateIds, currencyMatch, isValidCurrency} = require("./helper");



const accountValidation = body("accounts").custom((value, {req}) => {
    let accounts = value;
    let accountIsAnArray = Array.isArray(accounts);
    if (!accountIsAnArray) {
        req.validationError = ERROR.MALFORMED_INSTRUCTION_EMPTY_ACCOUNTS_ARRAY
        return null;
    }
    if (accounts.length < 1) {
        req.validationError = ERROR.MALFORMED_INSTRUCTION_ACCOUNTS_ARRAY_LENGTH
        return null;
    }


    for (const eachAccount of accounts) {
        //check type of each account
        if (typeof (eachAccount) !== "object") {
            req.validationError = ERROR.INVALID_ACCOUNT_EMPTY_OBJECTS
            return null
        }

        if (!eachAccount?.id) {
            req.validationError = ERROR.INVALID_ACCOUNT_STRUCTURE
            return null
        }

        const id = eachAccount.id;
        const validatedID = validateId(id);


        if (validatedID.valid === false) {
            req.validationError = validatedID.error;
            return null;
        }

        const duplicateIDs = checkDuplicateIds(accounts);

        //returns error if there is a duplicate id
        if (duplicateIDs.hasDuplicates) {
            req.validationError = {
                statusCode: duplicateIDs.duplicates[0].statusCode,
                statusReason: duplicateIDs.duplicates[0].statusReason,
            }
            return null;
        }

        // Validating balance
        if (!eachAccount?.balance) {
            req.validationError = ERROR.INVALID_ACCOUNT_STRUCTURE
            return null
        }

        const balance = eachAccount.balance;

        if (typeof balance === "string" || balance !== parseInt(balance)) {
            req.validationError = ERROR.AMOUNT_AS_INTEGER
            return null;
        }
        if (balance < 0) {
            req.validationError = ERROR.AMOUNT_AS_POSITIVE_INTEGER
            return null;
        }

        //Validating currencies
        if (!eachAccount?.currency) {
            req.validationError = ERROR.INVALID_ACCOUNT_STRUCTURE
            return null
        }

        let isNotValidCurrency = isValidCurrency(accounts);

        if (isNotValidCurrency) {
            req.validationError = ERROR.UNSUPPORTED_CURRENCY
            return null;
        }

        const isMatch = currencyMatch(accounts);

        if (isMatch.currenciesMatch === false) {
            req.validationError = isMatch.message
            return null;
        }


    }
    req.accounts = accounts;
    return true

})


module.exports = accountValidation;

