document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('tbody');
    let rowCounter = 1;

    // Функция для добавления строки в таблицу
    function addStudent(userName, percentage, date) {
        const newRow = tableBody.insertRow();

        const numberCell = newRow.insertCell();
        numberCell.textContent = rowCounter++;

        const nameCell = newRow.insertCell();
        nameCell.textContent = userName;

        const percentageCell = newRow.insertCell();
        percentageCell.textContent = percentage + '%';

        const dateCell = newRow.insertCell();
        dateCell.textContent = new Date(date).toLocaleDateString();
    }

    // Функция для загрузки учеников с сервера
    async function fetchStudents() {
        try {
            const response = await axios.get('http://localhost:8080/api/users'); 
            const students = response.data;
            tableBody.innerHTML = '';
            rowCounter = 1;

            students.forEach(student => {
                addStudent(student.userName, student.percentage, student.date);
            });

        } catch (error) {
            console.error('Ошибка загрузки данных об учениках:', error);
        }
    }

    // Функция для добавления нового ученика через сервер
    async function addNewStudentToServer(userName) {
        try {
            const response = await axios.post('http://localhost:8080/users', {
                userName: userName,
                percentage: 0, 
                date: new Date()
            });

            addStudent(response.data.userName, response.data.percentage, response.data.date);
        } catch (error) {
            console.error('Ошибка добавления ученика:', error);
        }
    }

    window.addNewStudentToServer = addNewStudentToServer;

    fetchStudents();
    setInterval(fetchStudents, 5000);
});
