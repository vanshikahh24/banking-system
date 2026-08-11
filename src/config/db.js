const mongoose = require("mongoose");

function connectToDb() {
    mongoose.connect(process.env.file)
        .then(() => {
            console.log("Connected to DB");
        })
        .catch((err) => {
            console.log("Error connecting to DB:", err);
            process.exit(1);
        });
}

module.exports = connectToDb;