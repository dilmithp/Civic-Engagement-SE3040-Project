import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-primary-50 font-sans">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md border-b border-primary-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <Link to="/" className="font-bold text-lg text-primary-900 tracking-tight">CivicConnect</Link>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-primary-700">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-primary-600 transition-colors">About Us</Link>
            <Link to="/contact" className="text-primary-600 font-semibold">Contact</Link>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors">Login</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary-900 tracking-tight mb-6">Get in Touch</h1>
            <div className="h-1.5 w-20 bg-primary-500 rounded-full mb-8"></div>
            <p className="text-lg text-primary-700 leading-relaxed mb-8">
              Have a question about using the platform or need to report a technical issue? Our support team is ready to assist.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-primary-100 transition-colors">
                <Mail className="text-primary-600 mt-1" size={24} />
                <div>
                  <h4 className="font-bold text-primary-900">Email Us</h4>
                  <p className="text-primary-600 mt-1">support@civicconnect.city</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-primary-100 transition-colors">
                <Phone className="text-primary-600 mt-1" size={24} />
                <div>
                  <h4 className="font-bold text-primary-900">Call Us</h4>
                  <p className="text-primary-600 mt-1">+1 (555) 123-4567</p>
                  <p className="text-sm text-primary-400 mt-0.5">Mon-Fri, 9am-5pm EST</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-primary-100 transition-colors">
                <MapPin className="text-primary-600 mt-1" size={24} />
                <div>
                  <h4 className="font-bold text-primary-900">Headquarters</h4>
                  <p className="text-primary-600 mt-1">100 Innovation Drive<br/>Suite 300<br/>Tech City, ST 12345</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-primary-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-primary-900 mb-6">Send a Message</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary-800 mb-1.5">Full Name</label>
                <input type="text" className="w-full bg-primary-50 border border-primary-200 focus:ring-2 focus:ring-primary-500 rounded-xl px-4 py-2.5 outline-none transition-all text-primary-900" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary-800 mb-1.5">Email Address</label>
                <input type="email" className="w-full bg-primary-50 border border-primary-200 focus:ring-2 focus:ring-primary-500 rounded-xl px-4 py-2.5 outline-none transition-all text-primary-900" placeholder="jane@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary-800 mb-1.5">Message</label>
                <textarea rows="4" className="w-full bg-primary-50 border border-primary-200 focus:ring-2 focus:ring-primary-500 rounded-xl px-4 py-2.5 outline-none transition-all text-primary-900 resize-none" placeholder="How can we help?"></textarea>
              </div>
              <button type="button" className="w-full py-3 mt-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all">
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
