import React, { useState } from 'react'
import { PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Category {
  id: number;
  name: string;
}

interface CategoryManagerProps {
  categories: Category[]
  onAddCategory: (name: string) => Promise<void>
  onUpdateCategory: (id: number, name: string) => Promise<void>
  onDeleteCategory: (id: number) => Promise<void>
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newCategoryName.trim()) {
      await onAddCategory(newCategoryName.trim())
      setNewCategoryName('')
      setIsAdding(false)
    }
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCategory && editingCategory.name.trim()) {
      await onUpdateCategory(editingCategory.id, editingCategory.name.trim())
      setEditingCategory(null)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Categories</h2>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:scale-105"
            >
              <PlusIcon className="h-5 w-5 inline-block mr-2" />
              Add Category
            </button>
          )}
        </div>
        {isAdding && (
          <form onSubmit={handleAddCategory} className="mb-6 bg-indigo-50 p-4 rounded-lg shadow-md">
            <div className="flex items-center">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                className="flex-grow px-4 py-2 border border-indigo-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out"
              >
                <CheckIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-300 ease-in-out"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        )}
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id} className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition duration-300 ease-in-out">
              {editingCategory && editingCategory.id === category.id ? (
                <form onSubmit={handleUpdateCategory} className="flex items-center p-4">
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="flex-grow px-4 py-2 border border-indigo-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-300 ease-in-out"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-4">
                  <span className="text-lg text-gray-900 font-medium">{category.name}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="p-2 text-indigo-600 hover:text-indigo-800 focus:outline-none transition duration-300 ease-in-out"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(category.id)}
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

export default CategoryManager