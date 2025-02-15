const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const User = require('./user');

mongoose.connect('mongodb://localhost:27017/Students', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('Error connecting to MongoDB', err));

// Добавление нового ученика
app.post('/users', async (req, res) => {
    const { userName } = req.body;
    try {
        const newUser = new User({ userName });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        console.error('Error saving user', err);
        res.status(500).json({ message: err.message });
    }
});

// Обновление данных ученика (проценты и дата)
// Обновление данных ученика (проценты и дата)
app.put('/users/:id', async (req, res) => {
    const { percentage, date } = req.body;
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Добавляем новую запись в историю
        user.history.push({ percentage: percentage, date: date });

        // Обновляем percentage и date для отображения последней работы на главной странице
        user.percentage = percentage; // Сохраняем последний процент для главной страницы
        user.date = date;           // Сохраняем дату последней работы для главной страницы
        await user.save();

        res.status(200).json(user);
    } catch (err) {
        console.error('Error updating user', err);
        res.status(500).json({ message: err.message });
    }
});


// Получение всех учеников
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users', err);
        res.status(500).json({ message: err.message });
    }
});

// Получение статистики за неделю (исправлено)
app.get('/api/statistics', async (req, res) => {
    try {
        const users = await User.find({});

        // Собираем последние проценты всех учеников
        const lastPercentages = users.map(user => user.percentage || 0); // Берем последний процент каждого ученика

        // Считаем средний процент из всех последних работ
        const total = lastPercentages.reduce((sum, percentage) => sum + percentage, 0);
        const average = lastPercentages.length > 0 ? (total / lastPercentages.length).toFixed(2) : 0;

        // Возвращаем средний процент
        res.status(200).json({ average });
    } catch (err) {
        console.error('Error fetching statistics', err);
        res.status(500).json({ message: err.message });
    }
});

// Получение среднего процента из истории работ ученика
app.get('/api/users/:userId/average', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const history = user.history;
        if (history.length === 0) {
            return res.status(200).json({ averagePercentage: 0 }); // Если истории нет, средний 0
        }

        // Рассчитываем средний процент из истории
        const totalPercentage = history.reduce((sum, record) => sum + record.percentage, 0);
        const averagePercentage = totalPercentage / history.length;

        res.status(200).json({ averagePercentage: averagePercentage.toFixed(2) }); // Возвращаем средний процент, округленный до 2 знаков
    } catch (err) {
        console.error('Error fetching average percentage', err);
        res.status(500).json({ message: err.message });
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});