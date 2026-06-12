"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import StepAnimation from "@/components/booking/StepAnimation";
import { createClient } from "@/lib/supabase/client";

// Step Imports
import Step1Identity from "@/components/booking/private-event/step1";
import Step2Logistics from "@/components/booking/private-event/step2";
import Step3Schedule from "@/components/booking/private-event/step3";
import Step4Culinary from "@/components/booking/private-event/step4";
import Step5Finances from "@/components/booking/private-event/step5";
import Step6Notes from "@/components/booking/private-event/step6";
import Step7Summary from "@/components/booking/private-event/step7";
import { CulinaryCatalog } from "@/components/booking/private-event/culinary-catalog";

export default function PrivateEventForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    eventName: "", occasion: "", customOccasion: "", 
    hostName: "", phone: "", countryCode: "+63", city: "", province: "", address: "",
    eventDate: "", eventEndDate: "", 
    timeSlot: "Dinner", customTime: "19:00",
    pax: { adults: 0, teens: 0, seniors: 0, children: 0 },
    direction: "Modern Filipino", isCustomFusion: false, catalogItems: [] as any[],
    budget_min: "", budget_max: "", budgetFlexible: false, 
    allergies: [] as string[], customAllergy: "", 
    serviceTier: "Standard", notes: ""
  });

  const updateData = (fields: Partial<typeof formData>) => setFormData(prev => ({ ...prev, ...fields }));

  const nextStep = () => setStep(s => Math.min(s + 1, 7));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // --- PRICING ENGINE ---
  const calculatePricingBreakdown = () => {
    const TIER_RATES: Record<string, number> = { Standard: 2000, Premium: 2500, Luxury: 4000 };
    const tierRate = TIER_RATES[formData.serviceTier] || 2000;
    
    const adultPax = (parseInt(String(formData.pax.adults)) || 0) + 
                     (parseInt(String(formData.pax.teens)) || 0) + 
                     (parseInt(String(formData.pax.seniors)) || 0);
    const childPax = parseInt(String(formData.pax.children)) || 0;
    const totalPaxCount = adultPax + childPax;
    
    // 70% Discount applied to children (They pay 30% of the base tier rate)
    const weightedGuestCount = (adultPax * 1.0) + (childPax * 0.3);
    const baseTotal = weightedGuestCount * tierRate;
    
    const culinaryPremium = formData.isCustomFusion ? 1500 : 0;
    
    let aLaCarteTotal = 0;
    let secondaryChefTotal = 0;
    const uniqueChefs = new Set();
    
    formData.catalogItems.forEach((item: any) => {
      aLaCarteTotal += (item.base_price || 0) * totalPaxCount; 
      if (item.custom_chef_id) uniqueChefs.add(item.custom_chef_id);
    });
    
    secondaryChefTotal = uniqueChefs.size * 1000; 
    
    const grandTotal = baseTotal + culinaryPremium + aLaCarteTotal + secondaryChefTotal;
    
    return {
      adultPax, childPax, totalPaxCount, weightedGuestCount,
      tierRate, baseTotal, culinaryPremium, aLaCarteTotal, 
      secondaryChefTotal, grandTotal
    };
  };

  const canContinue = () => {
    switch (step) {
      case 1: return formData.eventName && (formData.occasion === "Other" ? formData.customOccasion : formData.occasion);
      case 2: return formData.hostName && formData.phone && formData.city && formData.address;
      // REQUIRES BOTH A SLOT AND EXACT TIME NOW
      case 3: return formData.eventDate && formData.timeSlot && formData.customTime;
      case 4: 
        const total = Object.values(formData.pax).reduce((a, b) => a + (parseInt(b.toString()) || 0), 0);
        return total > 0 && formData.direction;
      case 5: 
        const min = parseInt(formData.budget_min.replace(/\D/g, "") || "0");
        const max = parseInt(formData.budget_max.replace(/\D/g, "") || "0");
        return formData.budget_min && formData.budget_max && max > min;
      case 6: return formData.serviceTier;
      default: return true;
    }
  };

  const submitInquiry = async () => {
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const breakdown = calculatePricingBreakdown();

      const dbPayload = {
        user_id: user.id,
        title: formData.eventName,
        occasion: formData.occasion,
        custom_occasion: formData.occasion === "Other" ? formData.customOccasion : null,
        
        recipient_name: formData.hostName,
        phone_number: `${formData.countryCode}${formData.phone}`,
        location_city: formData.city,
        location_address: formData.address,
        
        event_date: formData.eventDate,
        event_end_date: formData.eventEndDate || null,
        // SAVES AS: "Dinner at 19:00"
        event_time_pref: `${formData.timeSlot} at ${formData.customTime}`,
        guest_count: breakdown.totalPaxCount,
        
        selected_menu_theme: formData.direction,
        is_custom_fusion: formData.isCustomFusion,
        catalog_selections: formData.catalogItems, 
        allergies: formData.allergies,
        custom_allergy: formData.customAllergy,
        
        budget_min: parseFloat(formData.budget_min.toString().replace(/\D/g, "")) || 0,
        budget_max: parseFloat(formData.budget_max.toString().replace(/\D/g, "")) || 0,
        budget_flexible: formData.budgetFlexible,
        service_package: formData.serviceTier,
        projected_cost: breakdown.grandTotal,
        
        booking_type: 'Private Event',
        status: 'open',
        notes: formData.notes,
        payment_status: 'unpaid'
      };

      const { error } = await supabase.from('bookings').insert([dbPayload]);
      if (error) throw error;

      router.push("/user-dashboard?success=true");

    } catch (error) {
      console.error("Submission failed:", error);
      alert(`Submission Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricingBreakdown = calculatePricingBreakdown();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur border-b border-border py-8 px-6 flex justify-center">
        <div className="w-full max-w-7xl flex justify-between items-center">
          <button onClick={() => router.push("/booking/new")} className="text-[10px] uppercase tracking-widest font-bold opacity-50 hover:text-[#D4AF37] transition-colors">
            <X size={14} className="inline mr-2" /> Change Event
          </button>
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Step {step} / 7</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto py-16 px-6">
        <AnimatePresence mode="wait">
          <StepAnimation key={step} step={step}>
            {step === 1 && <Step1Identity data={formData} update={updateData} />}
            {step === 2 && <Step2Logistics data={formData} update={updateData} />}
            {step === 3 && <Step3Schedule data={formData} update={updateData} />}
            {step === 4 && <Step4Culinary data={formData} update={updateData} onOpenCatalog={() => setIsCatalogOpen(true)} />}
            {step === 5 && <Step5Finances data={formData} update={updateData} />}
            {step === 6 && <Step6Notes data={formData} update={updateData} />}
            {step === 7 && <Step7Summary data={formData} breakdown={pricingBreakdown} />}
          </StepAnimation>
        </AnimatePresence>
      </main>

      <footer className="sticky bottom-0 z-40 w-full bg-background border-t border-border py-4 px-6 flex justify-center">
        <div className="w-full max-w-7xl flex justify-between items-center">
          <button onClick={prevStep} disabled={step === 1} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold disabled:opacity-0 transition-opacity">
            <ArrowLeft size={14} /> Previous
          </button>
          <button 
            onClick={step === 7 ? submitInquiry : nextStep}
            disabled={!canContinue() || isSubmitting}
            className="bg-[#D4AF37] text-black px-16 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:opacity-90 disabled:opacity-20 transition-all"
          >
            {isSubmitting ? "Processing..." : step === 7 ? "Submit Inquiry" : "Next Step"} 
            {!isSubmitting && <ArrowRight size={14} className="inline ml-2" />}
          </button>
        </div>
      </footer>

      <CulinaryCatalog 
        isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} 
        onConfirm={(items: any) => { updateData({ catalogItems: items }); setIsCatalogOpen(false); }}
        currentSelection={formData.catalogItems}
      />
    </div>
  );
}