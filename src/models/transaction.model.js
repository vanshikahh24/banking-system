const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    fromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "account",
        required: [true,"transaction associated with from account"],
        index : true
    },
    toAccount:{
         type: mongoose.Schema.Types.ObjectId,
        ref : "account",
        required: [true,"transaction associated with from account"],
        index : true
    },
    status:{
        type: String,
        enum:{
            values: ["FAILED","PENDING","COMPLETED","REVERSED"],
            message:"status can either be failed, pending, completed or reversed"
        },
        default : "PENDING"
    },
    account:{
        type: Number,
        required: [true, "amount is required for creating transactions"],
        min:[0, "transactions cannot be negative"]
    },
    itempotencyKey:{
        type: String,
        required:[true, "itempotency key is require for transactions"],
        index : true,
        unique : true
    },
},{
    timestamps : true 
}
)
const transactionModel = mongoose.model("transaction", transactionSchema);
module.exports = transactionModel;