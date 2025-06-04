import Link from "next/link";
import { Cloud, Facebook, Twitter, Linkedin, Mail, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Column 1: Logo & Description */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Cloud className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              BD Weather
            </span>
          </div>
          <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
            BD Weather offers real-time, hyperlocal weather updates,
            visualizations, and forecasts to help you stay informed and prepared
            across all 64 districts of Bangladesh.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-4 tracking-wide uppercase">
            Quick Links
          </h3>
          <nav className="flex flex-col gap-3">
            <FooterLink href="/features" label="Features" />
            <FooterLink href="/about" label="About Us" />
            <FooterLink href="/data-sources" label="Data Sources" />
            <FooterLink href="/contact" label="Contact" />
          </nav>
        </div>

        {/* Column 3: Social Media */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-4 tracking-wide uppercase">
            Connect With Us
          </h3>
          <div className="flex gap-4">
            <FooterIcon
              href="https://facebook.com"
              icon={<Facebook className="h-5 w-5" />}
              label="Facebook"
              color="hover:text-blue-600"
            />
            <FooterIcon
              href="https://twitter.com"
              icon={<Twitter className="h-5 w-5" />}
              label="Twitter"
              color="hover:text-sky-500"
            />
            <FooterIcon
              href="https://linkedin.com"
              icon={<Linkedin className="h-5 w-5" />}
              label="LinkedIn"
              color="hover:text-blue-700"
            />
            <FooterIcon
              href="mailto:support@bdweather.com"
              icon={<Mail className="h-5 w-5" />}
              label="Email"
              color="hover:text-red-500"
            />
            <FooterIcon
              href="https://github.com"
              icon={<Github className="h-5 w-5" />}
              label="GitHub"
              color="hover:text-gray-800"
            />
          </div>
          <div className="mt-6">
            <p className="text-xs text-gray-500 mb-2">Subscribe to our newsletter</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-3 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full max-w-xs"
              />
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 text-sm rounded-r-md hover:from-blue-600 hover:to-cyan-600 transition-all duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 pt-6 text-center text-xs text-gray-500 border-t border-gray-200">
        © {new Date().getFullYear()} BD Weather. All rights reserved. | 
        <Link href="/privacy" className="hover:text-blue-600 ml-1">Privacy Policy</Link> | 
        <Link href="/terms" className="hover:text-blue-600 ml-1">Terms of Service</Link>
      </div>
    </footer>
  );
}

// Reusable link component
function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
    >
      {label}
    </Link>
  );
}

// Reusable social icon component
function FooterIcon({
  href,
  icon,
  label,
  color
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-gray-500 ${color} transition-colors duration-200`}
    >
      {icon}
    </Link>
  );
}