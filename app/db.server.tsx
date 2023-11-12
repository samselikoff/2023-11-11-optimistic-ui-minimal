const db = {
  todos: [] as { id: string }[],
};

export async function getTodos() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return clone(db.todos);
}

export async function addTodo(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  db.todos = [...clone(db.todos), { id }];
}

function clone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}
