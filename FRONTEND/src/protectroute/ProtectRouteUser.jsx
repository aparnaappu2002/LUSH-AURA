import React from 'react'
import { Navigate } from 'react-router-dom'

function protecteRouteUser({children}) {
    const id=localStorage.getItem('id')
  return (
    id?children : <Navigate to='/login' /> 
  )
}

export default protecteRouteUser