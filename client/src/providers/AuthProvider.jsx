import PropTypes from 'prop-types'
import { createContext, useEffect, useState } from 'react'
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'

import useAxiosCommon from '../hooks/useAxiosCommon'
import { app } from '../firebase/firebase.config'

export const AuthContext = createContext(null)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()
const facebookProvider = new FacebookAuthProvider()
const axiosCommon = useAxiosCommon()

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const createUser = (email, password) => {
    setLoading(true)
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const signIn = (email, password) => {
    setLoading(true)
    return signInWithEmailAndPassword(auth, email, password)
  }
//signInWight Googel
  const signInWithGoogle = () => {
    setLoading(true)
    return signInWithPopup(auth, googleProvider)
  }
//signInWight Facebook
  const signInWithFacebook = () => {
    setLoading(true)
    return signInWithPopup(auth, facebookProvider)
  }

  //signOut firebase
  // const logOutFirebase =()=>{
  //   setLoading(true)
  //  return signOut(auth)
  // }
  const logOut = async () => {
    setLoading(true)
    // await axios.get(`${import.meta.env.VITE_API_URL}/logout`, {
    //   withCredentials: true,
    // })
     return signOut(auth)
  }

  const resetPassword = email => {
    setLoading(true)
    return sendPasswordResetEmail(auth, email)
  }

 //updateProfile
  const updateUserProfile = (name, photo) => {
    return updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photo,
    })
  }
  // Get token from server
  const getToken = async userInfo => {
   try {
    const { data } = await axiosCommon.post(
      `${import.meta.env.VITE_API_URL}/jwt`,
     userInfo)
     localStorage.setItem('access-token',data.token)
   } catch (error) {
    
   }
    
  }
  // set new user in database
  const newUser = async(infoUser)=>{
    try {
      const {data} =await axiosCommon.put('/users',infoUser)
    } catch (error) {
      //(error)
    }
  }

  // onAuthStateChange
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser)
      const userInfo = {email: currentUser?.email}
      const infouser = {
        email: currentUser?.email,
        role : "Participant"
      }
      if (currentUser) {
        getToken(userInfo)
        newUser(infouser)
      }else{
        localStorage.removeItem('access-token')
      }
      setLoading(false)
    })
    return () => {
      return unsubscribe()
    }
  }, [])

  const authInfo = {
    user,
    loading,
    setLoading,
    createUser,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    resetPassword,
    updateUserProfile,
    logOut
  }

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  // Array of children.
  children: PropTypes.array,
}

export default AuthProvider
