import React from 'react';
import { Heart, Star, Users, Package, Clock, Shield, Phone, Mail, MapPin } from 'lucide-react';
import Navbar from '../shared/Navbar';

const AboutUs = () => {
  return (
    <div className="min-h-screen relative">
      {/* Video Background Section */}
      <div className="relative h-[80vh] overflow-hidden">
        <video
          autoPlay
          muted
          loop
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source
            src="https://res.cloudinary.com/edusphere/video/upload/v1737004587/skuuw9toa0w4khlmelfj.mp4"
            type="video/mp4"
          />
        </video>
        
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/50">
          <Navbar />

           {/* Hero Section - centered vertically and horizontally */}
           <div className="relative h-[calc(80vh-64px)] flex items-center justify-center">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h1 className="text-5xl font-bold mb-6 text-white">
                  Welcome to Our Story
                </h1>
                <p className="text-xl max-w-3xl mx-auto text-gray-100">
                  We're passionate about delivering exceptional fashion experiences that blend style, quality, and affordability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Heart className="w-8 h-8 text-pink-500" />}
              title="Customer First"
              description="We prioritize our customers' satisfaction above everything else, ensuring a seamless shopping experience."
            />
            <FeatureCard
              icon={<Star className="w-8 h-8 text-purple-500" />}
              title="Quality Products"
              description="Each product is carefully curated to meet our high standards of quality and style."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-pink-500" />}
              title="Community Driven"
              description="Built by fashion enthusiasts, for fashion enthusiasts. Join our growing community."
            />
            <FeatureCard
              icon={<Package className="w-8 h-8 text-purple-500" />}
              title="Fast Delivery"
              description="Quick and reliable shipping to get your favorite items to you as soon as possible."
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-pink-500" />}
              title="24/7 Support"
              description="Our dedicated team is always here to help you with any questions or concerns."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-purple-500" />}
              title="Secure Shopping"
              description="Your security matters. Shop with confidence using our protected payment systems."
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white/90 backdrop-blur-md py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Get in Touch</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <ContactCard
                icon={<Phone className="w-6 h-6" />}
                title="Call Us"
                info="+1 234 567 890"
              />
              <ContactCard
                icon={<Mail className="w-6 h-6" />}
                title="Email Us"
                info="lushaura@gmail.com"
              />
              <ContactCard
                icon={<MapPin className="w-6 h-6" />}
                title="Visit Us"
                info="123 Fashion Street, City, Country"
              />
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
              Our Vision
            </h2>
            <p className="text-lg text-gray-800 leading-relaxed">
              We envision a world where everyone can express their unique style without compromise. 
              Our mission is to revolutionize online fashion shopping by providing exceptional products, 
              outstanding service, and an inclusive community for fashion lovers worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl hover:transform hover:scale-105 transition-all duration-300 shadow-lg">
    <div className="bg-pink-50 rounded-full w-16 h-16 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-700">{description}</p>
  </div>
);

// Contact Card Component
const ContactCard = ({ icon, title, info }) => (
  <div className="text-center p-6 rounded-xl bg-white/80 hover:bg-white/90 transition-all duration-300 shadow-lg">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-700">{info}</p>
  </div>
);

export default AboutUs;