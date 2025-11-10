const { validationResult } = require("express-validator");

function errorValidator(req, res, next) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        const err = req.validationError;
        const unchangedAccounts = req.unchangedAccounts;



        return res.status(400).json({
            type: null,
            amount: null,
            currency: null,
            debit_account: null,
            credit_account: null,
            execute_by: null,
            status: "failed",
            ...err,
            accounts: [...unchangedAccounts],
        });
    }
    next();
}

module.exports = errorValidator;
