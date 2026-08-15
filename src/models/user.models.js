const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "email is required"],
            trim: true,
            lowercase: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Please enter a valid email"
            ],
            unique: true
        },

        name: {
            type: String,
            required: [true, "name required"]
        },

        password: {
            type: String,
            required: [true, "password required"],
            minlength: [6, "password too short"],
            select: false
        },
        SystemUser: {
            type: Boolean, 
            default: false,
            immutable: true, 
            select: false
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const hash = await bcrypt.hash(this.password, 10);

    this.password = hash;
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;