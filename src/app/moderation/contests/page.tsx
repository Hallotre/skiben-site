'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Contest } from '@/types'
import RoleGuard from '@/components/auth/RoleGuard'
import DashboardLayout from '@/components/moderation/DashboardLayout'

export default function ContestsManagementPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchContests()
  }, [])

  const fetchContests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching contests:', error)
        setContests([])
      } else {
        setContests(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (contestId: string) => {
    if (!confirm('Are you sure you want to delete this contest?')) return

    try {
      const { error } = await supabase
        .from('contests')
        .delete()
        .eq('id', contestId)

      if (error) throw error
      fetchContests()
    } catch (error) {
      console.error('Error deleting contest:', error)
    }
  }

  const handleStatusChange = async (contestId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      const { error } = await supabase
        .from('contests')
        .update({ status: newStatus })
        .eq('id', contestId)

      if (error) throw error
      fetchContests()
    } catch (error) {
      console.error('Error updating contest:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading contests...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard requiredRoles={['STREAMER', 'ADMIN']}>
      <DashboardLayout>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🎯 Contest Management</h1>
              <p className="text-gray-300">Create and manage video contests</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              + Create Contest
            </button>
          </div>

          {contests.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No contests created yet</p>
              <p className="text-gray-500 mb-6">Create your first contest to start collecting submissions</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Create Contest
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {contests.map((contest) => (
                <div key={contest.id} className="bg-dark-700 border border-dark-600 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`${
                          contest.status === 'ACTIVE' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-gray-600 text-white'
                        } px-3 py-1 rounded text-xs font-bold uppercase`}>
                          {contest.status}
                        </span>
                        <span className="text-sm text-gray-400">
                          Created: {new Date(contest.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mb-3">
                        <span className="text-primary-500 font-semibold text-sm uppercase">
                          ALERT CONTEST
                        </span>
                      </div>

                      <h3 className="text-xl text-white mb-2 font-medium">
                        {contest.title}
                      </h3>

                      <p className="text-gray-400 mb-4">
                        {contest.description}
                      </p>

                      <div className="text-primary-500 font-bold text-sm">
                        {contest.submission_count} SUBMISSIONS
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-6">
                      <a
                        href={`/moderation/contests/${contest.id}/submissions`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors text-sm whitespace-nowrap"
                      >
                        View Submissions
                      </a>
                      <button
                        onClick={() => handleStatusChange(contest.id, contest.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                        className={`${
                          contest.status === 'ACTIVE'
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : 'bg-green-600 hover:bg-green-700'
                        } text-white font-semibold py-2 px-4 rounded transition-colors text-sm whitespace-nowrap`}
                      >
                        {contest.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(contest.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors text-sm whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showModal && (
            <CreateContestModal
              onClose={() => setShowModal(false)}
              onSuccess={() => {
                setShowModal(false)
                fetchContests()
              }}
            />
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}

// Create Contest Modal Component
function CreateContestModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('contests')
        .insert({
          ...formData,
          submission_count: 0
        })

      if (insertError) throw insertError
      
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to create contest')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-dark-800 border border-dark-600 rounded-lg max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-dark-600">
          <h2 className="text-2xl font-bold text-white">Create New Contest</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-white font-semibold mb-3">
              Contest Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., SUB ALERT SUGGESTIONS"
              className="bg-dark-700 border border-dark-600 text-white rounded-lg px-4 py-3 w-full focus:outline-none focus:border-primary-500"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-3">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this contest is about..."
              rows={4}
              className="bg-dark-700 border border-dark-600 text-white rounded-lg px-4 py-3 w-full focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-3">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
              className="bg-dark-700 border border-dark-600 text-white rounded-lg px-4 py-3 w-full focus:outline-none focus:border-primary-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded-lg font-semibold">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-dark-600 hover:bg-dark-500 text-white font-bold py-3 px-8 rounded-lg transition-colors flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex-1 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Contest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

