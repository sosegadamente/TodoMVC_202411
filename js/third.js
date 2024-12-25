const todoApp = () => {
  const $footer = $(".footer");
  const $todoInput = $(".new-todo");
  const $todoList = $(".todo-list");
  const $toggleAll = $(".toggle-all");
  const $todoCount = $(".todoCount");
  const $clearCompleted = $(".clear-completed");
  const $filterItems = $$(".filters a");

  const getStorage = () => { return JSON.parse(localStorage.getItem("todos")) ?? { todos: [] }; };
  const setStorage = (todo) => { localStorage.setItem("todos", JSON.stringify(todo)); };
  let state = getStorage();

  class TodoServices {
    createTodo(value) {
      return { idx: crypto.randomUUID(), isFinished: false, value };
    }
    addTodo(value) {
      const todos = [...state.todos, this.createTodo(value)];
      console.log(...state.todos);
      console.log(this.createTodo(value));
      setStorage({ todos });
    }
  }
  
  const todoServices = new TodoServices();

  function renderCtrl(renderItem) {
    console.log(renderItem);
  }

  function eventCtrl () {
    $todoInput.onkeydown = (e) => { if (e.keyCode === 13 && e.target.value.trim()) todoServices.addTodo(e.target.value); }
  }

  eventCtrl();
};

todoApp();