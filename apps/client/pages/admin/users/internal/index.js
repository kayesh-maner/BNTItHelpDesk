import React from "react";
import { useQuery } from "react-query";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  usePagination,
} from "react-table";
import ResetPassword from "../../../../components/ResetPassword";
import UpdateUserModal from "../../../../components/UpdateUserModal";
import Link from "next/link";
import { Popconfirm, message } from 'antd';


const fetchUsers = async () => {
  const res = await fetch("/api/v1/users/all");
  return res.json();
};

function DefaultColumnFilter({ column: { filterValue, setFilter } }) {
  return (
    <input
      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
      type="text"
      value={filterValue || ""}
      onChange={(e) => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder="Type to filter"
    />
  );
}
function Table({ columns, data }) {
  const filterTypes = React.useMemo(
    () => ({
      text: (rows, id, filterValue) =>
        rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        }),
    }),
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      defaultColumn, // Be sure to pass the defaultColumn option
      filterTypes,
      initialState: {
        pageIndex: 0,
      },
    },
    useFilters, // useFilters!
    useGlobalFilter,
    usePagination
  );

  return (
    <div className="overflow-x-auto md:-mx-6 lg:-mx-8">
      <div className="py-2 align-middle inline-block min-w-full md:px-6 lg:px-8">
        <div className="shadow overflow-hidden border-b border-gray-200 md:rounded-lg">
          <table
            {...getTableProps()}
            className="min-w-full divide-y divide-gray-200"
          >
            <thead className="bg-gray-50">
              {headerGroups.map((headerGroup) => (
                <tr
                  {...headerGroup.getHeaderGroupProps()}
                  key={headerGroup.headers.map((header) => header.id)}
                >
                  {headerGroup.headers.map((column) =>
                    column.hideHeader === false ? null : (
                      <th
                        {...column.getHeaderProps()}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.render("Header")}
                        {/* Render the columns filter UI */}
                        <div>
                          {column.canFilter ? column.render("Filter") : null}
                        </div>
                      </th>
                    )
                  )}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row, i) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="bg-white">
                    {row.cells.map((cell) => (
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        {...cell.getCellProps()}
                      >
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Auth() {
  const { data, status, refetch } = useQuery("fetchAuthUsers", fetchUsers);

  async function deleteClient(client) {
    const id = client.id;
    try {
      await fetch(`/api/v1/auth/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          refetch;
        });
    } catch (error) {
      (error);
    }
  }

  const columns = React.useMemo(() => [
    {
      Header: "Name",
      accessor: "name",
      width: 10,
      id: "name",
    },
    {
      Header: "Email",
      accessor: "email",
      id: "email",
    },
    {
      Header: "",
      id: "actions",
      Cell: ({ row, value }) => {
        return (
          <div className="space-x-4 flex flex-row">
            <UpdateUserModal user={row.original} />
            <ResetPassword user={row.original} />
            <Popconfirm
              title="Are you sure you want to delete?"
              onConfirm={() => deleteClient(row.cells[0].value)}
            >
              <button
                type="button"
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </Popconfirm>
          </div>
        );
      },
    },
  ]);

  return (
    <div>
      <main
        className="relative z-0 overflow-y-auto focus:outline-none"
        tabIndex="0"
      >
        <div className="py-6">
          <div className="flex flex-row max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">
                Helpdesk  Users
            </h1>
            <div className="ml-4">
              <Link
                href="/admin/users/internal/new"
                className="inline-flex items-center p-1 border border-transparent rounded-md shadow-sm text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                New User
              </Link>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="py-4">
              {status === "loading" && (
                <div className="min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
                  <h2> Loading data ... </h2>
                </div>
              )}

              {status === "error" && (
                <div className="min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
                  <h2 className="text-2xl font-bold">
                    {" "}
                    Error fetching data ...{" "}
                  </h2>
                </div>
              )}

              {status === "success" && (
                <div style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'hidden' }}>
                  <div className="hidden sm:block">
                    <Table columns={columns} data={data.users} />
                  </div>
                 
                  <div className="sm:hidden">
                    {data.users.map((user) => (
                      <div
                        key={user.id}
                        className="flex flex-col text-center bg-white rounded-lg shadow mt-4"
                      >
                        <div className="flex-1 flex flex-col p-8">
                          <h3 className=" text-gray-900 text-sm font-medium">
                            {user.name}
                          </h3>
                          <dl className="mt-1 flex-grow flex flex-col justify-between">
                            <dd className="text-gray-500 text-sm">
                              {user.email}
                            </dd>
                            <dt className="sr-only">Role</dt>
                            <dd className="mt-3">
                              <span className="px-2 py-1 text-blue-800 text-xs font-medium bg-blue-100 rounded-full">
                                {user.isAdmin ? "admin" : "user"}
                              </span>
                            </dd>
                          </dl>
                        </div>
                        <div className="space-x-4 flex flex-row justify-center -mt-8 mb-4">
                          <UpdateUserModal
                            user={user}
                            refetch={() => handleRefresh}
                          />
                          <ResetPassword user={user} />
                          <Popconfirm
                            title="Are you sure you want to delete?"
                            onConfirm={() => deleteClient(user.id)}
                          >
                            <button
                              type="button"
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Delete
                            </button>
                          </Popconfirm>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
