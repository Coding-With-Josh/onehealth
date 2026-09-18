"use client";

import type { ReactNode } from "react";
import Image from "next/image";

export function AuthLayout({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-h-screen bg-zinc-50 p-3 font-sans text-black antialiased [font-synthesis:none] dark:bg-black dark:text-white">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        {/* Left Side - Auth Form */}
        <div className="flex min-h-190 items-center justify-center rounded-md border border-black/10 bg-white px-6 py-12 dark:border-white/5 dark:bg-[#0a0a0c] lg:min-h-0 lg:px-14 lg:py-20 xl:px-20">
          <div className="mx-auto w-full max-w-115">
            <h1 className="font-mix text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-white">
              {title}
            </h1>
            {children}
          </div>
        </div>

        {/* Right Side - Marketing Testimonial and Mockup */}
        <div className="relative hidden lg:flex min-h-[720px] flex-col overflow-hidden rounded-md bg-linear-to-b from-zinc-50 to-green-600 dark:from-black dark:to-green-900 p-8 text-black dark:text-white dark:to-[#050505] sm:p-12 lg:min-h-0 lg:p-16">
          {/*
            Background Shader
            Uncomment and install the package to enable:
            pnpm add @paper-design/shaders-react
            <FlutedGlass size={0.89} shape="lines" angle={0} distortionShape="prism" distortion={0.5} shift={0} blur={0} edges={0.25} stretch={0} scale={1.11} fit="cover" highlights={0.1} shadows={0.2} grainMixer={0.1} grainOverlay={0.1} colorBack="#00000000" colorHighlight="#FFFFFF" colorShadow="#000000" className="w-full h-full bg-transparent" />
          */}

          <div className="relative z-10 h-full w-full">
            <div className="max-w-115 lg:pt-12">
              <div className="flex items-center gap-4">
                <Image
                  src="https://res.cloudinary.com/harshitproject/image/upload/v1746774430/member-five.png"
                  alt="Charlotte"
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-full border border-white/20 object-cover"
                />
                <div>
                  <div className="font-semibold leading-tight">
                    Charlotte
                  </div>
                  <div className="mt-0.5 text-xs opacity-60">
                    Design Engineer
                  </div>
                </div>
              </div>

              <blockquote className="mt-7 text-2xl font-light leading-tight tracking-[-0.035em] opacity-90 sm:text-3xl lg:text-[34px]">
                “Using <span className="font-semibold">OneHealth</span> helped
                me track my health records and next steps to take.”
              </blockquote>
            </div>

            <div className="mt-10 w-full translate-y-[24%] overflow-hidden rounded-2xl border border-white/15 bg-black/70 p-2 shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:translate-y-[22%] lg:absolute lg:left-[12%] lg:-bottom-28 lg:mt-0 lg:w-[105%] lg:max-w-none lg:origin-bottom-left lg:translate-y-0 lg:-rotate-3 xl:left-[14%] xl:-bottom-[150px] xl:w-[108%] 2xl:-bottom-[170px] 2xl:w-[112%]">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
                <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/40 px-4 py-3 select-none">
                  <div className="size-2 rounded-full bg-white/35" />
                  <div className="size-2 rounded-full bg-white/25" />
                  <div className="size-2 rounded-full bg-white/15" />
                  <span className="ml-4 text-[9px] font-mono tracking-wider text-white/40">
                    solaceui.com/dashboard
                  </span>
                </div>
                <Image
                  src="https://res.cloudinary.com/harshitproject/image/upload/v1774017120/hero-light.png"
                  alt="SolaceUI Dashboard App Mockup"
                  className="h-auto w-full object-cover object-top opacity-95 [filter:invert(1)_hue-rotate(180deg)_brightness(0.68)_contrast(1.16)] dark:[filter:none]"
                  width={100}
                  height={100}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}