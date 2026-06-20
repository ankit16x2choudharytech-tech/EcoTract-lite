'use client'

import React, { useState } from 'react'
import { signInWithPopup, getIdToken } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebaseClient'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface GoogleSignInButtonProps {
  onSuccess?: (user: any, token: string) => void
  onError?: (error: any) => void
}

export function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Get ID token
      const idToken = await getIdToken(user)

      // Send to backend
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'google',
          idToken,
          email: user.email,
          name: user.displayName,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Google sign-in failed')
      }

      const data = await response.json()
      toast({
        title: 'Success',
        description: `Welcome back, ${data.user.name}!`,
      })

      if (onSuccess) {
        onSuccess(data.user, data.token)
      }

      // Store token in localStorage or cookie
      localStorage.setItem('firebaseToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect or update app state
      window.location.href = '/dashboard'
    } catch (err: any) {
      console.error('Google sign-in error:', err)
      const errorMsg = err.message || 'Failed to sign in with Google'
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      })
      if (onError) {
        onError(err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full"
      variant="outline"
    >
      {loading ? 'Signing in...' : '🔐 Sign in with Google'}
    </Button>
  )
}
