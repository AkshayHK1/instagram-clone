import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { clearNotifications, markAsRead } from '@/redux/rtnSlice'

const Notifications = () => {
  const dispatch = useDispatch()
  const { notifications } = useSelector(store => store.realTimeNotification)

  useEffect(() => {
    dispatch(markAsRead())
  }, [dispatch])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications?.length > 0 && (
          <Button variant="secondary" onClick={() => dispatch(clearNotifications())}>
            Clear all
          </Button>
        )}
      </div>
      
      {!notifications?.length ? (
        <div className="text-center py-12 text-gray-500">
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
              <Avatar>
                <AvatarImage src={notification.userDetails?.profilePicture} />
                <AvatarFallback>{notification.userDetails?.username?.substring(0, 2).toUpperCase() || "CN"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">
                  {notification.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
