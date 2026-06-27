import { useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import { EmailGate } from "@/components/EmailGate";
import { SiteHeader, scrollToDownload } from "@/components/SiteHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Play, ArrowRight, Brain, FlaskConical, FileText, ShieldCheck, Laptop, Lock } from "lucide-react";

const STEPS = [
  {
    n: 1,
    title: "Upload",
    body: "Drop in your scan or lab report. It stays private on your own computer.",
    clip: "clip_upload",
    label: "Dragging a medical scan into MIKA to upload it",
    reverse: false,
  },
  {
    n: 2,
    title: "Read",
    body: "MIKA reads your MRI, CT, or X-ray, and your blood work, and lays out what it sees.",
    clip: "clip_reading",
    label: "MIKA reading an MRI scan and highlighting findings",
    reverse: true,
  },
  {
    n: 3,
    title: "Answer",
    body: "You get a clear answer, with no medical jargon.",
    clip: "clip_answer",
    label: "MIKA showing a plain-language explanation of a scan",
    reverse: false,
  },
  {
    n: 4,
    title: "Ask",
    body: "Ask MIKA anything about your scan or report, until you feel sure.",
    clip: "clip_chat",
    label: "Chatting with MIKA to ask follow-up questions about a report",
    reverse: true,
  },
];

const FAQS = [
  {
    q: "Is MIKA really free?",
    a: "Yes. MIKA is completely free to download and use.",
  },
  {
    q: "Is my medical data private?",
    a: "MIKA reads your scans and reports on your own computer, so your medical data stays with you.",
  },
  {
    q: "Does MIKA replace my doctor?",
    a: "No. MIKA explains your results in plain language to help you understand them — it is not a diagnosis and does not replace professional medical advice.",
  },
  {
    q: "What can MIKA read?",
    a: "Medical scans like MRI, CT, and X-ray, plus lab reports and blood work — as image files or PDFs.",
  },
  {
    q: "Which devices are supported?",
    a: "MIKA is available for Mac and Windows.",
  },
];

export default function Home() {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <SiteHeader />
      <main id="top" className="min-h-[100dvh] w-full flex flex-col font-sans selection:bg-[#1e6bff] selection:text-white">
        {/* 1) DARK / CINEMATIC OPENING */}
        <section className="mika-dark-bg min-h-screen relative overflow-hidden flex flex-col items-center justify-start pt-10 pb-8 px-6">
          <div className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-[#1e6bff] rounded-full blur-[150px] opacity-20 animate-pulse motion-reduce:animate-none mix-blend-screen" />
            <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-[#1e6bff] rounded-full blur-[120px] opacity-10 mix-blend-screen" />
          </div>

          <div className="z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
            <FadeIn>
              <img
                src={`${baseUrl}/brand/mika_logo_hero.png`}
                alt="MIKA"
                width={1232}
                height={559}
                fetchPriority="high"
                className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto mb-3 opacity-95 drop-shadow-[0_0_35px_rgba(30,107,255,0.6)]"
              />
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3 leading-[1.05]">
                Understand your body.{" "}
                <span className="mika-accent-text text-shadow-glow">In plain language.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.4}>
              <p className="text-base md:text-lg text-gray-400 max-w-xl mx-auto mb-5 leading-relaxed">
                A free app that reads and explains your medical scans and lab reports.
              </p>
            </FadeIn>

            <FadeIn delay={0.5}>
              <button
                type="button"
                onClick={scrollToDownload}
                className="group inline-flex items-center gap-2 h-12 px-7 rounded-full mika-accent-bg hover:bg-[#1a5fe6] text-white font-semibold shadow-[0_0_40px_rgba(30,107,255,0.45)] transition-all hover:-translate-y-0.5"
              >
                Get MIKA — it&rsquo;s free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <p className="text-xs text-gray-500 mt-3">
                Free for Mac &amp; Windows · Not a substitute for professional medical advice
              </p>
            </FadeIn>

            <div className="w-full mt-8">
              <div className="relative w-full max-w-5xl mx-auto aspect-video rounded-2xl overflow-hidden box-shadow-glow border border-white/10 bg-black">
                {playing ? (
                  <iframe
                    src={`${baseUrl}/promo-embed/index.html`}
                    title="MIKA promo video"
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    aria-label="Play MIKA promo video"
                    className="group absolute inset-0 w-full h-full"
                  >
                    <img
                      src={`${baseUrl}/footage/promo_poster.jpg`}
                      alt="MIKA product preview"
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/20">
                      <span className="flex items-center justify-center w-20 h-20 rounded-full bg-[#1e6bff] shadow-[0_0_40px_rgba(30,107,255,0.6)] transition-transform group-hover:scale-110">
                        <Play className="w-8 h-8 text-white translate-x-0.5" fill="currentColor" />
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FOUNDER STORY */}
        <section className="mika-dark-bg py-32 px-6 relative border-b border-white/5">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <FadeIn className="order-2 md:order-1 relative">
              <div className="relative w-full max-w-md mx-auto md:mx-0 aspect-[4/5] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src={`${baseUrl}/brand/founder.png`}
                  alt="Husam Hammami, creator of MIKA"
                  width={400}
                  height={400}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#1e6bff] rounded-full blur-[80px] opacity-20 pointer-events-none" />
            </FadeIn>

            <div className="order-1 md:order-2 space-y-8">
              <FadeIn>
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                  &ldquo;This started with me.&rdquo;
                </h2>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                  <p>
                    I know how it feels to be alone and afraid, holding answers about your own body that you can&rsquo;t understand.
                  </p>
                  <p className="text-white font-medium text-xl border-l-2 border-[#1e6bff] pl-4">
                    &ldquo;I built MIKA so you never have to feel as lost as I did, and made it free, for anyone who needs it.&rdquo;
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-px bg-[#1e6bff]" />
                  <span className="text-sm font-medium tracking-widest uppercase text-white/70">
                    Husam Hammami, Creator
                  </span>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* TRANSITION INTO LIGHT */}
        <div aria-hidden="true" className="bg-gradient-to-b from-[#05070d] to-white h-48 w-full" />

        {/* 2) LIGHT / CLINICAL PRODUCT SECTION */}
        <section id="how" className="mika-light-bg py-24 px-6">
          <div className="max-w-5xl mx-auto text-center mb-24">
            <FadeIn>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#05070d] mb-6">
                How it works
              </h2>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Four simple steps to clarity.
              </p>
            </FadeIn>
          </div>

          <div className="max-w-6xl mx-auto space-y-32">
            {STEPS.map((step) => (
              <div key={step.n} className="grid md:grid-cols-2 gap-12 items-center">
                <FadeIn className={`space-y-6 ${step.reverse ? "order-1 md:order-2 md:pl-12" : "md:pr-12"}`}>
                  <div className="w-12 h-12 rounded-full mika-accent-bg text-white flex items-center justify-center text-xl font-bold mb-8">
                    {step.n}
                  </div>
                  <h3 className="text-3xl font-bold text-[#05070d]">{step.title}</h3>
                  <p className="text-lg text-gray-600">{step.body}</p>
                </FadeIn>
                <FadeIn
                  delay={0.2}
                  className={`relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-gray-100 aspect-video ${step.reverse ? "order-2 md:order-1" : ""}`}
                >
                  <video
                    src={`${baseUrl}/footage/${step.clip}.mp4`}
                    poster={`${baseUrl}/footage/${step.clip}.jpg`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-label={step.label}
                    className="w-full h-full object-contain"
                  />
                </FadeIn>
              </div>
            ))}
          </div>
        </section>

        {/* WHAT MIKA READS */}
        <section className="mika-light-bg pb-24 px-6">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <FadeIn>
              <span className="inline-block text-sm font-semibold tracking-widest uppercase mika-accent-text mb-4">
                What MIKA reads
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#05070d] mb-6">
                Bring whatever your doctor gave you.
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                MIKA understands the files you already have at home — no special exports or formats to figure out.
              </p>
            </FadeIn>
          </div>

          <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "Medical scans", body: "MRI, CT, and X-ray images." },
              { icon: FlaskConical, title: "Lab & blood work", body: "Blood panels and printed lab reports." },
              { icon: FileText, title: "Everyday files", body: "The image files and PDFs you already have." },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="h-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                  <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#1e6bff]/10 text-[#1e6bff] mb-5">
                    <item.icon className="w-6 h-6" />
                  </span>
                  <h3 className="text-xl font-bold text-[#05070d] mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* LAB REPORTS */}
        <section className="mika-light-bg pb-24 px-6">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <FadeIn>
              <span className="inline-block text-sm font-semibold tracking-widest uppercase mika-accent-text mb-4">
                Not just imaging
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#05070d] mb-6">
                Lab reports too.
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                MIKA reads your blood work and lab panels the same way. It explains every value and tells you what actually matters.
              </p>
            </FadeIn>
          </div>

          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-white">
                <img
                  src={`${baseUrl}/product/lab_result.png`}
                  alt="MIKA explaining a lab report in plain language"
                  width={1600}
                  height={719}
                  loading="lazy"
                  className="w-full h-auto"
                />
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <FadeIn delay={0.15} className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-white">
                  <img
                    src={`${baseUrl}/product/lab_values.png`}
                    alt="Every lab value read against your printed range"
                    width={1600}
                    height={758}
                    loading="lazy"
                    className="w-full h-auto"
                  />
                </div>
                <p className="text-base text-gray-600 text-center">
                  Every value, read against your printed range and put in plain words.
                </p>
              </FadeIn>
              <FadeIn delay={0.3} className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-white">
                  <img
                    src={`${baseUrl}/product/lab_chat.png`}
                    alt="Ask MIKA about your lab report"
                    width={1600}
                    height={780}
                    loading="lazy"
                    className="w-full h-auto"
                  />
                </div>
                <p className="text-base text-gray-600 text-center">
                  Ask anything about your results and get a clear answer back.
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* PRIVACY / LOCAL PROCESSING */}
        <section className="bg-gray-50 py-24 px-6 border-t border-gray-200">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <FadeIn>
              <span className="inline-block text-sm font-semibold tracking-widest uppercase mika-accent-text mb-4">
                Private by design
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#05070d] mb-6">
                Your scans stay yours.
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                MIKA reads and explains your scans on your own computer. Your most personal medical files stay with you.
              </p>
            </FadeIn>
          </div>

          <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
            {[
              { icon: Laptop, title: "Runs on your computer", body: "The reading happens on your own machine." },
              { icon: Lock, title: "Your files, your device", body: "Your scans and reports stay where they are." },
              { icon: ShieldCheck, title: "Free, with no catch", body: "No subscription and nothing to sell — it's just free." },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="h-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                  <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#1e6bff]/10 text-[#1e6bff] mb-5">
                    <item.icon className="w-6 h-6" />
                  </span>
                  <h3 className="text-xl font-bold text-[#05070d] mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mika-light-bg py-24 px-6 border-t border-gray-200">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#05070d] mb-12 text-center">
                Questions, answered.
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-lg font-medium text-[#05070d]">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-gray-600">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </FadeIn>
          </div>
        </section>

        {/* DOWNLOAD / EMAIL GATE */}
        <section id="download" className="bg-gray-50 py-32 px-6 border-t border-gray-200">
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <FadeIn>
              <img
                src={`${baseUrl}/brand/mika_helix_ink.png`}
                alt="MIKA"
                width={278}
                height={559}
                loading="lazy"
                className="h-16 w-auto mx-auto mb-8 opacity-80"
              />
              <h2 className="text-4xl font-bold text-[#05070d]">
                Get MIKA for free.
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-xl mx-auto">
                <EmailGate />
              </div>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-6 leading-relaxed">
                MIKA explains scans and lab reports in plain language. It is not a doctor and does not replace professional medical advice.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mika-dark-bg py-12 px-6 border-t border-white/10 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <img
              src={`${baseUrl}/brand/mika_type.png`}
              alt="MIKA"
              width={751}
              height={126}
              loading="lazy"
              className="h-5 w-auto mx-auto opacity-50"
            />
            <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
              MIKA explains scans and lab reports in plain language. It is not a doctor and does not replace professional medical advice.
            </p>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} MIKA. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
