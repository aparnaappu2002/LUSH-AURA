import React from 'react';
import Navbar from '../shared/Navbar';
import { useNavigate } from 'react-router-dom';


const HomePage = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section className="relative h-[700px] bg-gradient-to-r from-purple-900 to-pink-500">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white z-10">
            <h1 className="text-6xl font-extrabold mb-4 leading-tight">
              Discover Your <span className="text-pink-300">LUSH AURA</span>
            </h1>
            <p className="text-xl mb-8 font-light">
              Indulge in our premium collection of beauty and skincare products, crafted to enhance your natural radiance.
            </p>
            <button className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
             onClick={()=>navigate('/shop')}>
              Explore Now
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,112C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Featured Collections */}
      {/* Featured Collections */}
{/* Featured Collections */}
<section className="py-20 container mx-auto px-4">
  <h2 className="text-4xl font-bold text-center mb-12">Featured Collections</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {[
      {
        name: 'Skincare',
        image: 'https://res.cloudinary.com/dzpf5joxo/image/upload/v1733749603/category/dyba1hww0g9rkem9ngqk.webp'
      },
      {
        name: 'Makeup',
        image: 'https://res.cloudinary.com/dzpf5joxo/image/upload/v1733749485/category/qyt6y4bvqe4z92axkgey.jpg'
      },
      {
        name: 'Haircare',
        image: 'https://res.cloudinary.com/dzpf5joxo/image/upload/v1733749502/category/hjf2y8rnwhmvj5fyh8wt.jpg'
      }
    ].map((item, index) => (
      <div
        key={index}
        className="group relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
      >
        <img
          src={item.image}
          alt={`${item.name} Collection`}
          className="w-full h-[400px] object-cover transition-all duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
          <p className="text-sm mb-4">Discover our {item.name.toLowerCase()} essentials</p>
          <button className="bg-white text-purple-900 font-bold py-2 px-4 rounded-full hover:bg-purple-100 transition duration-300"
            onClick={()=>navigate('/shop')}>
            Shop Now
          </button>
        </div>
      </div>
    ))}
  </div>
</section>



      {/* Products Grid */}
      <section className="py-20 bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-4xl font-bold text-center mb-12">Our Best Sellers</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        {
          id: 1,
          name: "Aqualogica Radiance+ Smoothie Face Wash with Watermelon & Niacinamide for Clear & Oil-Free Skin - 100 ml",
          price: "Rs.212",
          image: "https://res.cloudinary.com/dzpf5joxo/image/upload/v1733640643/aqualogica-radiance-oil-free-moisturizer-with-watermelon-and-niacinamide-100g_3_display_1725522762_99e53e0a_e7ddus.webp"
        },
        {
          id: 2,
          name: "M.A.C Squirt Plumping Lip Gloss Stick - Heat Sensor",
          price: "Rs.1840",
          image: "https://res.cloudinary.com/dzpf5joxo/image/upload/v1733640369/4c5577c773602692187_1_1_ckbm5a.avif"
        },
        {
          id: 3,
          name: "Kay Beauty Quick Dry Liquid Eyeliner - Black Canvas",
          price: "Rs.479",
          image: "https://res.cloudinary.com/dzpf5joxo/image/upload/v1733640583/8c0c0ce8904330900486_2_1_uavuzl.avif"
        }
      ].map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
        >
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[400px] object-contain"
            />
            <div className="absolute top-0 right-0 bg-pink-500 text-white px-2 py-1 m-2 rounded-full text-sm font-bold">
              New
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <button className="bg-white text-purple-900 font-bold py-2 px-4 rounded-full hover:bg-purple-100 transition duration-300">
                Quick View
              </button>
            </div>
          </div>

          <div className="p-4 flex flex-col flex-grow justify-between">
            <h3 className="font-bold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-2">{product.price}</p>

            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 fill-current text-yellow-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
              <span className="text-gray-600 ml-2">(48 reviews)</span>
            </div>

            <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-full transition duration-300"
             onClick={()=>navigate('/shop')}>
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>




      {/* Promotional Banner */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
  <div className="container mx-auto px-4">
    <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0">
      
      {/* Text Content */}
      <div className="md:w-1/2">
        <h2 className="text-4xl font-bold mb-4">Special Summer Offer</h2>
        <p className="text-xl mb-6">Get 30% off on all makeup products this week! "Makeup is the art of enhancing what you already have, letting your confidence shine through every brushstroke."</p>
        <button className="bg-white text-purple-600 font-bold py-3 px-8 rounded-full hover:bg-purple-100 transition duration-300 shadow-lg">
          Shop the Sale
        </button>
      </div>

      {/* Image Section */}
      <div className="md:w-1/2 flex justify-center">
        <img
          src="https://res.cloudinary.com/dzpf5joxo/image/upload/v1733753555/1733475153_swiss_beauty_900x1318_hqa9sk.webp"
          alt="Summer Sale"
          className="w-3/4 max-w-sm rounded-lg shadow-2xl object-contain"
        />
      </div>
      
    </div>
  </div>
</section>


      {/* Beauty Gallery */}
  <section className="py-20">
  <div className="container mx-auto px-4">
    <h2 className="text-4xl font-bold text-center mb-12">Beauty Gallery</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        {
          id: 1,
          src: "https://res.cloudinary.com/dzpf5joxo/image/upload/v1733801431/pexels-polina-kovaleva-5927890_llguh2.jpg",
        },
        {
          id: 2,
          src: "https://res.cloudinary.com/dzpf5joxo/image/upload/v1733801393/pexels-adrienne-andersen-1174503-2661256_pweebd.jpg",
        },
        {
          id: 3,
          src: "https://res.cloudinary.com/dzpf5joxo/image/upload/v1733801404/pexels-alipazani-2787341_wm2jsh.jpg",
        },
        {
          id: 3,
          src: "https://res.cloudinary.com/dzpf5joxo/image/upload/v1733801760/download_batcheditor_fotor_1_lvj9sb.jpg",
        },
      ].map((item) => (
        <div
          key={item.id}
          className={`${
            item.id % 3 === 0 ? "row-span-2" : ""
          } overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300`}
        >
          <img
            src={item.src}
            alt={`Gallery ${item.id}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  </div>
</section>


      {/* Footer */}
      <footer className="bg-purple-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">About Lush Aura</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-pink-300 transition duration-300">Our Story</a></li>
                <li><a href="#" className="hover:text-pink-300 transition duration-300">Careers</a></li>
                <li><a href="#" className="hover:text-pink-300 transition duration-300">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4">Customer Care</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-pink-300 transition duration-300">Contact Us</a></li>
                <li><a href="#" className="hover:text-pink-300 transition duration-300">Shipping & Returns</a></li>
                <li><a href="#" className="hover:text-pink-300 transition duration-300">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4">Shop</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-pink-300 transition duration-300">Skincare</a></li>
                <li><a href="#" className="hover:text-pink-300 transition duration-300">Makeup</a></li>
                <li><a href="#" className="hover:text-pink-300 transition duration-300">Hair Care</a></li>
                <li><a href="#" className="hover:text-pink-300 transition duration-300">Fragrances</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4">Connect</h3>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="text-white hover:text-pink-300 transition duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-pink-300 transition duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.467.398.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.023.047 1.351.058 3.807.058h.468c2.456 0 2.784-.011 3.807-.058.975-.045 1.504-.207 1.857-.344.467-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.047-1.023.058-1.351.058-3.807v-.468c0-2.456-.011-2.784-.058-3.807-.045-.975-.207-1.504-.344-1.857a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-pink-300 transition duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
              <p className="text-sm">Stay updated with our latest offers and beauty tips!</p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-12 pt-8 text-center">
            <p>&copy; 2024 Lush Aura Beauty. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;