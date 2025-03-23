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


 
    async function fetchStudents() {
        try {
            const response = await axios.get('/api/users');
            let students = response.data;
            tableBody.innerHTML = '';
            rowCounter = 1;
    
            // Получаем средние проценты и количество работ для каждого ученика
            students = await Promise.all(students.map(async (student) => {
                const averageResponse = await axios.get(`/api/users/${student._id}/average`);
                const workCountResponse = await axios.get(`/api/users/${student._id}/workCount`);
                return {
                    ...student,
                    averagePercentage: averageResponse.data.averagePercentage || 0,
                    workCount: workCountResponse.data.workCount || 0
                };
            }));
    
            // Фильтруем только учеников с минимум 3 работами
            const eligibleStudents = students.filter(student => student.workCount >= 3);
    
            // Сортируем отфильтрованных студентов по среднему проценту (от большего к меньшему)
            eligibleStudents.sort((a, b) => (b.averagePercentage || 0) - (a.averagePercentage || 0));
    
            // Добавляем отсортированных студентов в таблицу
            for (const student of eligibleStudents) {
                addStudent(student.userName, student.averagePercentage, student.date);
            }
    
            // Если нужно, можно добавить сообщение или индикацию для учеников с менее 3 работ (опционально)
            if (eligibleStudents.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4">There are no students with enough papers to be ranked.</td></tr>';
            }
        } catch (error) {
            console.error('Ошибка загрузки данных об учениках:', error);
        }
    }

    // Функция для добавления нового ученика через сервер
    async function addNewStudentToServer(userName) {
        try {
            const response = await axios.post('/users', {
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
    setInterval(fetchStudents, 30000);
});
