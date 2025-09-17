"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Mail, Phone } from 'lucide-react'; // Import icons

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface SocialLink {
  icon: React.ElementType;
  url: string;
}

interface FooterSectionUIProps {
  logoSrc: string;
  logoAlt: string;
  aboutTitle: string;
  aboutText: string;
  menuItems: MenuItem[];
  socialLinks: SocialLink[];
  copyright: string;
  bottomLinks: { text: string; url: string }[];
}

export default function FooterSectionUI({
  logoSrc,
  logoAlt,
  aboutTitle,
  aboutText,
  menuItems,
  socialLinks,
  copyright,
  bottomLinks,
}: FooterSectionUIProps) {
  return (
    <footer className="bg-white dark:bg-gray-950 py-16 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6">
        {/* --- Branding & About Text --- */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-10">
          <div className="max-w-sm text-center lg:text-left">
            <Image
              src={logoSrc}
              alt={logoAlt}
              title={logoAlt}
              width={150} // Diperbesar
              height={150} // Diperbesar
              className="h-auto w-24 mx-auto lg:mx-0 mb-4" // Menyesuaikan lebar CSS
            />
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {aboutTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {aboutText}
              </p>
              {socialLinks.length > 0 && (
                <div className="flex justify-center lg:justify-start space-x-3 mt-4">
                  {socialLinks.map((social, idx) => {
                    const IconComponent = social.icon;
                    return (
                      <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                        <IconComponent className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* --- Menu Links (multi-column) --- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-8 flex-1">
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {section.title}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="hover:text-primary transition-colors"
                    >
                      <Link href={link.url}>{link.text}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 dark:text-gray-400 gap-4">
          <p>{copyright}</p>
          <ul className="flex flex-wrap gap-4">
            {bottomLinks.map((link, linkIdx) => (
              <li
                key={linkIdx}
                className="hover:text-primary underline underline-offset-4 transition-colors"
              >
                <Link href={link.url}>{link.text}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}