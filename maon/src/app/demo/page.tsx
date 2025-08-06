// app/demo/page.tsx
"use client";

import React from "react";
import { Navigation, Footer } from "../components";
import Democomp  from "../components/Democomp";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#ebe6df]">
      <Navigation />
      <main className="flex flex-col">
        <Democomp />
      </main>
      <Footer />
    </div>
  );
}
