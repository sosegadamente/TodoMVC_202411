const todoApp = () => {
  let state = JSON.parse(localStorage.getItem('todos')) ?? [];
  
  function setStorage(newState) {
    state = { ...structuredClone(state), ...newState };
    localStorage.setItem('todos', JSON.stringify(state));
    renderController();
  }

  function init() {
    renderController();
  }

  function addTodo({ keyCode }) {
    const $newTodo = $('.new-todo');
    if (keyCode !== 13 || !$newTodo.value.trim()) return;
    setStorage({ todos: [...state.todos, { isFinished: false, value: $newTodo.value, idx: Math.random() }] });
    $newTodo.value = "";
  }

  function renderController(todoList = state.todos) {
    todoList.forEach((todoItem) => {
      const $li = document.createElement('li');
      if (todoItem.isFinished === true) $li.classList.add('completed');
      $li.innerHTML = `
        <div class="view" data-idx=${todoItem.idx}>
          <input class="toggle" type="checkbox" ${todoItem.isFinished === true ? 'checked' : ''} />
          <label>${todoItem.value}</label>
          <button class="destroy"></button>
        </div>
      `;
      $('.todo-list').append($li);
    });
  }

  function setEvents() {
    document.onkeydown = (e) => { addTodo(e); }
    $('.clear-completed').onclick = () => { clearCompleted(); }
    $('#toggle-all').onchange = () => { toggleAll(); }
    window.onhashchange = () => { renderController(); }
  }
  init();
  setEvents();
}

todoApp();