import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import About from '@/components/About'
// import OpenSource from "@/components/OpenSource";
// import Blog from "@/components/Blog";
import Contact from '@/components/Contact'
import Experience from '@/components/Experience'
import Footer from '@/components/Footer'
import GrainOverlay from '@/components/GrainOverlay'
import Hero from '@/components/Hero'
import Navbar from '@/components/Navbar'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import { scrollBehavior } from '@/lib/scroll'

const Index = () => {
  const location = useLocation()

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null
    const id = state?.scrollTo ?? (location.hash ? location.hash.slice(1) : null)
    if (!id) return
    document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior() })
  }, [location.state, location.hash])

  return (
    <main className="relative min-h-screen">
      <GrainOverlay />
      <Navbar />
      <Hero />

      <About />
      <Experience />
      <Projects />
      <Skills />
      {/* <OpenSource /> */}
      {/* <Blog /> */}
      <Contact />
      <Footer />
    </main>
  )
}

export default Index
