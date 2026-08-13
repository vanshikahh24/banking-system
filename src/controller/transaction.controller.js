const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
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
}