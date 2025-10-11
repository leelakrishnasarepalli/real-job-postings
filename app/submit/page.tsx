'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jobPostingSchema, type JobPostingFormData } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'

export default function SubmitJobPage() {
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      job_type: 'remote',
    },
  })

  const fetchMetadata = async (url: string) => {
    setIsLoadingMetadata(true)
    setError(null)
    try {
      const response = await fetch('/api/scrape-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) throw new Error('Failed to fetch metadata')

      const data = await response.json()

      if (data.title) setValue('title', data.title)
      if (data.company) setValue('company', data.company)
      if (data.description) setValue('description', data.description)
      showToast('success', 'Job details fetched successfully!')
    } catch (err) {
      console.error('Failed to fetch metadata:', err)
      const errorMsg = 'Could not fetch job details. Please fill in manually.'
      setError(errorMsg)
      showToast('warning', errorMsg)
    } finally {
      setIsLoadingMetadata(false)
    }
  }

  const onSubmit = async (data: JobPostingFormData) => {
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Ensure user has a profile (create if doesn't exist)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            avatar_url: user.user_metadata?.avatar_url || '',
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw new Error('Failed to create user profile. Please contact support.')
        }
      }

      const { data: jobPosting, error: insertError } = await supabase
        .from('job_postings')
        .insert({
          user_id: user.id,
          url: data.url,
          title: data.title,
          company: data.company,
          description: data.description || null,
          category: data.category || null,
          location: data.location || null,
          job_type: data.job_type,
        })
        .select()
        .single()

      if (insertError) throw insertError

      showToast('success', 'Job posted successfully!')
      router.push(`/jobs/${jobPosting.id}`)
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to submit job posting'
      setError(errorMsg)
      showToast('error', errorMsg)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Submit a Job Posting</h1>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* URL Field */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                Job Posting URL *
              </label>
              <div className="flex gap-2">
                <input
                  {...register('url', {
                    onBlur: (e) => {
                      const url = e.target.value.trim()
                      if (url && !errors.url) {
                        fetchMetadata(url)
                      }
                    },
                  })}
                  type="url"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/jobs/software-engineer"
                />
              </div>
              {errors.url && (
                <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
              )}
              {isLoadingMetadata && (
                <p className="mt-1 text-sm text-gray-500">Fetching job details...</p>
              )}
            </div>

            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Senior Software Engineer"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Company Field */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                {...register('company')}
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Acme Inc."
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the role..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Category Field */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category (Optional)
              </label>
              <input
                {...register('category')}
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Engineering, Design, Marketing, etc."
              />
            </div>

            {/* Location Field */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location (Optional)
              </label>
              <input
                {...register('location')}
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="San Francisco, CA or Worldwide"
              />
            </div>

            {/* Job Type Field */}
            <div>
              <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-1">
                Job Type *
              </label>
              <select
                {...register('job_type')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Job Posting'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
