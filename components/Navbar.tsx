"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Wrench, Zap, Droplet } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <Wrench className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl text-foreground tracking-tight">
                ServicePro
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-foreground hover:text-primary font-medium transition-colors"
            >
              Home
            </Link>
            
            <div className="relative group">
              <button
                className="flex items-center text-foreground hover:text-primary font-medium transition-colors focus:outline-none"
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
              >
                Services
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              
              {/* Dropdown */}
              <div
                className={`absolute left-0 mt-0 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-in-out transform origin-top-left ${
                  isServicesOpen
                    ? "opacity-100 scale-100 translate-y-0 visible"
                    : "opacity-0 scale-95 -translate-y-2 invisible"
                }`}
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
              >
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <Link
                    href="/services/carpenter"
                    className="flex items-center px-4 py-3 text-sm text-foreground hover:bg-muted hover:text-primary"
                    role="menuitem"
                  >
                    <Wrench className="mr-3 h-4 w-4 text-primary" />
                    Carpenter
                  </Link>
                  <Link
                    href="/services/electrician"
                    className="flex items-center px-4 py-3 text-sm text-foreground hover:bg-muted hover:text-primary"
                    role="menuitem"
                  >
                    <Zap className="mr-3 h-4 w-4 text-secondary" />
                    Electrician
                  </Link>
                  <Link
                    href="/services/plumber"
                    className="flex items-center px-4 py-3 text-sm text-foreground hover:bg-muted hover:text-primary"
                    role="menuitem"
                  >
                    <Droplet className="mr-3 h-4 w-4 text-blue-500" />
                    Plumber
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/about"
              className="text-foreground hover:text-primary font-medium transition-colors"
            >
              About Us
            </Link>
            
            <Link
              href="/book"
              className="bg-primary hover:bg-teal-800 text-primary-foreground px-5 py-2 rounded-full font-medium transition-colors shadow-md hover:shadow-lg"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-muted focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isOpen ? "block" : "hidden"} md:hidden bg-white border-t border-border`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-muted"
          >
            Home
          </Link>
          
          <div className="space-y-1">
            <div className="px-3 py-2 text-base font-medium text-foreground">Services</div>
            <Link
              href="/services/carpenter"
              className="block pl-6 pr-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted"
            >
              Carpenter
            </Link>
            <Link
              href="/services/electrician"
              className="block pl-6 pr-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted"
            >
              Electrician
            </Link>
            <Link
              href="/services/plumber"
              className="block pl-6 pr-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted"
            >
              Plumber
            </Link>
          </div>

          <Link
            href="/about"
            className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-muted"
          >
            About Us
          </Link>
          
          <div className="pt-4 pb-2">
            <Link
              href="/book"
              className="block w-full text-center bg-primary hover:bg-teal-800 text-primary-foreground px-5 py-3 rounded-lg font-bold transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
