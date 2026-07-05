"use client";

import Link from "next/link";
import { FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-[#000000] text-[#A1A1AA] py-20 border-t border-[#1F1F1F]">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Identity */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-[#FAFAF8] tracking-tighter">Grekam Academy</span>
            </Link>
            <p className="text-sm leading-relaxed text-[#FAFAF8] font-medium">
              Learn. Create. Build. Grow.
            </p>
            <p className="text-sm leading-relaxed">
              A hybrid creative learning institute offering industry-focused education in Design, Development, Multimedia, Marketing, and Digital Technologies.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-[#0A0A0A] border border-[#1F1F1F] flex items-center justify-center hover:bg-[#49abc9] hover:text-[#FAFAF8] hover:border-[#49abc9] transition-all">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#0A0A0A] border border-[#1F1F1F] flex items-center justify-center hover:bg-[#49abc9] hover:text-[#FAFAF8] hover:border-[#49abc9] transition-all">
                <FaLinkedinIn size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#0A0A0A] border border-[#1F1F1F] flex items-center justify-center hover:bg-[#49abc9] hover:text-[#FAFAF8] hover:border-[#49abc9] transition-all">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#0A0A0A] border border-[#1F1F1F] flex items-center justify-center hover:bg-[#49abc9] hover:text-[#FAFAF8] hover:border-[#49abc9] transition-all">
                <FaYoutube size={18} />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-[#FAFAF8] font-bold mb-6">Explore</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#about" className="hover:text-[#49abc9] transition-colors">About</Link></li>
              <li><Link href="#courses" className="hover:text-[#49abc9] transition-colors">Courses</Link></li>
              <li><Link href="#platform" className="hover:text-[#49abc9] transition-colors">LMS Dashboard</Link></li>
              <li><Link href="#outcomes" className="hover:text-[#49abc9] transition-colors">Internships</Link></li>
              <li><Link href="#outcomes" className="hover:text-[#49abc9] transition-colors">Placements</Link></li>
              <li><Link href="#experience" className="hover:text-[#49abc9] transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Learning Modes & Resources */}
          <div>
            <h4 className="text-[#FAFAF8] font-bold mb-6">Learning Modes</h4>
            <ul className="space-y-3 text-sm mb-8">
              <li><Link href="#methodology" className="hover:text-[#49abc9] transition-colors">Classroom Training</Link></li>
              <li><Link href="#methodology" className="hover:text-[#49abc9] transition-colors">Live Online Classes</Link></li>
              <li><Link href="#methodology" className="hover:text-[#49abc9] transition-colors">Self-Paced Courses</Link></li>
              <li><Link href="#methodology" className="hover:text-[#49abc9] transition-colors">Corporate Training</Link></li>
            </ul>
            <h4 className="text-[#FAFAF8] font-bold mb-6">Student Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#platform" className="hover:text-[#49abc9] transition-colors">Portfolio Hub</Link></li>
              <li><Link href="#faq" className="hover:text-[#49abc9] transition-colors">FAQs</Link></li>
              <li><Link href="#pricing" className="hover:text-[#49abc9] transition-colors">Payment Plans</Link></li>
            </ul>
          </div>

          {/* Contact & SEO Keywords */}
          <div>
            <h4 className="text-[#FAFAF8] font-bold mb-6">Contact</h4>
            <address className="not-italic space-y-3 text-sm mb-8">
              <p>Grekam Academy</p>
              <p>Coimbatore, Tamil Nadu</p>
              <p>Email: <a href="mailto:info@grekam.in" className="hover:text-[#49abc9] transition-colors">info@grekam.in</a></p>
            </address>

            <h4 className="text-[#FAFAF8] font-bold mb-6">Programs</h4>
            <div className="text-xs space-y-2 opacity-50">
              <p>Design Institute in Coimbatore</p>
              <p>UI UX Design Course</p>
              <p>Full Stack Development</p>
              <p>Digital Marketing Institute</p>
              <p>Animation Training Institute</p>
            </div>
          </div>

        </div>

        <div className="border-t border-[#1F1F1F] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Grekam Academy. All rights reserved.</p>
          <p className="text-[#49abc9] font-handwriting text-xl">Every Creative Journey Begins Here.</p>
        </div>
      </div>
    </footer>
  );
}
