const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");
/**
validating request 
 */
async function createTransaction(req,res){
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
    if(!fromAccount || !toAccount|| !amount || !idempotencyKey){
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
    if(!fromUserAccount || !toUserAccount){
        return res.status(404).json({
            message: "fromAccount or toAccount not found"
        })  
    }

/** 
 * validating idemopotency key for transaction
 */
const existingTransaction = await transactionModel.findOne({
    idempotencyKey: idempotencyKey
})
if(existingTransaction){
    if(existingTransaction.status ==="COMPLETED"){
        return res.status(409).json({
            message: "transaction with this idempotency key has already been completed"
        })
    }
    if(existingTransaction.status ==="PENDING"){
        return res.status(409).json({
            message: "transaction with this idempotency key is still pending"
        })
    }
    if(existingTransaction.status ==="FAILED"){
        return res.status(409).json({
            message: "transaction with this idempotency key has already failed"
        })
    }
    if(existingTransaction.status ==="REVERSED"){
        return res.status(409).json({
            message:"transaction with this idempotency key has already been reversed"
        })
    }
}
/**
 * validating account status for transaction
 */
if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
    return res.status(400).json({
        message: "fromAccount or toAccount is not active"
    })

}
}
/** derive sender balance from ledger */
if(balance < amount){
    return res.status(400).json({
        message: "insufficient balance in fromUserAccount"
    })
}
/**create transaction(PENDING) */
const session = await mongoose.startSession();
const transaction = await transactionModel.create({
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING"
}, { session})
const debitLedgerEntry = await ledgerModel.create({
    account: fromAccount,
    type: "DEBIT",
    amount: amount,
    transaction: transaction._id
},{session}
)
const creditLedgerEntry = await ledgerModel.create({
    account: toAccount,
    type: "CREDIT",
    amount: amount,
    transaction: transaction._id
},{session}
)
transaction.status = "COMPLETED";
await transaction.save({session});
await session.commitTransaction();
session.endSession();
/** send email notification to both users */
await emailService.sendEmail(req.user.email, req.user.name, toAccount, amount, "DEBIT");
return res.status(201).json({
    message: "transaction completed successfully",
    transaction 
})
            