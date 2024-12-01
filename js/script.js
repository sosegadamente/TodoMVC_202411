class TodoApp{
  constructor() {
    this.isZero();
    this.renderController();
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
    this.getStorage().length === 0 ? $('label[for="toggle-all"]').style.display = 'none' : $('label[for="toggle-all"]').style.display = 'block';
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
    this.renderController();
    this.isZero();
    $newTodo.value = "";
  }

  numberLeftTodoList() {
    let incompletedList = [];
    const currentTodoList = this.getStorage();
    const $todoCount = $('.todo-count');
    currentTodoList.forEach((item) => { if (item.isFinished === false) incompletedList.push(item); });
    incompletedList.length === 1 ? $todoCount.innerHTML = '<span class="todo-count"><strong>1</strong> item left</span>' : $todoCount.innerHTML = `<span class="todo-count"><strong>${incompletedList.length}</strong> items left</span>`;
  }

  deleteTodo(eventTarget) {
    const currentTodoList = this.getStorage();
    const deleteTarget = +eventTarget.closest('.view').dataset.idx;
    const updateTodoList = currentTodoList.filter(({ idx }) => { return idx !== deleteTarget });
    this.setStorage(updateTodoList);
    this.isZero();
    this.renderController();
  }

  editTodo(event) {
    const $li = event.target.closest('li');
    const $input = !$li.querySelector('input.edit') ? document.createElement('input') : $li.querySelector('input.edit');
    $input.value = $li.querySelector('label').textContent;
    $input.classList.add("edit");
    $li.classList.add('editing');
    $li.append($input);
    $input.onblur = (e) => { this.editBlur(e); }
    $input.onkeydown = (e) => { this.updateStorage(e); }
  }

  editBlur(event) {
    event.target.closest('li').classList.remove('editing');
    event.target.remove();
  }

  updateStorage(event) {
    if (event.keyCode !== 13) return;
    if (event.keyCode === 13 && event.target.value == "") return this.deleteTodo(event.target.closest('li').querySelector('button'));
    const $dataIdx = +event.target.closest('li').querySelector('.view').dataset.idx;
    const currentTodoList = this.getStorage();
    const updateTodoList = currentTodoList.map((item) => {
      if (item.idx === $dataIdx) item.value = event.target.value;
      return item;
    });
    this.setStorage(updateTodoList);
    this.renderController();
  }

  changeStatus(event) {
    const currentTodoList = this.getStorage();
    const changeTarget = +event.target.closest('.view').dataset.idx;
    const updateTodoList = currentTodoList.map((item) => {
      if (item.idx === changeTarget) item.isFinished = !item.isFinished;
      return item;
    });
    this.setStorage(updateTodoList);
    this.renderController();
  }

  toggleAllStatus() {
    const isAllFinished = this.getStorage().every(({ isFinished }) => { return isFinished === true });
    isAllFinished && this.getStorage().length > 0 ? $('.toggle-all').checked = true : $('.toggle-all').checked = false;
  }

  toggleAll() {
    const currentTodoList = this.getStorage();
    const isAllFinished = currentTodoList.every(({ isFinished }) => isFinished === true );
    currentTodoList.forEach((item) => { item.isFinished = !isAllFinished; });
    this.setStorage(currentTodoList);
    this.renderController();
  }

  clearCompleted() {
    const currentTodoList = this.getStorage();
    const updateTodoList = currentTodoList.filter(({ isFinished }) => { return isFinished === false; });
    this.setStorage(updateTodoList);
    this.renderController();
    this.isZero();
  }

  renderController() {
    const $filters = [...$$('.filters li a')];
    $filters.forEach(($filter) => { $filter.classList.remove('selected'); });
    const $selectedHref = $filters.find( $filter => $filter.href === location.href );
    $selectedHref ? $selectedHref.classList.add('selected') : $('a[href="#/"]').classList.add('selected');
    if ($('a.selected').textContent === "All") return this.render();
    return this.renderWithFiltering();
  }

  render(renderList = this.getStorage()) {
    const $todoList = $('.todo-list');
    $todoList.innerHTML = '';
    renderList.forEach((todoItem) => {
      const $li = document.createElement('li');
      if (todoItem.isFinished === true) $li.classList.add('completed');
      $li.innerHTML = `
        <div class="view" data-idx=${todoItem.idx}>
          <input class="toggle" type="checkbox" ${todoItem.isFinished === true ? 'checked' : ''} />
          <label>${todoItem.value}</label>
          <button class="destroy"></button>
        </div>
      `;
      $li.querySelector('input').onclick = (e) => { this.changeStatus(e); }
      $li.querySelector('button').onclick = (e) => { this.deleteTodo(e.target); }
      $li.ondblclick = (e) => { this.editTodo(e); }
      $todoList.append($li);
    });
    !$('.completed') ? $('.clear-completed').style.display = "none" : $('.clear-completed').style.display = "block" ;
    this.toggleAllStatus();
    this.numberLeftTodoList();
  }

  renderWithFiltering() {
    let filteredLists = [];
    $('a.selected').textContent === "Active" ? filteredLists = this.getStorage().filter(({ isFinished }) => { return isFinished === false; }) : filteredLists = this.getStorage().filter(({ isFinished }) => { return isFinished === true; });
    this.render(filteredLists);
  }

  setEvents() {
    document.onkeydown = (e) => { this.addTodo(e); }
    $('.clear-completed').onclick = () => { this.clearCompleted(); }
    $('#toggle-all').onchange = () => { this.toggleAll(); }
    window.onhashchange = () => { this.renderController(); }
  }
}

new TodoApp();