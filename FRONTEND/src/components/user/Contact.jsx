import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, ChevronRight } from 'lucide-react';
import Navbar from '../shared/Navbar';

const ContactUs = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[40vh] bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <Navbar />
        
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto px-4">
              We'd love to hear from you. Reach out to us for any questions or concerns.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-600/20 transform -skew-y-6 rounded-3xl" />
            <div className="relative bg-white p-8 rounded-xl shadow-xl">
              <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-all duration-300"
                    placeholder="Your Name"
                    required
                  />
                </div>

                <div className="group">
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({...formState, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-all duration-300"
                    placeholder="Your Email"
                    required
                  />
                </div>

                <div className="group">
                  <input
                    type="text"
                    value={formState.subject}
                    onChange={(e) => setFormState({...formState, subject: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-all duration-300"
                    placeholder="Subject"
                    required
                  />
                </div>

                <div className="group">
                  <textarea
                    value={formState.message}
                    onChange={(e) => setFormState({...formState, message: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-all duration-300 h-32 resize-none"
                    placeholder="Your Message"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-8 rounded-lg font-semibold
                    hover:opacity-90 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Send Message
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
              Get in Touch
            </h2>

            <div className="space-y-6">
              <ContactCard
                icon={<Phone className="w-6 h-6" />}
                title="Phone"
                info="+1 234 567 890"
                detail="Monday to Friday, 9am to 6pm"
              />

              <ContactCard
                icon={<Mail className="w-6 h-6" />}
                title="Email"
                info="lushaura@gmail.com"
                detail="We'll respond within 24 hours"
              />

              <ContactCard
                icon={<MapPin className="w-6 h-6" />}
                title="Address"
                info="123 Fashion Street"
                detail="City, Country"
              />
            </div>

            {/* FAQ Section */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <FaqItem 
                  question="What are your working hours?"
                  answer="We're available Monday to Friday, from 9 AM to 6 PM EST."
                />
                <FaqItem 
                  question="How long does it take to get a response?"
                  answer="We typically respond to all inquiries within 24 hours during business days."
                />
                <FaqItem 
                  question="Do you offer international shipping?"
                  answer="Yes, we ship to most countries worldwide. Shipping rates vary by location."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactCard = ({ icon, title, info, detail }) => (
  <div className="flex items-start gap-4 p-6 rounded-xl bg-white shadow-lg hover:transform hover:scale-105 transition-all duration-300">
    <div className="flex-shrink-0">
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white">
        {icon}
      </div>
    </div>
    <div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-700 mt-1">{info}</p>
      <p className="text-gray-500 text-sm mt-1">{detail}</p>
    </div>
  </div>
);

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors duration-300"
      >
        <span className="font-medium">{question}</span>
        <ChevronRight className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      <div className={`px-6 transition-all duration-300 ${isOpen ? 'py-4' : 'h-0 overflow-hidden'}`}>
        <p className="text-gray-700">{answer}</p>
      </div>
    </div>
  );
};

export default ContactUs;