import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'

const MainLayout = () => {
  return (
    <div className="flex">
         <LeftSidebar/>
        <div className="ml-64 flex-1">
            <Outlet/>
        </div>
    </div>
  )
}

export default MainLayout