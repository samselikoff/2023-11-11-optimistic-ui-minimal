import { type ActionFunctionArgs } from "@remix-run/node";
import { Form, useFetchers, useLoaderData, useSubmit } from "@remix-run/react";
import { addTodo, getTodos } from "~/db.server";

export async function action({ request }: ActionFunctionArgs) {
  let formData = await request.formData();
  let id = formData.get("id") as string;

  await addTodo(id);

  return true;
}

export function loader() {
  return getTodos();
}

export default function Index() {
  let submit = useSubmit();
  let todos = useLoaderData<typeof loader>();
  let fetchers = useFetchers();

  let optimisticTodos = fetchers.reduce<{ id: string }[]>((memo, f) => {
    let id = f.formData?.get("id");

    // race condition: only include pending todos that haven't already been revalidated by earlier fetchers
    if (typeof id === "string" && !todos.map((t) => t.id).includes(id)) {
      memo.push({ id });
    }

    return memo;
  }, []);

  todos = [...todos, ...optimisticTodos];

  return (
    <div className="max-w-lg mx-auto p-8">
      <Form
        onSubmit={(e) => {
          e.preventDefault();

          let id = `${todos.length}`;

          submit({ id }, { method: "POST", fetcherKey: id, navigate: false });
        }}
      >
        <button className="bg-sky-500 text-white font-medium px-3 py-2">
          Add a todo
        </button>
      </Form>

      <div className="mt-8">
        <p>Todos:</p>

        <ul className="list-disc pl-4 space-y-4 mt-4">
          {todos
            .slice()
            .reverse()
            .map((todo) => (
              <li
                key={todo.id}
                className={`transition ${
                  optimisticTodos.includes(todo) ? "opacity-25" : ""
                }`}
              >
                Todo {todo.id}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
