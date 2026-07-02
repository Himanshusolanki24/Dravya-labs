"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'

export default function Signup() {
  const router = useRouter()
  const { login, signInWithGoogle } = useUser()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showProfilePopup, setShowProfilePopup] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match!' })
      return
    }

    if (!formData.agreeToTerms) {
      setErrors({ agreeToTerms: 'Please agree to the terms and conditions' })
      return
    }

    setIsLoading(true)

    try {
      // Sign up with Supabase Auth
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: fullName,
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Signup failed. Please try again.')
      }

      // Create user profile in users table
      await supabase.from('users').upsert({
        id: authData.user.id,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        full_name: fullName,
        is_profile_complete: false,
      }, { onConflict: 'id' })

      const userData = {
        id: authData.user.id,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: fullName,
        isProfileComplete: false,
      }

      login(userData)

      // Show popup and redirect to profile
      setShowProfilePopup(true)
      setTimeout(() => {
        router.push('/auth/profile')
      }, 2000)
    } catch (error) {
      console.error('Signup error:', error)
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrors({ general: errorMessage || 'Signup failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google signup failed", error);
      setErrors({ general: 'Google signup failed. Please try again.' });
    }
  }

  return (
    <>
      <style jsx>{`
        .signup-page {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-image: url('/loginbg.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          position: relative;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }

        .signup-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="leaf1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2370b377;stop-opacity:0.3" /><stop offset="100%" style="stop-color:%2398d89e;stop-opacity:0.2" /></linearGradient></defs><ellipse cx="100" cy="100" rx="60" ry="35" fill="url(%23leaf1)" transform="rotate(-25 100 100)"/><ellipse cx="1100" cy="150" rx="70" ry="40" fill="url(%23leaf1)" transform="rotate(25 1100 150)"/><ellipse cx="200" cy="700" rx="55" ry="32" fill="url(%23leaf1)" transform="rotate(45 200 700)"/><ellipse cx="1000" cy="650" rx="65" ry="38" fill="url(%23leaf1)" transform="rotate(-35 1000 650)"/></svg>');
          opacity: 0.4;
          pointer-events: none;
        }

        .signup-container {
          background: rgba(134, 194, 155, 0.85);
          backdrop-filter: blur(12px);
          padding: 30px 25px;
          border-radius: 25px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15),
                      0 0 0 1px rgba(255, 255, 255, 0.3) inset,
                      0 -5px 20px rgba(255, 255, 255, 0.2) inset;
          width: 90%;
          max-width: 420px;
          max-height: 90vh;
          overflow-y: visible;
          position: relative;
          animation: fadeIn 0.6s ease-out;
          z-index: 10;
          margin: 20px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .signup-container::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.05));
          border-radius: 30px;
          z-index: -1;
        }

        .signup-logo {
          display: block;
          margin: 0 auto 15px auto;
          width: 120px;
          height: auto;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
        }

        .signup-title {
          color: white;
          text-align: center;
          margin-bottom: 20px;
          font-size: 24px;
          font-weight: 600;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          letter-spacing: 0.5px;
        }

        .form-row {
          display: flex;
          gap: 12px;
          margin-bottom: 15px;
        }

        .form-group {
          margin-bottom: 15px;
          flex: 1;
        }

        .form-label {
          display: block;
          color: white;
          margin-bottom: 5px;
          font-size: 13px;
          font-weight: 500;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          background: rgba(255, 255, 255, 0.9);
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          background: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
          transform: none;
        }

        .terms-section {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          font-size: 12px;
        }

        .terms-checkbox {
          margin-right: 6px;
          cursor: pointer;
          width: 14px;
          height: 14px;
        }

        .terms-text {
          color: white;
          cursor: pointer;
        }

        .terms-link {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: underline;
          font-weight: 500;
        }

        .signup-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #7ac943 0%, #5fb82e 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(122, 201, 67, 0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 15px;
        }

        .signup-btn:hover {
          box-shadow: 0 8px 25px rgba(122, 201, 67, 0.5);
          background: linear-gradient(135deg, #8ad451 0%, #6fc935 100%);
          transform: none;
        }

        .signup-btn:active {
          transform: none;
        }

        .divider {
          text-align: center;
          margin: 15px 0;
          position: relative;
        }

        .divider::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 100%;
          height: 1px;
          background: rgba(255, 255, 255, 0.3);
        }

        .divider span {
          background: rgba(134, 194, 155, 0.85);
          padding: 0 12px;
          position: relative;
          color: white;
          font-size: 12px;
        }

        .google-btn {
          width: 100%;
          padding: 10px;
          background: white;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          margin-bottom: 15px;
        }

        .google-btn:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          transform: none;
        }

        .google-icon {
          width: 16px;
          height: 16px;
        }

        .login-link {
          text-align: center;
          color: white;
          font-size: 12px;
        }

        .login-link a {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: underline;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .login-link a:hover {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
        }

        .floating-leaves {
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .leaf {
          position: absolute;
          width: 30px;
          height: 30px;
          background: rgba(144, 238, 144, 0.3);
          border-radius: 0 50% 50% 50%;
          animation: fall linear infinite;
        }

        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }

        .leaf:nth-child(1) { left: 10%; animation-duration: 8s; animation-delay: 0s; }
        .leaf:nth-child(2) { left: 30%; animation-duration: 10s; animation-delay: 2s; }
        .leaf:nth-child(3) { left: 50%; animation-duration: 9s; animation-delay: 4s; }
        .leaf:nth-child(4) { left: 70%; animation-duration: 11s; animation-delay: 1s; }
        .leaf:nth-child(5) { left: 90%; animation-duration: 8.5s; animation-delay: 3s; }
      `}</style>

      <div className="signup-page">
        {/* Profile Completion Popup */}
        {showProfilePopup && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}>
            <div style={{
              background: 'white',
              padding: '32px 40px',
              borderRadius: '20px',
              textAlign: 'center',
              maxWidth: '400px',
              margin: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'fadeIn 0.3s ease-out',
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #7ac943 0%, #5fb82e 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3 style={{ color: '#1a1a1a', fontSize: '22px', fontWeight: '600', marginBottom: '12px' }}>
                Account Created! 🎉
              </h3>
              <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', marginBottom: '16px' }}>
                Complete your profile to get personalized Ayurvedic recommendations
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#7ac943',
                fontSize: '14px',
                fontWeight: '500',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Redirecting to profile...
              </div>
            </div>
          </div>
        )}

        <div className="floating-leaves">
          <div className="leaf"></div>
          <div className="leaf"></div>
          <div className="leaf"></div>
          <div className="leaf"></div>
          <div className="leaf"></div>
        </div>

        <div className="signup-container">
          <h2 className="signup-title">Create Account</h2>

          {errors.general && (
            <div style={{
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              color: 'white',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '15px',
              fontSize: '13px'
            }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="form-input"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                {errors.firstName && <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', marginTop: '3px' }}>{errors.firstName}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="form-input"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                {errors.lastName && <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', marginTop: '3px' }}>{errors.lastName}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              {errors.email && <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', marginTop: '3px' }}>{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              {errors.password && <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', marginTop: '3px' }}>{errors.password}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              {errors.confirmPassword && <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', marginTop: '3px' }}>{errors.confirmPassword}</div>}
            </div>

            <div className="terms-section">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                className="terms-checkbox"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <label htmlFor="agreeToTerms" className="terms-text">
                I agree to the <a href="#" className="terms-link">Terms and Conditions</a>
              </label>
              {errors.agreeToTerms && <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', marginTop: '3px', marginLeft: '20px' }}>{errors.agreeToTerms}</div>}
            </div>

            <button type="submit" className="signup-btn" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <button type="button" className="google-btn" onClick={handleGoogleSignup}>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="login-link">
              Already have an account? <a href="/auth/login">Sign In</a>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}