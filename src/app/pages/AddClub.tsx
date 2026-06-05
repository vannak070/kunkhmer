import { useState } from "react";
import { ArrowLeft, Save, Upload, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router";

export function AddClub() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    headCoach: "",
    phone: "",
    email: "",
    established: "",
    description: "",
    status: "active",
    image: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally save to backend/database
    console.log("Club data:", formData);
    // Navigate back to clubs page
    navigate("/home/clubs");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F5F7] min-h-full">
      {/* Header */}
      <header className="bg-[#FFFFFF] border-b border-[#B0B0B0]/20 px-4 md:px-6 py-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/home/clubs" className="p-2 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#0A3D91] rounded-lg transition-colors border border-[#B0B0B0]/20">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-black text-[#0A3D91] tracking-tight uppercase">Add New Club</h1>
            <p className="text-xs md:text-sm font-medium text-[#707070]">Register a new Kun Khmer training facility</p>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Club Image */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#B0B0B0]/20 p-6 shadow-sm">
              <h2 className="text-lg font-black text-[#0A3D91] uppercase tracking-tight mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Club Image
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-[#B0B0B0]/30 border-dashed rounded-xl cursor-pointer bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 text-[#B0B0B0] mb-3" />
                      <p className="mb-2 text-sm font-bold text-[#333333]">
                        <span className="text-[#0A3D91]">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-[#B0B0B0]">PNG, JPG or WEBP (MAX. 2MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData(prev => ({ ...prev, image: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {formData.image && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#B0B0B0]/20">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#B0B0B0]/20 p-6 shadow-sm">
              <h2 className="text-lg font-black text-[#0A3D91] uppercase tracking-tight mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#333333] mb-2">
                    Club Name <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Phnom Penh Elite Gym"
                    className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#B0B0B0]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A3D91]/50 focus:border-[#0A3D91] transition-all font-medium text-[#333333] placeholder:text-[#B0B0B0]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#333333] mb-2">
                    Location <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Phnom Penh, Cambodia"
                    className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#B0B0B0]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A3D91]/50 focus:border-[#0A3D91] transition-all font-medium text-[#333333] placeholder:text-[#B0B0B0]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#333333] mb-2">
                    Head Coach <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="text"
                    name="headCoach"
                    value={formData.headCoach}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Chan Reach"
                    className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#B0B0B0]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A3D91]/50 focus:border-[#0A3D91] transition-all font-medium text-[#333333] placeholder:text-[#B0B0B0]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#333333] mb-2">
                    Established Year <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="text"
                    name="established"
                    value={formData.established}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 2010"
                    className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#B0B0B0]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A3D91]/50 focus:border-[#0A3D91] transition-all font-medium text-[#333333] placeholder:text-[#B0B0B0]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#333333] mb-2">
                    Status <span className="text-[#C8102E]">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#B0B0B0]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A3D91]/50 focus:border-[#0A3D91] transition-all font-medium text-[#333333] appearance-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#B0B0B0]/20 p-6 shadow-sm">
              <h2 className="text-lg font-black text-[#0A3D91] uppercase tracking-tight mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#333333] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+855 12 345 678"
                    className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#B0B0B0]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A3D91]/50 focus:border-[#0A3D91] transition-all font-medium text-[#333333] placeholder:text-[#B0B0B0]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#333333] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@club.com"
                    className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#B0B0B0]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A3D91]/50 focus:border-[#0A3D91] transition-all font-medium text-[#333333] placeholder:text-[#B0B0B0]"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#B0B0B0]/20 p-6 shadow-sm">
              <h2 className="text-lg font-black text-[#0A3D91] uppercase tracking-tight mb-4">Description</h2>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the club's training philosophy, facilities, and specialties..."
                className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#B0B0B0]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A3D91]/50 focus:border-[#0A3D91] transition-all font-medium text-[#333333] placeholder:text-[#B0B0B0] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse md:flex-row gap-3 pt-4 pb-8">
              <Link
                to="/home/clubs"
                className="flex-1 md:flex-none md:px-8 py-3 bg-[#FFFFFF] border-2 border-[#B0B0B0]/30 text-[#333333] rounded-xl font-bold hover:bg-[#F5F5F7] transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex-1 md:flex-none md:px-8 py-3 bg-[#0A3D91] text-[#FFFFFF] rounded-xl font-bold hover:bg-[#0A3D91]/90 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Club
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}