import About from '@/components/About'
// import OpenSource from "@/components/OpenSource";
// import Blog from "@/components/Blog";
import Contact from '@/components/Contact'
import CustomCursor from '@/components/CustomCursor'
import Experience from '@/components/Experience'
import Footer from '@/components/Footer'
import GrainOverlay from '@/components/GrainOverlay'
import Hero from '@/components/Hero'
import Navbar from '@/components/Navbar'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'

const Index = () => (
  <main className="relative min-h-screen">
    <CustomCursor />
    <GrainOverlay />
    <Navbar />
    <Hero />

    <About />
    <Skills />
    <Projects />
    <Experience />
    {/* <OpenSource /> */}
    {/* <Blog /> */}
    <Contact />
    <Footer />
  </main>
)

export default Index
