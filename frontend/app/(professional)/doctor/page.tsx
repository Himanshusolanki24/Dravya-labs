'use client';

import React, { useState } from 'react';
import { 
    Search, MapPin, Star, ThumbsUp, Video, Calendar, BadgeCheck, 
    ChevronDown, Filter, Stethoscope, Clock
} from 'lucide-react';
import Image from 'next/image';

// Dummy data for Ayurvedic doctors
const doctors = [
    {
        id: "d1",
        name: "Dr. Vasant Lad",
        qualifications: "BAMS, MD - Ayurveda",
        experience: "24 years experience overall",
        location: "Koramangala, Bangalore",
        clinic: "AyurVeda Wellness Center",
        rating: 98,
        patients: 1240,
        fee: 800,
        availableToday: true,
        image: "https://i.pravatar.cc/150?img=11"
    },
    {
        id: "d2",
        name: "Dr. Meenakshi Sharma",
        qualifications: "BAMS, MS - Ayurvedic Gynecology",
        experience: "15 years experience overall",
        location: "Indiranagar, Bangalore",
        clinic: "Prakriti Healing Clinic",
        rating: 95,
        patients: 890,
        fee: 600,
        availableToday: true,
        image: "https://i.pravatar.cc/150?img=5"
    },
    {
        id: "d3",
        name: "Dr. Rajesh Kute",
        qualifications: "BAMS, MD - Kaya Chikitsa",
        experience: "18 years experience overall",
        location: "Jayanagar, Bangalore",
        clinic: "Kerala Ayurveda Vaidyashala",
        rating: 92,
        patients: 450,
        fee: 500,
        availableToday: false,
        image: "https://i.pravatar.cc/150?img=12"
    },
    {
        id: "d4",
        name: "Dr. Anjali Desai",
        qualifications: "BAMS, Certification in Panchakarma",
        experience: "10 years experience overall",
        location: "Whitefield, Bangalore",
        clinic: "Holistic Health Ayurveda",
        rating: 99,
        patients: 2100,
        fee: 750,
        availableToday: true,
        gender: "female",
        hospital: "Holistic Health Ayurveda",
        image: "https://i.pravatar.cc/150?img=9"
    }
];

const LOCATIONS = ["Bangalore", "Delhi", "Mumbai", "Pune", "Chennai", "Hyderabad"];
const GENDERS = ["Any", "Male Doctor", "Female Doctor"];
const AVAILABILITY = ["Any day", "Available Today", "Available Tomorrow", "Available in next 7 days"];
const HOSPITALS = ["Any Hospital", "AyurVeda Wellness Center", "Prakriti Healing Clinic", "Kerala Ayurveda Vaidyashala", "Holistic Health Ayurveda"];

export default function FindDoctorPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('Bangalore');
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    
    // Filter states
    const [selectedGender, setSelectedGender] = useState('Any');
    const [selectedAvailability, setSelectedAvailability] = useState('Any day');
    const [selectedHospital, setSelectedHospital] = useState('Any Hospital');

    // Toggle dropdown
    const toggleDropdown = (name: string) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#F1F5F0] p-2 sm:p-4 lg:p-4">
            {/* The Main Floating Card */}
            <div className="w-full flex-1 mx-auto bg-gradient-to-br from-[#FFFdfa] to-[#F3F8EC] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 overflow-hidden flex flex-col relative">
                
                {/* Header Search Section */}
                <div className="bg-white/60 backdrop-blur-md border-b border-green-900/5 sticky top-0 z-30 px-6 lg:px-8 py-6">
                    <h1 className="text-xl lg:text-3xl font-bold text-gray-800 tracking-tight mb-6">
                        Find Top Ayurvedic Doctors in {locationQuery || 'India'}
                    </h1>
                    
                    <div className="flex flex-col md:flex-row gap-0 rounded-2xl shadow-sm border border-white overflow-hidden bg-white max-w-4xl">
                        {/* Location Search */}
                        <div className="flex items-center flex-1 min-w-[200px] border-b md:border-b-0 md:border-r border-gray-100 px-4 py-3 sm:py-4">
                            <MapPin className="size-5 text-[#267F37] shrink-0" />
                            <input 
                                type="text"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                                placeholder="Search location"
                                className="w-full border-none focus:ring-0 text-sm ml-2 text-gray-700 placeholder:text-gray-400 outline-none font-medium"
                            />
                        </div>
                        {/* Specialty/Doctor Search */}
                        <div className="flex items-center flex-[2] px-4 py-3 sm:py-4 bg-white/50">
                            <Search className="size-5 text-[#267F37] shrink-0" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search doctors, clinics, therapies, etc."
                                className="w-full border-none focus:ring-0 text-sm ml-2 text-gray-700 placeholder:text-gray-400 outline-none font-medium bg-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="border-b border-green-900/5 bg-white/40 px-6 lg:px-8 py-3 relative z-20">
                    <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 text-sm">
                        <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#267F37] bg-[#E8F0E5] text-[#267F37] font-bold shadow-sm transition-colors hover:bg-[#267F37] hover:text-white">
                            <Video className="size-4" />
                            Video Consult
                        </button>
                        
                        {/* Availability Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => toggleDropdown('availability')}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border shadow-sm transition-colors font-medium ${activeDropdown === 'availability' ? 'border-[#267F37] bg-[#E8F0E5] text-[#267F37]' : 'border-white bg-white/80 text-gray-700 hover:bg-white'}`}
                            >
                                {selectedAvailability !== 'Any day' ? selectedAvailability : 'Availability'}
                                <ChevronDown className={`size-3 transition-transform ${activeDropdown === 'availability' ? 'rotate-180' : ''}`} />
                            </button>
                            {activeDropdown === 'availability' && (
                                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-100 shadow-xl rounded-xl py-2 min-w-[200px] overflow-hidden">
                                    {AVAILABILITY.map(option => (
                                        <button 
                                            key={option} 
                                            onClick={() => { setSelectedAvailability(option); setActiveDropdown(null); }}
                                            className="w-full text-left px-4 py-2.5 hover:bg-[#E8F0E5] hover:text-[#267F37] transition-colors text-gray-700 text-sm font-medium"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Gender Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => toggleDropdown('gender')}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border shadow-sm transition-colors font-medium ${activeDropdown === 'gender' ? 'border-[#267F37] bg-[#E8F0E5] text-[#267F37]' : 'border-white bg-white/80 text-gray-700 hover:bg-white'}`}
                            >
                                {selectedGender !== 'Any' ? selectedGender : 'Gender'}
                                <ChevronDown className={`size-3 transition-transform ${activeDropdown === 'gender' ? 'rotate-180' : ''}`} />
                            </button>
                            {activeDropdown === 'gender' && (
                                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-100 shadow-xl rounded-xl py-2 min-w-[160px] overflow-hidden">
                                    {GENDERS.map(option => (
                                        <button 
                                            key={option} 
                                            onClick={() => { setSelectedGender(option); setActiveDropdown(null); }}
                                            className="w-full text-left px-4 py-2.5 hover:bg-[#E8F0E5] hover:text-[#267F37] transition-colors text-gray-700 text-sm font-medium"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Hospital Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => toggleDropdown('hospital')}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border shadow-sm transition-colors font-medium ${activeDropdown === 'hospital' ? 'border-[#267F37] bg-[#E8F0E5] text-[#267F37]' : 'border-white bg-white/80 text-gray-700 hover:bg-white'}`}
                            >
                                {selectedHospital !== 'Any Hospital' ? <span className="max-w-[120px] truncate">{selectedHospital}</span> : 'Hospital'}
                                <ChevronDown className={`size-3 transition-transform ${activeDropdown === 'hospital' ? 'rotate-180' : ''}`} />
                            </button>
                            {activeDropdown === 'hospital' && (
                                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-100 shadow-xl rounded-xl py-2 min-w-[250px] max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {HOSPITALS.map(option => (
                                        <button 
                                            key={option} 
                                            onClick={() => { setSelectedHospital(option); setActiveDropdown(null); }}
                                            className="w-full text-left px-4 py-2.5 hover:bg-[#E8F0E5] hover:text-[#267F37] transition-colors text-gray-700 text-sm font-medium truncate"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <span className="w-px h-6 bg-gray-300 mx-2 hidden sm:block rounded-full"></span>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[#267F37] font-bold hover:bg-white rounded-full transition-colors ml-auto sm:ml-0">
                            <Filter className="size-4" />
                            All Filters
                        </button>
                        
                        <div className="ml-auto hidden md:flex items-center gap-2">
                            <span className="text-gray-500 font-medium">Sort By:</span>
                            <button className="flex items-center gap-1 font-bold text-gray-800 bg-white px-3 py-1.5 rounded-full shadow-sm border border-white">
                                Relevance
                                <ChevronDown className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-8">
                    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
                        
                        {/* Doctor List */}
                        <div className="lg:col-span-3 space-y-5">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 tracking-tight">
                                {doctors.length} Doctors available in {locationQuery || 'India'}
                            </h2>
                            
                            {doctors.map(doctor => (
                                <div key={doctor.id} className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white shadow-sm overflow-hidden hover:shadow-md hover:bg-white transition-all group">
                                    <div className="p-6 flex flex-col sm:flex-row gap-6">
                                        {/* Doctor Image */}
                                        <div className="shrink-0 relative">
                                            <div className="size-28 rounded-2xl border-4 border-[#E8F0E5] overflow-hidden bg-white shadow-inner">
                                                <img 
                                                    src={doctor.image} 
                                                    alt={doctor.name} 
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="absolute -bottom-3 -right-2 bg-gradient-to-r from-[#267F37] to-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md">
                                                <BadgeCheck className="size-3" />
                                                Verified
                                            </div>
                                        </div>
                                        
                                        {/* Doctor Info */}
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#267F37] transition-colors cursor-pointer">{doctor.name}</h3>
                                                    <p className="text-sm font-medium text-emerald-600 mt-1">{doctor.qualifications}</p>
                                                    <p className="text-sm text-gray-600 mt-1">{doctor.experience}</p>
                                                    
                                                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg inline-flex border border-gray-100">
                                                        <MapPin className="size-4 text-emerald-600 shrink-0" />
                                                        <span className="font-semibold">{doctor.location}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-gray-600 truncate">{doctor.clinic}</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-800 mt-3 flex items-center gap-1.5">
                                                        <span className="bg-[#E8F0E5] text-[#267F37] px-2 py-0.5 rounded-md">₹ {doctor.fee}</span> 
                                                        Consultation fee
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Ratings */}
                                            <div className="flex items-center gap-3 mt-auto pt-4">
                                                <div className="flex items-center gap-1.5 bg-[#267F37] text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
                                                    <ThumbsUp className="size-3.5" />
                                                    {doctor.rating}%
                                                </div>
                                                <span className="text-sm font-medium text-gray-500 hover:text-gray-900 underline decoration-gray-300 cursor-pointer transition-colors">
                                                    {doctor.patients} Patient Stories
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Actions Area */}
                                        <div className="sm:border-l sm:border-gray-100 pt-4 sm:pt-0 sm:pl-6 flex flex-col justify-center shrink-0 sm:w-56 gap-3">
                                            <div className="text-center mb-2">
                                                {doctor.availableToday ? (
                                                    <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-[#267F37]">
                                                        <Calendar className="size-4" />
                                                        Available Today
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-amber-600">
                                                        <Clock className="size-4" />
                                                        Available Tomorrow
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <button className="w-full bg-[#267F37] hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all text-sm shadow-[0_4px_14px_0_rgba(38,127,55,0.39)] hover:shadow-[0_6px_20px_rgba(38,127,55,0.23)] hover:-translate-y-0.5">
                                                Book Visit
                                            </button>
                                            <button className="w-full bg-white hover:bg-[#E8F0E5] text-[#267F37] border-2 border-[#267F37] font-bold py-2.5 px-4 rounded-xl transition-all text-sm">
                                                Video Consult
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Right Sidebar - Info/Ads */}
                        <div className="hidden lg:block space-y-6">
                            <div className="bg-gradient-to-br from-[#E8F0E5] to-[#D4E4D0] border border-white rounded-[24px] p-6 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Stethoscope className="size-24 text-[#267F37]" />
                                </div>
                                <div className="flex items-center gap-3 mb-4 text-[#267F37] relative z-10">
                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                        <Stethoscope className="size-6" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 leading-tight">Ayurvedic<br/>Second Opinion</h3>
                                </div>
                                <p className="text-sm text-gray-700 mb-6 relative z-10 font-medium">
                                    Get specialized advice on chronic health issues from top practitioners.
                                </p>
                                <button className="w-full bg-white text-[#267F37] font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm relative z-10">
                                    Know More
                                </button>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-5">Safety Promise</h3>
                                <ul className="space-y-4 text-sm text-gray-600 font-medium">
                                    <li className="flex items-start gap-3">
                                        <div className="bg-[#E8F0E5] p-1.5 rounded-lg shrink-0">
                                            <BadgeCheck className="size-4 text-[#267F37]" />
                                        </div>
                                        <span className="mt-1">Verified BAMS doctors</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="bg-[#E8F0E5] p-1.5 rounded-lg shrink-0">
                                            <Video className="size-4 text-[#267F37]" />
                                        </div>
                                        <span className="mt-1">100% private video consults</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="bg-[#E8F0E5] p-1.5 rounded-lg shrink-0">
                                            <Star className="size-4 text-[#267F37]" />
                                        </div>
                                        <span className="mt-1">Genuine patient reviews</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
