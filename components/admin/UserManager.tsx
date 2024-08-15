import React, { useState } from 'react'
import { PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface User {
  id: number;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface UserManagerProps {
  users: User[]
  onAddUser: (userData: Omit<User, 'id'>) => Promise<void>
  onUpdateUser: (id: number, userData: Partial<User>) => Promise<void>
  onDeleteUser: (id: number) => Promise<void>
}

const UserManager: React.FC<UserManagerProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({ name: '', email: '', role: 'USER' })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newUser.name && newUser.email) {
      await onAddUser(newUser)
      setNewUser({ name: '', email: '', role: 'USER' })
      setIsAdding(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUser) {
      await onUpdateUser(editingUser.id, editingUser)
      setEditingUser(null)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Users</h2>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:scale-105"
            >
              <PlusIcon className="h-5 w-5 inline-block mr-2" />
              Add User
            </button>
          )}
        </div>
        {isAdding && (
          <form onSubmit={handleAddUser} className="mb-6 bg-indigo-50 p-4 rounded-lg shadow-md">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                value={newUser.name || ''}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                placeholder="Name"
                className="px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="Email"
                className="px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value as 'USER' | 'ADMIN'})}
                className="px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out"
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-300 ease-in-out"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </form>
        )}
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition duration-300 ease-in-out">
              {editingUser && editingUser.id === user.id ? (
                <form onSubmit={handleUpdateUser} className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    value={editingUser.name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'USER' | 'ADMIN' })}
                    className="px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-300 ease-in-out"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-lg text-gray-900 font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-2 text-indigo-600 hover:text-indigo-800 focus:outline-none transition duration-300 ease-in-out"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDeleteUser(user.id)}
                      className="p-2 text-indigo-600 hover:text-indigo-800 focus:outline-none transition duration-300 ease-in-out"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default UserManager