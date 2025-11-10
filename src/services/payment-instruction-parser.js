/**
 * Custom modules
 */
const Accounts = require("../mock-models/account");
const ERROR = require("../core/errors/app-error");
const SUCCESS = require("../core/success/app-success");
const {checkDateTiming} = require("../utils/helper");

/**
 * @returns {Promise<{accounts: *, instruction: *}>}
 * @param accountId
 */

const result = {
    "type": null,
    "amount": null,
    "currency": null,
    "debit_account": null,
    "credit_account": null,
    "execute_by": null,
    "status": "failed",
    "status_reason": null,
    "status_code": null,
    "accounts": []
}

/**
 * Custom functions
 */
function checkIfAccountExists(accountId, accountsFromPayload) {
    const allAccounts = [...Accounts];
    const accountExists = allAccounts.find(account => account.id === accountId);

    if (accountExists) {
        let foundAccount = [];
        accountsFromPayload.forEach((account) => {
            if (account.id === accountId) {
                foundAccount.push(account);
            }
        });
        if (foundAccount.length > 0) {
            return foundAccount[0];
        }
    }
    return {
        errorId: accountId,
    }
}

function accountNotFoundError(instruction, accountIdThatDoesNotExist) {
    const type = instruction.type;
    const types = ["DEBIT", "CREDIT"].find(accType => type.toString().toUpperCase() === accType);
    result.status_code = ERROR.ACCOUNT_NOT_FOUND.statusCode;
    result.status_reason = `${ERROR.ACCOUNT_NOT_FOUND.statusReason} : ${accountIdThatDoesNotExist.errorId}`;
    throw result
}

function checkCurrency(currency, accounts) {
    const account = accounts.find(account => account.currency.toUpperCase() === currency);
    if (!account) return {errorId: currency}
    return currency;
}

/**
 *
 * @param accounts
 * @param instruction
 * @returns {Promise<{accounts: *, instruction: *, debitAccount: *, creditAccount: *}>}
 * Payment Instruction Parser Service
 */
const paymentInstructionParserService = async (accounts, instruction) => {
    const debitAccount = checkIfAccountExists(instruction.debit_account, accounts);
    const creditAccount = checkIfAccountExists(instruction.credit_account, accounts);
    
    const amount = instruction.amount;
 
  

    if (debitAccount.errorId) accountNotFoundError(instruction, debitAccount);
    if (creditAccount.errorId) accountNotFoundError(instruction, creditAccount);

    const isValidInstructionCurrency = checkCurrency(instruction.currency, accounts);

    if (isValidInstructionCurrency.errorId) {
        result.status_code = ERROR.UNSUPPORTED_CURRENCY_IN_INSTRUCTION.statusCode;
        result.status_reason = ERROR.UNSUPPORTED_CURRENCY_IN_INSTRUCTION.statusReason;
        result.accounts = accounts;
        throw result;
    }
    let timing = instruction.execute_by && checkDateTiming(instruction.execute_by);

    const debitAccountBalanceBefore = debitAccount.balance;
    const creditAccountBalanceBefore = creditAccount.balance;

    if (debitAccount.balance - amount <= 0) {
        result.type= null
        result.amount = null;
        result.accounts = [];
        result.status = "failed"
        result.status_code = ERROR.INSUFFICIENT_FUNDS.statusCode;
        result.status_reason = ERROR.INSUFFICIENT_FUNDS.statusReason;
        throw result;
        // throw {"p" : amount}
    }


    if (timing !== "future") {
        debitAccount.balance = debitAccount.balance - amount;
        creditAccount.balance = creditAccount.balance + amount;
    }

    debitAccount.balanceBefore = debitAccountBalanceBefore;
    creditAccount.balanceBefore = creditAccountBalanceBefore;


    result.type = instruction.type;
    result.amount = amount;
    result.currency = instruction.currency;
    result.debit_account = debitAccount.id;
    result.credit_account = creditAccount.id;
    result.execute_by = instruction.execute_by;
    result.status = timing === "future" ? "pending" : "successful";
    result.status_reason = timing === "future" ? SUCCESS.PENDING_FUTURE_EXECUTION.statusReason : SUCCESS.SUCCESSFUL_EXECUTION.statusReason
    result.status_code = timing === "future" ? SUCCESS.PENDING_FUTURE_EXECUTION.statusCode : SUCCESS.SUCCESSFUL_EXECUTION.statusCode
    instruction.type === "DEBIT" ? result.accounts = [
            {...debitAccount},
            {...creditAccount}
        ] :
        result.accounts = [
            {...creditAccount},
            {...debitAccount}
        ]


    return result
};

module.exports = paymentInstructionParserService;
