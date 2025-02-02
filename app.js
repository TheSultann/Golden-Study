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
       const user = await User.findById(id);
       if (!user) {
           return res.status(404).json({ message: "User not found" });
       }

        // Обновляем историю, добавляем текущий результат в начало массива
        user.history.unshift({ percentage, date });

        // Ограничиваем длину истории до 3 последних результатов
        user.history = user.history.slice(0, 3);
        
        // Обновляем общий процент на основе последних трех работ
        let averagePercentage = user.history.reduce((sum, item) => sum + item.percentage, 0) / user.history.length;


        // Сохраняем обновленного пользователя
        user.percentage = averagePercentage;
        user.date = date; // сохраняем дату последнего обновления
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
       const weeklyAverages = users.map(user => {
           // Вычисляем средний процент только на основе последних 3 работ
           const lastThree = user.history.slice(0, 3);
           const average = lastThree.length > 0 ? lastThree.reduce((sum, item) => sum + item.percentage, 0) / lastThree.length : 0;


           return {
               userName: user.userName,
               average: average.toFixed(2),
               lastWorkDate: user.date
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