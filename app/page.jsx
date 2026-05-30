import Navbar from '@/src/components/Navbar';
import Hero from '@/src/components/Hero';
import About from '@/src/components/About';
import Projects from '@/src/components/Projects';
import Skills from '@/src/components/Skills';
import Experience from '@/src/components/Experience';
import Contact from '@/src/components/Contact';
import Footer from '@/src/components/Footer';
import CustomCursor from '@/src/components/CustomCursor';

export default function Home() {
  return (
    <>
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
