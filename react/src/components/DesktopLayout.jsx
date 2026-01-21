import NavbarDesktop from "./NavbarDesktop";

function DesktopLayout( {children}) {
    return (
        <div className="desktop-layout">
            <header>
                <NavbarDesktop />
            </header>
            <main>
                {children}
            </main>
        </div>
    );
}

export default DesktopLayout;