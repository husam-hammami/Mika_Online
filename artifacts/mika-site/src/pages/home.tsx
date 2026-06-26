import React from "react";
import { FadeIn } from "@/components/FadeIn";
import { EmailGate } from "@/components/EmailGate";
import { Play } from "lucide-react";

export default function Home() {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-[100dvh] w-full flex flex-col font-sans selection:bg-[#1e6bff] selection:text-white">
      {/* 1) DARK / CINEMATIC OPENING */}
      <section className="mika-dark-bg min-h-screen relative overflow-hidden flex flex-col items-center justify-center pt-24 pb-32 px-6">
        <div className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-[#1e6bff] rounded-full blur-[150px] opacity-20 animate-pulse mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-[#1e6bff] rounded-full blur-[120px] opacity-10 mix-blend-screen" />
        </div>

        <div className="z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          <FadeIn>
            <img 
              src={`${baseUrl}/brand/mika_logo_glow.png`} 
              alt="MIKA Logo" 
              className="h-16 md:h-20 mb-12 opacity-90 drop-shadow-[0_0_15px_rgba(30,107,255,0.5)]" 
            />
          </FadeIn>

          <FadeIn delay={0.2}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Clinical Imaging Intelligence. <br/>
              <span className="mika-accent-text text-shadow-glow">In plain language.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-16 leading-relaxed">
              A free desktop app that reads your medical scans and explains what they show — turning frightening radiology reports into something you can actually understand.
            </p>
          </FadeIn>

          <FadeIn delay={0.6} className="w-full">
            <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden box-shadow-glow border border-white/10 bg-black">
              <video 
                src={`${baseUrl}/MIKA_Promo.mp4`} 
                poster={`${baseUrl}/footage/clip_reading.jpg`}
                controls 
                className="w-full h-full object-cover"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOUNDER STORY */}
      <section className="mika-dark-bg py-32 px-6 relative border-b border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <FadeIn className="order-2 md:order-1 relative">
            <div className="relative w-full max-w-md mx-auto md:mx-0 aspect-[4/5] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src={`${baseUrl}/brand/founder.png`} 
                alt="Husam Hammami" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#1e6bff] rounded-full blur-[80px] opacity-20 pointer-events-none" />
          </FadeIn>

          <div className="order-1 md:order-2 space-y-8">
            <FadeIn>
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                "This started with me."
              </h2>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                <p>
                  A cauda equina emergency. Two spine surgeries. Failed back surgery syndrome. A permanent S1 nerve injury.
                </p>
                <p>
                  I remember sitting alone, staring at scans and reports I couldn't understand, utterly terrified. The path was described to me as "high risk, low reward."
                </p>
                <p className="text-white font-medium text-xl border-l-2 border-[#1e6bff] pl-4">
                  "I built MIKA so you never feel as lost as I did. It's free. For anyone who needs it."
                </p>
                <p>
                  You don't have to face it alone.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-px bg-[#1e6bff]" />
                <span className="text-sm font-medium tracking-widest uppercase text-white/70">
                  Husam Hammami, Founder
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* TRANSITION INTO LIGHT */}
      <section className="bg-gradient-to-b from-[#05070d] to-white h-48 w-full border-0" />

      {/* 2) LIGHT / CLINICAL PRODUCT SECTION */}
      <section className="mika-light-bg py-24 px-6">
        <div className="max-w-5xl mx-auto text-center mb-24">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#05070d] mb-6">
              How it works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Four simple steps to clarity. Designed to feel like a trustworthy expert sitting beside you.
            </p>
          </FadeIn>
        </div>

        <div className="max-w-6xl mx-auto space-y-32">
          {/* STEP 1 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn className="space-y-6 md:pr-12">
              <div className="w-12 h-12 rounded-full mika-accent-bg text-white flex items-center justify-center text-xl font-bold mb-8">
                1
              </div>
              <h3 className="text-3xl font-bold text-[#05070d]">Upload</h3>
              <p className="text-lg text-gray-600">
                Securely drop your medical scan files directly into MIKA. It stays entirely on your computer — private, secure, and offline.
              </p>
            </FadeIn>
            <FadeIn delay={0.2} className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-gray-50 aspect-video">
              <video 
                src={`${baseUrl}/footage/clip_upload.mp4`} 
                poster={`${baseUrl}/footage/clip_upload.jpg`}
                autoPlay muted loop playsInline 
                className="w-full h-full object-cover"
              />
            </FadeIn>
          </div>

          {/* STEP 2 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn className="order-2 md:order-1 relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-gray-50 aspect-video">
              <video 
                src={`${baseUrl}/footage/clip_reading.mp4`} 
                poster={`${baseUrl}/footage/clip_reading.jpg`}
                autoPlay muted loop playsInline 
                className="w-full h-full object-cover"
              />
            </FadeIn>
            <FadeIn delay={0.2} className="order-1 md:order-2 space-y-6 md:pl-12">
              <div className="w-12 h-12 rounded-full mika-accent-bg text-white flex items-center justify-center text-xl font-bold mb-8">
                2
              </div>
              <h3 className="text-3xl font-bold text-[#05070d]">Read</h3>
              <p className="text-lg text-gray-600">
                MIKA reads the raw imaging data. It analyzes MRI, CT, and X-ray formats to understand exactly what the radiologist sees.
              </p>
            </FadeIn>
          </div>

          {/* STEP 3 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn className="space-y-6 md:pr-12">
              <div className="w-12 h-12 rounded-full mika-accent-bg text-white flex items-center justify-center text-xl font-bold mb-8">
                3
              </div>
              <h3 className="text-3xl font-bold text-[#05070d]">Answer</h3>
              <p className="text-lg text-gray-600">
                Get a clear, plain-language explanation of the findings. We strip away the intimidating medical jargon so you know what's happening.
              </p>
            </FadeIn>
            <FadeIn delay={0.2} className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-gray-50 aspect-video">
              <video 
                src={`${baseUrl}/footage/clip_answer.mp4`} 
                poster={`${baseUrl}/footage/clip_answer.jpg`}
                autoPlay muted loop playsInline 
                className="w-full h-full object-cover"
              />
            </FadeIn>
          </div>

          {/* STEP 4 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn className="order-2 md:order-1 relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-gray-50 aspect-video">
              <video 
                src={`${baseUrl}/footage/clip_chat.mp4`} 
                poster={`${baseUrl}/footage/clip_chat.jpg`}
                autoPlay muted loop playsInline 
                className="w-full h-full object-cover"
              />
            </FadeIn>
            <FadeIn delay={0.2} className="order-1 md:order-2 space-y-6 md:pl-12">
              <div className="w-12 h-12 rounded-full mika-accent-bg text-white flex items-center justify-center text-xl font-bold mb-8">
                4
              </div>
              <h3 className="text-3xl font-bold text-[#05070d]">Ask</h3>
              <p className="text-lg text-gray-600">
                Still have questions? Chat directly with MIKA about your specific scan. Ask anything, no matter how small, until you feel confident.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* DOWNLOAD / EMAIL GATE */}
      <section className="bg-gray-50 py-32 px-6 border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <FadeIn>
            <img 
              src={`${baseUrl}/brand/mika_helix_ink.png`} 
              alt="MIKA" 
              className="h-16 mx-auto mb-8 opacity-80"
            />
            <h2 className="text-4xl font-bold text-[#05070d] mb-4">
              Get MIKA for free.
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              It's free. For anyone who needs it. Download the app for Mac or Windows to start understanding your health today.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-xl mx-auto">
              <EmailGate />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mika-dark-bg py-12 px-6 border-t border-white/10 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <img 
            src={`${baseUrl}/brand/mika_type.png`} 
            alt="MIKA" 
            className="h-5 mx-auto opacity-50"
          />
          <p className="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed">
            MIKA is designed to explain medical scans in plain language for educational purposes. 
            It is not a doctor, does not provide medical diagnoses, and does not replace professional medical advice. 
            Always consult a qualified healthcare provider regarding any medical condition.
          </p>
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} MIKA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}