import NavbarMobile from "./NavbarMobile";
import LogoImport from "../Logo/LogoMobile";

function MobileLayout({ children }) {
    return (
        <div className="mobile-layout">
            <LogoImport />
            <main>
                
                <main className="mobile-main">{children}</main>

            </main>
            <NavbarMobile />
        </div>
    );
}

export default MobileLayout;