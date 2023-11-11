import { type ActionFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
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
  let todos = useLoaderData<typeof loader>();
  let [optimisticTodos, setOptimisticTodos] = useState<{ id: string }[]>([]);
  let fetcher = useFetcher();
  let nextId = todos.length + optimisticTodos.length;

  todos = [...todos, ...optimisticTodos];

  if (fetcher.state === "idle" && fetcher.data && optimisticTodos.length > 0) {
    setOptimisticTodos([]);
  }

  return (
    <div className="max-w-sm mx-auto p-8">
      <fetcher.Form
        onSubmit={(e) => {
          e.preventDefault();

          let id = `optimistic ${nextId}`;

          setOptimisticTodos((todos) => [...todos, { id }]);

          fetcher.submit({ id }, { method: "POST" });
        }}
      >
        <button className="bg-sky-500 text-white font-medium px-3 py-2">
          Add a todo
        </button>
      </fetcher.Form>

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
