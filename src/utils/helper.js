const ERROR = require("../core/errors/app-error");
const CURRENCIES = require("../mock-models/currency");

function validateId(id) {

    // Check if id is a string and not empty
    if (typeof id !== "string" || id.trim() === "") {
        return {valid: false, error: ERROR.INVALID_ACCOUNT_ID_FORMAT_SHOULD_INCLUDE};
    }
    id = id.toString().trim();
    // Check if length is at least 1
    if (id.length < 1) {
        return {valid: false, error: ERROR.INVALID_ACCOUNT_ID_FORMAT_SHOULD_INCLUDE};
    }

    // Define allowed symbols
    const allowedSymbols = ["-", "@", "."];

    // Get first character
    const firstChar = id[0];

    // Check if first character is a number
    if (!isNaN(Number(firstChar)) && firstChar !== " ") {
        return {valid: false, error: ERROR.INVALID_ACCOUNT_ID_FORMAT_NOT_START_WITH_NUMBER};
    }

    // Check if first character is a symbol
    if (allowedSymbols.includes(firstChar)) {
        return {valid: false, error: ERROR.INVALID_ACCOUNT_ID_FORMAT_NOT_START_WITH_SYMBOL};
    }

    // Check if first character is any other symbol (not letter, number, or allowed symbol)
    const isLetter = (firstChar >= 'a' && firstChar <= 'z') || (firstChar >= 'A' && firstChar <= 'Z');
    if (!isLetter) {
        return {valid: false, error: ERROR.INVALID_ACCOUNT_ID_FORMAT_SHOULD_INCLUDE};
    }

    // Check remaining characters
    for (let i = 1; i < id.length; i++) {
        const char = id[i];

        const isLetterChar = (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
        const isNumberChar = !isNaN(Number(char)) && char !== " ";
        const isAllowedSymbol = allowedSymbols.includes(char);

        // If character is not a letter, number, or allowed symbol, it's invalid
        if (!isLetterChar && !isNumberChar && !isAllowedSymbol) {
            return {valid: false, error: ERROR.INVALID_ACCOUNT_ID_FORMAT_ALLOWED_FORMAT};
        }
    }

    return {valid: true, error: null};
}

function checkDuplicateIds(accounts) {
    const seenIds = new Set();
    const duplicates = [];

    for (let i = 0; i < accounts.length; i++) {
        const acc = accounts[i];
        const id = acc.id;

        // Check if we've seen this ID before
        if (seenIds.has(id)) {
            duplicates.push({
                id: id,
                index: i,
                statusCode: "AC02",
                statusReason: `Debit and credit accounts cannot be the same: duplicate account ID '${id}'`
            });
        } else {
            seenIds.add(id);
        }
    }

    return {
        hasDuplicates: duplicates.length > 0,
        duplicates: duplicates
    };
}

function currencyMatch(accounts) {
    const seenCurrency = new Set();
    const duplicates = [];

    if (accounts.length === 1) {
        duplicates.push({})
    }

    for (let i = 0; i < accounts.length; i++) {
        const acc = accounts[i];
        const currency = acc.currency.toString().toLowerCase();


        // Check if we've seen this ID before
        if (seenCurrency.has(currency)) {
            duplicates.push({
                currency: currency,
                index: i,
                message: ERROR.CURRENCY_MISMATCH
            });
        } else {
            seenCurrency.add(currency);
        }
    }

    return {
        currenciesMatch: duplicates.length > 0,
        currencies: duplicates,
        message: ERROR.CURRENCY_MISMATCH
    };
}

function isValidCurrency(accounts) {
    let isMatch;
    let valid = [];
    accounts.forEach((account) => {
        const currency = account.currency.toString().trim().toUpperCase();
        isMatch = CURRENCIES.includes(currency);
        if (isMatch === false) {
            valid.push(false);
        }
    });
    return valid.length > 0;
}

function removeExtraSpaces(str) {
    // Split by space
    let parts = str.split(" ");

    // Filter out empty strings
    let filtered = [];
    for (let i = 0; i < parts.length; i++) {
        if (parts[i] !== "") {
            filtered.push(parts[i]);
        }
    }

    // Join back with single space
    return filtered.join(" ");
}

function parseInstructionWithValidation(instruction) {
    const cleaned = removeExtraSpaces(instruction.trim());
    const parts = cleaned.split(" ");

    let result = {
        type: null,
        amount: null,
        currency: null,
        debit_account: null,
        credit_account: null,
        execute_by: null,
        valid: false,
        error: null
    };

    // Find keyword positions (case-insensitive)
    let typeIndex = -1;
    let fromIndex = -1;
    let forIndex = -1;
    let toIndex = -1;
    let onIndex = -1;
    let accountIndices = [];

    for (let i = 0; i < parts.length; i++) {
        const word = parts[i].toUpperCase();

        // FIXED: Only set type if it's at index 0 (first word)
        if ((word === "DEBIT" || word === "CREDIT") && i === 0) {
            typeIndex = i;
            result.type = word;
        }
        if (word === "FROM") fromIndex = i;
        if (word === "FOR") forIndex = i;
        if (word === "TO") toIndex = i;
        if (word === "ON") onIndex = i;
        if (word === "ACCOUNT") accountIndices.push(i);
    }

    // Validate type keyword
    if (typeIndex !== 0 || !result.type) {
        result.error = ERROR.MISSING_REQUIRED_KEYWORD;
        return result;
    }
    if (parts[7].toUpperCase() === parts[0].toUpperCase()) {
        ERROR.MALFORMED_INSTRUCTION.statusReason = "Malformed instruction: Duplicate keyword " +"[" + [parts[0], parts[7]] + "] . It should be DEBIT CREDIT / CREDIT DEBIT used in the instruction"
        result.error = ERROR.MALFORMED_INSTRUCTION;
        return result;
    }

    // Check minimum instruction length
    if (parts.length < 10) {
        result.error = ERROR.MALFORMED_INSTRUCTION;
        return result;
    }

    // Parse amount (index 1)
    if (typeIndex + 1 >= parts.length) {
        result.error = ERROR.AMOUNT_AS_POSITIVE_INTEGER;
        return result;
    }

    const amountStr = parts[typeIndex + 1];
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
        result.error = ERROR.AMOUNT_AS_POSITIVE_INTEGER;
        return result;
    }

    // Check if amount is an integer
    if (amount !== Math.floor(amount)) {
        result.error = ERROR.AMOUNT_AS_INTEGER;
        return result;
    }

    result.amount = amount;
    

    // Parse currency (index 2)
    if (typeIndex + 2 >= parts.length) {
        result.error = ERROR.UNSUPPORTED_CURRENCY;
        return result;
    }

    if (typeIndex + 2 && CURRENCIES.includes(parts[typeIndex + 2].toString().toUpperCase()) !== true) {
        result.error = ERROR.UNSUPPORTED_CURRENCY;
        return result;
    }
    result.currency = parts[typeIndex + 2];

    // Validate required keywords exist
    if (fromIndex === -1 && toIndex === -1) {
        result.error = ERROR.MISSING_REQUIRED_KEYWORD;
        return result;
    }

    if (forIndex === -1) {
        result.error = ERROR.MISSING_REQUIRED_KEYWORD;
        return result;
    }


    // Validate ACCOUNT keywords
    if (accountIndices.length !== 2) {
        result.error = ERROR.MISSING_REQUIRED_KEYWORD;
        return result;
    }

    // Validate keyword order
    if (result.type === "DEBIT") {
        if (fromIndex === -1 || fromIndex > forIndex) {
            result.error = ERROR.INVALID_KEYWORD_ORDER;
            return result;
        }
        if (toIndex === -1 || forIndex > toIndex) {
            result.error = ERROR.INVALID_KEYWORD_ORDER;
            return result;
        }
    } else if (result.type === "CREDIT") {
        if (toIndex === -1 || toIndex > forIndex) {
            result.error = ERROR.INVALID_KEYWORD_ORDER;
            return result;
        }
        if (fromIndex === -1 || forIndex > fromIndex) {
            result.error = ERROR.INVALID_KEYWORD_ORDER;
            return result;
        }
    }

    // Get account IDs
    const firstAccountId = parts[accountIndices[0] + 1];
    const secondAccountId = parts[accountIndices[1] + 1];

    if (!firstAccountId || !secondAccountId) {
        result.error = ERROR.INVALID_ACCOUNT_ID_FORMAT;
        return result;
    }

    // Assign accounts based on type
    if (result.type === "DEBIT") {
        result.debit_account = firstAccountId;
        result.credit_account = secondAccountId;
    } else {
        result.credit_account = firstAccountId;
        result.debit_account = secondAccountId;
    }

    // Check if debit and credit accounts are the same
    if (result.debit_account === result.credit_account) {
        result.error = ERROR.DEBIT_CREDIT_ACCOUNT_SAME;
        return result;
    }

    // Parse optional date (after ON keyword)
    if (onIndex !== -1) {
        if (onIndex + 1 >= parts.length) {
            result.error = ERROR.INVALID_DATE_FORMAT;
            return result;
        }

        const dateStr = parts[onIndex + 1];
        const dateValidation = validateDate(dateStr);

        if (!dateValidation.valid) {
            result.error = ERROR.INVALID_DATE_FORMAT;
            return result;
        }

        result.execute_by = dateStr;
    }

    result.valid = true;
    return result;
}

function validateDate(dateStr) {
    // Check basic format length
    if (dateStr.length !== 10) {
        return {valid: false};
    }

    // Check for dashes at correct positions
    if (dateStr[4] !== "-" || dateStr[7] !== "-") {
        return {valid: false};
    }

    // Extract parts
    const yearStr = dateStr.substring(0, 4);
    const monthStr = dateStr.substring(5, 7);
    const dayStr = dateStr.substring(8, 10);

    // Check if all parts are numbers
    for (let i = 0; i < yearStr.length; i++) {
        if (isNaN(Number(yearStr[i]))) {
            return {valid: false};
        }
    }

    for (let i = 0; i < monthStr.length; i++) {
        if (isNaN(Number(monthStr[i]))) {
            return {valid: false};
        }
    }

    for (let i = 0; i < dayStr.length; i++) {
        if (isNaN(Number(dayStr[i]))) {
            return {valid: false};
        }
    }

    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const day = parseInt(dayStr);

    // Validate ranges
    if (year < 1000 || year > 9999) {
        return {valid: false};
    }

    if (month < 1 || month > 12) {
        return {valid: false};
    }

    if (day < 1 || day > 31) {
        return {valid: false};
    }

    // Check days in month
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Check for leap year
    let isLeapYear = false;
    if (year % 4 === 0) {
        if (year % 100 === 0) {
            if (year % 400 === 0) {
                isLeapYear = true;
            }
        } else {
            isLeapYear = true;
        }
    }

    if (isLeapYear && month === 2) {
        daysInMonth[1] = 29;
    }

    if (day > daysInMonth[month - 1]) {
        return {valid: false};
    }

    return {valid: true};
}

function checkDateTiming(dateStr) {
    // Parse the date string (YYYY-MM-DD)
    const yearStr = dateStr.substring(0, 4);
    const monthStr = dateStr.substring(5, 7);
    const dayStr = dateStr.substring(8, 10);

    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1; // JavaScript months are 0-indexed
    const day = parseInt(dayStr);

    // Create date object for the given date (at midnight)
    const givenDate = new Date(year, month, day);

    // Get today's date (at midnight to compare only dates, not times)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Compare
    if (givenDate < today) {
        return "past";
    } else if (givenDate > today) {
        return "future";
    } else {
        return "present";
    }
}


module.exports = {
    validateId,
    checkDuplicateIds,
    currencyMatch,
    isValidCurrency,
    removeExtraSpaces,
    parseInstructionWithValidation,
    checkDateTiming,
}