'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Inter } from 'next/font/google'
import { LayoutDashboard, FolderKanban, MessageSquare, Settings, Menu, X, User2 } from 'lucide-react'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

const links = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
  {href: '/portal/users', label: 'Users', icon: User2},
  { href: '/portal/projects', label: 'Projects', icon: FolderKanban },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function SideBar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
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
            Dev-<span className="text-blue-600">Portal</span>
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

        <div className="px-6 py-4 border-t border-gray-950/50">
          <p className="text-xs text-gray-600">© 2026 Buttnetworks</p>
        </div>
      </aside>
    </>
  )
}