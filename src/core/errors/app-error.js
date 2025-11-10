const ERROR = {
    AMOUNT_AS_POSITIVE_INTEGER: {
        statusCode: "AM01",
        statusReason: "Amount must be a positive integer",
    },
    AMOUNT_AS_INTEGER: {
        statusCode: "AM01",
        statusReason: "Amount must be an integer",
    },

    CURRENCY_MISMATCH: {
        statusCode: "CU01",
        statusReason: "Account currency mismatch",
    },

    UNSUPPORTED_CURRENCY: {
        statusCode: "CU02",
        statusReason: "Unsupported currency: Only NGN, USD, GBP, and GHS are supported",
    },

    UNSUPPORTED_CURRENCY_IN_INSTRUCTION: {
        statusCode: "CU02",
        statusReason: "Unsupported currency: Instruction Currency should match accounts currency",
    },

    INSUFFICIENT_FUNDS: {
        statusCode: "AC01",
        statusReason: "Insufficient funds in debit account",
    },

    DEBIT_CREDIT_ACCOUNT_SAME: {
        statusCode: "AC02",
        statusReason: "Debit and credit accounts cannot be the same",
    },

    ACCOUNT_NOT_FOUND: {
        statusCode: "AC03",
        statusReason: "Account not found",
    },
    INVALID_ACCOUNT_EMPTY_OBJECTS: {
        statusCode: "AC04",
        statusReason: "Invalid account format: accounts cannot be empty and should be objects",
    },
    INVALID_ACCOUNT_STRUCTURE: {
        statusCode: "AC04",
        statusReason: "Invalid account format: id, balance and currency is required",
    },

    INVALID_ACCOUNT_ID_FORMAT: {
        statusCode: "AC04",
        statusReason: "Invalid account ID format",
    },
    INVALID_ACCOUNT_ID_FORMAT_SHOULD_INCLUDE: {
        statusCode: "AC04",
        statusReason: "Invalid account ID format: id should be a string that include letters, numbers and symbols at least 1 character long",
    },
    INVALID_ACCOUNT_ID_FORMAT_NOT_START_WITH_SYMBOL: {
        statusCode: "AC04",
        statusReason: "Invalid account ID format: id should not start with a symbol",
    },
    INVALID_ACCOUNT_ID_FORMAT_NOT_START_WITH_NUMBER: {
        statusCode: "AC04",
        statusReason: "Invalid account ID format: id should not start with a number",
    },
    INVALID_ACCOUNT_ID_FORMAT_ALLOWED_FORMAT: {
        statusCode: "AC04",
        statusReason: "Invalid account ID format: Invalid character. Only letters, numbers, and symbols (-, @, .) are allowed`",
    },

    INVALID_DATE_FORMAT: {
        statusCode: "DT01",
        statusReason: "Invalid date format: It should be YYYY-MM-DD",
    },

    MISSING_REQUIRED_KEYWORD: {
        statusCode: "SY01",
        statusReason: "Missing required keyword",
    },

    INVALID_KEYWORD_ORDER: {
        statusCode: "SY02",
        statusReason: "Invalid keyword order",
    },

    MALFORMED_INSTRUCTION_EMPTY_ACCOUNTS_ARRAY: {
        statusCode: "SY03",
        statusReason: "Malformed instruction: accounts should be an array of accounts",
    },

    MALFORMED_INSTRUCTION_ACCOUNTS_ARRAY_LENGTH: {
        statusCode: "SY03",
        statusReason: "Malformed instruction: accounts array should have at least two accounts",
    },
    MALFORMED_INSTRUCTION: {
        statusCode: "SY03",
        statusReason: "Malformed instruction: unable to parse instruction",
    },
    MALFORMED_INSTRUCTION_INSTRUCTION_MISSING: {
        statusCode: "SY03",
        statusReason: "Malformed instruction: unable to parse instruction",
    },
};

module.exports = ERROR;
