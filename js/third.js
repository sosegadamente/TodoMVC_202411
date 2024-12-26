const todoApp = () => {
  const $footer = $(".footer");
  const $todoInput = $(".new-todo");
  const $todoList = $(".todo-list");
  const $toggleAll = $(".toggle-all");
  const $todoCount = $(".todo-count");
  const $clearCompleted = $(".clear-completed");
  const $filterItems = [...$$(".filters a")];
  const getStorage = () => { return JSON.parse(localStorage.getItem("todos")) ?? { todos: [] }; };
  const setStorage = (todo) => { localStorage.setItem("todos", JSON.stringify(todo)); };
  let state = getStorage();

  class TodoServices {
    createTodo(value) {
      return { idx: crypto.randomUUID(), isFinished: false, value };
    }
    addTodo({ target, keyCode }) {
      if (keyCode !== 13 || !target.value.trim()) return;
      const todos = [...state.todos, this.createTodo(target.value)];
      setState({ todos });
      target.value = "";
    }
    deleteTodo(eventTarget) {
      const changeTarget = eventTarget.closest('.view').dataset.idx;
      const todos = state.todos.filter((item) => item.idx !== changeTarget);
      setState({ todos });
    }
    editTodo({ target }) {
      const $li = target.closest('li');
      const $input = !$li.querySelector('input.edit') ? $createElement('li', { classList: 'edit' }) : $li.querySelector('input.edit');
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
    editUpdate({ target, keyCode }) {
      if (keyCode !== 13) return;
      if (keyCode === 13 && !target.value.trim()) return this.deleteTodo(target.closest('li').querySelector('button'));
      const changeIdx = target.closest('li').querySelector('.view').dataset.idx;
      const todos = state.todos.map(item => item.idx === changeIdx ? { ...item, value: target.value } : item);
      setState({ todos });
    }
    changeState({ target }) {
      const changeTarget = target.closest('.view').dataset.idx;
      const todos = state.todos.map((item) => item.idx === changeTarget ? { ...item, isFinished: !item.isFinished } : item);
      setState({ todos });
    }
    clearCompleted() {
      setState({ todos: state.todos.filter(({ isFinished }) => !isFinished) });
    }
    todoCount() {
      let incompletedList = [];
      state.todos.forEach((item) => { if (item.isFinished === false) incompletedList.push(item); });
      incompletedList.length === 1 ? $todoCount.innerHTML = '<span class="todo-count"><strong>1</strong> item left</span>' : $todoCount.innerHTML = `<span class="todo-count"><strong>${ incompletedList.length }</strong> items left</span>`;
    }
    toggleAllState() {
      const isAllFinished = state.todos.every(({ isFinished }) => { return isFinished === true });
      isAllFinished && state.todos.length > 0 ? $('.toggle-all').checked = true : $('.toggle-all').checked = false;
    }
    isZero() {
      state.todos.length === 0 ? $footer.style.display = 'none' : $footer.style.display = 'block';
      state.todos.length === 0 ? $('label[for="toggle-all"]').style.display = 'none' : $('label[for="toggle-all"]').style.display = 'block';
    }
    toggleAll() {
      const isAllFinished = state.todos.every(({ isFinished }) => isFinished);
      const todos = state.todos.map((todo) => ({ ...todo, isFinished: !isAllFinished }));
      setState({ todos });
    }
  }
  const todoServices = new TodoServices();

  function setState(newState) {
    state = { ...state, ...newState };
    setStorage(state);
    renderCtrl();
  }
  function renderCtrl() {
    $filterItems.forEach(($filter) => { $filter.classList.remove('selected') });
    const $selectedHref = $filterItems.find(($filter) => $filter.href === location.href);
    $selectedHref ? $selectedHref.classList.add('selected') : $('a[href="#/"]').classList.add('selected');
    if ($('a.selected').textContent === "All") return render();
    const filteredList = $('a.selected').textContent === "Active" ? state.todos.filter(({ isFinished }) => { return isFinished === false; }) : state.todos.filter(({ isFinished }) => { return isFinished === true; });
    render(filteredList);
  }
  function render(renderList = state.todos) {
    $todoList.innerHTML = "";
    renderList.forEach((todoItem) => {
      const $li = todoItem.isFinished ? $createElement("li", { classList: 'completed' }) : $createElement("li");
      $li.innerHTML = `
        <div class="view" data-idx=${todoItem.idx}>
          <input class="toggle" type="checkbox" ${todoItem.isFinished ? 'checked' : ''} />
          <label>${todoItem.value}</label>
          <button class="destroy"></button>
        </div>
      `;
      $li.querySelector('input').onclick = (e) => todoServices.changeState(e);
      $li.querySelector('button').onclick = (e) => todoServices.deleteTodo(e.target);
      $li.ondblclick = (e) => todoServices.editTodo(e);
      $todoList.append($li);
    });
    !$('.completed') ? $('.clear-completed').style.display = "none" : $('.clear-completed').style.display = "block";
    todoServices.todoCount();
    todoServices.toggleAllState();
    todoServices.isZero();
  }
  function eventCtrl () {
    $todoInput.onkeydown = (e) => todoServices.addTodo(e);
    $clearCompleted.onclick = () => todoServices.clearCompleted();
    $toggleAll.onchange = () => todoServices.toggleAll();
    window.onhashchange = () => renderCtrl();
  }

  renderCtrl();
  eventCtrl();
};

todoApp();