"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { isSupabaseConfigured, missingSupabaseMessage, supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'

export default function Login() {
  const router = useRouter()
  const { login, signInWithGoogle } = useUser()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
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

    setIsLoading(true)

    try {
      if (!isSupabaseConfigured) {
        // MOCK AUTH: create a local-only session without Supabase
        const mockId = 'local-' + crypto.randomUUID();
        const userData = {
          id: mockId,
          email: formData.email,
          fullName: formData.email.split('@')[0],
          isProfileComplete: true,
        }
        login(userData)
        router.push('/dashboard')
        return;
      }

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Login failed. Please try again.')
      }

      // Fetch user profile from users table
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      const userData = {
        id: authData.user.id,
        email: authData.user.email || '',
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        fullName: profile?.full_name,
        age: profile?.age,
        gender: profile?.gender,
        location: profile?.location,
        avatarUrl: profile?.avatar_url,
        isProfileComplete: profile?.is_profile_complete ?? false,
      }

      login(userData)

      // Check if profile is complete
      if (!userData.isProfileComplete) {
        setShowProfilePopup(true)
        setTimeout(() => {
          router.push('/auth/profile')
        }, 2000)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)

      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('Invalid login credentials')) {
        setErrors({ general: 'Invalid email or password.' })
      } else {
        setErrors({ general: errorMessage || 'Login failed. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      // MOCK: simulate Google login locally
      const mockId = 'local-' + crypto.randomUUID();
      const userData = {
        id: mockId,
        email: 'demo@dravyalabs.com',
        fullName: 'Demo User',
        isProfileComplete: true,
      }
      login(userData)
      router.push('/dashboard')
      return
    }

    try {
      await signInWithGoogle();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google login failed. Please try again.';
      setErrors({ general: errorMessage });
    }
  }

  return (
    <>
      <style jsx>{`
        .login-page {
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
          overflow-y: auto;
          overflow-x: hidden;
          margin: 0;
          padding: 20px 0;
        }

        .login-page::before {
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

        .login-container {
          background: rgba(134, 194, 155, 0.9);
          backdrop-filter: blur(16px);
          padding: 24px 28px;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2),
                      0 0 0 1px rgba(255, 255, 255, 0.3) inset,
                      0 -5px 20px rgba(255, 255, 255, 0.2) inset;
          width: 90%;
          max-width: 380px;
          position: relative;
          animation: fadeIn 0.6s ease-out;
          z-index: 10;
          margin: 10px;
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

        .login-container::before {
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

        .login-logo {
          display: block;
          margin: 0 auto 12px auto;
          width: 80px;
          height: auto;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
        }

        .login-title {
          color: white;
          text-align: center;
          margin-bottom: 14px;
          font-size: 26px;
          font-weight: 600;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          letter-spacing: 0.5px;
        }

        .form-group {
          margin-bottom: 12px;
        }

        .form-label {
          display: block;
          color: white;
          margin-bottom: 5px;
          font-size: 13.5px;
          font-weight: 500;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .form-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 12px;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.85);
          color: #333;
          transition: all 0.3s ease;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          background: white;
          border-color: rgba(255, 255, 255, 0.8);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.05);
          transform: translateY(-1px);
        }

        .remember-forgot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          font-size: 13px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          color: white;
          cursor: pointer;
        }

        .remember-checkbox {
          margin-right: 8px;
          cursor: pointer;
          width: 16px;
          height: 16px;
        }

        .forgot-password {
          color: white;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .forgot-password:hover {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #16826B 0%, #116251 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(22, 130, 107, 0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(22, 130, 107, 0.5);
          background: linear-gradient(135deg, #18987d 0%, #137460 100%);
        }

        .login-btn:active {
          transform: translateY(0);
        }

        .divider {
          text-align: center;
          margin: 12px 0;
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
          background: rgba(134, 194, 155, 0.9);
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
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .google-btn:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .google-icon {
          width: 18px;
          height: 18px;
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

        /* Mobile Responsive Styles */
        @media screen and (max-width: 480px) {
          .login-page {
            padding: 1rem;
            align-items: flex-start;
            padding-top: max(1rem, env(safe-area-inset-top));
            padding-bottom: max(1rem, env(safe-area-inset-bottom));
          }

          .login-container {
            padding: 24px 20px;
            border-radius: 20px;
            width: 100%;
            max-width: 100%;
            margin: 1rem 0;
          }

          .login-logo {
            width: 60px;
            margin-bottom: 8px;
          }

          .login-title {
            font-size: 22px;
            margin-bottom: 20px;
          }

          .form-input {
            font-size: 16px;
            padding: 14px;
            border-radius: 12px;
            min-height: 44px;
          }

          .form-label {
            font-size: 14px;
            margin-bottom: 8px;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .remember-forgot {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .login-btn, .google-btn {
            min-height: 48px;
            font-size: 16px;
            border-radius: 12px;
          }

          .floating-leaves {
            display: none;
          }
        }

        @media screen and (max-width: 375px) {
          .login-container {
            padding: 20px 16px;
          }

          .login-title {
            font-size: 20px;
          }
        }

        @media screen and (max-height: 700px) {
          .login-page {
            align-items: flex-start;
            overflow-y: auto;
          }

          .login-container {
            margin: 1rem auto;
          }
        }
      `}</style>

      <div className="login-page">
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
                Welcome! 🎉
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }}>
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

        <div className="login-container" style={{ paddingTop: "10px" }}>
          <img src="/Full logo.png" alt="Dravya Labs Logo" className="login-logo" style={{ filter: "brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.15))", width: "180px", display: "block", margin: "0 auto 5px auto", transform: "translateX(6px)" }} />
          <h2 className="login-title" style={{ marginTop: 0 }}>Welcome Back</h2>

          {errors.general && (
            <div style={{
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
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
              {errors.email && <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', marginTop: '5px' }}>{errors.email}</div>}
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
              {errors.password && <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', marginTop: '5px' }}>{errors.password}</div>}
            </div>

            <div className="remember-forgot">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="remember"
                  className="remember-checkbox"
                  checked={formData.remember}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <button type="button" className="google-btn" onClick={handleGoogleLogin}>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div style={{ textAlign: 'center', color: 'white', fontSize: '14px', marginTop: '20px' }}>
              Don&apos;t have an account? <a href="/signup" style={{ color: 'rgba(255, 255, 255, 0.9)', textDecoration: 'underline', fontWeight: '500' }}>Sign Up</a>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
