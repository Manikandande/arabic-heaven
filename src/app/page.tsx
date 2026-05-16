import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import FeaturedDishes from '@/components/home/FeaturedDishes'
import OffersSection from '@/components/home/OffersSection'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import ReservationCTA from '@/components/home/ReservationCTA'
import PlatformLinks from '@/components/home/PlatformLinks'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedDishes />
        <OffersSection />
        <WhyChooseUs />
        <TestimonialsSection />
        <ReservationCTA />
        <PlatformLinks />
      </main>
      <Footer />
    </>
  )
}
