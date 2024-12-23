// import { $, $$ } from './common.js';

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

  deleteTodo(eventTarget) {
    const deleteTarget = +eventTarget.closest('.view').dataset.idx;
    const updatedTodos = this.state.todos.filter(({ idx }) => deleteTarget !== idx);
    this.setStorage({ todos: updatedTodos });
  }

  changeState({ target }) {
    const changeTarget = +target.closest('.view').dataset.idx;
    const updateTodos = this.state.todos.map(item => item.idx === changeTarget ? { ...item, isFinished: !item.isFinished } : item);
    this.setStorage({ todos: updateTodos });
  }

  editTodo({ target }) {
    const $li = target.closest('li');
    const $input = !$li.querySelector('input.edit') ? document.createElement('input') : $li.querySelector('input.edit');
    $input.classList.add('edit');
    $li.append($input);
    $input.value = $li.querySelector('label').textContent;
    $li.classList.add('editing');
    $input.focus();
    $input.onblur = (e) => this.editBlur(e);
    $input.onkeydown = (e) => this.editUpdate(e);
  }

  editBlur({ target }) {
    target.closest('li').classList.remove('editing');
    target.remove();
  }

  editUpdate(event) {
    if (event.keyCode !== 13) return;
    if (event.keyCode === 13 && !event.target.value.trim()) return this.deleteTodo(event.target.closest('li').querySelector('button'));
    const changeIdx = +event.target.closest('li').querySelector('.view').dataset.idx;
    const updateTodos = this.state.todos.map(item => item.idx === changeIdx ? { ...item, value: event.target.value } : item);
    this.setStorage({ todos: updateTodos });
  }

  renderController() {
    const $filters = [...$$('.filters li a')];
    $filters.forEach($filter => { $filter.classList.remove('selected'); });
    const $selectedHref = $filters.find($filter => $filter.href === location.href);
    $selectedHref ? $selectedHref.classList.add('selected') : $('a[href="#/"]').classList.add('selected');
    if ($('a.selected').textContent === "All") return this.render();
    let filteredLists = [];
    $('a.selected').textContent === "Active" ? filteredLists = this.state.todos.filter(({ isFinished }) => { return isFinished === false; }) : filteredLists = this.state.todos.filter(({ isFinished }) => { return isFinished === true; });
    this.render(filteredLists);
  }

  render(todoList = this.state.todos) {
    $('.todo-list').innerHTML = "";
    todoList.forEach(todoItem => {
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
      $li.querySelector('button').onclick = (e) => this.deleteTodo(e.target);
      $li.ondblclick = (e) => this.editTodo(e);
      $('.todo-list').append($li);
    });
    !$('.completed') ? $('.clear-completed').style.display = "none" : $('.clear-completed').style.display = "block" ;
    this.toggleAllStatus();
    this.numberLeftTodoList();
    this.isZero();
  }

  toggleAllStatus() {
    const isAllFinished = this.state.todos.every(({ isFinished }) => { return isFinished === true });
    isAllFinished && this.state.todos.length > 0 ? $('.toggle-all').checked = true : $('.toggle-all').checked = false;
  }

  clearCompleted() {
    this.setStorage({ todos: this.state.todos.filter(({ isFinished }) => !isFinished) });
  }
  
  numberLeftTodoList() {
    let incompletedList = [];
    this.state.todos.forEach((item) => { if (item.isFinished === false) incompletedList.push(item); });
    incompletedList.length === 1 ? $('.todo-count').innerHTML = '<span class="todo-count"><strong>1</strong> item left</span>' : $('.todo-count').innerHTML = `<span class="todo-count"><strong>${ incompletedList.length }</strong> items left</span>`;
  }

  isZero() {
    this.state.todos.length === 0 ? $('footer').style.display = 'none' : $('footer').style.display = 'block';
    this.state.todos.length === 0 ? $('label[for="toggle-all"]').style.display = 'none' : $('label[for="toggle-all"]').style.display = 'block';
  }

  toggleAll() {
    const isAllFinished = this.state.todos.every(({ isFinished }) => isFinished);
    const updatedTodos = this.state.todos.map(todo => ({ ...todo, isFinished: !isAllFinished }));
    this.setStorage({ todos: updatedTodos });
  }

  setEvents() {
    document.onkeydown = (e) => this.addTodo(e);
    window.onhashchange = () => this.renderController();
    $('.clear-completed').onclick = () => this.clearCompleted();
    $('#toggle-all').onchange = () => this.toggleAll();
  }
}

new TodoApp();