import React, { useState } from 'react';
import API from '../config';
import { Mail, MapPin, Loader2 } from 'lucide-react';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ success: null, message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ success: null, message: '' });

    const { name, email, message } = formData;
    if (!name.trim() || !email.trim() || !message.trim()) {
      return setFeedback({ success: false, message: 'Please complete all form fields.' });
    }

    if (!validateEmail(email)) {
      return setFeedback({ success: false, message: 'Please enter a valid email address.' });
    }

    if (name.length > 100 || email.length > 100 || message.length > 3000) {
      return setFeedback({ success: false, message: 'Inputs exceed secure length limits.' });
    }

    setLoading(true);

    try {
      const response = await API.post('/api/messages', formData);
      setFeedback({ success: true, message: response.data.message || 'Message delivered successfully!' });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to deliver message. Please try again.';
      setFeedback({ success: false, message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="w-full max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24 py-24 border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Left column details */}
        <div className="flex flex-col justify-between relative z-10">
          <div>
            <span className="text-orange-500 uppercase tracking-widest text-xs font-bold">Connect With Me</span>
            <h2 className="mt-4 text-slate-900 dark:text-white text-4xl md:text-5xl font-extrabold leading-tight">
              Got a great idea?<br />Let's build it together.
            </h2>
            <p className="mt-6 text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed max-w-[500px]">
              Ready to take your project online? Get in touch to discuss custom websites, tools, or potential collaborations.
            </p>
          </div>

          <div className="mt-12 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-orange-500 text-lg">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">Direct Email</span>
                <p className="text-slate-800 dark:text-white font-semibold">
                  <a href="mailto:arunabhadeveloper@gmail.com" className="hover:text-orange-500 transition-colors">
                    arunabhadeveloper@gmail.com
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-orange-500 text-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">Location</span>
                <p className="text-slate-800 dark:text-white font-semibold">India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column form */}
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050914]/80 p-8 shadow-2xl backdrop-blur-md relative z-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {feedback.message && (
              <div className={`p-4 rounded-xl border text-sm font-semibold ${
                feedback.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                {feedback.message}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
                placeholder="Name" 
                className="px-4 py-3 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all duration-300" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                value={formData.email}
                onChange={handleChange}
                maxLength={100}
                placeholder="email@example.com" 
                className="px-4 py-3 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all duration-300" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Message Details</label>
              <textarea 
                id="message" 
                name="message" 
                required 
                rows="4" 
                value={formData.message}
                onChange={handleChange}
                maxLength={3000}
                placeholder="Briefly describe your project details..." 
                className="px-4 py-3 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all duration-300 resize-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-xl bg-orange-500 text-black font-bold hover:bg-orange-600 transition-colors duration-300 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>Send Message</span>
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}

export default Contact;
