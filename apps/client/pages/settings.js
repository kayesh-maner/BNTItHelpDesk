import React, { useState } from 'react'
import { message } from 'antd'
import { useRouter } from 'next/router'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { signOut, useSession } from 'next-auth/react'

import { UserProfile } from '../components/UserProfile'
import UserNotifications from '../components/UserNotifications'

export default function Settings() {
  const { data: session } = useSession()
  const [isButtonClicked, setIsButtonClicked] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const linkStyles = {
    active:
      'w-full bg-teal-50 border-teal-500 text-teal-700 hover:bg-teal-50 hover:text-teal-700 group border-l-4 px-3 py-2 flex items-center text-sm font-medium',
    inactive:
      'w-full border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group mt-1 border-l-4 px-3 py-2 flex items-center text-sm font-medium',
  }
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [check, setCheck] = useState('')

  const [show, setShow] = useState('profile')

  const success = () => {
    message.success('Password updated')
  }

  const fail = (f) => {
    message.error(`${f}`)
  }

  const postData = async () => {
    try {
      if (!password || !check) {
        fail('password can not be empty')
        return
      }

      //validate password
      const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/
      if (!passwordPattern.test(password)) {
        fail(
          'Password must be at least 8 characters long and contain at least one number and one special character'
        )
        return
      }

      // Disable create Ticket button
      setIsButtonClicked(true)
      const id = session.user.id

      if (check === password) {
        await fetch(`/api/v1/users/resetpassword`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password,
            id,
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.failed === false) {
              success()
              signOut()
            } else {
              fail(res.message)
            }
          })
      } else {
        fail('Passwords are not the same')
      }
    } catch (err) {
      // enable create Ticket button
      setIsButtonClicked(false)
      console.log('Error >>>', err)
    }
  }

  return (
    <div>
      <main className='relative'>
        <div className='max-w-screen-xl mx-auto pb-6 px-4 sm:px-6 lg:pb-16 lg:px-8'>
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <div className='divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x'>
              <aside className='py-6 lg:col-span-3'>
                <nav>
                  <button
                    onClick={() => {
                      setShow('profile')
                    }}
                    className={show === 'profile' ? linkStyles.active : linkStyles.inactive}
                    aria-current='page'
                  >
                    <svg
                      className='text-teal-500 group-hover:text-teal-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      aria-hidden='true'
                    >
                      <path
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        stroke-width='2'
                        d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    <span className='truncate'>Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setShow('notifications')
                    }}
                    className={show === 'notifications' ? linkStyles.active : linkStyles.inactive}
                    aria-current='page'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      stroke-width='2'
                      className='flex-shrink-0 -ml-1 mr-3 h-6 w-6'
                    >
                      <path
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                      />
                    </svg>
                    <span className='truncate'>Notifications</span>
                  </button>

                  <button
                    onClick={() => {
                      setShow('password')
                    }}
                    className={show === 'password' ? linkStyles.active : linkStyles.inactive}
                  >
                    <svg
                      className=' flex-shrink-0 -ml-1 mr-3 h-6 w-6'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      aria-hidden='true'
                    >
                      <path
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        stroke-width='2'
                        d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
                      />
                    </svg>
                    <span className='truncate'>Password</span>
                  </button>
                  <button
                    onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                    className={linkStyles.inactive}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className=' flex-shrink-0 -ml-1 mr-3 h-6 w-6'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                      />
                    </svg>
                    <span className='truncate'>Log Out</span>
                  </button>
                </nav>
              </aside>

              <div className=' lg:col-span-9'>
                <div className={`${show === 'profile' ? '' : 'hidden'}`}>
                  <UserProfile />
                </div>

                <div className={`${show === 'notifications' ? '' : 'hidden'}`}>
                  <UserNotifications />
                </div>

                <div className={`${show === 'password' ? 'pb-12' : 'hidden'}`}>
                  <div className='m-2 space-y-4 p-4 relative'>
                    <div className='mt-2 space-y-4'>
                      <div className='relative'>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md pl-10'
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder='Enter users new password'
                        />
                        <div className='absolute top-1/2 right-2 transform -translate-y-1/2'>
                          {showPassword ? (
                            <FaEye
                              className='h-5 w-5 text-gray-500 cursor-pointer'
                              onMouseDown={togglePasswordVisibility}
                              onMouseUp={() => clearInterval()}
                            />
                          ) : (
                            <FaEyeSlash
                              className='h-5 w-5 text-gray-500 cursor-pointer'
                              onMouseDown={togglePasswordVisibility}
                              onMouseUp={() => clearInterval()}
                            />
                          )}
                        </div>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md pl-10'
                        onChange={(e) => setCheck(e.target.value)}
                        placeholder='Confirm users password'
                      />
                    </div>

                    <button
                      type='button'
                      className='mb-4 float-right w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm'
                      onClick={() => postData()}
                      disabled={isButtonClicked}
                    >
                      Update
                    </button>
                  </div>
                </div>

                <div className={`${show === 'notifications' ? '' : 'hidden'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
