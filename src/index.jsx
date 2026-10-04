import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Catalog } from './components/Catalog.jsx'
import { AnnouncementBar, CartDrawer, Footer, MobileDrawer, Navbar, Toasts } from './components/Chrome.jsx'
import { Hero } from './components/Hero.jsx'
import { Compare, Configurator, Domains, Latency, Support } from './components/Sections.jsx'
import { StoreProvider } from './store.jsx'

function App() {
  const [category, setCategory] = useState('networks')
  return (
    <StoreProvider>
      <AnnouncementBar />
      <Navbar onCategory={setCategory} />
      <MobileDrawer onCategory={setCategory} />
      <CartDrawer />
      <main>
        <Hero />
        <Catalog category={category} setCategory={setCategory} />
        <Domains />
        <Compare />
        <Latency />
        <Configurator />
        <Support />
      </main>
      <Footer />
      <Toasts />
    </StoreProvider>
  )
}

document.documentElement.classList.add('js')
createRoot(document.getElementById('root')).render(<App />)
document.getElementById('boot')?.remove()
