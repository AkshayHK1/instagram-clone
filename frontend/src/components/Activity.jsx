import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import Post from './Post'

const Activity = () => {
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useSelector(store => store.auth)

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user) return
      try {
        const res = await axios.get('http://localhost:8000/api/v1/user/activity', { withCredentials: true })
        if (res.data.success) {
          setPosts(res.data.posts)
          setComments(res.data.comments)
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching activity:', error)
        setLoading(false)
      }
    }
    fetchActivity()
  }, [user])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center py-12">
        <p>Loading activity...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Activity from Followed Users</h1>

      {posts.length === 0 && comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No activity yet. Follow more users to see their posts and comments!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Recent Comments Section */}
          {comments.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Comments</h2>
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Avatar>
                      <AvatarImage src={comment.author?.profilePicture} />
                      <AvatarFallback>{comment.author?.username?.substring(0, 2).toUpperCase() || "CN"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{comment.author?.username}</span> commented: "{comment.text}"
                      </p>
                      <p className="text-xs text-gray-500 mt-1">on a post</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {posts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Posts</h2>
              <div className="space-y-6">
                {posts.map((post) => (
                  <Post key={post._id} post={post} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Activity
