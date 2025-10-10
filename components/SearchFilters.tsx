'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface SearchFiltersProps {
  currentSort: string
  currentSearch: string
  currentCategory: string
  currentLocation: string
  currentJobType: string
  currentMinScore?: number
}

export function SearchFilters({
  currentSort,
  currentSearch,
  currentCategory,
  currentLocation,
  currentJobType,
  currentMinScore,
}: SearchFiltersProps) {
  const router = useRouter()
  const [search, setSearch] = useState(currentSearch)
  const [category, setCategory] = useState(currentCategory)
  const [location, setLocation] = useState(currentLocation)
  const [jobType, setJobType] = useState(currentJobType)
  const [minScore, setMinScore] = useState(currentMinScore?.toString() || '')
  const [showFilters, setShowFilters] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters()
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const applyFilters = () => {
    const params = new URLSearchParams()
    params.set('sort', currentSort)
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (location) params.set('location', location)
    if (jobType) params.set('job_type', jobType)
    if (minScore) params.set('min_score', minScore)

    router.push(`/jobs?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setLocation('')
    setJobType('')
    setMinScore('')
    router.push(`/jobs?sort=${currentSort}`)
  }

  const hasActiveFilters = currentSearch || currentCategory || currentLocation || currentJobType || currentMinScore

  return (
    <div className="mb-6">
      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs by title, company, or description..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition text-gray-700 font-medium"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">All Categories</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Data">Data</option>
                <option value="Operations">Operations</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco, Remote"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Job Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">All Types</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            {/* Trust Score Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Trust Score
              </label>
              <input
                type="number"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                placeholder="e.g., 10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          {currentSearch && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Search: {currentSearch}
            </span>
          )}
          {currentCategory && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {currentCategory}
            </span>
          )}
          {currentLocation && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {currentLocation}
            </span>
          )}
          {currentJobType && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {currentJobType}
            </span>
          )}
          {currentMinScore !== undefined && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Score ≥ {currentMinScore}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
