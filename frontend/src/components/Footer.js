import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-secondary-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Finternet</h3>
            <p className="text-secondary-300 text-sm">
              A scalable, secure, user-centric financial internet platform with tokenized assets, 
              unified ledger backend, and decentralized smart contracts.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-secondary-300 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/assets" className="hover:text-white transition-colors">Assets</Link></li>
              <li><Link to="/transactions" className="hover:text-white transition-colors">Transactions</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-secondary-300 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">API Reference</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-secondary-300 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-secondary-700 mt-8 pt-6">
          <p className="text-secondary-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Finternet. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-secondary-400 hover:text-white transition-colors">
              <FaGithub size={20} />
            </a>
            <a href="#" className="text-secondary-400 hover:text-white transition-colors">
              <FaTwitter size={20} />
            </a>
            <a href="#" className="text-secondary-400 hover:text-white transition-colors">
              <FaLinkedin size={20} />
            </a>
            <a href="mailto:info@finternet.com" className="text-secondary-400 hover:text-white transition-colors">
              <FaEnvelope size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
