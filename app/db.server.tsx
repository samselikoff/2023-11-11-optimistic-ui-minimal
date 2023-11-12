const db = {
  todos: [] as { id: string }[],
};

export async function getTodos() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return db.todos;
}

export async function addTodo(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  db.todos = [...db.todos, { id }];
}
