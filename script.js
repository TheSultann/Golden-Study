// script.js
    // Функция для добавления ученика
    document.getElementById('addUserBtn').addEventListener('click', async (e) => {
        e.preventDefault();

        const userName = document.getElementById('userName').value;

        if (!userName) {
            alert('Пожалуйста, введите имя ученика');
            return;
        }

        try {
            const response = await axios.post('/users', { userName });

            if (response.status === 201) {
               console.log('User created', response.data);
            //    alert('User successfully created!');
               document.getElementById('userName').value = '';
               
           } else {
                alert('Ошибка при создании пользователя');
                console.error('Error:', response.status, response.data);
            }
        } catch (error) {
            console.error('Error:', error.message, error.response);
            alert('Error creating user');
        }
    });

    // Функция для загрузки и отображения статистики
    

    // Загружаем статистику при загрузке страницы
    document.addEventListener('DOMContentLoaded', () => {
       loadStatistics();
    });