// src/utils/orderTodos.js
export function orderTodos(todos) {
const arr = [...(todos || [])];
arr.sort((a, b) => {
if (a.completed !== b.completed) return a.completed ? 1 : -1;
const ta = new Date(a.createdAt).getTime() || 0;
const tb = new Date(b.createdAt).getTime() || 0;
return tb - ta;
});
return arr;
}