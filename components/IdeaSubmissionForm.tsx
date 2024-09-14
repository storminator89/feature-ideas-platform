// components/IdeaSubmissionForm.tsx
import React, { useState } from 'react'
import { Category } from '@prisma/client'
import TiptapEditor from './TiptapEditor'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`block w-full px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out
            ${errors.title ? 'border-red-300 ring-red-300' : 'border-gray-300'}`}
          placeholder="Enter the title of your idea"
        />
        {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <div className={`${errors.description ? 'ring-2 ring-red-300 rounded-lg' : ''}`}>
          <TiptapEditor onChange={setDescription} initialContent={description} />
        </div>
        {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="relative">
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={`block w-full px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition duration-150 ease-in-out
              ${errors.category ? 'border-red-300 ring-red-300' : 'border-gray-300'}`}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
        {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category}</p>}
      </div>
      <div className="flex items-center justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          Submit Idea
        </button>
      </div>
    </form>
  )
}

export default IdeaSubmissionForm