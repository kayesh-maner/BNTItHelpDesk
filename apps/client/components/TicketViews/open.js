import React from "react";
import { useQuery } from "react-query";
import Link from "next/link";
import Loader from "react-spinners/ClipLoader";
import { useRouter } from "next/router";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  usePagination,
} from "react-table";
import moment from "moment";

import TicketsMobileList from "../../components/TicketsMobileList";
import { PaperClipIcon } from "@heroicons/react/20/solid";

async function getUserTickets() {
  const res = await fetch("/api/v1/ticket/open");
  return res.json();
}

function Table({ columns, data }) {
  const router = useRouter();

  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      // fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
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
      // Let's set up our default Filter UI
      // Filter: DefaultColumnFilter,
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
    state: { pageIndex, pageSize, globalFilter },
    setGlobalFilter
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
              <tr>
                <th colSpan={columns.length} className="text-right">
                  <label htmlFor="search" className="sr-only">
                    Search :
                  </label>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    value={globalFilter || ""}
                    onChange={(e) => setGlobalFilter(e.target.value || undefined)}
                    placeholder="Search..."
                    className="p-2 px-2 m-2 border border-gray-300 rounded-md w-80"
                  />
                </th>
              </tr>
              {headerGroups.map((headerGroup) => (
                <tr
                  {...headerGroup.getHeaderGroupProps()}
                  key={headerGroup.headers.map((header) => header.id)}
                >
                  {headerGroup.headers.map((column) =>
                    column.hideHeader === false ? null : (
                      <th
                        {...column.getHeaderProps()}
                        style={{ maxWidth: 10, overflow: "hidden" }}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.render("Header")}
                        {/* <div>
                          {column.canFilter ? column.render("Filter") : null}
                        </div> */}
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
                  <tr
                    {...row.getRowProps()}
                    className="bg-white hover:bg-gray-100 hover:cursor-pointer"
                    onClick={() => {
                      router.push(`/tickets/${row.original.id}`);
                    }}
                  >
                    {row.cells.map((cell) => (
                      <td
                        style={{ maxWidth: 240 }}
                        className="px-6 py-4 whitespace-nowrap truncate text-sm font-medium text-gray-900"
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

          <nav
            className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
            aria-label="Pagination"
          >
            <div className="hidden sm:block">
              <div className="flex flex-row items-center flex-nowrap w-full space-x-2">
                <span
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 "
                >
                  Show
                </span>
                <div className="pl-4">
                  <select
                    id="location"
                    name="location"
                    className="block w-full h-10 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                    }}
                  >
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        {pageSize}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
              <button
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                type="button"
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
              >
                Previous
              </button>
              <button
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                type="button"
                onClick={() => nextPage()}
                disabled={!canNextPage}
              >
                Next
              </button>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default function OpenTickets() {
  const { data, status, error } = useQuery("userTickets", getUserTickets);

  const high = "bg-red-100 text-red-800";
  const low = "bg-blue-100 text-blue-800";
  const normal = "bg-blue-100 text-blue-800";

  const columns = React.useMemo(() => [
    {
      Header: "Sr No",
      accessor: "summary",
      id: "srno",
      Cell: ({ row}) => {
        return (
          <>
            <span className="max-w-[240px] truncate">{row.index + 1}</span>
          </>
        );
      },
    },
    // {
    //   Header: "Type",
    //   accessor: "type",
    //   id: "type",
    //   width: 50,
    // },
    {
      Header: "Summary",
      accessor: "title",
      id: "summary",
      Cell: ({ row, value }) => {
        (row);
        return (
          <>
            <span className="max-w-[240px] truncate">{value}</span>
          </>
        );
      },
    },
    {
      Header: "Attachment",
      accessor: "filePath",
      id: "fileLocation",
      Cell: ({ row, value }) => {
        (row);
        return (
          <>
            <span className="max-w-[240px] truncate">{value &&(<PaperClipIcon 
              fontSize='10px'
              className="flex-shrink-0 mr-1.5 h-5 w-5 text-black-400 flex justify-center"
              />)}</span>
          </>
        );
      },
    },
    {
      Header: "Assignee",
      accessor: "assignedTo.name",
      id: "assignee",
      Cell: ({ row, value }) => {
        (row);
        return (
          <>
            <span className="w-[80px] truncate">{value ? value : "n/a"}</span>
          </>
        );
      },
    },
    {
      Header: "Priority",
      accessor: "priority",
      id: "priority",
      Cell: ({ row, value }) => {
        let p = value;
        let badge;

        if (p === "Low") {
          badge = low;
        }
        if (p === "Normal") {
          badge = normal;
        }
        if (p === "High") {
          badge = high;
        }

        return (
          <>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge}`}
            >
              {value}
            </span>
          </>
        );
      },
    },
    {
      Header: "Status",
      accessor: "status",
      id: "status",
      Cell: ({ row, value }) => {
        let p = value;
        let badge;

        return (
          <>
            <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
              {value === "needs_support" && <span>Needs Support</span>}
              {value === "in_progress" && <span>In Progress</span>}
              {value === "in_review" && <span>In Review</span>}
              {value === "done" && <span>Done</span>}
            </span>
          </>
        );
      },
    },
    {
      Header: "Created",
      accessor: "createdAt",
      id: "created",
      Cell: ({ row, value }) => {
        const now = moment(value).format("DD/MM/YYYY");
        return (
          <>
            <span className="">{now}</span>
          </>
        );
      },
    },
    {
      Header: "Updated On",
      accessor: "updatedAt",
      id: "updated",
      Cell: ({ row, value }) => {
        const now = moment(value).format("DD/MM/YYYY");
        return (
          <>
            <span className="">{now}</span>
          </>
        );
      },
    },
    // {
    //   Header: "",
    //   id: "actions",
    //   Cell: ({ row, value }) => {
    //     (row)
    //     return (
    //       <>
    //         <Link href={`/tickets/${row.original.id}`}>View</Link>
    //       </>
    //     );
    //   },
    // },
  ]);

  return (
    <>
      {status === "success" && (
        <>
          {data.tickets && data.tickets.length > 0 && (
            <>
              <div className="hidden sm:block ">
                <Table columns={columns} data={data.tickets} />
              </div>

              <div className="sm:hidden">
                <TicketsMobileList tickets={data.tickets} />
              </div>
            </>
          )}

          {data.tickets.length === 0 && (
            <>
              <div className="text-center mt-72">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  You currently don't have any assigned tickets. :)
                </h3>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
