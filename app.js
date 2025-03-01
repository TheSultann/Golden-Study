const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname));

const User = require('./user');

mongoose.connect('mongodb://localhost:27017/Students', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('Error connecting to MongoDB', err));

// Middleware для проверки роли
app.use((req, res, next) => {
    const role = req.headers['x-role'] || 'guest';
    req.userRole = role;
    next();
});

// Маршруты для учителя и ученика
app.get('/teacher', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/students', (req, res) => {
    res.sendFile(path.join(__dirname, 'students', 'students.html'));
});

// Добавление нового ученика
app.post('/users', async (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
    }

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

// Обновление данных ученика
app.put('/users/:id', async (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
    }

    const { percentage, date, dictionary, topic, other } = req.body;
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.history.push({ percentage, date });
        user.percentage = percentage;
        user.date = date;
        user.dictionary = dictionary;
        user.topic = topic;
        user.other = other;
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

// Получение статистики за неделю
app.get('/api/statistics', async (req, res) => {
    try {
        const users = await User.find({});
        const lastPercentages = users.map(user => user.percentage || 0);
        const total = lastPercentages.reduce((sum, percentage) => sum + percentage, 0);
        const average = lastPercentages.length > 0 ? (total / lastPercentages.length).toFixed(2) : 0;
        res.status(200).json({ average });
    } catch (err) {
        console.error('Error fetching statistics', err);
        res.status(500).json({ message: err.message });
    }
});

// Получение среднего процента из истории
app.get('/api/users/:userId/average', async (req, res) => {
    const { userId } = req.params;
    const N = 3;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const history = user.history || [];
        const lastNWorks = history.slice(-N);
        const totalPercentage = lastNWorks.reduce((sum, record) => sum + record.percentage, 0);
        const averagePercentage = lastNWorks.length > 0 ? totalPercentage / lastNWorks.length : 0;

        res.status(200).json({ averagePercentage: averagePercentage.toFixed(2) });
    } catch (err) {
        console.error('Error fetching average percentage', err);
        res.status(500).json({ message: err.message });
    }
});

// Получение количества работ ученика
app.get('/api/users/:userId/workCount', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const workCount = user.history ? user.history.length : 0;
        res.status(200).json({ workCount });
    } catch (err) {
        console.error('Error fetching work count', err);
        res.status(500).json({ message: err.message });
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});