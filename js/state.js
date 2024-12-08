class TodoApp {
  constructor() {
    this.state = JSON.parse(localStorage.getItem('todos')) ?? { todos: [] };
    this.renderController();
    this.setEvents();
  }

  setStorage(newState) {
    this.state = { ...structuredClone(this.state), ...newState };
    localStorage.setItem('todos', JSON.stringify(this.state));
    this.renderController();
  }

  addTodo({ keyCode }) {
    const $newTodo = $('.new-todo');
    if (keyCode !== 13 || !$newTodo.value.trim()) return;
    const newTodo = { isFinished: false, value: $newTodo.value, idx: Math.random() };
    this.setStorage({ todos: [...this.state.todos, newTodo] });
    $newTodo.value = "";
  }

  deleteTodo({ target }) {
    const deleteTarget = +target.closest('.view').dataset.idx;
    const updatedTodos = this.state.todos.filter(item => deleteTarget !== item.idx);
    this.setStorage({ todos: updatedTodos });
  }

  changeState({ target }) {
    const changeIdx = +target.closest('.view').dataset.idx;
    const updatedTodos = this.state.todos.map(item => item.idx === changeIdx ? { ...item, isFinished: !item.isFinished } : item );
    this.setStorage({ todos: updatedTodos });
  }

  renderController(todoList = this.state.todos) {
    $('.todo-list').innerHTML = "";
    todoList.forEach((todoItem) => {
      const $li = document.createElement('li');
      if (todoItem.isFinished) $li.classList.add('completed');
      $li.innerHTML = `
        <div class="view" data-idx=${todoItem.idx}>
          <input class="toggle" type="checkbox" ${todoItem.isFinished ? 'checked' : ''} />
          <label>${todoItem.value}</label>
          <button class="destroy"></button>
        </div>
      `;
      $li.querySelector('input').onclick = (e) => this.changeState(e);
      $li.querySelector('button').onclick = (e) => this.deleteTodo(e);
      $('.todo-list').append($li);
    });
    this.toggleAllStatus();
    this.numberLeftTodoList();
    this.isZero();
  }

  clearCompleted() {
    this.setStorage({ todos: this.state.todos.filter(todo => !todo.isFinished) });
  }
  
  toggleAllStatus() {
    const isAllFinished = this.state.todos.every(({ isFinished }) => { return isFinished === true });
    isAllFinished && this.state.todos.length > 0 ? $('.toggle-all').checked = true : $('.toggle-all').checked = false;
  }

  numberLeftTodoList() {
    let incompletedList = [];
    const currentTodoList = this.state.todos;
    const $todoCount = $('.todo-count');
    currentTodoList.forEach((item) => { if (item.isFinished === false) incompletedList.push(item); });
    incompletedList.length === 1 ? $todoCount.innerHTML = '<span class="todo-count"><strong>1</strong> item left</span>' : $todoCount.innerHTML = `<span class="todo-count"><strong>${incompletedList.length}</strong> items left</span>`;
  }

  isZero() {
    this.state.todos.length === 0 ? $('footer').style.display = 'none' : $('footer').style.display = 'block';
    this.state.todos.length === 0 ? $('label[for="toggle-all"]').style.display = 'none' : $('label[for="toggle-all"]').style.display = 'block';
  }

  toggleAll() {
    const isAllFinished = this.state.todos.every(todo => todo.isFinished);
    const updatedTodos = this.state.todos.map(todo => ({ ...todo, isFinished: !isAllFinished }));
    this.setStorage({ todos: updatedTodos });
  }

  setEvents() {
    document.onkeydown = (e) => this.addTodo(e);
    $('.clear-completed').onclick = () => this.clearCompleted();
    $('#toggle-all').onchange = () => this.toggleAll();
    window.onhashchange = () => this.renderController();
  }
}

new TodoApp();