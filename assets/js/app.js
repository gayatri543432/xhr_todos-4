const cl = console.log;

const todoForm = document.getElementById('todoForm');
const titleControl = document.getElementById('title');
const completedControl = document.getElementById('completed');
const userIdControl = document.getElementById('userId');
const addBtn = document.getElementById('addBtn');
const updateBtn = document.getElementById('updateBtn');
const todoContainer = document.getElementById('todoContainer');
const spinner = document.getElementById('spinner');

let todoArr = [];

let BASE_URL = `https://jsonplaceholder.typicode.com`;
let POST_URL = `${BASE_URL}/todos`;

function showAlert(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 300
    });
}

function updateSerialNumbers() {
    let allRows = todoContainer.querySelectorAll('tr');

    allRows.forEach((row, index) => {
        row.children[0].innerText = index + 1;
    });
}

function getTodos() {

    let xhr = new XMLHttpRequest();

    xhr.open('GET', POST_URL);

    xhr.send(null);

    xhr.onload = function () {

        if (xhr.status >= 200 && xhr.status <= 299) {

            let res = JSON.parse(xhr.response);

            todoArr = res;

            renderTodos(res.reverse());

        } else {

            showAlert('Error..', 'error');
        }
    };

    xhr.onerror = function () {

        showAlert('Error..', 'error');
    };
}

getTodos();

function renderTodos(arr) {

    let result = '';

    arr.forEach((todo, i) => {

        result += `
            <tr id="${todo.id}">
                <td>${i + 1}</td>
                <td>${todo.userId}</td>
                <td>${todo.title}</td>
                <td>
                    ${todo.completed
                        ? '<i class="fa-solid fa-square-check text-primary"></i> Complete'
                        : '<i class="fa-solid fa-spinner text-warning"></i> Pending'}
                </td>
                <td>
                    <i onclick="editTodo(this)"
                       class="fa-solid fa-pen-to-square fa-2x text-primary"></i>
                </td>
                <td>
                    <i onclick="deleteTodo(this)"
                       class="fa-solid fa-trash-can fa-2x text-danger"></i>
                </td>
            </tr>`;
    });

    todoContainer.innerHTML = result;
}

function addTodo(e) {

    e.preventDefault();

    spinner.classList.remove('d-none');

    let newTodo = {
        userId: userIdControl.value,
        title: titleControl.value,
        completed: completedControl.value
    };

    let xhr = new XMLHttpRequest();

    xhr.open('POST', POST_URL);

    xhr.setRequestHeader(
        'Content-Type',
        'application/json; charset=UTF-8'
    );

    xhr.send(JSON.stringify(newTodo));

    xhr.onload = function () {

        if (xhr.status >= 200 && xhr.status <= 299) {

            let res = JSON.parse(xhr.response);

            let tr = document.createElement('tr');

            tr.id = res.id;

            tr.innerHTML = `
                <td></td>
                <td>${newTodo.userId}</td>
                <td>${newTodo.title}</td>
                <td>
                    ${newTodo.completed === 'true'
                        ? '<i class="fa-solid fa-square-check text-success"></i> Complete'
                        : '<i class="fa-solid fa-spinner text-warning"></i> Pending'}
                </td>
                <td>
                    <i onclick="editTodo(this)"
                       class="fa-solid fa-pen-to-square fa-2x text-primary"></i>
                </td>
                <td>
                    <i onclick="deleteTodo(this)"
                       class="fa-solid fa-trash-can fa-2x text-danger"></i>
                </td>
            `;

            todoContainer.prepend(tr);

            todoArr.unshift(res);

            updateSerialNumbers();

            todoForm.reset();

            spinner.classList.add('d-none');

            showAlert('New Todo Created..', 'success');

        } else {

            spinner.classList.add('d-none');

            showAlert('Error', 'error');
        }
    };

    xhr.onerror = function () {

        spinner.classList.add('d-none');

        showAlert('Network Error', 'error');
    };
}

function editTodo(ele) {

    let editId = ele.closest('tr').id;

    localStorage.setItem('EDIT_ID', editId);

    let row = document.getElementById(editId);

    userIdControl.value = row.children[1].innerText;
    titleControl.value = row.children[2].innerText;

    completedControl.value =
        row.children[3].innerText.includes('Complete')
            ? 'true'
            : 'false';

    addBtn.classList.add('d-none');
    updateBtn.classList.remove('d-none');
}

function updateTodo() {

    spinner.classList.remove('d-none');

    let editId = localStorage.getItem('EDIT_ID');

    let updateUrl = `${POST_URL}/${editId}`;

    let updatedTodo = {
        userId: userIdControl.value,
        title: titleControl.value,
        completed: completedControl.value === 'true'
    };

    let xhr = new XMLHttpRequest();

    xhr.open('PATCH', updateUrl);

    xhr.setRequestHeader(
        'Content-Type',
        'application/json; charset=UTF-8'
    );

    xhr.send(JSON.stringify(updatedTodo));

    xhr.onload = function () {

        if (xhr.status >= 200 && xhr.status <= 299) {

            let row = document.getElementById(editId);

            row.children[1].innerText = updatedTodo.userId;
            row.children[2].innerText = updatedTodo.title;

            row.children[3].innerHTML =
                updatedTodo.completed
                    ? '<i class="fa-solid fa-square-check text-success"></i> Complete'
                    : '<i class="fa-solid fa-spinner text-warning"></i> Pending';

            todoForm.reset();

            addBtn.classList.remove('d-none');
            updateBtn.classList.add('d-none');

            spinner.classList.add('d-none');

            localStorage.removeItem('EDIT_ID');

            showAlert('Todo Updated Successfully', 'success');

        } else {

            spinner.classList.add('d-none');

            showAlert('Update Failed', 'error');
        }
    };

    xhr.onerror = function () {

        spinner.classList.add('d-none');

        showAlert('Network Error', 'error');
    };
}

function deleteTodo(ele) {

    let removeId = ele.closest('tr').id;

    Swal.fire({
        title: "Are you sure?",
        text: "This todo will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#dc3545",
        confirmButtonText: "Yes, Delete It!"
    }).then((result) => {

        if (result.isConfirmed) {

            spinner.classList.remove('d-none');

            let deleteUrl = `${POST_URL}/${removeId}`;

            let xhr = new XMLHttpRequest();

            xhr.open('DELETE', deleteUrl);

            xhr.send(null);

            xhr.onload = function () {

                if (xhr.status >= 200 && xhr.status <= 299) {

                    document.getElementById(removeId).remove();

                    updateSerialNumbers();

                    spinner.classList.add('d-none');

                    showAlert('Todo Deleted Successfully', 'success');

                } else {

                    spinner.classList.add('d-none');

                    showAlert('Delete Failed', 'error');
                }
            };

            xhr.onerror = function () {

                spinner.classList.add('d-none');

                showAlert('Network Error', 'error');
            };
        }
    });
}

todoForm.addEventListener('submit', addTodo);

updateBtn.addEventListener('click', updateTodo);