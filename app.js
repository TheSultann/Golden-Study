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
    app.put('/users/:id', async (req, res) => {
        const { percentage, date } = req.body;
        const { id } = req.params;
        try {
            const updatedUser = await User.findByIdAndUpdate(
                id,
                { percentage, date },
                { new: true }
            );
            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json(updatedUser);
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
            const statistics = {};

            users.forEach(user => {
                if (!statistics[user.userName]) {
                    statistics[user.userName] = { total: 0, count: 0 };
                }
                statistics[user.userName].total += user.percentage;
                statistics[user.userName].count += 1;
            });

            const weeklyAverages = Object.keys(statistics).map(userName => {
                return {
                    userName: userName,
                    average: (statistics[userName].total / statistics[userName].count).toFixed(2)
                };
            });

            res.status(200).json(weeklyAverages);
        } catch (err) {
            console.error('Error fetching statistics', err);
            res.status(500).json({ message: err.message });
        }
    });

    const PORT = 8080;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });