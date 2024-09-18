import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
  } from "@/components/ui/sheet";
import { FilePlus2, Menu} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
// import UpgradeButton from "./ui/UpgradeButton";

function Header() {
  return (
    <header className="border-b">
        <div className="flex items-center justify-between bg-background shadow-sm p-5">
            <Link href={"/dashboard"} className="text-2xl">
                Chat to <span className="text-indigo-600">PDF</span>
            </Link>

            {/* Primary Navigation */}
            <SignedIn>
                <nav className="hidden md:flex items-center space-x-6">
                    <Button asChild variant={"link"} className="hidden md:flex">
                        <Link href={"/dashboard/upgrade"} className="text-sm font-medium text-muted-foreground hover:text-primary">Pricing</Link>
                    </Button>

                    <Button asChild variant={"outline"}>
                        <Link href={"/dashboard"} className="text-sm font-medium text-muted-foreground hover:text-primary">My Documents</Link>
                    </Button>

                    <Button asChild size="icon" variant={"outline"}className="border-indigo-600">
                        <Link href={"/dashboard/upload"}>
                        <FilePlus2 className="text-indigo-600 h-5 w-5" />
                        </Link>
                    </Button>
                    
                    <ThemeToggle />
                    {/* <UpgradeButton /> */}
                    <UserButton />
                </nav>
            </SignedIn>

            {/* Mobile Menu */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-white">
                    <nav className="flex flex-col space-y-4">
                        <Button asChild variant={"link"}>
                            <Link href="/pricing" className="text-sm font-medium hover:text-primary">
                                Pricing
                            </Link>
                        </Button>
                        <Button asChild variant={"outline"}>
                            <Link href="/documents" className="text-sm font-medium hover:text-primary">
                                My Documents
                            </Link>
                        </Button>
                    </nav>
                </SheetContent>
            </Sheet>

            {/* Side Navigation On Mobile View */}
            <div className="flex items-center space-x-4 md:hidden">
                <Button variant="outline" size="icon">
                    <FilePlus2 className="text-indigo-600 h-5 w-5" />
                </Button>
                <ThemeToggle />
                <UserButton />
            </div>
            
        </div>
    </header>
  );
}

export default Header;