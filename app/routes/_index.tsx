import { type ActionFunctionArgs } from "@remix-run/node";
import { Form, useFetchers, useLoaderData, useSubmit } from "@remix-run/react";
import { db } from "~/db.server";

export async function action({ request }: ActionFunctionArgs) {
  let formData = await request.formData();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  let clientId = formData.get("id") as string;

  db.todos.push({ id: clientId });

  return true;
}

export function loader() {
  return db.todos;
}

export default function Index() {
  let submit = useSubmit();
  let todos = useLoaderData<typeof loader>();
  let fetchers = useFetchers();
  let optimisticTodos = fetchers.reduce<{ id: string }[]>((memo, f) => {
    let id = f.formData?.get("id");

    if (todos.map((t) => t.id).includes(id)) {
      console.log(todos);
      console.log(fetchers);
      debugger;
      // console.log("BUG");
    }

    if (typeof id === "string") {
      memo.push({ id });
    }

    return memo;
  }, []);

  todos = [...todos, ...optimisticTodos];

  // console.log(
  //   todos.map((t) => `${t.id} ${optimisticTodos.includes(t) ? "*" : ""}`)
  // );

  return (
    <div className="max-w-lg mx-auto p-8">
      <Form
        onSubmit={(e) => {
          e.preventDefault();

          let tempId = window.crypto.randomUUID();

          submit(
            { id: tempId },
            { method: "POST", fetcherKey: tempId, navigate: false }
          );
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
                className={optimisticTodos.includes(todo) ? "opacity-25" : ""}
              >
                {todo.id}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
