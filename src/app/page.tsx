"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  KeyRound,
  Shield,
  EyeOff,
  MessageSquare,
  Lock,
  Fingerprint,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#EBEAE6] font-sans selection:bg-[#B87B5C] selection:text-[#0B0C0E]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b border-[#1A1D24] bg-[#0B0C0E]/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#111317] border border-[#1D2027] flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-[#8FA3B8]" />
            </div>
            <span className="text-sm font-medium tracking-[0.2em] text-[#EBEAE6] uppercase">
              Mystery Message
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/auth/sign-in"
              className="text-xs font-medium text-[#828896] hover:text-[#EBEAE6] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="text-xs font-medium bg-[#EBEAE6] text-[#0B0C0E] px-5 py-2.5 hover:bg-[#B87B5C] transition-colors"
            >
              Create Portal
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative max-w-6xl mx-auto px-6 pt-32 pb-40 flex flex-col items-center text-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-3xl space-y-8"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#1D2027] bg-[#111317] text-[10px] uppercase tracking-widest text-[#828896]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#3E6E56]" />
              Secure Anonymous Messaging
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-6xl font-light tracking-tight text-[#EBEAE6] leading-[1.1]"
            >
              &quot;I wonder what people secretly think about me.&quot;
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-[#828896] font-light max-w-2xl mx-auto leading-relaxed"
            >
              A quiet space for unvarnished truths and silent questions. No
              profiles, no performative posts. Just honest words delivered in
              complete anonymity.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#EBEAE6] text-[#0B0C0E] px-8 py-4 text-sm font-medium hover:bg-[#B87B5C] transition-all duration-300 active:scale-[0.98]"
              >
                Deploy Your Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="w-full sm:w-auto flex items-center justify-center bg-transparent border border-[#1D2027] text-[#EBEAE6] px-8 py-4 text-sm font-medium hover:border-[#B87B5C] hover:bg-[#111317] transition-all duration-300"
              >
                Discover How
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Product Preview / UI Mockup */}
        <section className="max-w-5xl mx-auto px-6 pb-40">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full bg-[#111317] border border-[#1D2027] p-2"
          >
            <div className="bg-[#0B0C0E] border border-[#1A1D24] h-[400px] flex flex-col">
              <div className="border-b border-[#1A1D24] p-4 flex items-center justify-between">
                <div className="text-xs text-[#828896] tracking-widest uppercase">
                  Inbox
                </div>
                <div className="text-xs text-[#5C616E]">3 Unread Messages</div>
              </div>
              <div className="p-8 flex flex-col gap-4 overflow-hidden relative">
                {/* Mock Message 1 */}
                <div className="bg-[#111317] border-l-2 border-[#B87B5C] p-6 max-w-lg">
                  <p className="text-[#EBEAE6] font-light leading-relaxed">
                    &quot;I&apos;ve always admired how you handle pressure. You
                    make it look effortless, even when I know it&apos;s
                    not.&quot;
                  </p>
                  <p className="text-[10px] text-[#5C616E] tracking-widest uppercase mt-4">
                    Just now • Anonymous
                  </p>
                </div>
                {/* Mock Message 2 */}
                <div className="bg-[#111317] border-l-2 border-[#1D2027] p-6 max-w-lg opacity-60 ml-8">
                  <p className="text-[#EBEAE6] font-light leading-relaxed">
                    &quot;Thank you for listening yesterday. I didn&apos;t know
                    how to say it in person.&quot;
                  </p>
                  <p className="text-[10px] text-[#5C616E] tracking-widest uppercase mt-4">
                    2 hours ago • Anonymous
                  </p>
                </div>
                {/* Solid fade out at bottom to simulate scroll without gradients */}
                <div className="absolute bottom-0 left-0 w-full h-12 bg-[#0B0C0E]/90 backdrop-blur-sm" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="border-y border-[#1A1D24] bg-[#07080A] py-32"
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-light text-[#EBEAE6] tracking-tight">
                The Architecture of Secrecy
              </h2>
              <p className="text-[#828896] mt-4 font-light">
                Three steps to your private correspondence.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Claim an Alias",
                  desc: "Register a unique username. No personal details required. Your identity remains entirely abstracted.",
                  icon: Fingerprint,
                },
                {
                  step: "02",
                  title: "Distribute the Link",
                  desc: "Share your dedicated portal URL on social media, in your bio, or privately to selected individuals.",
                  icon: ArrowRight,
                },
                {
                  step: "03",
                  title: "Receive Truths",
                  desc: "Read unvarnished feedback and messages in a secure, distraction-free inbox designed for contemplation.",
                  icon: MessageSquare,
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="bg-[#0B0C0E] border border-[#1D2027] p-8 hover:border-[#B87B5C] transition-colors duration-300"
                >
                  <div className="flex justify-between items-start mb-12">
                    <div className="w-10 h-10 border border-[#1D2027] bg-[#111317] flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-[#8FA3B8]" />
                    </div>
                    <span className="text-[10px] text-[#5C616E] tracking-widest font-mono">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-[#EBEAE6] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#828896] leading-relaxed font-light">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features / Why People Love It */}
        <section className="py-32 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-3xl md:text-4xl font-light tracking-tight leading-tight">
                Anonymity is a mirror that reflects the uncompromised self.
              </h2>
              <p className="text-[#828896] font-light leading-relaxed">
                When the fear of judgment is removed, people speak freely. We
                built Mystery Message to facilitate genuine human connection
                stripped of social performativity. It&apos;s not about hiding;
                it&apos;s about revealing.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  {
                    title: "No Metadata Logging",
                    desc: "We don't track sender IPs, locations, or browser fingerprints.",
                  },
                  {
                    title: "End-to-End Obfuscation",
                    desc: "Your inbox is secured and accessible only via your credentials.",
                  },
                  {
                    title: "Zero Ads. Zero Tracking.",
                    desc: "A pure, premium experience designed for introspection.",
                  },
                ].map((feature, i) => (
                  <li key={i} className="flex gap-4">
                    <Shield className="w-5 h-5 text-[#B87B5C] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[#EBEAE6] text-sm font-medium">
                        {feature.title}
                      </h4>
                      <p className="text-[#828896] text-xs mt-1">
                        {feature.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Visual element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square bg-[#07080A] border border-[#1A1D24] flex items-center justify-center overflow-hidden"
            >
              {/* Abstract conceptual visual for "Anonymity/Secrecy" - Geometric patterns */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#111317_1px,transparent_1px),linear-gradient(to_bottom,#111317_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50" />
              <div className="relative w-48 h-48 border border-[#1D2027] bg-[#0B0C0E] rotate-45 flex items-center justify-center transition-transform hover:rotate-90 duration-1000 ease-out">
                <div className="w-24 h-24 border border-[#B87B5C] -rotate-45 flex items-center justify-center">
                  <EyeOff className="w-6 h-6 text-[#B87B5C]" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-[#1A1D24] bg-[#07080A] py-32 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <div className="w-16 h-16 mx-auto bg-[#111317] border border-[#1D2027] flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#EBEAE6]" />
            </div>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight">
              Ready to listen?
            </h2>
            <p className="text-[#828896] font-light">
              Create your portal in less than 30 seconds and start receiving
              anonymous messages today.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center bg-[#EBEAE6] text-[#0B0C0E] px-8 py-4 text-sm font-medium hover:bg-[#B87B5C] transition-all duration-300 active:scale-[0.98]"
            >
              Create Your Portal
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1A1D24] bg-[#0B0C0E] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#5C616E]" />
            <span className="text-xs tracking-[0.2em] text-[#5C616E] uppercase">
              Mystery Message
            </span>
          </div>
          <div className="flex gap-8 text-[10px] tracking-widest uppercase text-[#5C616E]">
            <Link href="#" className="hover:text-[#EBEAE6] transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-[#EBEAE6] transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-[#EBEAE6] transition-colors">
              Contact
            </Link>
          </div>
          <div className="text-[10px] text-[#5C616E]">
            © 2026. Designed for truth.
          </div>
        </div>
      </footer>
    </div>
  );
}
