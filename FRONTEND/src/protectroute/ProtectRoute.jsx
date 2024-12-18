import React from 'react'

import { Navigate } from 'react-router-dom'
function ProtectRoute({children}) {
 const id=localStorage.getItem('id')

  return (
    id? children:<Navigate to='/adminlogin' /> 
  )
}

export default ProtectRoute

