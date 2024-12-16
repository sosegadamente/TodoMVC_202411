/*** REVIEW: 코드 리뷰
 * ### 공통
 * VSCode Extension: Comment Anchors, Better Comments 설치하고 모든걸 추천함
 *
 * ### 상태기반 렌더링에 관하여
 * 예전에 작성했던 코드 보다는 상태기반 렌더링을 적용한 코드가 보기가 좋음
 * 하지만 코드의 가독성이나, 직관성을 개선해야될 필요가 보임
 *
 **/

const $ = (element) => document.querySelector(element);
const $$ = (element) => [...document.querySelectorAll(element)];
const createElement = (element, attr = {}) => Object.assign(document.createElement(element), attr);

const isEmpty = (text) => text.trim() === "";
const getStorage = (key, initState) => JSON.parse(localStorage.getItem(key)) ?? initState;
const setStorage = (key, state) => localStorage.setItem(key, JSON.stringify(state));

const $footer = $(".footer");
const $todoInput = $(".new-todo");
const $todoList = $(".todo-list");
const $toggleAll = $(".toggle-all");
const $todoCount = $(".todoCount");
const $clearCompleted = $(".clear-completed");
const $filterItems = $$(".filters a");

let state = getStorage("todos", { todos: [], filter: "all" });

const services = {
  createdTodo: (text) => ({
    idx: crypto.randomUUID(),
    isFinished: false,
    isEdit: false,
    name: text.trim(),
  }),
  addTodo(text) {
    const todos = [...state.todos, services.createdTodo(text)];
    setState({ todos });
  },
  deleteTodo(itemIdx) {
    const todos = state.todos.filter((item) => item.idx !== itemIdx);
    setState({ todos });
  },
  updateTodoCompleltedToogleByIdx(itemIdx) {
    const idx = services.findIndexByIdx(itemIdx);
    const todos = state.todos.with(idx, { ...state.todos[idx], isFinished: !state.todos[idx].isFinished });
    setState({ todos });
  },
  updateTodoEditStatusByIdx(itemIdx, isEdit) {
    const idx = services.findIndexByIdx(itemIdx);
    const todos = state.todos.with(idx, { ...state.todos[idx], isEdit });
    return setState({ todos });
  },
  updateTodoEditNameByIdx(itemIdx, name) {
    const idx = services.findIndexByIdx(itemIdx);
    const todos = state.todos.with(idx, { ...state.todos[idx], name: name.trim() });
    return setState({ todos });
  },
  updateAllTodoCompleted(isCompleted) {
    const todos = state.todos.map((item) => ({ ...item, isFinished: isCompleted }));
    return setState({ todos });
  },
  deleteAllCompleted() {
    const todos = state.todos.filter(({ isFinished }) => !isFinished);
    return setState({ todos });
  },
  toggleAllSelected() {
    services.updateAllTodoCompleted(!services.isAllCompleted);
  },
  findByIdx(idx) {
    return state.todos.find((item) => item.idx === idx);
  },
  findIndexByIdx(idx) {
    return state.todos.findIndex((item) => item.idx === idx);
  },

  get isAllCompleted() {
    return state.todos.every(({ isFinished }) => isFinished);
  },
  get existCompleted() {
    return state.todos.some(({ isFinished }) => isFinished);
  },
  get isEmpty() {
    return state.todos.length === 0;
  },
};

function setState(newState) {
  state = { ...state, ...newState };
  setStorage("todos", state);
  rendering();
}
function setEvent() {
  $todoInput.addEventListener("keydown", function ({ keyCode }) {
    if (keyCode !== 13) return;
    if (isEmpty(this.value)) return;

    services.addTodo(this.value);
    $todoInput.value = "";
  });
  $toggleAll.addEventListener("click", services.toggleAllSelected);
  $clearCompleted.addEventListener("click", services.deleteAllCompleted);
}

function rendering() {
  $footer.classList.toggle("hidden", services.isEmpty);
  $clearCompleted.classList.toggle("hidden", services.existCompleted);
  $toggleAll.checked = services.isAllCompleted;

  $todoList.innerHTML = "";
  state.todos.forEach((todoItem) => {
    const $li = createElement("li", {
      className: `${todoItem.isFinished ? "completed" : todoItem.isEdit ? "editing" : ""}`,
    });
    const $view = createElement("div", { className: "view" });
    const $toggle = createElement("input", { type: "checkbox", checked: todoItem.isFinished });
    const $p = createElement("p", { textContent: todoItem.name });
    const $button = createElement("button", { class: "destory" });

    $button.addEventListener("click", () => services.deleteTodo(todoItem.idx));
    $p.addEventListener("click", () => services.updateTodoEditStatusByIdx(todoItem.idx, true));

    $view.append($toggle, $p, $button);
    $li.append($view);
    $todoList.append($li);

    if (!todoItem.isEdit) return;
    const $edit = createElement("input", { type: "text", className: "edit" });
    $edit.addEventListener("blur", function () {
      if (isEmpty(this.value)) return services.deleteTodo(todoItem.idx);
      services.updateTodoEditStatusByIdx(todoItem.idx, false);
      services.updateTodoEditNameByIdx(todoItem.idx, this.value);
    });
    $edit.addEventListener("keydown", function ({ keyCode }) {
      if (keyCode !== 13) return;
      if (isEmpty(this.value)) return services.deleteTodo(todoItem.idx);
      services.updateTodoEditStatusByIdx(todoItem.idx, false);
      services.updateTodoEditNameByIdx(todoItem.idx, this.value);
    });
    $li.append($edit);
  });
}

(() => {
  setEvent();
  rendering();
})();

/* class TodoApp {
  // NOTE: 생성자
  constructor() {
    this.state = JSON.parse(localStorage.getItem("todos")) ?? { todos: [] };
    this.renderController();
    this.setEvents();
  }

  // NOTE: 상태 값 로컬 스토리지 저장 & 렌더링
  setStorage(newState) {
    this.state = { ...structuredClone(this.state), ...newState };
    localStorage.setItem("todos", JSON.stringify(this.state));
    this.renderController();
  }

  // NOTE: 투두 생성
  addTodo({ keyCode }) {
    const $newTodo = $(".new-todo");
    if (keyCode !== 13 || !$newTodo.value.trim()) return;
    const newTodo = {
      isFinished: false,
      value: $newTodo.value,
      idx: Math.random(),
    };
    this.setStorage({ todos: [...this.state.todos, newTodo] });
    $newTodo.value = "";
  }

  // NOTE: 투두 삭제
  deleteTodo(eventTarget) {
    const deleteTarget = +eventTarget.closest(".view").dataset.idx;
    const updatedTodos = this.state.todos.filter(({ idx }) => deleteTarget !== idx);
    this.setStorage({ todos: updatedTodos });
  }

  // NOTE: 투두 상태 변경(completed,uncompleted)
  changeState({ target }) {
    const changeTarget = +target.closest(".view").dataset.idx;
    const updateTodos = this.state.todos.map((item) =>
      item.idx === changeTarget ? { ...item, isFinished: !item.isFinished } : item
    );
    this.setStorage({ todos: updateTodos });
  }

  // NOTE: 투두 수정 모드로 변경
  editTodo({ target }) {
    const $li = target.closest("li");
    const $input = !$li.querySelector("input.edit") ? document.createElement("input") : $li.querySelector("input.edit");
    $input.classList.add("edit");
    $li.append($input);
    $input.value = $li.querySelector("label").textContent;
    $li.classList.add("editing");
    $input.focus();
    $input.onblur = (e) => this.editBlur(e);
    $input.onkeydown = (e) => this.editUpdate(e);
  }

  // NOTE: 투두 수정 모드일때 바깥 클릭시 예외처리
  editBlur({ target }) {
    target.closest("li").classList.remove("editing");
    target.remove();
  }

  // NOTE: 투두 수정 처리
  editUpdate(event) {
    if (event.keyCode !== 13) return;
    if (event.keyCode === 13 && !event.target.value.trim())
      return this.deleteTodo(event.target.closest("li").querySelector("button"));
    const changeIdx = +event.target.closest("li").querySelector(".view").dataset.idx;
    const updateTodos = this.state.todos.map((item) =>
      item.idx === changeIdx ? { ...item, value: event.target.value } : item
    );
    this.setStorage({ todos: updateTodos });
  }

  // NOTE: 렌더링 컨트롤러
  renderController() {
    const $filters = [...$$(".filters li a")];
    $filters.forEach(($filter) => {
      $filter.classList.remove("selected");
    });
    const $selectedHref = $filters.find(($filter) => $filter.href === location.href);
    $selectedHref ? $selectedHref.classList.add("selected") : $('a[href="#/"]').classList.add("selected");
    if ($("a.selected").textContent === "All") return this.render();
    let filteredLists = [];
    $("a.selected").textContent === "Active"
      ? (filteredLists = this.state.todos.filter(({ isFinished }) => {
          return isFinished === false;
        }))
      : (filteredLists = this.state.todos.filter(({ isFinished }) => {
          return isFinished === true;
        }));
    this.render(filteredLists);
  }

  // NOTE: 투두리스트 렌더링
  render(todoList = this.state.todos) {
    $(".todo-list").innerHTML = "";
    todoList.forEach((todoItem) => {
      const $li = document.createElement("li");
      if (todoItem.isFinished) $li.classList.add("completed");
      $li.innerHTML = `
        <div class="view" data-idx=${todoItem.idx}>
          <input class="toggle" type="checkbox" ${todoItem.isFinished ? "checked" : ""} />
          <label>${todoItem.value}</label>
          <button class="destroy"></button>
        </div>
      `;
      $li.querySelector("input").onclick = (e) => this.changeState(e);
      $li.querySelector("button").onclick = (e) => this.deleteTodo(e.target);
      $li.ondblclick = (e) => this.editTodo(e);
      $(".todo-list").append($li);
    });
    !$(".completed") ? ($(".clear-completed").style.display = "none") : ($(".clear-completed").style.display = "block");
    this.toggleAllStatus();
    this.numberLeftTodoList();
    this.isZero();
  }

  // NOTE: 전체 선택 (엘린먼트 클래스 값 변경)
  toggleAllStatus() {
    const isAllFinished = this.state.todos.every(({ isFinished }) => {
      return isFinished === true;
    });
    isAllFinished && this.state.todos.length > 0
      ? ($(".toggle-all").checked = true)
      : ($(".toggle-all").checked = false);
  }

  // NOTE: 완료된 투두 삭제
  clearCompleted() {
    this.setStorage({
      todos: this.state.todos.filter(({ isFinished }) => !isFinished),
    });
  }

  // NOTE: 남은 갯수 표기 처리
  numberLeftTodoList() {
    let incompletedList = [];
    this.state.todos.forEach((item) => {
      if (item.isFinished === false) incompletedList.push(item);
    });
    incompletedList.length === 1
      ? ($(".todo-count").innerHTML = '<span class="todo-count"><strong>1</strong> item left</span>')
      : ($(
          ".todo-count"
        ).innerHTML = `<span class="todo-count"><strong>${incompletedList.length}</strong> items left</span>`);
  }

  // NOTE: 투두 없을때 예외처리
  isZero() {
    this.state.todos.length === 0 ? ($("footer").style.display = "none") : ($("footer").style.display = "block");
    this.state.todos.length === 0
      ? ($('label[for="toggle-all"]').style.display = "none")
      : ($('label[for="toggle-all"]').style.display = "block");
  }

  // NOTE: 전체 선택
  toggleAll() {
    const isAllFinished = this.state.todos.every(({ isFinished }) => isFinished);
    const updatedTodos = this.state.todos.map((todo) => ({
      ...todo,
      isFinished: !isAllFinished,
    }));
    this.setStorage({ todos: updatedTodos });
  }

  // NOTE: 이벤트 그룹
  setEvents() {
    document.onkeydown = (e) => this.addTodo(e);
    window.onhashchange = () => this.renderController();
    $(".clear-completed").onclick = () => this.clearCompleted();
    $("#toggle-all").onchange = () => this.toggleAll();
  }
}

new TodoApp(); */
