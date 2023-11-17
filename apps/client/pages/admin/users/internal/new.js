import React, { useState } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import { Listbox } from "@headlessui/react";
import "react-toastify/dist/ReactToastify.css";

export default function CreateUser() {
  //const [open, setOpen] = useState(false);

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [admin, setAdmin] = useState(false);
  const [empType, setEmployeeType] = useState('Employee');


 // State for validation errors
 const [emailError, setEmailError] = useState("");
 const [passwordError, setPasswordError] = useState("");

  const router = useRouter();

  async function createUser() {

    setEmailError("");
    setPasswordError("");

    if (!name || !email || !password) {
      toast.error("Please fill in all required fields", { autoClose: 5000 });
      return;
    }
   
     // Validate email format
     const atSymbolPattern = /@/;

     if (!atSymbolPattern.test(email)) {
       toast.error("Please enter a valid email address ", { autoClose: 5000 });
       return;
     }

     //validate password
     const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
    if (!passwordPattern.test(password)) {
      toast.error(
        "Password must be at least 8 characters long and contain at least one number and one special character",
        { autoClose: 6000 }
      );
      return;
    }

    await fetch("/api/v1/admin/user/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        email,
        name,
        admin,
        empType
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success === true) {
          toast.success("The action was processed successfully!", {
            autoClose: 5000,
          });
        setTimeout(() => {
          router.push("/admin/users/internal");
        }, 2000);
        } else {
          toast.error("There has been an error. Whoops! Please wait and try again!", {
            autoClose: 5000,
          });
        }
      });
  }

  const notificationMethods = [
    { id: "user", title: "user" },
    { id: "admin", title: "admin" },
  ];

  const employeeType = ['Employee','Contractual', 'Consultant',]

  return (
    <div>
    <ToastContainer />
      <div className="sm:flex sm:items-start">
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
          <h3 p className="text-lg leading-6 font-medium text-gray-900">
            Create a new user
          </h3>
          <div className="mt-2 space-y-4">
            <input
              type="text"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-1/2 sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter name here..."
              name="name"
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter email here...."
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && (
              <div className="text-red-500">{emailError}</div>
            )}
            <input
              type="password"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter password here..."
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && (
              <div className="text-red-500">{passwordError}</div>
            )}
<br></br>
            <label className="text-base font-medium text-gray-900 mt-2">
              User Type
            </label>
            <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
              {notificationMethods.map((notificationMethod) => (
                <div key={notificationMethod.id} className="flex items-center">
                  <input
                    id={notificationMethod.id}
                    name="notification-method"
                    type="radio"
                    defaultChecked={notificationMethod.id === "user"}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    value={notificationMethod.id}
                    onChange={(e) =>
                      e.target.value === "admin"
                        ? setAdmin(true)
                        : setAdmin(false)
                    }
                  />
                  <label
                    htmlFor={notificationMethod.id}
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    {notificationMethod.title}
                  </label>
                </div>
              ))}
              
            </div>


            {!admin && (
              <Listbox value={employeeType} onChange={setEmployeeType}>
              <div className="relative">
                <Listbox.Button className="bg-white relative min-w-[154px] w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-1 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <span className="block truncate">
                    {empType ? empType : 'select employee type'}
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg sm:text-sm">
                  {employeeType.map((empType) => (
                    <Listbox.Option
                      key={empType}
                      value={empType}
                      className={({ active, selected }) =>
                        `cursor-pointer select-none relative px-4 py-2 ${
                          active ? 'bg-gray-100' : ''
                        } ${selected ? 'bg-blue-500 text-white' : 'text-gray-900'}`
                      }
                    >
                      {({ selected }) => (
                        <span className={`${selected ? 'font-semibold' : 'font-normal'}`}>
                          {empType}
                        </span>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
        
            )}
           </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={() => {
            createUser();
          }}
        >
          Create
        </button>
      </div>
    </div>
  );
}
