const mongoose = require("mongoose");

const LedgerSchema = new mongoose.Schema({
account:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required:[true, "ledger must be associated with an account"],
    index: true,
    immmutable: true
},
amount:{
    type:number,
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
    type: string,
    enum:{
        values:["CREDIT", "DEBIT"],
        message: "ledger type can either be CREDIT or DEBIT"
    },
    required: [true, "ledger must have a type"],
immutable: true
}
})
function preventLedgerModification(){
    throw new error("ledger cannout be modified or deleted");
}
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("findOneAndRemove", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);
const ledgerModel = mongoose.model("ledger", ledgerSchema);
module.exports = ledgerModel;