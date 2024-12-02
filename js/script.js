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


// NOTE: 의준 코드
class TodoApp{
  constructor() {
    this.isZero();
    this.renderController();
    this.setEvents();
  }

  getStorage() {
    return JSON.parse(localStorage.getItem('list')) ?? [];
  }

  setStorage(list) {
    localStorage.setItem('list', JSON.stringify(list));
  }

  isZero() {
    this.getStorage().length === 0 ? $('footer').style.display = 'none' : $('footer').style.display = 'block';
    this.getStorage().length === 0 ? $('label[for="toggle-all"]').style.display = 'none' : $('label[for="toggle-all"]').style.display = 'block';
  }

  todoFormat(value) {
    return { isFinished: false, value, idx: Math.random() };
  }

  addTodo(event) {
    const $newTodo = $('.new-todo');
    if (event.keyCode !== 13 || !$newTodo.value.trim()) return;
    const formattedTodoForm = this.todoFormat($newTodo.value);
    const currentTodoList = this.getStorage();
    currentTodoList.push(formattedTodoForm);
    this.setStorage(currentTodoList);
    this.renderController();
    this.isZero();
    $newTodo.value = "";
  }

  numberLeftTodoList() {
    let incompletedList = [];
    const currentTodoList = this.getStorage();
    const $todoCount = $('.todo-count');
    currentTodoList.forEach((item) => { if (item.isFinished === false) incompletedList.push(item); });
    incompletedList.length === 1 ? $todoCount.innerHTML = '<span class="todo-count"><strong>1</strong> item left</span>' : $todoCount.innerHTML = `<span class="todo-count"><strong>${incompletedList.length}</strong> items left</span>`;
  }

  deleteTodo(eventTarget) {
    const currentTodoList = this.getStorage();
    const deleteTarget = +eventTarget.closest('.view').dataset.idx;
    const updateTodoList = currentTodoList.filter(({ idx }) => { return idx !== deleteTarget });
    this.setStorage(updateTodoList);
    this.isZero();
    this.renderController();
  }

  editTodo(event) {
    const $li = event.target.closest('li');
    const $input = !$li.querySelector('input.edit') ? document.createElement('input') : $li.querySelector('input.edit');
    $input.value = $li.querySelector('label').textContent;
    $input.classList.add("edit");
    $li.classList.add('editing');
    $li.append($input);
    $input.onblur = (e) => { this.editBlur(e); }
    $input.onkeydown = (e) => { this.updateStorage(e); }
  }

  editBlur(event) {
    event.target.closest('li').classList.remove('editing');
    event.target.remove();
  }

  updateStorage(event) {
    if (event.keyCode !== 13) return;
    if (event.keyCode === 13 && event.target.value == "") return this.deleteTodo(event.target.closest('li').querySelector('button'));
    const $dataIdx = +event.target.closest('li').querySelector('.view').dataset.idx;
    const currentTodoList = this.getStorage();
    const updateTodoList = currentTodoList.map((item) => {
      if (item.idx === $dataIdx) item.value = event.target.value;
      return item;
    });
    this.setStorage(updateTodoList);
    this.renderController();
  }

  changeStatus(event) {
    const currentTodoList = this.getStorage();
    const changeTarget = +event.target.closest('.view').dataset.idx;
    const updateTodoList = currentTodoList.map((item) => {
      if (item.idx === changeTarget) item.isFinished = !item.isFinished;
      return item;
    });
    this.setStorage(updateTodoList);
    this.renderController();
  }

  toggleAllStatus() {
    const isAllFinished = this.getStorage().every(({ isFinished }) => { return isFinished === true });
    isAllFinished && this.getStorage().length > 0 ? $('.toggle-all').checked = true : $('.toggle-all').checked = false;
  }

  toggleAll() {
    const currentTodoList = this.getStorage();
    const isAllFinished = currentTodoList.every(({ isFinished }) => isFinished === true );
    currentTodoList.forEach((item) => { item.isFinished = !isAllFinished; });
    this.setStorage(currentTodoList);
    this.renderController();
  }

  clearCompleted() {
    const currentTodoList = this.getStorage();
    const updateTodoList = currentTodoList.filter(({ isFinished }) => { return isFinished === false; });
    this.setStorage(updateTodoList);
    this.renderController();
    this.isZero();
  }

  renderController() {
    const $filters = [...$$('.filters li a')];
    $filters.forEach(($filter) => { $filter.classList.remove('selected'); });
    const $selectedHref = $filters.find( $filter => $filter.href === location.href );
    $selectedHref ? $selectedHref.classList.add('selected') : $('a[href="#/"]').classList.add('selected');
    if ($('a.selected').textContent === "All") return this.render();
    return this.renderWithFiltering();
  }

  render(renderList = this.getStorage()) {
    const $todoList = $('.todo-list');
    $todoList.innerHTML = '';
    renderList.forEach((todoItem) => {
      const $li = document.createElement('li');
      if (todoItem.isFinished === true) $li.classList.add('completed');
      $li.innerHTML = `
        <div class="view" data-idx=${todoItem.idx}>
          <input class="toggle" type="checkbox" ${todoItem.isFinished === true ? 'checked' : ''} />
          <label>${todoItem.value}</label>
          <button class="destroy"></button>
        </div>
      `;
      $li.querySelector('input').onclick = (e) => { this.changeStatus(e); }
      $li.querySelector('button').onclick = (e) => { this.deleteTodo(e.target); }
      $li.ondblclick = (e) => { this.editTodo(e); }
      $todoList.append($li);
    });
    !$('.completed') ? $('.clear-completed').style.display = "none" : $('.clear-completed').style.display = "block" ;
    this.toggleAllStatus();
    this.numberLeftTodoList();
  }

  renderWithFiltering() {
    let filteredLists = [];
    $('a.selected').textContent === "Active" ? filteredLists = this.getStorage().filter(({ isFinished }) => { return isFinished === false; }) : filteredLists = this.getStorage().filter(({ isFinished }) => { return isFinished === true; });
    this.render(filteredLists);
  }

  setEvents() {
    document.onkeydown = (e) => { this.addTodo(e); }
    $('.clear-completed').onclick = () => { this.clearCompleted(); }
    $('#toggle-all').onchange = () => { this.toggleAll(); }
    window.onhashchange = () => { this.renderController(); }
  }
}

new TodoApp();