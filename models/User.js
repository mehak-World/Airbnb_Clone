const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String
    }
  
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.findOrCreate = async function (condition, doc) {
    const one = await this.findOne(condition);
    return one || this.create(doc);
};

const User = mongoose.model("User", userSchema);

module.exports = User;