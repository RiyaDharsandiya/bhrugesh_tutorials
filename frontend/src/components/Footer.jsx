import React from "react";

export default function Footer() {
  return (
    <footer className="bg-indigo-100 border-t border-indigo-100 text-center py-4 mt-auto">
      <p className="text-indigo-600 font-medium tracking-wide">
        © {new Date().getFullYear()} Bhrugesh Tutorials © 2025 All rights reserved
      </p>
    </footer>
  );
}
