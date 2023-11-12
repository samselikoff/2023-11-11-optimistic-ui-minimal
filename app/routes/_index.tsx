import { type ActionFunctionArgs } from "@remix-run/node";
import { Form, useFetchers, useLoaderData, useSubmit } from "@remix-run/react";
import { db } from "~/db.server";

export async function action({ request }: ActionFunctionArgs) {
  let formData = await request.formData();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  let clientId = formData.get("id") as string;
  let serverId = clientId.replace("optimistic", "server");

  db.todos.push({ id: serverId });

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

    if (typeof id === "string") {
      memo.push({ id });
    }

    return memo;
  }, []);

  let nextId = `optimistic ${todos.length + optimisticTodos.length}`;

  todos = [...todos, ...optimisticTodos];

  return (
    <div className="max-w-sm mx-auto p-8">
      <Form
        onSubmit={(e) => {
          e.preventDefault();

          submit(
            { id: nextId },
            { method: "POST", fetcherKey: nextId, navigate: false }
          );
        }}
      >
        <button className="bg-sky-500 text-white font-medium px-3 py-2">
          Add a todo
        </button>
      </Form>

      <div className="mt-8">
        <p>Todos:</p>

        <ul className="list-disc pl-4 space-y-4">
          {todos
            .slice()
            .reverse()
            .map((todo) => (
              <li key={todo.id}>{todo.id}</li>
            ))}
        </ul>
      </div>
    </div>
  );
}
