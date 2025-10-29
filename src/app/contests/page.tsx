'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Contest } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Calendar } from 'lucide-react'
import SubmissionModal from '@/components/contests/SubmissionModal'

const supabase = createClient()

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchContests()
  }, [])

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('id, title, description, status, display_number, tags, created_at, updated_at, submission_count:submissions(count)')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching contests:', error)
        setContests([])
      } else {
        const normalized = (data || []).map((contest: any) => ({
          ...contest,
          submission_count: Array.isArray(contest.submission_count)
            ? (contest.submission_count[0]?.count ?? 0)
            : (contest.submission_count ?? 0)
        }))
        setContests(normalized)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitSuccess = () => {
    fetchContests()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-6 text-lg text-gray-400">
          Loading contests...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-10 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Active Contests</h1>
        <p className="text-gray-400 text-xl">Submit your videos to compete</p>
      </div>
      
      {contests.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <div className="text-7xl mb-4 opacity-50">🎯</div>
            <h2 className="text-xl font-semibold mb-2">No active contests</h2>
            <p className="text-gray-500">
              Check back soon for new contest opportunities!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {contests.map((contest) => (
            <Card 
              key={contest.id} 
              className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold">
                        {contest.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(contest.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3">
                      {contest.title}
                    </h3>

                    <p className="text-gray-400 mb-4">
                      {contest.description}
                    </p>

                    <Badge variant="outline" className="border-gray-600">
                      {contest.submission_count} submissions
                    </Badge>
                  </div>

                  {contest.status === 'ACTIVE' && (
                    <Button
                      size="lg"
                      onClick={() => setSelectedContest(contest)}
                    >
                      Submit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {selectedContest && (
        <SubmissionModal
          contest={selectedContest}
          onClose={() => setSelectedContest(null)}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  )
}
