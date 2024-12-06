/* NOTE: 로컬 스토리지 같이 자주 사용하는 함수들은 별도로 분리해두는게 보기 좋음 */
const storage = Object.freeze({
  get:(key,initState) => JSON.parse(localStorage.getItem(key)) ?? initState,
  set:(key,state) => localStorage.setItem(key,JSON.stringify(state))
});

/*** NOTE: TodoApp의 전체적인 State 값들을 확인하기가 어려움
 *  현재의 구조로는 투두리스트 데이터를 가지고 있는 상태 값의 호출이 뒤죽박죽임
 *  매 함수마다 getStorage 함수를 호출해서 값을 로드하는 성격을 가지고 있음 
 *  
 *  상태(데이터) 기반 렌더링을 하면 이러한 복잡함을 해결 할 수 있음
 *  그리고 꼭 클래스 기반으로 입력하지 않아도됨
 **/
class TodoAppRefactoring{
  constructor(){
    this.state = storage.get('todoApp',{ todos:[], todoText:'' })
  }

  // NOTE: state의 모든 값은 setState를 통해 변경을 진행하고, 값이 변경될 때마다 storage에 업로드됨 / 그리고 상태기반 렌더링
  setState(updateState){
    this.state = {...structuredClone(this.state), ...updateState}
    storage.set('todoApp',this.state)

    this.rendering()
  }

  todoInput(event){
    this.setState({ todoText:event.target.value }); // 인풋을 입력할 때마다 todoText 값 업데이트 
  }

  addTodo({keyCode}){
    const isCreated = keyCode === 13 && this.state.todoText.trim().length
    if(!isCreated) return  // NOTE: 엔터이며, 텍스트가 아닐때는 생성에서 제외

    const todoItem = { 
      name:this.state.todoText,
      completed:false,
      edited:false
    }

    this.setState({
      todos:[ ...this.state.todos, todoItem],
      todoText:'',
    });
  }

  rendering(){
    // this.state.todos 
  }
}

const $ = (element) => document.querySelector(element);
const $$ = (element) => [...document.querySelectorAll(element)];

const $todoInput = $("#todoInpupt");
const $todoList = $("#list");

let state = JSON.parse(localStorage.getItem("todos")) ?? { todos: [] };
function setState(newState) {
  state = { ...state, ...newState };
  localStorage.setItem("todos", JSON.stringify(state));
  rendering();
}

$todoInput.addEventListener("keydown", function ({ keyCode }) {
  if (keyCode !== 13) return; // Enter
  if (!this.value.trim().length) return; // 공백체크

  const value = this.value;
  this.value = "";

  setState({ todos: [...state.todos, { id: crypto.randomUUID(), name: value }] });
});

function rendering() {
  const $todoItems = state.todos.map((todoItem) => {
    const $div = document.createElement("div");

    const $span = document.createElement("span");
    $span.innerText = todoItem.name;

    const $button = document.createElement("button");
    $button.innerText = "삭제";

    $button.addEventListener("click", function () {
      setState({ todos: state.todos.filter((todo) => todoItem.id !== todo.id) });
    });

    $div.append($span, $button);
    return $div;
  });

  $todoList.innerHTML = "";
  $todoList.append(...$todoItems);
}

rendering();
