// students.js
// Функция для добавления ученика
async function addStudent(name) {
    try {
        const response = await axios.post('http://localhost:8080/users', { userName: name });

        if (response.status !== 201) {
            throw new Error('Ошибка при добавлении ученика');
        }

        await updateTable();
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Функция для обновления таблицы
async function updateTable() {
    try {
        // Получаем данные с сервера с помощью axios
        const response = await axios.get('http://localhost:8080/api/users');

        // Проверяем статус ответа
        if (response.status !== 200) {
            throw new Error(`Ошибка при загрузке данных: ${response.status} ${response.statusText}`);
        }

        const users = response.data;

        // Очищаем таблицу
        const tableBody = document.getElementById('studentsTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';

        // Добавляем каждого ученика в таблицу
        users.forEach(user => {
            addStudentToTable(user.userName, user._id, user.percentage, user.date); // Передаём id, процент и дату
        });
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные. Проверьте консоль для подробностей.');
    }
}

// Функция для добавления строки в таблицу
function addStudentToTable(name, id, percentage = 0, date = null) {
    const table = document.getElementById('studentsTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.dataset.userId = id;

    // Ячейка с именем ученика
    const nameCell = newRow.insertCell(0);
    nameCell.textContent = name;

    // Ячейка для последней работы
    const lastWorkCell = newRow.insertCell(1);
    if (percentage > 0) { // Показываем дату только если есть процент успеваемости
        const formattedDate = date ? new Date(date).toLocaleDateString() : '';
        lastWorkCell.innerHTML = `
            <div class="last-work">${percentage.toFixed(2)}%</div>
            <div class="date">${formattedDate}</div>
        `;
    } else {
        lastWorkCell.textContent = '-'; // Если оценок нет, просто ставим прочерк
    }

    // Ячейки для ввода процентов
    const vocabCell = newRow.insertCell(2);
    vocabCell.innerHTML = '<input type="number" min="0" max="100" placeholder="%">';

    const topicCell = newRow.insertCell(3);
    topicCell.innerHTML = '<input type="number" min="0" max="100" placeholder="%">';

    const otherCell = newRow.insertCell(4);
    otherCell.innerHTML = '<input type="number" min="0" max="100" placeholder="%">';

    // Кнопка "Отправить"
    const submitCell = newRow.insertCell(5);
    submitCell.innerHTML = '<button onclick="calculateAverage(this)">Отправить</button>';
}

// Функция для расчета среднего процента
async function calculateAverage(button) {
    const row = button.parentElement.parentElement;
    const inputs = row.getElementsByTagName('input');
    const lastWorkCell = row.cells[1];
    const userId = row.dataset.userId;

    // Получаем значения из input
    const vocab = parseFloat(inputs[0].value) || 0;
    const topic = parseFloat(inputs[1].value) || 0;
    const other = parseFloat(inputs[2].value) || 0;

    // Рассчитываем средний процент
    const average = (vocab + topic + other) / 3;

    // Получаем текущую дату
    const currentDate = new Date().toISOString();

    try {
        // Отправляем данные на сервер
        const response = await axios.put(`http://localhost:8080/users/${userId}`, {
            percentage: average,
            date: currentDate
        });

        if (response.status === 200) {
            // Обновляем ячейку "Последняя работа"
            const formattedDate = new Date(currentDate).toLocaleDateString();
            lastWorkCell.innerHTML = `
                <div class="last-work">${average.toFixed(2)}%</div>
                <div class="date">${formattedDate}</div>
            `;
        } else {
            console.error("Ошибка при обновлении данных");
        }
    } catch (error) {
        console.error("Ошибка:", error);
    }
}

// Загружаем таблицу при загрузке страницы
document.addEventListener('DOMContentLoaded', updateTable);
