import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
// import OpenSource from "@/components/OpenSource";
// import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import GrainOverlay from "@/components/GrainOverlay";

const Index = () => (
  <div className="relative min-h-screen">
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
  </div>
);

export default Index;
