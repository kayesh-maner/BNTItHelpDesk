import React, { useState, useEffect, Fragment, useRef } from 'react'
import { Dialog, Transition, Listbox } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/20/solid'
import useTranslation from 'next-translate/useTranslation'
import { RichTextEditor, Link } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react'
import Highlight from '@tiptap/extension-highlight'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
// import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript'
import SubScript from '@tiptap/extension-subscript'
import { notifications } from '@mantine/notifications'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
// import Select from 'react-select';
import { Select } from '@mantine/core'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function CreateTicketModal() {
  const { t, lang } = useTranslation('peppermint')

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [company, setCompany] = useState()
  const [engineer, setEngineer] = useState('admin')
  const [email, setEmail] = useState('')
  const [ccEmail, setCcEmail] = useState('')
  const [issue, setIssue] = useState(t('ticket_extra_details'))
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [options, setOptions] = useState([])
  const [admin, setAdmin] = useState()
  const [category, setCategory] = useState()
  const [fileAttached, setFileAttached] = useState()
  const [isPlaceholderVisible, setPlaceholderVisible] = useState(true)
  const router = useRouter()
  const [isButtonClicked, setIsButtonClicked] = useState(false)

  const categoryList = process.env.NEXT_PUBLIC_CATEGORYLIST.split(',')

  // Get session data
  const { data: session } = useSession()
  const maxCharLimit = 667
  const [remainingChars, setRemainingChars] = useState(maxCharLimit - 7)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Type your text here...' }),
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
    ],
    content: issue,
    onUpdate({ editor }) {
      setIssue(editor.getHTML())
      const newContent = editor.getHTML()
      const cleanedHTML = editor.getHTML().trim()

      setRemainingChars(maxCharLimit - newContent.length)
      // Check if the editor content is an empty paragraph with this 7 char unnecessary data (<p></p>)
      // If true, set remainingChars to a specific value maxCharLimit and remove this unnecessary data length (<p></p>)

      if (cleanedHTML === '<p></p>') {
        setRemainingChars(maxCharLimit - 7)
      }
    },
  })

  const fetchClients = async () => {
    await fetch(`/api/v1/clients/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res) {
          setOptions(res.clients)
        }
      })
  }

  async function fetchUsers() {
    try {
      await fetch(`/api/v1/users/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((res) => {
          // Filter only Admins
          const filteredUsers = res.users.filter((user) => user.isAdmin === true)
          if (filteredUsers) {
            setAdmin(filteredUsers)
          }

          // Filter only Users
          const filteredAdmins = res.users.filter((user) => user.isAdmin === false)
          if (filteredAdmins) {
            setGoal(filteredAdmins)
          }
        })
    } catch (error) {
      console.log(error)
    }
  }

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0]
    if (e.target.files.length > 0) {
      setFileAttached(e.target.files[0].name)
    } else {
      setSelectedFileName(null)
    }
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('/api/v1/upload/new', {
        method: 'POST',
        body: formData,
      })

      if (response.status === 200) {
        await response.json()
      } else {
        console.error('File upload failed')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  async function createTicket() {
    try {
      if (editor.getHTML().length > maxCharLimit) {
        notifications.show({
          title: 'Error',
          message: `Exceeded maximum character limit`,
          color: 'red',
          autoClose: 5000,
        })
        return
      }
      const errorMessages = []

      if (!name) {
        errorMessages.push('Name is required')
      }

      if (!title) {
        errorMessages.push('Title is required')
      }

      if (!category) {
        errorMessages.push('Please select a category')
      }

      if (!email) {
        errorMessages.push('Email is required')
      }

      if (!issue) {
        errorMessages.push('Please describe your issue')
      }

      if (errorMessages.length > 0) {
        errorMessages.forEach((errorMessage) => {
          notifications.show({
            message: `❌ ${errorMessage}`,
            color: 'red',
            autoClose: 5000,
          })
        })
        return
      }

      // Disable create Ticket button
      setIsButtonClicked(true)

      await fetch('/api/v1/ticket/create', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name,
          title,
          email: !session.user.isAdmin ? session.user.email : email,
          detail: issue,
          priority,
          engineer: admin[0],
          category,
          fileAttached,
          ccemail: ccEmail,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success === true) {
            notifications.show({
              title: 'Ticket Created',
              message: 'Ticket created successfully',
              color: 'green',
              autoClose: 5000,
            })
            setTimeout(() => {
              router.push(`/tickets/${res.ticket.id}`)
            }, 1000)
          } else {
            notifications.show({
              title: 'Error',
              message: `Error: ${res.error}`,
              color: 'red',
              autoClose: 5000,
            })
          }
        })
    } catch (err) {
      // enable create Ticket button
      setIsButtonClicked(false)
      console.log('Catch Error >>>', err)
    }
  }

  const optionsContacts = Array.isArray(goal)
    ? goal.map((item) => {
        return {
          value: item.name,
          label: item.name,
          uid: item.id,
          email: item.email,
          reporting: item.reporting,
        }
      })
    : []

  const handleNameChange = (selectedOption) => {
    const filtered = optionsContacts.filter((f) => f.value == selectedOption)
    setName(filtered[0]?.value)
    setEmail(filtered[0]?.email)
    if (selectedOption?.reporting === null) {
      setCcEmail('')
    } else {
      setCcEmail(filtered[0]?.reporting)
    }
  }

  useEffect(() => {
    fetchClients()
    fetchUsers()
    setName(!session.user.isAdmin ? session.user.name : name)
    setEmail(!session.user.isAdmin ? session.user.email : email)
    setCcEmail(!session.user.isAdmin ? session.user.reporting : ccEmail)
  }, [])

  return (
    <div className='inline-block bg-white rounded-lg px-8 py-4 text-left shadow-xl align-middle 2xl:max-w-6xl w-full '>
      <div className='flex flex-row w-full'>
        <span className='text-md pb-2 font-bold text-xl'>{t('ticket_new')}</span>
      </div>

      <input
        type='text'
        name='title'
        placeholder={t('ticket_details')}
        maxLength={64}
        autocomplete='off'
        onChange={(e) => setTitle(e.target.value)}
        className='w-full pl-0 pr-0 sm:text-xl border-none focus:outline-none focus:shadow-none focus:ring-0 focus:border-none'
      />

      <div className=''>
        {session.user.isAdmin ? (
          <>
            {/* Admin view */}

            <Select
              name='name'
              autoComplete='off'
              placeholder='Select or search Employee Name'
              onChange={handleNameChange}
              data={optionsContacts}
              searchable
              filterOption={(inputValue, option) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
              }
            />

            <input
              type='text'
              name='email'
              placeholder={t('ticket_email_manager')}
              className='w-full pl-0 pr-0 sm:text-sm border-none focus:outline-none focus:shadow-none focus:ring-0 focus:border-none'
              value={email}
              disabled
            />

            <input
              type='text'
              name='ccEmail'
              placeholder={t('ticket_email_cc')}
              className='w-full pl-0 pr-0 sm:text-sm border-none focus:outline-none focus:shadow-none focus:ring-0 focus:border-none'
              value={ccEmail}
              disabled
            />
          </>
        ) : (
          <>
            {/* Non-admin view */}
            <input
              type='text'
              id='name'
              placeholder={t('ticket_name_here')}
              name='name'
              autocomplete='off'
              onChange={(e) => setName(e.target.value)}
              className=' w-full pl-0 pr-0 sm:text-sm border-none focus:outline-none focus:shadow-none focus:ring-0 focus:border-none'
              value={!session.user.isAdmin ? session.user.name : name}
            />

            <input
              type='text'
              name='email'
              placeholder={t('ticket_email_manager')}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full pl-0 pr-0 sm:text-sm border-none focus:outline-none focus:shadow-none focus:ring-0 focus:border-none'
              value={!session.user.isAdmin ? session.user.email : email}
            />

            <input
              type='text'
              name='ccEmail'
              placeholder={t('ticket_email_cc')}
              onChange={(e) => setCcEmail(e.target.value)}
              className='w-full pl-0 pr-0 sm:text-sm border-none focus:outline-none focus:shadow-none focus:ring-0 focus:border-none'
              value={!session.user.isAdmin ? session.user.reporting : ccEmail}
            />
          </>
        )}

        <div
          className='flex flex-row space-x-4 pb-2 mt-2'
          sx={{ marginTop: '10px', marginBottom: '10px' }}
        >
          <Listbox value={categoryList} onChange={setCategory}>
            <div className='relative'>
              <Listbox.Button className='bg-white relative min-w-[164px] w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-1 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'>
                <span className='block truncate'>{category ? category : 'Select a Category'}</span>
                <span className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                  <svg
                    className='h-5 w-5 text-gray-500'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path d='M19 9l-7 7-7-7'></path>
                  </svg>
                </span>
              </Listbox.Button>
              <Listbox.Options className='absolute z-10 mt-2 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg'>
                {categoryList.map((category) => (
                  <Listbox.Option
                    key={category}
                    value={category}
                    className={({ active, selected }) =>
                      `cursor-pointer select-none relative px-4 py-2 ${
                        active ? 'bg-gray-100' : ''
                      } ${selected ? 'bg-blue-500 text-white' : 'text-gray-900'}`
                    }
                  >
                    {({ selected }) => (
                      <span className={`${selected ? 'font-semibold' : 'font-normal'}`}>
                        {category}
                      </span>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>

          <div className='relative'>
            <input
              type='file'
              accept='image/png, image/jpeg'
              onChange={handleFileUpload}
              className='hidden'
              id='fileInput'
            />
            <label
              htmlFor='fileInput'
              className='bg-blue-500 text-white min-w-[164px] w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-3 py-1 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
            >
              Select File
            </label>
            {fileAttached && <p className='mt-2'>Selected File: {fileAttached}</p>}
          </div>
        </div>

        <RichTextEditor editor={editor}>
          <RichTextEditor.Toolbar>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.ClearFormatting />
              <RichTextEditor.Highlight />
              <RichTextEditor.Code />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H1 />
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
              <RichTextEditor.H4 />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Blockquote />
              <RichTextEditor.Hr />
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
              <RichTextEditor.Subscript />
              <RichTextEditor.Superscript />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>

            {/* <RichTextEditor.ControlsGroup>
              <RichTextEditor.AlignLeft />
              <RichTextEditor.AlignCenter />
              <RichTextEditor.AlignJustify />
              <RichTextEditor.AlignRight />
            </RichTextEditor.ControlsGroup> */}
          </RichTextEditor.Toolbar>

          {/* <RichTextEditor.Content style={{ minHeight: 190 }} placeholder="Type your text here..." /> */}
          <RichTextEditor.Content style={{ minHeight: 190 }} />
        </RichTextEditor>

        <span style={{ color: remainingChars < 0 ? 'red' : 'green', marginTop: '5px' }}>
          {remainingChars < 0
            ? 'Exceeded character limit!'
            : `${remainingChars} characters remaining`}
        </span>
        <div className='border-gray-300 '>
          <div className='mt-2 float-right'>
            <button
              onClick={() => {
                createTicket()
              }}
              type='button'
              className='inline-flex justify-center rounded-md shadow-sm px-2.5 py-1.5 border border-transparent text-xs bg-blue-600 font-medium text-white hover:bg-blue-700 focus:outline-none '
              disabled={isButtonClicked}
            >
              Create Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
