import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import MobileLayout from "./NavbarMobile/MobileLayout";
import DesktopLayout from "./NavbarDesktop/DesktopLayout";

export default function AppLayout({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const Layout = isMobile ? MobileLayout : DesktopLayout;
    return (
        <Layout>
            {children ?? <Outlet />}
        </Layout>
    );
}