'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ServicesCatalog, { ServiceItem, SERVICES_CATALOG } from '@/components/ServicesCatalog';
import LocationsSection from '@/components/LocationsSection';
import BarbersSection, { BarberData } from '@/components/BarbersSection';
import BookingModal from '@/components/BookingModal';
import StaffLoginModal from '@/components/StaffLoginModal';
import StaffDashboard from '@/components/StaffDashboard';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'public' | 'staff'>('public');

  // Branch filter: 'ALL', 'Zona 6', 'Zona 5'
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Barbers data list
  const [barbers, setBarbers] = useState<BarberData[]>([]);

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Selected booking parameters
  const [bookingBarber, setBookingBarber] = useState<BarberData | null>(null);
  const [bookingTime, setBookingTime] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Load barbers from API
  const loadBarbers = async () => {
    try {
      const res = await fetch('/api/barbers');
      if (res.ok) {
        const data = await res.json();
        setBarbers(data.barbers || []);
      }
    } catch (err) {
      console.error('Error loading barbers:', err);
    }
  };

  useEffect(() => {
    loadBarbers();

    // Check if user session was stored in localStorage
    const savedUser = localStorage.getItem('visionary_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('visionary_user');
      }
    }
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('visionary_user', JSON.stringify(user));
    setCurrentView('staff');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('visionary_user');
    setCurrentView('public');
  };

  const handleOpenSlotBooking = (barber: BarberData, time: string, date: string) => {
    setBookingBarber(barber);
    setBookingTime(time);
    setBookingDate(date);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        currentView={currentView}
        onToggleView={(view) => setCurrentView(view)}
      />

      <main className="flex-grow">
        {currentView === 'staff' && currentUser ? (
          /* INTERNAL STAFF DASHBOARD VIEW */
          <StaffDashboard user={currentUser} onLogout={handleLogout} />
        ) : (
          /* PUBLIC CLIENT BOOKING FLOW */
          <>
            {/* 1. Hero Concept & Quick Branch Links */}
            <Hero
              onSelectBranch={(branch) => {
                setSelectedBranch(branch);
                document.getElementById('barberos')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenServicePicker={() => {
                document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 2. Initial Service Selection & Pricing Menu */}
            <ServicesCatalog
              selectedServiceId={selectedService?.id || null}
              onSelectService={(service) => {
                setSelectedService(service);
              }}
              onContinueToBarbers={() => {
                document.getElementById('barberos')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 3. Sedes & Waze Direct Navigation */}
            <LocationsSection
              selectedBranch={selectedBranch}
              onFilterByBranch={(branch) => {
                setSelectedBranch(branch);
              }}
            />

            {/* 4. Real-time Barbers & Booking Calendar */}
            <BarbersSection
              barbers={barbers}
              selectedBranch={selectedBranch}
              onChangeBranch={(branch) => setSelectedBranch(branch)}
              selectedService={selectedService}
              onSelectSlotToBook={handleOpenSlotBooking}
              onRefreshData={loadBarbers}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onOpenLogin={() => setIsLoginModalOpen(true)} />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        barber={bookingBarber}
        initialTime={bookingTime}
        initialDate={bookingDate}
        initialService={selectedService}
        onBookingSuccess={() => {
          loadBarbers();
        }}
      />

      {/* Staff Login Modal */}
      <StaffLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

