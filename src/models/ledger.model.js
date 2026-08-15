const mongoose = require("mongoose");

const LedgerSchema = new mongoose.Schema({
account:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required:[true, "ledger must be associated with an account"],
    index: true,
    immutable: true
},
amount:{
    type: Number,
    required:[true, "ledger must have an amount"],
    min:[0,"ledger transaction cannot be negative"],
    immutable: true
},
transaction:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "transaction",
    required: [true, "ledger must be associated with a transaction"],
    index: true,
    immutable: true
},
type:{
    type: String,
    enum:{
        values:["CREDIT", "DEBIT"],
        message: "ledger type can either be CREDIT or DEBIT"
    },
    required: [true, "ledger must have a type"],
immutable: true
}
})
function preventLedgerModification(){
    throw new Error("ledger cannot be modified or deleted");
}
LedgerSchema.pre("updateOne", preventLedgerModification);
LedgerSchema.pre("deleteOne", preventLedgerModification);
LedgerSchema.pre("findOneAndUpdate", preventLedgerModification);
LedgerSchema.pre("findOneAndDelete", preventLedgerModification);
LedgerSchema.pre("updateMany", preventLedgerModification);
LedgerSchema.pre("deleteMany", preventLedgerModification);
LedgerSchema.pre("findOneAndRemove", preventLedgerModification);
LedgerSchema.pre("findOneAndReplace", preventLedgerModification);
const ledgerModel = mongoose.model("ledger", LedgerSchema);
module.exports = ledgerModel;