// Функция для создания debouncing
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

let allStudents = [];
const role = localStorage.getItem('userRole') || 'guest';

async function updateTable() {
    try {
        const response = await axios.get('/api/users', {
            headers: { 'X-Role': role }
        });

        if (response.status !== 200) {
            throw new Error(`Ошибка при загрузке данных: ${response.status}`);
        }

        allStudents = response.data;
        const tableBody = document.querySelector('#studentsTable tbody');
        tableBody.innerHTML = '';

        allStudents.forEach(user => {
            addStudentToTable(user.userName, user._id, user.percentage, user.date, user.dictionary, user.topic, user.other);
        });
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные');
    }
}

function filterStudents(searchTerm) {
    const tableBody = document.querySelector('#studentsTable tbody');
    tableBody.innerHTML = '';

    const filteredStudents = allStudents.filter(student =>
        student.userName.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    filteredStudents.forEach(user => {
        addStudentToTable(user.userName, user._id, user.percentage, user.date, user.dictionary, user.topic, user.other);
    });
}

function addStudentToTable(name, id, percentage = 0, date = null, dictionary = 0, topic = 0, other = 0) {
    const tableBody = document.querySelector('#studentsTable tbody');
    const newRow = tableBody.insertRow();
    newRow.dataset.userId = id;

    if (role === 'admin') {
        newRow.innerHTML = `
            <td>${name}</td>
            <td>
                ${percentage > 0 ? `
                    <div class="last-work">${percentage.toFixed(2)}%</div>
                    <div class="date">${date ? new Date(date).toLocaleDateString() : '-'}</div>
                ` : '-'}
            </td>
            <td><input type="number" min="0" max="100" placeholder="%" value=""></td>
            <td><input type="number" min="0" max="100" placeholder="%" value=""></td>
            <td><input type="number" min="0" max="100" placeholder="%" value=""></td>
            <td><button class="send-button" onclick="calculateAverage(this)">Send</button></td>
        `;
    } else {
        newRow.innerHTML = `
            <td>${name}</td>
            <td>
                ${percentage > 0 ? `
                    <div class="last-work">${percentage.toFixed(2)}%</div>
                    <div class="date">${date ? new Date(date).toLocaleDateString() : '-'}</div>
                ` : '-'}
            </td>
            <td>${dictionary > 0 ? dictionary.toFixed(2) + '%' : '-'}</td>
            <td>${topic > 0 ? topic.toFixed(2) + '%' : '-'}</td>
            <td>${other > 0 ? other.toFixed(2) + '%' : '-'}</td>
            <td></td>
        `;
    }
}

async function calculateAverage(button) {
    const row = button.parentElement.parentElement;
    const inputs = row.getElementsByTagName('input');
    const lastWorkCell = row.cells[1];
    const userId = row.dataset.userId;

    const vocab = parseFloat(inputs[0].value) || 0;
    const topic = parseFloat(inputs[1].value) || 0;
    const other = parseFloat(inputs[2].value) || 0;
    const average = (vocab + topic + other) / 3;
    const currentDate = new Date().toLocaleDateString();

    try {
        const response = await axios.put(`/users/${userId}`, {
            percentage: average,
            date: new Date().toISOString(),
            dictionary: vocab,
            topic: topic,
            other: other
        }, {
            headers: { 'X-Role': role }
        });

        if (response.status === 200) {
            lastWorkCell.innerHTML = `
                <div class="last-work">${average.toFixed(2)}%</div>
                <div class="date">${currentDate}</div>
            `;
            inputs[0].value = '';
            inputs[1].value = '';
            inputs[2].value = '';
        } else {
            throw new Error('Ошибка при обновлении данных');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось обновить данные');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const debouncedFilter = debounce(searchTerm => filterStudents(searchTerm), 300);

    searchInput.addEventListener('input', (e) => {
        debouncedFilter(e.target.value);
    });

    updateTable();
});