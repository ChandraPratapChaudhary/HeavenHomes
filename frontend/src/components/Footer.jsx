import React from 'react';
import { Building2, Heart, Shield, Sparkles, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">HEAVEN<span className="text-sky-400">HOMES</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Discover & book handpicked luxury hotels, villas, and boutique resorts across top destinations with instant dynamic pricing.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Top Cities</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/?city=Mumbai" className="hover:text-sky-400 transition-colors">Mumbai Hotels</a></li>
              <li><a href="/?city=Delhi" className="hover:text-sky-400 transition-colors">Delhi Stays</a></li>
              <li><a href="/?city=Goa" className="hover:text-sky-400 transition-colors">Goa Luxury Resorts</a></li>
              <li><a href="/?city=Bengaluru" className="hover:text-sky-400 transition-colors">Bengaluru Business Hotels</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-500">Secure Payments via Razorpay</span></li>
              <li><span className="text-slate-500">Instant Automated Confirmation</span></li>
              <li><span className="text-slate-500">Spring Boot Security + JWT</span></li>
              <li><span className="text-slate-500">Dynamic Pricing Strategy Engine</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-sky-400" /> support@heavenhomes.com
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Phone className="w-4 h-4 text-sky-400" /> +91 1800-200-HEAVEN
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-sky-400" /> Headquarters: Mumbai, India
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Heaven-Homes Luxury Stays. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Built with React JS, Tailwind CSS & Spring Boot</span>
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
