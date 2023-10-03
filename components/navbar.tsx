import MobileSidebar from "@/components/mobile-sidebar";

const Navbar = async () => {

    return (
        <div className="Flex items-center p-4">
            <MobileSidebar />
            <div className="flex w-full justify-end">
            </div>
        </div>
    );
}

export default Navbar;