import React, { useState } from 'react'
import { Category } from '@prisma/client'
import { LightBulbIcon, PencilIcon, FolderIcon } from '@heroicons/react/24/outline'

interface IdeaSubmissionFormProps {
  categories: Category[]
  onSubmit: (idea: { title: string; description: string; categoryId: number }) => void
  onCancel: () => void
}

const IdeaSubmissionForm: React.FC<IdeaSubmissionFormProps> = ({ categories, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (!description.trim()) newErrors.description = 'Description is required'
    if (!categoryId) newErrors.category = 'Category is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        categoryId: parseInt(categoryId, 10),
      })
      setTitle('')
      setDescription('')
      setCategoryId('')
      setErrors({})
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LightBulbIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`pl-10 block w-full rounded-md ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            } focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            placeholder="Enter the title of your idea"
          />
        </div>
        {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
            <PencilIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`pl-10 block w-full rounded-md ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            } focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            placeholder="Describe your idea in detail"
          />
        </div>
        {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FolderIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={`pl-10 block w-full rounded-md ${
              errors.category ? 'border-red-300' : 'border-gray-300'
            } focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category}</p>}
      </div>
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit Idea
        </button>
      </div>
    </form>
  )
}

export default IdeaSubmissionForm