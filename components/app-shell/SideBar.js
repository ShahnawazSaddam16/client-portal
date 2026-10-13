'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Inter } from 'next/font/google'
import { LayoutDashboard, FolderKanban, MessageSquare, Settings, Menu, X, LogOut, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/components/context/AuthContext'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN

const links = [
  { href: '/client', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/client/projects', label: 'Projects', icon: FolderKanban },
  { href: '/client/messages', label: 'Notifications', icon: MessageSquare },
  { href: '/client/settings', label: 'Settings', icon: Settings },
]

export default function SideBar() {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser } = useAuth()

  const initial = user?.username?.charAt(0)?.toUpperCase() || 'U'

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      setLogoutError('')

      const res = await fetch(`${API_ORIGIN}/client/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Logout failed')
      }

      if (setUser) setUser(null)
      setConfirmOpen(false)
      setOpen(false)
      router.push('/')
      router.refresh()
    } catch (err) {
      setLogoutError(err.message)
    } finally {
      setLoggingOut(false)
    }
  }

  const closeConfirm = () => {
    if (loggingOut) return
    setConfirmOpen(false)
    setLogoutError('')
  }

  return (
    <>
      <style>{`
        @keyframes sbFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sbPop {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sb-fade { animation: sbFade 0.25s ease-out forwards; }
        .sb-pop { animation: sbPop 0.3s ease-out forwards; }
      `}</style>

      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white shadow-md border border-gray-100 text-blue-600 active:scale-95 transition-transform"
      >
        <Menu size={22} />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      <div className="hidden md:block w-64 shrink-0" />

      <aside
        className={`
          ${inter.className}
          fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-950/50
          flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        <div className="flex items-center justify-start px-6 h-16 gap-3 border-b
         border-gray-950/50">
          <Image
          src={"/favicon.png"}
          width={100}
          height={100}
          alt='Logo'
          className='w-10 h-10 rounded-full border-2 border-blue-600'
          />
          <span className="text-lg sm:text-[22px] font-bold text-gray-900">
            Client-<span className="text-blue-600">Portal</span>
          </span>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Icon
                  size={19}
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                  }`}
                />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="px-3 pb-3">
          <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-3 transition-all duration-200 hover:bg-blue-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{user?.username}</p>
              <p className="truncate text-xs text-gray-600">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => setConfirmOpen(true)}
            className="group mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-gray-600 transition-all duration-200 hover:bg-blue-600 hover:text-white active:scale-95"
          >
            <LogOut
              size={19}
              className="text-gray-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white"
            />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {confirmOpen && (
        <div
          onClick={closeConfirm}
          className={`${inter.className} sb-fade fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="sb-pop w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl shadow-blue-600/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <LogOut size={22} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-gray-900">Log out?</h3>
            <p className="mt-1 text-sm text-gray-600">
              You are signed in as <span className="font-semibold text-blue-600">{user?.username}</span>. Are you sure you want to log out?
            </p>

            {logoutError && (
              <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600">{logoutError}</p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeConfirm}
                disabled={loggingOut}
                className="flex-1 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-100 active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/30 transition-all duration-200 hover:bg-blue-700 active:scale-95 disabled:opacity-70"
              >
                {loggingOut ? <Loader2 size={16} className="animate-spin" /> : null}
                {loggingOut ? 'Logging out' : 'Yes, logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}