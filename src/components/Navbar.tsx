"use client"
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "Info", href: "/info" },
    { name: "Live Score", href: "/livescore" },
    { name: "Aturan", href: "/rules" },
    { name: "Peserta", href: "/peserta" },
    { name: "Klasemen", href: "/standings" },
    { name: "Bracket", href: "/bracket" },
    { name: "Live Drawing", href: "/drawing" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-navy border-b-3 border-black px-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-white no-underline">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-black bg-white shrink-0">
          <Image
            src="/logo.png"
            alt="MAPID PONG Logo"
            fill
            className="object-contain"
          />
        </div>
        <span className="font-mono tracking-tight text-sm sm:text-base">MAPID PONG</span>
      </Link>

      <div className="hidden lg:flex gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`font-mono text-[10px] font-bold uppercase px-3 py-2 border-2 border-transparent tracking-wider transition-all rounded-none ${isActive
                  ? "border-black bg-yellow text-black"
                  : "text-white hover:border-yellow hover:bg-yellow hover:text-black"
                }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Mobile Scroll Bar */}
      <div className="lg:hidden flex overflow-x-auto gap-2 max-w-[60vw] no-scrollbar py-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`font-mono text-[9px] font-bold uppercase px-2.5 py-1.5 border border-transparent tracking-wider shrink-0 transition-all rounded-none ${isActive
                  ? "border-black bg-yellow text-black"
                  : "text-white hover:bg-yellow hover:text-black"
                }`}
            >
              {link.name.replace("Live ", "")}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}