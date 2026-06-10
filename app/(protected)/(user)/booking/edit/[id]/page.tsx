"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, X, Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import StepAnimation from "@/components/booking/StepAnimation";

// Import your existing Private Event steps
import Step1Identity from "@/components/booking/private-event/step1";
import Step2Logistics from "@/components/booking/private-event/step2";
import Step3Schedule from "@/components/booking/private-event/step3";
import Step4Culinary from "@/components/booking/private-event/step4";
import Step5Finances from "@/components/booking/private-event/step5";
import Step6Notes from "@/components/booking/private-event/step6";
import Step7Summary from "@/components/booking/private-event/step7";

// Import your existing Consultation steps
import ConStep1Identity from "@/components/booking/consultation/step1";
import ConStep2Business from "@/components/booking/consultation/step2";
import ConStep3Focus from "@/components/booking/consultation/step3";
import ConStep4Logistics from "@/components/booking/consultation/step4";
import ConStep5Finances from "@/components/booking/consultation/step5";
import ConStep6Summary from "@/components/booking/consultation/step6";

export default function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the dynamic route params Promise
  const { id } = use(params);
  
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState<'Private Event' | 'Consultation' | null>(null);
  
  // A unified massive state object to hold all possible properties
  const [formData, setFormData] = useState<any>({});

  // 1. Fetch & Normalize Data
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data, error } = await supabase.from('bookings').select('*').eq('id', id).single();
        if (error || !data) throw error;
        if (['completed', 'cancelled', 'expired'].includes(data.status)) {
           router.push('/user-dashboard?error=locked');
           return;
        }

        setBookingType(data.booking_type);

        // Normalize DB schema back into UI state properties
        setFormData({
          id: data.id,
          editCount: data.edit_count || 0,
          notes: data.notes || "",
          
          // Private Mapping
          eventName: data.title || "",
          occasion: data.occasion || "",
          customOccasion: data.custom_occasion || "",
          hostName: data.recipient_name || "",
          phone: data.phone_number?.replace('+63', '') || "",
          countryCode: "+63",
          city: data.location_city || "",
          address: data.location_address || "",
          eventDate: data.event_date || "",
          eventEndDate: data.event_end_date || "",
          time: data.event_time_pref || "Evening",
          pax: { adults: data.guest_count || 0, teens: 0, seniors: 0, children: 0 },
          direction: data.selected_menu_theme || "Modern Filipino",
          catalogItems: data.catalog_selections || [],
          budget_min: data.budget_min?.toString() || "",
          budget_max: data.budget_max?.toString() || "",
          budgetFlexible: data.budget_flexible || false,
          allergies: data.allergies || [],
          customAllergy: data.custom_allergy || "",
          serviceTier: data.service_package || "Standard",

          // Consultation Mapping
          companyName: data.company_name || "",
          employeeCount: data.company_employee_count || 0,
          businessStage: data.business_stage || "",
          primaryObjective: data.primary_objective || "",
          areasOfFocus: data.areas_of_focus || [],
          consultationTopic: data.consultation_topic || "",
          deliveryFormat: data.delivery_format || "",
        });
      } catch (err) {
        console.error("Failed to load:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [id, router, supabase]);

  const updateData = (fields: any) => setFormData((prev: any) => ({ ...prev, ...fields }));

  const maxSteps = bookingType === 'Private Event' ? 7 : 6;
  const nextStep = () => setStep(s => Math.min(s + 1, maxSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // 2. Database Update Payload Builder
  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        title: formData.eventName || formData.companyName,
        notes: formData.notes,
        edit_count: formData.editCount + 1,
      };

      if (bookingType === 'Private Event') {
        payload.occasion = formData.occasion;
        payload.custom_occasion = formData.customOccasion;
        payload.recipient_name = formData.hostName;
        payload.phone_number = `${formData.countryCode}${formData.phone}`;
        payload.location_city = formData.city;
        payload.location_address = formData.address;
        payload.event_date = formData.eventDate;
        payload.event_time_pref = formData.time;
        payload.guest_count = Object.values(formData.pax).reduce((a: any, b: any) => a + (parseInt(b) || 0), 0);
        payload.selected_menu_theme = formData.direction;
        payload.catalog_selections = formData.catalogItems;
        payload.allergies = formData.allergies;
        payload.custom_allergy = formData.customAllergy;
        payload.budget_min = parseFloat(formData.budget_min) || 0;
        payload.budget_max = parseFloat(formData.budget_max) || 0;
        payload.service_package = formData.serviceTier;
      } else {
        payload.company_name = formData.companyName;
        payload.company_employee_count = formData.employeeCount;
        payload.business_stage = formData.businessStage;
        payload.areas_of_focus = formData.areasOfFocus;
        payload.consultation_topic = formData.consultationTopic;
        payload.delivery_format = formData.deliveryFormat;
      }

      const { error } = await supabase.from('bookings').update(payload).eq('id', formData.id);
      if (error) throw error;
      
      router.push("/user-dashboard?success=true");
    } catch (error) {
      console.error(error);
      alert("Failed to update revision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin opacity-30" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur border-b border-border py-8 px-6 flex justify-center">
        <div className="w-full max-w-7xl flex justify-between items-center">
          <button onClick={() => router.push("/user-dashboard")} className="text-[10px] uppercase tracking-widest font-bold opacity-50 hover:text-primary transition-colors">
            <X size={14} className="inline mr-2" /> Cancel Revision
          </button>
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-amber-500">
            Revision Protocol (Step {step} / {maxSteps})
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto py-16 px-6">
        <AnimatePresence mode="wait">
          <StepAnimation key={step} step={step}>
            {bookingType === 'Private Event' && (
              <>
                {step === 1 && <Step1Identity data={formData} update={updateData} />}
                {step === 2 && <Step2Logistics data={formData} update={updateData} />}
                {step === 3 && <Step3Schedule data={formData} update={updateData} />}
                {step === 4 && <Step4Culinary data={formData} update={updateData} />}
                {step === 5 && <Step5Finances data={formData} update={updateData} />}
                {step === 6 && <Step6Notes data={formData} update={updateData} />}
                {step === 7 && <Step7Summary data={formData} />}
              </>
            )}
            
            {bookingType === 'Consultation' && (
              <>
                {step === 1 && <ConStep1Identity data={formData} update={updateData} />}
                {step === 2 && <ConStep2Business data={formData} update={updateData} />}
                {step === 3 && <ConStep3Focus data={formData} update={updateData} />}
                {step === 4 && <ConStep4Logistics data={formData} update={updateData} />}
                {step === 5 && <ConStep5Finances data={formData} update={updateData} />}
                {step === 6 && <ConStep6Summary data={formData} />}
              </>
            )}
          </StepAnimation>
        </AnimatePresence>
      </main>

      <footer className="sticky bottom-0 z-40 w-full bg-background border-t border-border py-4 px-6 flex justify-center">
        <div className="w-full max-w-7xl flex justify-between items-center">
          <button onClick={prevStep} disabled={step === 1} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold disabled:opacity-0 transition-opacity">
            <ArrowLeft size={14} /> Previous
          </button>
          <button 
            onClick={step === maxSteps ? handleUpdate : nextStep}
            disabled={isSubmitting}
            className="bg-primary text-black px-16 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          >
            {isSubmitting ? "Committing Updates..." : step === maxSteps ? "Finalize Revision" : "Next Step"} 
            {!isSubmitting && <ArrowRight size={14} className="inline ml-2" />}
          </button>
        </div>
      </footer>
    </div>
  );
}