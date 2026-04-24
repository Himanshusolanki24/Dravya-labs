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
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50">
            {/* Header Search Section - Practo Style */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 lg:py-6">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-6">
                        Book from Top Ayurvedic Doctors in {locationQuery || 'India'}
                    </h1>
                    
                    <div className="flex flex-col md:flex-row gap-0 rounded-lg shadow-sm border border-gray-300 overflow-hidden bg-white max-w-4xl">
                        {/* Location Search */}
                        <div className="flex items-center flex-1 min-w-[200px] border-b md:border-b-0 md:border-r border-gray-200 px-3 py-3">
                            <MapPin className="size-5 text-gray-400 shrink-0" />
                            <input 
                                type="text"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                                placeholder="Search location"
                                className="w-full border-none focus:ring-0 text-sm ml-2 text-gray-700 placeholder:text-gray-400 outline-none"
                            />
                        </div>
                        {/* Specialty/Doctor Search */}
                        <div className="flex items-center flex-[2] px-3 py-3 bg-white">
                            <Search className="size-5 text-gray-400 shrink-0" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search doctors, clinics, hospitals, etc."
                                className="w-full border-none focus:ring-0 text-sm ml-2 text-gray-700 placeholder:text-gray-400 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 relative z-20">
                    <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3 text-sm">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors">
                            <Video className="size-4" />
                            Video Consult
                        </button>
                        
                        {/* Availability Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => toggleDropdown('availability')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${activeDropdown === 'availability' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                {selectedAvailability !== 'Any day' ? selectedAvailability : 'Availability'}
                                <ChevronDown className={`size-3 transition-transform ${activeDropdown === 'availability' ? 'rotate-180' : ''}`} />
                            </button>
                            {activeDropdown === 'availability' && (
                                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 shadow-lg rounded-lg py-1 min-w-[200px]">
                                    {AVAILABILITY.map(option => (
                                        <button 
                                            key={option} 
                                            onClick={() => { setSelectedAvailability(option); setActiveDropdown(null); }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
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
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${activeDropdown === 'gender' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                {selectedGender !== 'Any' ? selectedGender : 'Gender'}
                                <ChevronDown className={`size-3 transition-transform ${activeDropdown === 'gender' ? 'rotate-180' : ''}`} />
                            </button>
                            {activeDropdown === 'gender' && (
                                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 shadow-lg rounded-lg py-1 min-w-[150px]">
                                    {GENDERS.map(option => (
                                        <button 
                                            key={option} 
                                            onClick={() => { setSelectedGender(option); setActiveDropdown(null); }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
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
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${activeDropdown === 'hospital' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                {selectedHospital !== 'Any Hospital' ? <span className="max-w-[100px] truncate">{selectedHospital}</span> : 'Hospital'}
                                <ChevronDown className={`size-3 transition-transform ${activeDropdown === 'hospital' ? 'rotate-180' : ''}`} />
                            </button>
                            {activeDropdown === 'hospital' && (
                                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 shadow-lg rounded-lg py-1 min-w-[250px] max-h-[300px] overflow-y-auto">
                                    {HOSPITALS.map(option => (
                                        <button 
                                            key={option} 
                                            onClick={() => { setSelectedHospital(option); setActiveDropdown(null); }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm truncate"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <span className="w-px h-5 bg-gray-300 mx-1 hidden sm:block"></span>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 font-medium hover:underline transition-colors ml-auto sm:ml-0">
                            <Filter className="size-4" />
                            All Filters
                        </button>
                        
                        <div className="ml-auto hidden md:flex items-center gap-2">
                            <span className="text-gray-500">Sort By</span>
                            <button className="flex items-center gap-1 font-medium text-gray-800">
                                Relevance
                                <ChevronDown className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Doctor List */}
                <div className="lg:col-span-3 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                        {doctors.length} doctors available in {locationQuery || 'India'}
                    </h2>
                    
                    {doctors.map(doctor => (
                        <div key={doctor.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-5 flex flex-col sm:flex-row gap-5">
                                {/* Doctor Image */}
                                <div className="shrink-0 relative">
                                    <div className="size-24 rounded-full border-2 border-blue-100 overflow-hidden bg-gray-100">
                                        <img 
                                            src={doctor.image} 
                                            alt={doctor.name} 
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-white flex items-center gap-1 shadow-sm">
                                        <BadgeCheck className="size-3 text-blue-600" />
                                        Verified
                                    </div>
                                </div>
                                
                                {/* Doctor Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-blue-600 hover:underline cursor-pointer">{doctor.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{doctor.qualifications}</p>
                                            <p className="text-sm text-gray-800 mt-0.5">{doctor.experience}</p>
                                            
                                            <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-800">
                                                <span className="font-semibold">{doctor.location}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-600 truncate">{doctor.clinic}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">₹ {doctor.fee} Consultation fee at clinic</p>
                                        </div>
                                    </div>

                                    {/* Ratings */}
                                    <div className="flex items-center gap-3 mt-4">
                                        <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                                            <ThumbsUp className="size-3" />
                                            {doctor.rating}%
                                        </div>
                                        <span className="text-sm text-gray-600 underline cursor-pointer hover:text-gray-900">
                                            {doctor.patients} Patient Stories
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Actions Area */}
                                <div className="sm:border-l border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0 sm:pl-5 flex flex-col justify-end shrink-0 sm:w-48">
                                    <div className="text-center mb-4">
                                        {doctor.availableToday ? (
                                            <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-green-600 mb-1">
                                                <Calendar className="size-4" />
                                                Available Today
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-orange-600 mb-1">
                                                <Clock className="size-4" />
                                                Available Tomorrow
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm mb-2 shadow-sm">
                                        Book Clinic Visit
                                    </button>
                                    <button className="w-full bg-white hover:bg-blue-50 text-blue-600 border border-blue-600 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                                        Video Consult
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Sidebar - Info/Ads */}
                <div className="hidden lg:block space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                        <div className="flex justify-center mb-4 text-blue-500">
                            <Stethoscope className="size-10" />
                        </div>
                        <h3 className="text-center font-bold text-gray-800 mb-2">Ayurvedic Second Opinion</h3>
                        <p className="text-center text-sm text-gray-600 mb-4">
                            Get advice on chronic health issues from top specialized Ayurvedic practitioners.
                        </p>
                        <button className="w-full bg-white text-blue-700 border border-blue-200 font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors">
                            Know More
                        </button>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h3 className="font-bold text-gray-800 mb-3">Safety during consultation</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <BadgeCheck className="size-5 text-green-500 shrink-0" />
                                <span>Verified doctors with BAMS qualifications</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <BadgeCheck className="size-5 text-green-500 shrink-0" />
                                <span>Secure and private video consultations</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <BadgeCheck className="size-5 text-green-500 shrink-0" />
                                <span>100% genuine patient reviews</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-[#28328c] text-white pt-12 pb-6 mt-12">
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-white">Dravya Labs</h4>
                        <ul className="space-y-2 text-sm text-indigo-100">
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-white">For Patients</h4>
                        <ul className="space-y-2 text-sm text-indigo-100">
                            <li><a href="#" className="hover:text-white transition-colors">Search for Doctors</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Search for Clinics</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Search for Hospitals</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Book Diagnostic Tests</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Read Health Articles</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-white">For Doctors</h4>
                        <ul className="space-y-2 text-sm text-indigo-100">
                            <li><a href="#" className="hover:text-white transition-colors">Dravya Consult</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Dravya Health Feed</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Dravya Profile</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-white">More</h4>
                        <ul className="space-y-2 text-sm text-indigo-100">
                            <li><a href="#" className="hover:text-white transition-colors">Help</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Developers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Healthcare Directory</a></li>
                        </ul>
                    </div>
                </div>
                
                <div className="max-w-6xl mx-auto px-4 pt-6 border-t border-indigo-800 text-center text-sm text-indigo-200">
                    <p>Copyright © 2026, Dravya Labs. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
