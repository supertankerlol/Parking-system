import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { Features } from "./components/Features";
import { Dashboard } from "./components/Dashboard";
import { Testimonials } from "./components/Testimonials";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="dark min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Dashboard />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
