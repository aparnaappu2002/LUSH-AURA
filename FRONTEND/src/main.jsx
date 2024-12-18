import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import store from './components/redux/Store.jsx'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
  
  
    <Provider store={store}>
      <GoogleOAuthProvider clientId='322850358507-dsrql8t15dcaffrqqolvet6i9eqrq8gq.apps.googleusercontent.com'>
      <BrowserRouter>
    <App />
    </BrowserRouter>
      </GoogleOAuthProvider>
    
    
</Provider>
    
   
  
)
