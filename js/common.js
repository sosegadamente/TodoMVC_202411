const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const $createElement = (el, attr = {}) => { Object.assign(document.createElement(el), attr) };

// export { $, $$ }