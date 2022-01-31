// DOM Variables
const hamburger = document.querySelector('.hamburger-menu');
const containerBG = document.querySelector('.container-background');
const sidebar = document.querySelector('.sidebar');
const categoryNameSection = document.querySelector('.category-name');
const todosContainer = document.querySelector('.todos-container');
const todoFilter = document.querySelector('.todo-filter');
const categoryAdd = document.querySelector('.category-add');
let importanceColor;

// Local Storage Arrays
let todos = [];
let categories = [];
let selectedCategory;
let doneTodos = [];
// Page Load
loadItems();


// Event Listeners
hamburger.addEventListener('click', () => {
    sidebar.classList.add('show');
    containerBG.style.display = "block";
    sidebar.addEventListener('click', (e) => {

        if (e.target.classList.contains('fa-times-circle')) {
            containerBG.style.display = "none";
            sidebar.classList.remove('show');
        }

    })
});
categoryNameSection.querySelector('.btn').addEventListener('click', (e) => {
    e.preventDefault();
    categories = getCategoriesFromLS();
    const newTodoContainer = document.createElement('div');
    newTodoContainer.classList.add('new-todo-container');
    newTodoContainer.innerHTML = `
    <div class="new-todo">
                    <div class="close"><i class="far fa-times-circle"></i></div>
                    <h3>Başlık</h3>
                    <input type="text" class="input-text" id="title">
                    <h3>Açıklama</h3>
                    <textarea id="desc" class="input-text"></textarea>
                    <h3>Kategori</h3>
                    <select class="input-text" id="category" required>
                        <option value="" selected disabled>Lütfen bir kategori seçiniz..</option>
                         ${categories.map(category => {
        return `<option value="${category._id}" >${category.categoryName}</option>`
    })}    
                    </select>
                    <h3>Öncelik Durumu</h3>
                    <select class="input-text" id="importance" required>
                        <option value="" selected disabled>Lütfen bir değer seçiniz..</option>
                        <option value="Yüksek">Yüksek</option>
                        <option value="Normal">Normal</option>
                        <option value="Düşük">Düşük</option>
                    </select>
                    <a href="#" class="todo-add btn"><i class="fas fa-plus"></i>Yeni Görev Ekle</a>  
                </div>
    `;
    todosContainer.appendChild(newTodoContainer);
    containerBG.style.display = "block";

    const todoAddBtn = document.querySelector('.todo-add');
    newTodoContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('fa-times-circle')) {
            containerBG.style.display = "none";
            newTodoContainer.remove();
        }
    })

    todoAddBtn.addEventListener('click', () => {

        const todoTitle = newTodoContainer.querySelector('#title').value;
        const todoDesc = newTodoContainer.querySelector('#desc').value;
        const todoCategory = newTodoContainer.querySelector('#category')
        const todoImportance = newTodoContainer.querySelector('#importance').value;
        if (todoTitle === '' || todoDesc === '' || todoCategory.value === '' || todoImportance === '') {
            Swal.fire({
                icon: 'error',
                title: 'Hata...',
                text: 'Tüm alanları doldurunuz!',
            });
        } else {
            setTodosFromLS(createRandomID(), todoCategory.value, todoCategory.selectedOptions[0].innerText, todoTitle, todoDesc, todoImportance, Date.now().toString());
            loadTodos();
            newTodoContainer.querySelector('#title').value = '';
            newTodoContainer.querySelector('#desc').value = '';
            newTodoContainer.querySelector('#category').value = '';
            newTodoContainer.querySelector('#importance').value = '';
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Görev Başarılı Bir Şekilde Oluşturuldu',
                showConfirmButton: false,
                timer: 1500
            })
        }

    });
});
categoryAdd.querySelector('.btn').addEventListener('click', (e) => {
    e.preventDefault();
    const categoryInput = categoryAdd.querySelector('.input-text');

    if (categoryInput.value == '') {
        Swal.fire({
            icon: 'error',
            title: 'Hata...',
            text: 'Kategori ismi boş bırakılamaz!',
        });
    } else if (categoryInput.value.length > 17) {
        Swal.fire({
            icon: 'error',
            title: 'Hata...',
            text: 'Kategori ismi 17 karakterden fazla olamaz!',
        });
    } else {
        setCategoriesFromLS(createRandomID(), categoryInput.value, getRandomHexColor());
        categoryInput.value = '';
        loadItems();
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Kategori Başarılı Bir Şekilde Oluşturuldu',
            showConfirmButton: false,
            timer: 1500
        });
    }


});
todoFilter.querySelector('span').addEventListener('click', () => {
    todoFilter.querySelector('.filters-container').classList.toggle('show');
});
todoFilter.querySelector('.btn').addEventListener('click', (e) => {
    e.preventDefault();
    const todoStatus = todoFilter.querySelector('#todo-status').value;
    const todoSort = todoFilter.querySelector('#todo-sort').value;
    const todoImportanceStatus = todoFilter.querySelector('#todo-importance-status').value;
    if (todoSort === '' || todoImportanceStatus === '') {
        alert('Lütfen tarih bilgisini ve öncelik bilgisini boş bırakmayınız!');
    } else {
        loadTodos(todoStatus, todoSort, todoImportanceStatus);

    }
});
sidebar.querySelector('.category-list').addEventListener('click', (e) => {

    if (e.target.tagName === 'LI') {
        setSelectedCategory(e.target.dataset.categoryId);
        loadItems();
    } else if (e.target.tagName === 'I') {
        categories = getCategoriesFromLS();
        todos = getTodosFromLS();
        doneTodos = getDoneTodosFromLS();
        const deleteCategoryId = e.target.dataset.categoryId;
        const deletedCategoryTodos = todos.filter(todo => todo.categoryId !== deleteCategoryId);
        const deleteCategory = categories.filter(category => category._id !== deleteCategoryId);
        const deleteCategoryDoneTodos = doneTodos.filter(todos => todos.categoryId !== deleteCategoryId);
        localStorage.setItem('todos', JSON.stringify(deletedCategoryTodos));
        localStorage.setItem('categories', JSON.stringify(deleteCategory));
        localStorage.setItem('doneTodos', JSON.stringify(deleteCategoryDoneTodos));
        localStorage.setItem('selectedCategory', JSON.stringify('all'));
        loadItems();
    }

});
sidebar.querySelector('.category-list').addEventListener('change', (e) => {
    if (e.target.tagName === 'INPUT') {
        const colorValue = e.target.value;
        const categoryIndex = categories.findIndex(category => category._id === e.target.parentElement.dataset.categoryId);
        categories[categoryIndex].hexColor = colorValue;
        localStorage.setItem('categories', JSON.stringify(categories));
        loadItems();
    }
});
todosContainer.querySelector('.todos').addEventListener('click', (e) => {
    if (e.target.classList.contains('fa-edit')) {
        const todoId = e.target.dataset.todoId;
        const editTodoContainer = e.target.parentElement.parentElement.parentElement;
        const editTodoPopup = document.createElement('div');
        editTodoPopup.classList.add('edit-todo-container');
        editTodoPopup.innerHTML = `
    <div class="edit-todo-container">
                    <div class="close"><i class="far fa-times-circle"></i></div>
                    <h2>Görevi Düzenle</h2>
                    <h3>Başlık</h3>
                    <input type="text" class="input-text" id="title" value="${editTodoContainer.querySelector('.todo-name').textContent}">
                    <h3>Açıklama</h3>
                    <textarea id="desc" class="input-text">${editTodoContainer.querySelector('.todo-name h2').textContent}</textarea>
                    <h3>Kategori</h3>
                    <select class="input-text" id="category" required  value="${editTodoContainer.querySelector('.todo-category').textContent}">
                        <option value="" disabled>Lütfen bir kategori seçiniz..</option>
                         ${categories.map(category => {
            return `<option value="${category._id}" ${category.categoryName === editTodoContainer.querySelector('.todo-category').textContent ? 'selected' : ''}>${category.categoryName}</option>`
        })}    
                    </select>
                    <h3>Öncelik Durumu</h3>
                    <select class="input-text" id="importance" required>
                        <option value="" disabled>Lütfen bir değer seçiniz..</option>
                        <option value="Yüksek" ${editTodoContainer.querySelector('.todo-importance').textContent === 'Yüksek' ? 'selected' : ''}>Yüksek</option>
                        <option value="Normal" ${editTodoContainer.querySelector('.todo-importance').textContent === 'Normal' ? 'selected' : ''}>Normal</option>
                        <option value="Düşük" ${editTodoContainer.querySelector('.todo-importance').textContent === 'Düşük' ? 'selected' : ''}>Düşük</option>
                    </select>
                    <div class="todo-popup-btns">
                    <a href="#" class="todo-delete btn" data-todo-id="${todoId}"><i class="far fa-trash-alt"></i>SİL</a>  
                    <a href="#" class="todo-edit btn" data-todo-id="${todoId}"><i class="fas fa-edit"></i>GÜNCELLE</a>  
                    </div>
                    
                </div>
    `;
        todosContainer.appendChild(editTodoPopup);
        containerBG.style.display = "block";

        editTodoPopup.addEventListener('click', (e) => {
            if (e.target.classList.contains('fa-times-circle')) {
                containerBG.style.display = "none";
                editTodoPopup.remove();
            } else if (e.target.classList.contains('todo-delete')) {
                e.preventDefault();
                const deletedTodoIndex = todos.findIndex(todo => todo._id === e.target.dataset.todoId);
                todos.splice(deletedTodoIndex, 1);
                localStorage.setItem('todos', JSON.stringify(todos));
                containerBG.style.display = "none";
                editTodoPopup.remove();
                loadTodos();
            } else if (e.target.classList.contains('todo-edit')) {
                e.preventDefault();
                if (editTodoPopup.querySelector('#title').value === '' || editTodoPopup.querySelector('#desc').value === '' || editTodoPopup.querySelector('#category').value === '' || editTodoPopup.querySelector('#importance').value === '') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Hata...',
                        text: 'Tüm alanları doldurunuz!',
                    });
                } else {
                    const editTodoIndex = todos.findIndex(todo => todo._id === e.target.dataset.todoId);
                    todos[editTodoIndex].categoryId = editTodoPopup.querySelector('#category').value;
                    todos[editTodoIndex].categoryName = editTodoPopup.querySelector('#category').selectedOptions[0].innerText;
                    todos[editTodoIndex].todoTitle = editTodoPopup.querySelector('#title').value;
                    todos[editTodoIndex].todoDesc = editTodoPopup.querySelector('#desc').value;
                    todos[editTodoIndex].todoImportance = editTodoPopup.querySelector('#importance').value;
                    localStorage.setItem('todos', JSON.stringify(todos));
                    containerBG.style.display = "none";
                    editTodoPopup.remove();
                    loadItems();
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Başarılı bir şekilde düzenlendi!',
                        showConfirmButton: false,
                        timer: 1200
                    });
                }

            }
        })

    } else if (e.target.classList.contains('btn')) {
        e.preventDefault();
        const doneTodo = todos.filter(todo => todo._id === e.target.dataset.todoId)
        doneTodo[0].doneTask = true;
        doneTodos.push(doneTodo[0]);
        localStorage.setItem('todos', JSON.stringify(todos));
        localStorage.setItem('doneTodos', JSON.stringify(doneTodos));
        loadTodos(todoFilter.querySelector('#todo-status').value, todoFilter.querySelector('#todo-sort').value === '' ? 'desc' : todoFilter.querySelector('#todo-sort').value, todoFilter.querySelector('#todo-importance-status').value === '' ? 'all' : todoFilter.querySelector('#todo-importance-status').value);
    } else if (e.target.classList.contains('fa-undo')) {
        doneTodos = getDoneTodosFromLS();
        todos = getTodosFromLS();
        todos.forEach(todo => {
            if (todo._id === e.target.dataset.todoId) {
                todo.doneTask = false;
            }
        });
        const deleteDoneTodo = doneTodos.filter(doneTodo => doneTodo._id !== e.target.dataset.todoId);

        localStorage.setItem('todos', JSON.stringify(todos));
        localStorage.setItem('doneTodos', JSON.stringify(deleteDoneTodo));
        loadTodos(todoFilter.querySelector('#todo-status').value, todoFilter.querySelector('#todo-sort').value === '' ? 'desc' : todoFilter.querySelector('#todo-sort').value, todoFilter.querySelector('#todo-importance-status').value === '' ? 'all' : todoFilter.querySelector('#todo-importance-status').value);
    }
})
// Functions
function loadItems() {
    loadCategories();
    loadTodos();
}
function loadCategories() {
    selectedCategory = getSelectedCategory();
    categories = getCategoriesFromLS();
    sidebar.querySelector('.category-list').innerHTML = `
                <ul>
                <li class="${selectedCategory === 'all' || selectedCategory === null || selectedCategory === '' ? 'active' : ''}" data-category-id="all" ><i class="fas fa-th-list"></i> Tümünü Göster</li>
                ${categories.map(category => {
        return `<li class="${selectedCategory === category._id ? 'active' : ''}" data-category-id="${category._id}"><input class="todo-color" type="color" value="${category.hexColor}">${category.categoryName} <i class="far fa-trash-alt" data-category-id="${category._id}"></i></li>`
    }).join('')}              
            </ul>`;
}

function loadTodos(todoStatus = 'all', todoSort = 'desc', todoImportanceStatus = 'all') {
    todos = getTodosFromLS();
    doneTodos = getDoneTodosFromLS();
    if (doneTodos.length === 0) {
        todos.forEach(todo => {
            todo.doneTask = false;
        });
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    let sortArray = [...todos];

    if (todoSort === 'desc') { sortArray.sort((a, b) => { return b.todoDate - a.todoDate }); }
    else if (todoSort === 'asc') { sortArray.sort((a, b) => { return a.todoDate - b.todoDate }); }

    if (selectedCategory === "all") {
        categoryNameSection.querySelector('h1').innerHTML = `Tüm Görevler <span>(${todos.length})</span>`;
        if (todoStatus === 'all') {
            if (todoImportanceStatus === 'all') {
                getTodosSnippet(sortArray)
            } else {
                todosContainer.querySelector('.todos').innerHTML = sortArray.filter(todo => todo.todoImportance === todoImportanceStatus).map(todo => {
                    const date = new Date(Number(todo.todoDate));
                    if (todo.todoImportance == 'Yüksek') {
                        importanceColor = 'background-color:#800000';
                    } else if (todo.todoImportance == 'Normal') {
                        importanceColor = 'background-color:#df7100';
                    } else {
                        importanceColor = 'background-color:#007400';
                    }
                    const categoryColor = categories.find(category => category._id === todo.categoryId)
                    return `
                    <li style="border-color:${categoryColor.hexColor}" class="${todo.doneTask === true ? 'done' : ''}">
                        <div class="todo-info"><div class="todo-category" style="background-color:${categoryColor.hexColor}35; color:${categoryColor.hexColor}">${todo.categoryName}</div> <div class="todo-importance" style="${importanceColor}">${todo.todoImportance}</div><div class="icons"><i class="fas fa-edit" data-todo-id="${todo._id}"></i><i class="fas fa-undo" data-todo-id="${todo._id}"></i></div></div>
                        <div class="todo-name"><h2>${todo.todoTitle}</h2></div>
                        <p class="desc">${todo.todoDesc}</p>
                        <div class="todo-actions"><span><i class="fas fa-clock"></i> ${date.getDate()}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} </span> <a href="#" class="btn" data-todo-id="${todo._id}"><i class="fas fa-check"></i> <p>Tamamla</p></a></div>
                </li>`;
                }).join('');
            }

        } else if (todoStatus === 'done') {
            if (todoImportanceStatus === 'all') {
                todosContainer.querySelector('.todos').innerHTML = sortArray.filter(todo => todo.doneTask === true).map(todo => {
                    const date = new Date(Number(todo.todoDate));
                    if (todo.todoImportance == 'Yüksek') {
                        importanceColor = 'background-color:#800000';
                    } else if (todo.todoImportance == 'Normal') {
                        importanceColor = 'background-color:#df7100';
                    } else {
                        importanceColor = 'background-color:#007400';
                    }
                    const categoryColor = categories.find(category => category._id === todo.categoryId)
                    return `
                    <li style="border-color:${categoryColor.hexColor}" class="${todo.doneTask === true ? 'done' : ''}">
                        <div class="todo-info"><div class="todo-category" style="background-color:${categoryColor.hexColor}35; color:${categoryColor.hexColor}">${todo.categoryName}</div> <div class="todo-importance" style="${importanceColor}">${todo.todoImportance}</div><div class="icons"><i class="fas fa-edit" data-todo-id="${todo._id}"></i><i class="fas fa-undo" data-todo-id="${todo._id}"></i></div></div>
                        <div class="todo-name"><h2>${todo.todoTitle}</h2></div>
                        <p class="desc">${todo.todoDesc}</p>
                        <div class="todo-actions"><span><i class="fas fa-clock"></i> ${date.getDate()}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} </span> <a href="#" class="btn" data-todo-id="${todo._id}"><i class="fas fa-check"></i> <p>Tamamla</p></a></div>
                </li>`;
                }).join('');
            } else {
                todosContainer.querySelector('.todos').innerHTML = sortArray.filter(todo => todo.doneTask === true).filter(todo => todo.todoImportance === todoImportanceStatus).map(todo => {
                    const date = new Date(Number(todo.todoDate));
                    if (todo.todoImportance == 'Yüksek') {
                        importanceColor = 'background-color:#800000';
                    } else if (todo.todoImportance == 'Normal') {
                        importanceColor = 'background-color:#df7100';
                    } else {
                        importanceColor = 'background-color:#007400';
                    }
                    const categoryColor = categories.find(category => category._id === todo.categoryId)
                    return `
                    <li style="border-color:${categoryColor.hexColor}" class="${todo.doneTask === true ? 'done' : ''}">
                        <div class="todo-info"><div class="todo-category" style="background-color:${categoryColor.hexColor}35; color:${categoryColor.hexColor}">${todo.categoryName}</div> <div class="todo-importance" style="${importanceColor}">${todo.todoImportance}</div><div class="icons"><i class="fas fa-edit" data-todo-id="${todo._id}"></i><i class="fas fa-undo" data-todo-id="${todo._id}"></i></div></div>
                        <div class="todo-name"><h2>${todo.todoTitle}</h2></div>
                        <p class="desc">${todo.todoDesc}</p>
                        <div class="todo-actions"><span><i class="fas fa-clock"></i> ${date.getDate()}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} </span> <a href="#" class="btn" data-todo-id="${todo._id}"><i class="fas fa-check"></i> <p>Tamamla</p></a></div>
                </li>`;
                }).join('');
            }

        } else if (todoStatus === 'notDone') {
            if (todoImportanceStatus === 'all') {
                todosContainer.querySelector('.todos').innerHTML = sortArray.filter(todo => todo.doneTask !== true).map(todo => {
                    const date = new Date(Number(todo.todoDate));
                    if (todo.todoImportance == 'Yüksek') {
                        importanceColor = 'background-color:#800000';
                    } else if (todo.todoImportance == 'Normal') {
                        importanceColor = 'background-color:#df7100';
                    } else {
                        importanceColor = 'background-color:#007400';
                    }
                    const categoryColor = categories.find(category => category._id === todo.categoryId)
                    return `
                    <li style="border-color:${categoryColor.hexColor}" class="${todo.doneTask === true ? 'done' : ''}">
                        <div class="todo-info"><div class="todo-category" style="background-color:${categoryColor.hexColor}35; color:${categoryColor.hexColor}">${todo.categoryName}</div> <div class="todo-importance" style="${importanceColor}">${todo.todoImportance}</div><div class="icons"><i class="fas fa-edit" data-todo-id="${todo._id}"></i><i class="fas fa-undo" data-todo-id="${todo._id}"></i></div></div>
                        <div class="todo-name"><h2>${todo.todoTitle}</h2></div>
                        <p class="desc">${todo.todoDesc}</p>
                        <div class="todo-actions"><span><i class="fas fa-clock"></i> ${date.getDate()}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} </span> <a href="#" class="btn" data-todo-id="${todo._id}"><i class="fas fa-check"></i> <p>Tamamla</p></a></div>
                </li>`;
                }).join('');
            } else {
                todosContainer.querySelector('.todos').innerHTML = sortArray.filter(todo => todo.doneTask !== true).filter(todo => todo.todoImportance === todoImportanceStatus).map(todo => {
                    const date = new Date(Number(todo.todoDate));
                    if (todo.todoImportance == 'Yüksek') {
                        importanceColor = 'background-color:#800000';
                    } else if (todo.todoImportance == 'Normal') {
                        importanceColor = 'background-color:#df7100';
                    } else {
                        importanceColor = 'background-color:#007400';
                    }
                    const categoryColor = categories.find(category => category._id === todo.categoryId)
                    return `
                    <li style="border-color:${categoryColor.hexColor}" class="${todo.doneTask === true ? 'done' : ''}">
                        <div class="todo-info"><div class="todo-category" style="background-color:${categoryColor.hexColor}35; color:${categoryColor.hexColor}">${todo.categoryName}</div> <div class="todo-importance" style="${importanceColor}">${todo.todoImportance}</div><div class="icons"><i class="fas fa-edit" data-todo-id="${todo._id}"></i><i class="fas fa-undo" data-todo-id="${todo._id}"></i></div></div>
                        <div class="todo-name"><h2>${todo.todoTitle}</h2></div>
                        <p class="desc">${todo.todoDesc}</p>
                        <div class="todo-actions"><span><i class="fas fa-clock"></i> ${date.getDate()}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} </span> <a href="#" class="btn" data-todo-id="${todo._id}"><i class="fas fa-check"></i> <p>Tamamla</p></a></div>
                </li>`;
                }).join('');
            }

        }

    } else {
        const selectedCategoryTodos = todos.filter(todo => todo.categoryId === selectedCategory);
        const activeCategoryText = sidebar.querySelector('.category-list ul li.active').textContent;

        categoryNameSection.querySelector('h1').innerHTML = `${activeCategoryText} <span>(${selectedCategoryTodos.length})</span>`;

        if (selectedCategoryTodos.length === 0) {
            todosContainer.querySelector('.todos').innerHTML = `<h3>Görev Bulunamadı! <br> Lütfen yeni bir görev ekleyiniz..</h3>`
        } else {
            sortArray = [...selectedCategoryTodos];
            if (todoSort === 'desc') { sortArray.sort((a, b) => { return b.todoDate - a.todoDate }); }
            else if (todoSort === 'asc') { sortArray.sort((a, b) => { return a.todoDate - b.todoDate }); }
            if (todoStatus === 'all') {
                if (todoImportanceStatus === 'all') {
                    getTodosSnippet(sortArray);
                } else {
                    todosContainer.querySelector('.todos').innerHTML = sortArray.filter(todo => todo.todoImportance === todoImportanceStatus).map(todo => {
                        const date = new Date(Number(todo.todoDate));
                        if (todo.todoImportance == 'Yüksek') {
                            importanceColor = 'background-color:#800000';
                        } else if (todo.todoImportance == 'Normal') {
                            importanceColor = 'background-color:#df7100';
                        } else {
                            importanceColor = 'background-color:#007400';
                        }
                        const categoryColor = categories.find(category => category._id === todo.categoryId)
                        return `
                        <li style="border-color:${categoryColor.hexColor}" class="${todo.doneTask === true ? 'done' : ''}">
                            <div class="todo-info"><div class="todo-category" style="background-color:${categoryColor.hexColor}35; color:${categoryColor.hexColor}">${todo.categoryName}</div> <div class="todo-importance" style="${importanceColor}">${todo.todoImportance}</div><div class="icons"><i class="fas fa-edit" data-todo-id="${todo._id}"></i><i class="fas fa-undo" data-todo-id="${todo._id}"></i></div></div>
                            <div class="todo-name"><h2>${todo.todoTitle}</h2></div>
                            <p class="desc">${todo.todoDesc}</p>
                            <div class="todo-actions"><span><i class="fas fa-clock"></i> ${date.getDate()}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} </span> <a href="#" class="btn" data-todo-id="${todo._id}"><i class="fas fa-check"></i> <p>Tamamla</p></a></div>
                    </li>`;
                    }).join('');
                }
            } else if (todoStatus === 'done') {
                if (todoImportanceStatus === 'all') {
                    todosContainer.querySelector('.todos').innerHTML = sortArray.filter(todo => todo.doneTask === true).map(todo => {
                        const date = new Date(Number(todo.todoDate));
                        if (todo.todoImportance == 'Yüksek') {
                            importanceColor = 'background-color:#800000';
                        } else if (todo.todoImportance == 'Normal') {
                            importanceColor = 'background-color:#df7100';
                        } else {
                            importanceColor = 'background-color:#007400';
                        }
                        const categoryColor = categories.find(category => category._id === todo.categoryId)
                        return `
                        <li style="border-color:${categoryColor.hexColor}" class="${todo.doneTask === true ? 'done' : ''}">
                            <div class="todo-info"><div class="todo-category" style="background-color:${categoryColor.hexColor}35; color:${categoryColor.hexColor}">${todo.categoryName}</div> <div class="todo-importance" style="${importanceColor}">${todo.todoImportance}</div><div class="icons"><i class="fas fa-edit" data-todo-id="${todo._id}"></i><i class="fas fa-undo" data-todo-id="${todo._id}"></i></div></div>
                            <div class="todo-name"><h2>${todo.todoTitle}</h2></div>
                            <p class="desc">${todo.todoDesc}</p>
                            <div class="todo-actions"><span><i class="fas fa-clock"></i> ${date.getDate()}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} </span> <a href="#" class="btn" data-todo-id="${todo._id}"><i class="fas fa-check"></i> <p>Tamamla</p></a></div>
                    </li>`;
                    }).join('');
                } else {
                    todosContainer.querySelector('.todos').innerHTML = sortArray.filter(todo => todo.doneTask === true).filter(todo => todo.todoImportance === todoImportanceStatus).map(todo => {
                        const date = new Date(Number(todo.todoDate));
                        if (todo.todoImportance == 'Yüksek') {
                            importanceColor = 'background-color:#800000';
                        } else if (todo.todoImportance == 'Normal') {
                            importanceColor = 'background-color:#df7100';
                        } else {
                            importanceColor = 'background-color:#007400';
                        }
                        const categoryColor = categories.find(category => category._id === todo.categoryId)
                        return `
                        <li style="border-color:${categoryColor.hexColor}" class="${todo.doneTask === true ? 'done' : ''}">
                            <div class="todo-info"><div class="todo-category" style="background-color:${categoryColor.hexColor}35; color:${categoryColor.hexColor}">${todo.categoryName}</div> <div class="todo-importance" style="${importanceColor}">${todo.todoImportance}</div><div class="icons"><i class="fas fa-edit" data-todo-id="${todo._id}"></i><i class="fas fa-undo" data-todo-id="${todo._id}"></i></div></div>
                            <div class="todo-name"><h2>${todo.todoTitle}</h2></div>
                            <p class="desc">${todo.todoDesc}</p>
                            <div class="todo-actions"><span><i class="fas fa-clock"></i> ${date.getDate()}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} </span> <a href="#" class="btn" data-todo-id="${todo._id}"><i class="fas fa-check"></i> <p>Tamamla</p></a></div>
                    </li>`;
                    }).join('');
                }

            } else if (todoStatus === 'notDone') {
                if (todoImportanceStatus === 'all') {
                    todosContainer.querySelector('.todos').innerHTML = sortArray.filter(todo => todo.doneTask !== true).map(todo => {
                        const date = new Date(Number(todo.todoDate));
                        if (todo.todoImportance == 'Yüksek') {
                            importanceColor = 'background-color:#800000';
                        } else if (todo.todoImportance == 'Normal') {
                            importanceColor = 'background-color:#df7100';
                        } else {
                            importanceColor = 'background-color:#007400';
                        }
                        const categoryColor = categories.find(category => category._id === todo.categoryId)
                        return `
                        <li style="border-color:${categoryColor.hexColor}" class="${todo.doneTask === true ? 'done' : ''}">
                            <div class="todo-info"><div class="todo-category" style="background-color:${categoryColor.hexColor}35; color:${categoryColor.hexColor}">${todo.categoryName}</div> <div class="todo-importance" style="${importanceColor}">${todo.todoImportance}</div><div class="icons"><i class="fas fa-edit" data-todo-id="${todo._id}"></i><i class="fas fa-undo" data-todo-id="${todo._id}"></i></div></div>
                            <div class="todo-name"><h2>${todo.todoTitle}</h2></div>
                            <p class="desc">${todo.todoDesc}</p>
                            <div class="todo-actions"><span><i class="fas fa-clock"></i> ${date.getDate()}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} </span> <a href="#" class="btn" data-todo-id="${todo._id}"><i class="fas fa-check"></i> <p>Tamamla</p></a></div>
                    </li>`;
                    }).join('');
                } else {
                    todosContainer.querySelector('.todos').innerHTML = sortArray.filter(todo => todo.doneTask !== true).filter(todo => todo.todoImportance === todoImportanceStatus).map(todo => {
                        const date = new Date(Number(todo.todoDate));
                        if (todo.todoImportance == 'Yüksek') {
                            importanceColor = 'background-color:#800000';
                        } else if (todo.todoImportance == 'Normal') {
                            importanceColor = 'background-color:#df7100';
                        } else {
                            importanceColor = 'background-color:#007400';
                        }
                        const categoryColor = categories.find(category => category._id === todo.categoryId)
                        return `
                        <li style="border-color:${categoryColor.hexColor}" class="${todo.doneTask === true ? 'done' : ''}">
                            <div class="todo-info"><div class="todo-category" style="background-color:${categoryColor.hexColor}35; color:${categoryColor.hexColor}">${todo.categoryName}</div> <div class="todo-importance" style="${importanceColor}">${todo.todoImportance}</div><div class="icons"><i class="fas fa-edit" data-todo-id="${todo._id}"></i><i class="fas fa-undo" data-todo-id="${todo._id}"></i></div></div>
                            <div class="todo-name"><h2>${todo.todoTitle}</h2></div>
                            <p class="desc">${todo.todoDesc}</p>
                            <div class="todo-actions"><span><i class="fas fa-clock"></i> ${date.getDate()}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} </span> <a href="#" class="btn" data-todo-id="${todo._id}"><i class="fas fa-check"></i> <p>Tamamla</p></a></div>
                    </li>`;
                    }).join('');
                }

            }
        }

    }
}


function getTodosSnippet(sortArray) {
    todosContainer.querySelector('.todos').innerHTML = sortArray.map(todo => {
        const date = new Date(Number(todo.todoDate));
        if (todo.todoImportance == 'Yüksek') {
            importanceColor = 'background-color:#800000';
        } else if (todo.todoImportance == 'Normal') {
            importanceColor = 'background-color:#df7100';
        } else {
            importanceColor = 'background-color:#007400';
        }
        const categoryColor = categories.find(category => category._id === todo.categoryId)
        return `
        <li style="border-color:${categoryColor.hexColor}" class="${todo.doneTask === true ? 'done' : ''}">
            <div class="todo-info"><div class="todo-category" style="background-color:${categoryColor.hexColor}35; color:${categoryColor.hexColor}">${todo.categoryName}</div> <div class="todo-importance" style="${importanceColor}">${todo.todoImportance}</div><div class="icons"><i class="fas fa-edit" data-todo-id="${todo._id}"></i><i class="fas fa-undo" data-todo-id="${todo._id}"></i></div></div>
            <div class="todo-name"><h2>${todo.todoTitle}</h2></div>
            <p class="desc">${todo.todoDesc}</p>
            <div class="todo-actions"><span><i class="fas fa-clock"></i> ${date.getDate()}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} </span> <a href="#" class="btn" data-todo-id="${todo._id}"><i class="fas fa-check"></i> <p>Tamamla</p></a></div>
    </li>`;
    }).join('');
}
//!Local Storage Verilerini Getir
function getTodosFromLS() {
    if (localStorage.getItem('todos') === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }
    return todos;
}
function getCategoriesFromLS() {
    if (localStorage.getItem('categories') === null) {
        categories = [];
    } else {
        categories = JSON.parse(localStorage.getItem('categories'));
    }
    return categories
}
function getSelectedCategory() {
    if (localStorage.getItem('selectedCategory') === null) {
        selectedCategory = "all";
    } else {
        selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
    }
    return selectedCategory
}
function getDoneTodosFromLS() {
    if (localStorage.getItem('doneTodos') === null) {
        doneTodos = [];
    } else {
        doneTodos = JSON.parse(localStorage.getItem('doneTodos'));
    }
    return doneTodos
}
//! Local Strorage İçine Veri Ekle
function setTodosFromLS(id, categoryID, categoryName, todoTitle, todoDesc, todoImportance, todoDate) {
    todos = getTodosFromLS();
    todos.push({
        _id: id,
        categoryId: categoryID,
        categoryName: categoryName,
        todoTitle: todoTitle,
        todoDesc: todoDesc,
        todoImportance: todoImportance,
        todoDate: todoDate,
        doneTask: false
    })
    localStorage.setItem('todos', JSON.stringify(todos))
}
function setCategoriesFromLS(randomID, categoryName, randomHexColor) {
    categories = getCategoriesFromLS();
    categories.push({
        _id: randomID,
        categoryName: categoryName,
        hexColor: randomHexColor
    })
    localStorage.setItem('categories', JSON.stringify(categories))
}
function setSelectedCategory(id) {
    selectedCategory = id;
    localStorage.setItem('selectedCategory', JSON.stringify(selectedCategory));
}

//! Random Generators Functions
function createRandomID() {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    })
    return uuid;
}
function getRandomHexColor() {
    do {
        var hex = (Math.round(Math.random() * 0xffffff)).toString(16);
        while (hex.length < 6) hex = "0" + hex;
        return `#${hex}`;
    }
    while (hex == 'ffffff')

}
