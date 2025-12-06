import React, { useContext } from 'react'
import {signInWithGooglePopup} from '../firebase'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import { AuthContext } from '../context/AuthContext';

 
const GoogleLoginButton = () => {
  const {login}= useContext(AuthContext)
  const navigate= useNavigate()

  const handleGoogleLogin= async ()=>{
    try{
      const {idToken, firebaseUser }= await signInWithGooglePopup()
      const res= await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/google`, {idToken})
      login(res.data)
      navigate('/')
    }
    catch(err){
      console.error(err)
      alert(err.response?.data?.msg || 'Google sign-in failed')
    }
  }

  return (
    <div>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
    </div>
  )
}

export default GoogleLoginButton