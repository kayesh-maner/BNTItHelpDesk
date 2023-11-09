import { useQuery } from "react-query";
import moment from "moment";
import { useRouter } from "next/router";
import { Link } from "next/link";

async function fetchNotebooks() {
  const res = await fetch("/api/v1/note/get-notes");
  return res.json();
}

export default function NoteBooksIndex() {
  const { data, status, error, refetch } = useQuery(
    "getUsersNotebooks",
    fetchNotebooks
  );

  const router = useRouter();

  async function deleteNotebook(id) {
    if (window.confirm("Do you really want to delete this notebook?")) {
      const res = await fetch(`/api/v1/note/${id}/delete`).then((res) =>
        res.json()
      );
      (res);
      refetch();
    }
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Notebook
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Below is a list of your private notebooks that only you can access
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <a
              href="/notebook/new"
              className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              New Note
            </a>
          </div>
        </div>
        {status === "success" && (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="hidden md:inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                {data.notebooks.length > 0 && (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                        >
                          <span className="ml-4">Title</span>
                        </th>
                        <th
                          scope="col"
                          className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Created On
                        </th>
                        <th
                          scope="col"
                          className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Last Updated
                        </th>
                        <th
                          scope="col"
                          className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                        ></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {data.notebooks.map((note) => (
                        <tr
                          key={note.id}
                          className="hover:bg-gray-200 hover:cursor-pointer"
                          onClick={() => router.push(`/notebook/${note.id}`)}
                        >
                          <td className="whitespace-nowrap py-2 ml-4 -pl-4 text-sm text-gray-500 sm:pl-0">
                            <span className="ml-4">{note.title}</span>
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
                            {moment(note.createdAt).format("DD-MM-YYYY")}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
                            {moment(note.updatedAt).format("DD-MM-YYYY")}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
                            <button
                              type="button"
                              onClick={() => deleteNotebook(note.id)}
                              className="rounded z-50 bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
