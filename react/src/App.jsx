import { useEffect, useState } from 'react'
import './App.css'
import DesktopLayout from './components/DesktopLayout'
import Button from './components/Button'
import Card from './components/Card'
import MobileLayout from './components/MobileLayout'

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
  const onResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
  }, []);

  const Layout = isMobile ? MobileLayout : DesktopLayout;
  return (
    <Layout>

      <Card title="Timer">
        <Button 
            label = "Start ►"
            variant = "start"
        />
         <Button 
            label = "Stop ■"
            variant = "stop"
        />
      </Card>
    </Layout>
  )
}

export default App
