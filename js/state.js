const todoApp = () => {
  let state = JSON.parse(localStorage.getItem('todos')) ?? [];
  function setStorage(newState) {
    state = { ...state, ...newState };
    localStorage.setItem('todos', JSON.stringify(state));
    renderController();
  }

  function init() {
    renderController();
  }

  function todoFormmater(value) {
    return { isFinished: false, value, idx: Math.random() };
  }

  function addTodo({ keyCode }) {
    const $newTodo = $('.new-todo');
    if (keyCode !== 13 || !$newTodo.value.trim()) return;
    setStorage({ todos: [...state.todos, {id: todoFormmater($newTodo.value)}] });
    $newTodo.value = "";
  }

  function renderController() {

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