const todoApp = () => {
  const getStorage = () => { return JSON.parse(localStorage.getItem("todos")) ?? { todos: [] }; };
  const setStorage = (todo) => { localStorage.setItem("todos", JSON.stringify(todo)); };
  let state = getStorage();

  const setState = (newState) => {
    state = { ...state, ...newState };
    setStorage(state);
    renderCtrl();
  }

  const $todoCount = $('.todo-count');
  const $newTodo = $('.new-todo');
  const $filters = [...$$('.filters a')];
  const $selectedA = $('a.selected');
  const $footer = $('footer');
  const $clearCompleted = $('.clear-completed');
  const $todoList = $('.todo-list');
  const $toggleAll = $('.toggle-all');

  class TodoCtrl {
    createTodo(value) {
      return { idx: crypto.randomUUID(), isEditing: false, isFinished: false, value };
    }
    addTodo({ target }) {
      const todos = [...state.todos, this.createTodo(target.value)];
      setState({ todos });
    }
    deleteTodo(eventTarget) {
      const todos = state.todos.filter((item) => item.idx !== eventTarget.closest('.view').dataset.idx);
      setState({ todos });
    }
    editUpdate({ target }) {
      const todos = state.todos.map((item) => item.idx === target.closest('li').querySelector('.view').dataset.idx ? { ...item, value: target.value } : item);
      setState({ todos });
    }
    changeState({ target }) {
      const todos = state.todos.map((item) => item.idx === target.closest('.view').dataset.idx ? { ...item, isFinished: !item.isFinished } : item);
      setState({ todos });
    }
    clearCompleted() {
      setState({ todos: state.todos.filter(({ isFinished }) => !isFinished) });
    }
    toggleAll() {
      const isAllFinished = state.todos.every(({ isFinished }) => isFinished);
      const todos = state.todos.map((todo) => ({ ...todo, isFinished: !isAllFinished }));
      setState({ todos });
    }
    get todoCount() {
      return state.todos.filter((item) => item.isFinished === false).length;
    }
    get todoLength() {
      return state.todos.length;
    }
    get isAllFinished() {
      return state.todos.every(({ isFinished }) => { return isFinished === true; });
    }
    get isZero() {
      return state.todos.length === 0;
    }
  }
  const todoServices = new TodoCtrl();

  function editTodo ({ target }) {
    const $li = target.closest('li');
    const $input = !$li.querySelector('input.edit') ? document.createElement('input') : $li.querySelector('input.edit');
    $input.classList.add('edit');
    $li.append($input);
    $input.value = $li.querySelector('label').textContent;
    $li.classList.add('editing');
    $input.focus();
    $input.onblur = (e) => {
      if (!e.target.value.trim()) return todoServices.deleteTodo(e.target.closest('li').querySelector('button'));
      todoServices.editUpdate(e);
    };
    $input.onkeydown = (e) => {
      if (e.keyCode !== 13) return;
      if (e.keyCode === 13 && !e.target.value.trim()) return todoServices.deleteTodo(e.target.closest('li').querySelector('button'));
      todoServices.editUpdate(e);
    };
  };

  function renderCtrl() {
    $filters.forEach(($filter) => { $filter.classList.remove('selected'); });
    const $selectedHref = $filters.find(($filter) => $filter.href === location.href);
    $selectedHref ? $selectedHref.classList.add('selected') : $('a[href="#/"]').classList.add('selected');
    if ($selectedA.textContent === "All") return render();
    const filteredList = state.todos.filter(({ isFinished }) => isFinished === ($selectedA.textContent === "Active" ? false : true));
    render(filteredList);
  };
  
  function render(renderList = state.todos) {
    $todoList.innerHTML = "";
    renderList.forEach((todoItem) => {
      const $li =  $createElement("li", { classList: todoItem.isFinished  ?'completed' : '', innerHTML: `
        <div class="view" data-idx=${todoItem.idx}>
          <input class="toggle" type="checkbox" ${todoItem.isFinished ? 'checked' : ''} />
          <label>${todoItem.value}</label>
          <button class="destroy"></button>
        </div>`
      });
      $li.querySelector('input').onclick = (e) => todoServices.changeState(e);
      $li.querySelector('button').onclick = (e) => todoServices.deleteTodo(e.target);
      $li.ondblclick = (e) => editTodo(e);
      $todoList.append($li);
    });
    $clearCompleted.classList.toggle('hidden', todoServices.todoLength - todoServices.todoCount <= 0);
    $footer.classList.toggle('hidden', todoServices.isZero);
    $('label[for="toggle-all"]').classList.toggle('hidden', todoServices.isZero);
    $todoCount.innerHTML = `<span class="todo-count"><strong>${ todoServices.todoCount } </strong>${ todoServices.todoCount === 1 ? 'item' : 'items' } left</span>`;
    $toggleAll.checked = todoServices.isAllFinished;
  };
  function eventCtrl() {
    $newTodo.onkeydown = (e) => { if (e.keyCode === 13 && e.target.value.trim() && !e.target.value.startsWith('<s')) { todoServices.addTodo(e); e.target.value = "";} };
    $clearCompleted.onclick = () => { todoServices.clearCompleted(); };
    $toggleAll.onchange = () => { todoServices.toggleAll(); };
    window.onhashchange = () => { renderCtrl(); };
  };

  renderCtrl();
  eventCtrl();
}

todoApp();