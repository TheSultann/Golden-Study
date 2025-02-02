const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    percentage: { type: Number, default: 0 }, // Средний процент последних работ
    date: { type: Date, default: Date.now },  // Дата последней работы
    history: [{
        percentage: { type: Number, required: true }, // Процент за работу
        date: { type: Date, default: Date.now }       // Дата сдачи работы
    }]
});

module.exports = mongoose.model('User', userSchema);