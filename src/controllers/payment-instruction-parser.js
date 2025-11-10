const paymentInstructionParserService = require("../services/payment-instruction-parser");

const paymentInstructionParserController = async (req, res) => {
    try {
        const {accounts, instruction} = req;
        const data = await paymentInstructionParserService(accounts, instruction);
        res.status(200).json(data);
        return null;
    } catch (error) {
        res.status(400).json(error)
    }
};


module.exports = paymentInstructionParserController;