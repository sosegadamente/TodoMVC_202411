const todoApp = () => {
  const getStorage = () => { return JSON.parse(localStorage.getItem("todos")) ?? { todos: [] }; };
  const setStorage = (todo) => { localStorage.setItem("todos", JSON.stringify(todo)); };
  let state = getStorage();

  const setState = (newState) => {
    state = { ...state, ...newState };
    setStorage(state);
    renderCtrl();
  }

  class TodoCtrl {
    createTodo(value) {
      return { idx: crypto.randomUUID(), isFinished: false, value };
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
      e.target.closest('li').classList.remove('editing');
      e.target.remove();
    };
    $input.onkeydown = (e) => {
      if (e.keyCode !== 13) return;
      if (e.keyCode === 13 && !e.target.value.trim()) return todoServices.deleteTodo(e.target.closest('li').querySelector('button'));
      todoServices.editUpdate(e);
    };
  };
  function renderCtrl() {
    [...$$('.filters a')].forEach(($filter) => { $filter.classList.remove('selected'); });
    const $selectedHref = [...$$('.filters a')].find(($filter) => $filter.href === location.href);
    $selectedHref ? $selectedHref.classList.add('selected') : $('a[href="#/"]').classList.add('selected');
    if ($('a.selected').textContent === "All") return render();
    const filteredList = $('a.selected').textContent === "Active" ? state.todos.filter(({ isFinished }) => { return isFinished === false; }) : state.todos.filter(({ isFinished }) => { return isFinished === true; });
    render(filteredList);
  };
  function render(renderList = state.todos) {
    $('.todo-list').innerHTML = "";
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
      $li.ondblclick = (e) => editTodo(e);
      $('.todo-list').append($li);
    });
    $('.clear-completed').classList.toggle('hidden', todoServices.todoLength - todoServices.todoCount <= 0);
    $('footer').classList.toggle('hidden', todoServices.todoLength === 0);
    $('label[for="toggle-all"]').classList.toggle('hidden', todoServices.todoLength === 0);
    todoServices.todoCount === 1 ? $('.todo-count').innerHTML = '<span class="todo-count"><strong>1</strong> item left</span>' : $('.todo-count').innerHTML = `<span class="todo-count"><strong>${ todoServices.todoCount }</strong> items left</span>`;
    todoServices.isAllFinished === true ? $('.toggle-all').checked = true : $('.toggle-all').checked = false;
  };
  function eventCtrl() {
    $('.new-todo').onkeydown = (e) => {
      if (e.keyCode !== 13 || !e.target.value.trim()) return;
      if (e.target.value.startsWith('<s')) return alert('Error Occurred');
      todoServices.addTodo(e);
      e.target.value = "";
    };
    $('.clear-completed').onclick = () => {
      todoServices.clearCompleted();
    };
    $('.toggle-all').onchange = () => {
      todoServices.toggleAll();
    };
    window.onhashchange = () => {
      renderCtrl();
    };
  };

  renderCtrl();
  eventCtrl();
}

todoApp();