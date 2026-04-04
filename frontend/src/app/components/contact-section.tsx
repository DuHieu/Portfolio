import { motion } from 'motion/react';
import { Mail, Send, User, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export function ContactSection({ username }: { username: string }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/api/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="relative py-32 md:py-40 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00D9FF]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A855F7]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section title for ${username} */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-[#00D9FF] to-[#A855F7] bg-clip-text text-transparent">
              Get In Touch
            </span>
          </h2>
          <p className="text-xl text-white/60 tracking-wide">
            Let's create something extraordinary together with {username}
          </p>
        </motion.div>

        {/* Contact form in 3D glass sphere */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Floating animation */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotateX: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="preserve-3d"
          >
            {/* Glass container */}
            <div className="relative backdrop-blur-2xl bg-white/5 border border-white/20 rounded-[3rem] p-12 overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/10 via-transparent to-[#A855F7]/10" />
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                {/* Name field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <label className="flex items-center gap-2 text-white/80 mb-3 tracking-wide">
                    <User className="w-5 h-5" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-6 py-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#00D9FF]/50 transition-colors tracking-wide"
                    required
                  />
                </motion.div>

                {/* Email field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <label className="flex items-center gap-2 text-white/80 mb-3 tracking-wide">
                    <Mail className="w-5 h-5" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-6 py-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#00D9FF]/50 transition-colors tracking-wide"
                    required
                  />
                </motion.div>

                {/* Message field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <label className="flex items-center gap-2 text-white/80 mb-3 tracking-wide">
                    <MessageSquare className="w-5 h-5" />
                    Your Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell me about your project..."
                    rows={6}
                    className="w-full px-6 py-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#00D9FF]/50 transition-colors resize-none tracking-wide"
                    required
                  />
                </motion.div>

                {/* Submit button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <motion.button
                    type="submit"
                    disabled={status === 'sending'}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full relative px-8 py-5 backdrop-blur-xl bg-gradient-to-r from-[#00D9FF] to-[#A855F7] rounded-2xl text-white overflow-hidden group disabled:opacity-70"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 tracking-wide">
                      <Send className="w-5 h-5" />
                      {status === 'sending' ? 'Sending...' : status === 'success' ? 'Message Sent! ✓' : status === 'error' ? 'Error – Try again' : 'Send Message'}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.button>
                </motion.div>
              </form>

              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-[#00D9FF]/30 to-transparent rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#A855F7]/30 to-transparent rounded-full blur-2xl" />
            </div>

            {/* Outer glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00D9FF]/20 to-[#A855F7]/20 rounded-[3rem] blur-3xl -z-10" />
          </motion.div>

          {/* Shadow */}
          <div className="absolute inset-0 bg-black/30 rounded-[3rem] blur-3xl translate-y-8 -z-20" />
        </motion.div>

        {/* Social links (optional) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16 space-y-4"
        >
          <p className="text-white/60 tracking-wide">Or find me on</p>
          <div className="flex justify-center gap-4">
            {['Twitter', 'LinkedIn', 'GitHub', 'Dribbble'].map((platform, index) => (
              <motion.a
                key={platform}
                href="#"
                whileHover={{ y: -5, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                className="px-6 py-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full text-white/80 hover:text-white hover:border-white/40 transition-all tracking-wide"
              >
                {platform}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
