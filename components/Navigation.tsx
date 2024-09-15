import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import { Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline'

const Navigation: React.FC = () => {
  const { data: session, status } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (session?.user?.id) {
      router.push(`/profile/${session.user.id}`)
    }
  }

  return (
    <>
      <div className="h-16"></div>
      <nav className={`fixed top-0 left-0 right-0 z-10 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-indigo-600">Feature Ideas</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {status === 'authenticated' && session ? (
                <div className="flex items-center space-x-4">
                  <a 
                    href="#"
                    onClick={handleProfileClick}
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    My Profile
                  </a>
                  {session.user?.role === 'ADMIN' && (
                    <Link 
                      href="/admin" 
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Admin
                    </Link>
                  )}
                  <Popover className="relative">
                    {({ open }: { open: boolean }) => (
                      <>
                        <Popover.Button className="flex items-center text-gray-700 hover:text-indigo-600 focus:outline-none">
                          <UserCircleIcon className="h-8 w-8" />
                        </Popover.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in duration-150"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <Popover.Panel className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <button
                              onClick={handleSignOut}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Sign out
                            </button>
                          </Popover.Panel>
                        </Transition>
                      </>
                    )}
                  </Popover>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Sign in
                </Link>
              )}
            </div>
            <div className="flex items-center sm:hidden">
              <Popover>
                {({ open }: { open: boolean }) => (
                  <>
                    <Popover.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute top-16 inset-x-0 p-2 transition transform origin-top-right md:hidden">
                        <div className="rounded-lg shadow-md bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
                          <div className="px-5 pt-4 flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold text-indigo-600">Feature Ideas</span>
                            </div>
                          </div>
                          <div className="px-2 pt-2 pb-3 space-y-1">
                            {status === 'authenticated' && session ? (
                              <>
                                <a
                                  href="#"
                                  onClick={handleProfileClick}
                                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                >
                                  My Profile
                                </a>
                                {session.user?.role === 'ADMIN' && (
                                  <Link
                                    href="/admin"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                  >
                                    Admin Dashboard
                                  </Link>
                                )}
                                <button
                                  onClick={handleSignOut}
                                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                >
                                  Sign out
                                </button>
                              </>
                            ) : (
                              <Link
                                href="/auth/signin"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                              >
                                Sign in
                              </Link>
                            )}
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navigation
