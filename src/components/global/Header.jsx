"use client";

import React, { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoCloseOutline } from "react-icons/io5";
import Link from "next/link";
import {
  SignInButton,
  UserButton,
  SignedIn,
  SignedOut,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = ({ backgroundColor }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="flex items-center justify-between p-4 border-b z-4">
      <Link href="/" className=" font-bold">
        SMK
      </Link>

      {/* Desktop Navigation */}
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList className="flex space-x-6 items-center">
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/"
              className="px-3 py-2 text-base font-medium transition-colors hover:text-primary focus:outline-none focus:text-primary"
            >
              Hjem
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/events"
              className="px-3 py-2 text-base font-medium transition-colors hover:text-primary focus:outline-none focus:text-primary"
            >
              Begivenheder
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/dashboard"
              className="px-3 py-2 text-base font-medium transition-colors hover:text-primary focus:outline-none focus:text-primary"
            >
              Kurator
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink
              href="/create_edit"
              className="px-3 py-2 text-base font-medium transition-colors hover:text-primary focus:outline-none focus:text-primary"
            >
              Lav event
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem></NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobil Navigation */}
      <div className="lg:hidden">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <button onClick={toggleMenu} className="focus:outline-none">
              {isOpen ? (
                <IoCloseOutline
                  className="h-6 w-6 text-black"
                  aria-hidden="true"
                />
              ) : (
                <RxHamburgerMenu
                  className="h-6 w-6 text-black"
                  aria-hidden="true"
                />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-1/3 min-w-[200px] shadow-lg mt-2 absolute right-0"
            style={{ backgroundColor: backgroundColor }}
          >
            <DropdownMenuItem asChild>
              <Link href="/">Hjem</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/events">Begivenheder</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Kurator</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link
                href="/create_edit"
                className="px-3 py-2 text-base font-medium transition-colors hover:text-primary focus:outline-none focus:text-primary"
              >
                Lav event
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild></DropdownMenuItem>

            <DropdownMenuItem></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
