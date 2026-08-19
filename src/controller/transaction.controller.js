const accountModel = require("../models/account.model");
const emailService = require("../services/email.services");
const ledgerModel = require("../models/ledger.model");
const transactionModel = require("../models/transaction.model");
const userModel = require("../models/user.models");
const mongoose = require("mongoose");

/**
validating request
*/
async function createTransaction(req, res) {

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotencyKey are required fields"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(404).json({
            message: "fromAccount or toAccount not found"
        })
    }

    /**
     * validating idempotency key for transaction
     */
    const existingTransaction = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (existingTransaction) {

        if (existingTransaction.status === "COMPLETED") {
            return res.status(409).json({
                message: "transaction with this idempotency key has already been completed"
            })
        }

        if (existingTransaction.status === "PENDING") {
            return res.status(409).json({
                message: "transaction with this idempotency key is still pending"
            })
        }

        if (existingTransaction.status === "FAILED") {
            return res.status(409).json({
                message: "transaction with this idempotency key has already failed"
            })
        }

        if (existingTransaction.status === "REVERSED") {
            return res.status(409).json({
                message: "transaction with this idempotency key has already been reversed"
            })
        }
    }

    /**
     * validating account status for transaction
     */
    if (fromUserAccount.status !== "active" || toUserAccount.status !== "active") {
        return res.status(400).json({
            message: "fromAccount or toAccount is not active"
        })
    }

    /**
     * derive sender balance from ledger
     */
    const balance = await fromUserAccount.GetBalance();

    if (balance < amount) {
        return res.status(400).json({
            message: "insufficient balance in fromUserAccount"
        })
    }

    /**
     * create transaction(PENDING)
     */
    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        const [transaction] = await transactionModel.create(
            [
                {
                    fromAccount,
                    toAccount,
                    amount,
                    idempotencyKey,
                    status: "PENDING"
                }
            ],
            { session }
        );

        const debitLedgerEntry = await ledgerModel.create([
            {
                account: fromAccount,
                type: "DEBIT",
                amount: amount,
                transaction: transaction._id
            }
        ], { session })

        const creditLedgerEntry = await ledgerModel.create([
            {
                account: toAccount,
                type: "CREDIT",
                amount: amount,
                transaction: transaction._id
            }
        ], { session })

        transaction.status = "COMPLETED";

        await transaction.save({ session });

        await session.commitTransaction();

        session.endSession();

        /**
         * send email notification to users
         */
        await emailService.sendTransactionEmail(
            req.user.email,
            req.user.name,
            toAccount,
            amount,
            "DEBIT"
        );

        return res.status(201).json({
            message: "transaction completed successfully",
            transaction
        })

    } catch (err) {

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        session.endSession();

        return res.status(500).json({
            message: "transaction failed",
            error: err.message
        })
    }
}


async function createInitialFundsTransaction(req, res) {

    const { toAccount, amount, idempotencyKey } = req.body;

    // Validate request
    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required fields"
        });
    }

    // Find receiver account
    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    });

    if (!toUserAccount) {
        return res.status(404).json({
            message: "toAccount not found"
        });
    }

    // Check idempotency key
    const existingTransaction = await transactionModel.findOne({
        idempotencyKey
    });

    if (existingTransaction) {
        return res.status(409).json({
            message: "transaction with this idempotency key already exists"
        });
    }

    // Find System User
    const systemUser = await userModel
        .findOne({ SystemUser: true })
        .select("+SystemUser");

    if (!systemUser) {
        return res.status(404).json({
            message: "system user not found"
        });
    }

    // Find System User's account
    const fromUserAccount = await accountModel.findOne({
        user: systemUser._id
    });

    if (!fromUserAccount) {
        return res.status(404).json({
            message: "system user account not found"
        });
    }

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        // Create transaction
        const [transaction] = await transactionModel.create([
            {
                fromAccount: fromUserAccount._id,
                toAccount,
                amount,
                idempotencyKey,
                status: "PENDING"
            }
        ], { session });

        // Add money to receiver's ledger
        await ledgerModel.create([
            {
                account: toAccount,
                type: "CREDIT",
                amount: amount,
                transaction: transaction._id
            }
        ], { session });

        // Mark transaction completed
        transaction.status = "COMPLETED";

        await transaction.save({ session });

        await session.commitTransaction();

        session.endSession();

        return res.status(201).json({
            message: "initial funds added successfully",
            transaction
        });

    } catch (err) {

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        session.endSession();

        return res.status(500).json({
            message: "initial funds transaction failed",
            error: err.message
        });
    }
}


module.exports = {
    createTransaction,
    createInitialFundsTransaction
}