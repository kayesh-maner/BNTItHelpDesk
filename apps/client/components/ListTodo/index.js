import React, { useState } from "react";
import { Pagination } from "antd";
import { TrashIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import { useQuery } from "react-query";
import { Tooltip, Upload, message } from "antd";


async function getTodos() {
  const res = await fetch("/api/v1/todo/get");
  
  return res.json();
}

export default function ListTodo() {
  const { status, data, refetch } = useQuery("repoData", getTodos);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(4);
  const [text, setText] = useState("");

  function handleChange(value) {
    if (value <= 1) {
      setMinValue(0);
      setMaxValue(4);
    } else {
      setMinValue((value - 1) * 4);
      setMaxValue(value * 4);
    }
  }

  async function onSubmit() {
    await fetch("/api/v1/todo/create", {
      method: "POST",
      body: JSON.stringify({
        todo: text,
      }),
    }).then(() => {
      refetch();
      setText("");
    });
  }

  async function deleteTodo(id) {
    await fetch(`api/v1/todo/delete/${id}`, {
      method: "POST",
    }).then(() => refetch());
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div>
      <div className="flex flex-row w-full">
        <div className="mt-1 relative w-full space-x-2">
          <input
            type="text"
            name="text"
            id="text"
            className="w-full shadow-sm text-gray-900 bg-gray-100 rounded-lg font-semibold border-none focus:outline-none "
            placeholder="Enter To Do here..."
            onKeyDown={handleKeyDown}
            value={text}
            onSubmit={() => onSubmit()}
            onChange={(e) => {
              if (e.target.value.length <= 50) {
                setText(e.target.value);
              }
            }}
          />
        </div>
      </div>

      {status === "success" && (
        <div>
          <div className="mt-4">
            {data.todos ? (
              data.todos.slice(minValue, maxValue).map((todo) => {
                return (
                  <div
                    className="flex row justify-between mt-1 bg-gray-100 p-2 rounded-lg"
                    key={todo.id}
                  >
                    
                  <Tooltip title={todo.text}>
                    <span
                      className={
                        todo.done
                          ? "line-through text-sm truncate"
                          : "text-sm font-semibold capitalize truncate"
                      }
                    >
                      {todo.text.length > 30 ? `${todo.text.substring(0, 30)}...` : todo.text}
                    </span>
                  </Tooltip>

                    <button
                      onClick={() => deleteTodo(todo.id)}
                      type="button"
                      className="float-right   text-red-600 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                );
              })
            ) : (
              <p>Not Found</p>
            )}
          </div>
          <div  className={data.todos.length > 4 ? "mt-4" : "hidden"}>
            <Pagination
              defaultCurrent={1}
              total={data.todos.length}
              pageSize={4}
              onChange={handleChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
