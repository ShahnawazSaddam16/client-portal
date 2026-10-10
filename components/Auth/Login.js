"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [focused, setFocused] = useState('')

  return (
    <section className="flex flex-col justify-center items-center bg-white min-h-screen 
    sm:min-h-0 px-4 mt-15">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 p-8 transition-all duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>

        <form className="flex flex-col gap-5">
          <div className="relative">
            <label className={`absolute left-11 transition-all duration-300 pointer-events-none ${
              focused === 'username' || username
                ? '-top-2.5 left-3 text-xs bg-white px-1.5 rounded text-blue-600'
                : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'
            }`}>
              Username
            </label>
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600/70" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocused('username')}
              onBlur={() => setFocused('')}
              className="w-full bg-white border border-gray-300 focus:border-blue-600 rounded-xl pl-11 pr-4 py-3 text-gray-900 outline-none transition-all duration-300 focus:shadow-lg focus:shadow-blue-500/10"
            />
          </div>

          <div className="relative">
            <label className={`absolute left-11 transition-all duration-300 pointer-events-none ${
              focused === 'password' || password
                ? '-top-2.5 left-3 text-xs bg-white px-1.5 rounded text-blue-600'
                : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'
            }`}>
              Password
            </label>
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600/70" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              className="w-full bg-white border border-gray-300 focus:border-blue-600 rounded-xl pl-11 pr-11 py-3 text-gray-900 outline-none transition-all duration-300 focus:shadow-lg focus:shadow-blue-500/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600/70 hover:text-blue-600 transition-colors duration-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            className="mt-2 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 active:scale-[0.98] text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30"
          >
            Sign in
          </button>
        </form>

      </div>
    </section>
  )
}