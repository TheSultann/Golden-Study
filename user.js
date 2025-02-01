
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    percentage: { type: Number, default: 0 }, // Средний процент
    date: { type: Date}   // Дата добавления
});

module.exports = mongoose.model('User', userSchema);