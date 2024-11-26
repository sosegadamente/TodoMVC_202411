class TodoApp{
  constructor() {
    this.isZero();
    this.selectedFilter();
    this.setEvents();
  }

  getStorage() {
    return JSON.parse(localStorage.getItem('list')) ?? [];
  }

  setStorage(list) {
    localStorage.setItem('list', JSON.stringify(list));
  }

  isZero() {
    this.getStorage().length === 0 ? $('footer').style.display = 'none' : $('footer').style.display = 'block';
    if (this.getStorage().length === 0) $('.toggle-all').checked = false;
  }

  todoFormat(value) {
    return { isFinished: false, value, idx: Math.random() };
  }

  addTodo(event) {
    const $newTodo = $('.new-todo');
    if (event.keyCode !== 13 || !$newTodo.value.trim()) return;
    const formattedTodoForm = this.todoFormat($newTodo.value);
    const currentTodoList = this.getStorage();
    currentTodoList.push(formattedTodoForm);
    this.setStorage(currentTodoList);
    this.selectedFilter();
    this.isZero();
    $newTodo.value = "";
  }

  numberLeftTodoList() {
    let incompletedList = [];
    const currentTodoList = this.getStorage();
    const $todoCount = $('.todo-count');
    currentTodoList.forEach((item) => {
      if (item.isFinished === false) incompletedList.push(item);
    });
    incompletedList.length === 1 ? $todoCount.innerHTML = '<span class="todo-count"><strong>1</strong> item left</span>' : $todoCount.innerHTML = `<span class="todo-count"><strong>${incompletedList.length}</strong> items left</span>`;
  }

  deleteTodo(event) {
    const currentTodoList = this.getStorage();
    const deleteTarget = event.target.closest('.view').querySelector('label').textContent;
    const updateTodoList = currentTodoList.filter(({ value }) => { return value !== deleteTarget });
    this.setStorage(updateTodoList);
    this.isZero();
    this.selectedFilter();
  }

  editTodo(event) {
    const $li = event.target.closest('li');
    const $input = !$li.querySelector('input.edit') ? document.createElement('input') : $li.querySelector('input.edit');
    $input.value = $li.querySelector('label').textContent;
    $input.classList.add("edit");
    $li.classList.add('editing');
    $li.append($input);
    $input.onblur = (e) => { this.editBlur(e) };
    $input.onkeydown = (e) => { this.updateStorage(e); }
  }

  editBlur(event) {
    console.log(event.target);
    event.target.closest('li').classList.remove('editing');
    event.target.remove();
  }

  updateStorage(event) {
    if (event.keyCode !== 13 || !event.target.value.trim()) return;
    const $textContent = event.target.closest('li').querySelector('label').textContent;
    const currentTodoList = this.getStorage();
    const updateTodoList = currentTodoList.map((item) => {
      if (item.value === $textContent) item.value = event.target.value;
      return item;
    });
    this.setStorage(updateTodoList);
    this.selectedFilter();
  }

  changeStatus(event) {
    const currentTodoList = this.getStorage();
    const changeTarget = event.target.closest('.view').querySelector('label').textContent;
    const updateTodoList = currentTodoList.map((item) => {
      if (item.value === changeTarget) { item.isFinished = !item.isFinished; }
      return item;
    });
    this.setStorage(updateTodoList);
    this.selectedFilter();
  }

  toggleAllStatus() {
    const isAllFinished = this.getStorage().every(({ isFinished }) => { return isFinished == true });
    isAllFinished ? $('.toggle-all').checked = true : $('.toggle-all').checked = false;
  }

  toggleAll() {
    const currentTodoList = this.getStorage();
    const isAllFinished = currentTodoList.every(({ isFinished }) => isFinished == true );
    currentTodoList.forEach((item) => {
      item.isFinished = !isAllFinished;
    });
    this.setStorage(currentTodoList);
    this.selectedFilter();
  }

  clearCompleted() {
    const currentTodoList = this.getStorage();
    const updateTodoList = currentTodoList.filter(({ isFinished }) => { return isFinished == false; } )
    this.setStorage(updateTodoList);
    this.selectedFilter();
    this.isZero();
  }

  render(renderList = this.getStorage()) {
    const $todoList = $('.todo-list');
    $todoList.innerHTML = ''
    renderList.forEach((todoItem) => {
      const $li = document.createElement('li');
      if (todoItem.isFinished == true) $li.classList.add('completed');
      $li.innerHTML = `
        <div class="view">
          <input class="toggle" type="checkbox" ${todoItem.isFinished == true ? 'checked' : ''} />
          <label>${todoItem.value}</label>
          <button class="destroy"></button>
        </div>
      `;
      $li.querySelector('input').onclick = (e) => { this.changeStatus(e); }
      $li.querySelector('button').onclick = (e) => { this.deleteTodo(e); }
      $li.ondblclick = (e) => { this.editTodo(e); }
      $todoList.append($li);
    });
    this.toggleAllStatus();
    this.numberLeftTodoList();
  }

  selectedFilter() {
    const $filters = [...$$('.filters li a')]
    $filters.forEach( $filter => $filter.classList.remove('selected') );
    const $selectedHref = $filters.find( $filter => $filter.href === location.href );
    $selectedHref ? $selectedHref.classList.add('selected') : $('a[href="#/"]').classList.add('selected');
    if ($('a.selected').textContent === "All") return this.render();
    this.renderWithFiltering();
  }

  renderWithFiltering() {
    let filteredLists = [];
    $('a.selected').textContent === "Active" ? filteredLists = this.getStorage().filter(({ isFinished }) => { return isFinished == false; }) : filteredLists = this.getStorage().filter(({ isFinished }) => { return isFinished == true; });
    this.render(filteredLists);
  }

  setEvents() {
    document.onkeydown = (e) => { this.addTodo(e); }
    $('.clear-completed').onclick = () => { this.clearCompleted(); }
    $('#toggle-all').onchange = () => { this.toggleAll(); }
    window.onhashchange = () => { this.selectedFilter(); }
  }
}

new TodoApp();