const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: [true, "Account must be associated with a user"],
            index: true
        },

        status: {
            type: String,
            enum: {
                values: ["active", "frozen", "closed"],
                message: "Account can either be active, frozen or closed"
            },
            default: "active"
        },

        currency: {
            type: String,
            required: [true, "Account must have currency"],
            default: "INR"
        }
    },
    {
        timestamps: true
    }
);

accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.GetBalance = async function () {

    const balanceData = await ledgerModel.aggregate([
        {/** match the account id */ 
            $match: {
                account: this._id
            }
        },
        {/**to group together to find total debit and credit */
            $group: {
                _id: null,

                TotalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "DEBIT"] },
                            "$amount",
                            0
                        ]
                    }
                },
                TotalCredit: {
                    $sum : {
                        $cond: [
                            { $eq: ["$type" , "CREDIT"]},
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project:{
                _id : 0,
                balance: { 
                    subtract: ["$TotalCredit", "$TotalDebit"]
                }
            }
        }
    ]);
if(balanceData.length === 0){
    return 0;
}
return balanceData[0].balance;
};

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;