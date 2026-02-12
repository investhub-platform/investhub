import { useState } from 'react'

const Navbar = () => {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-4 px-3 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-lg max-w-4xl w-full mx-4">
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="InvestHub" width={28} height={28} style={{ maxWidth: '100%', display: 'block' }} className="h-6 w-6 md:h-7 md:w-7 rounded-md object-contain" />
          <span className="text-white font-semibold tracking-wide text-sm md:text-base">InvestHub</span>
        </a>

        <nav className="flex-1 flex justify-center gap-6 text-sm text-slate-300 hidden md:flex">
          <a href="#product" className="hover:text-white transition-colors">Product</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#resources" className="hover:text-white transition-colors">Resources</a>
          <a href="#company" className="hover:text-white transition-colors">Company</a>
        </nav>

        <div className="flex items-center gap-3 ml-auto md:ml-0">
          <a href="/get-started" className="hidden md:inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium shadow-lg hover:scale-[1.02] transition-transform">Get Started</a>

          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            className="md:hidden inline-flex items-center justify-center p-1.5 rounded-md bg-white/3 text-slate-100 hover:bg-white/6 transition-colors"
          >
            {/* Hamburger / X icons */}
            <svg className={`${open ? 'hidden' : 'block'} h-5 w-5`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            <svg className={`${open ? 'block' : 'hidden'} h-5 w-5`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown: positioned below header */}
      {open && (
        <div className="pointer-events-auto absolute top-[64px] left-1/2 transform -translate-x-1/2 w-[92%] max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 z-40 md:hidden">
          <nav className="flex flex-col gap-2 text-sm text-slate-200">
            <a onClick={() => setOpen(false)} href="#product" className="block px-3 py-2 rounded hover:bg-white/3">Product</a>
            <a onClick={() => setOpen(false)} href="#pricing" className="block px-3 py-2 rounded hover:bg-white/3">Pricing</a>
            <a onClick={() => setOpen(false)} href="#resources" className="block px-3 py-2 rounded hover:bg-white/3">Resources</a>
            <a onClick={() => setOpen(false)} href="#company" className="block px-3 py-2 rounded hover:bg-white/3">Company</a>
            <a onClick={() => setOpen(false)} href="/get-started" className="mt-2 inline-flex items-center justify-center w-full px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium shadow">Get Started</a>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
