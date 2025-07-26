import { assets } from "../assets/assets";

const Contact = () => {
  return (
    <div>
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          CONTACT <span className="text-gray-700 font-medium">US</span>
        </p>
      </div>
      <div className="my-10 flex flex-col md:flex-row gap-10 justify-center md:flex-row mb-28 text-sm">
        <img
          src={assets.contact_image}
          className="w-full md:max-w-[360px]"
          alt=""
        />
        <div className="flex flex-col justify-center gap-6">
          <p className="font-semibold text-gray-600">Our OFFICE</p>
          <p className="text-gray-500">123 Main St Anytown, USA</p>
          <p className="text-gray-500">
            Tel: (123) 456-7890 <br />
            Email: contact@merodoctor.com
          </p>
          <p className="text-gray-500">Office Hours: Mon-Fri, 9 AM - 5 PM</p>
          <p className="font-semibold text-gray-600">Careers at Mero Doctor</p>
          <p className="text-gray-500">
            Join our team and make a difference in healthcare!
          </p>
          <button className="border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500">
            Explore Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
