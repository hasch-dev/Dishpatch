"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, X, Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client"; 
import StepAnimation from "@/components/booking/StepAnimation";

// Your Step Imports
import Step1Intro from "@/components/booking/consultation/step1";
import Step2Identity from "@/components/booking/consultation/step2";
import Step3Calendar from "@/components/booking/consultation/step3";
import Step4Objectives from "@/components/booking/consultation/step4";
import Step5Packages from "@/components/booking/consultation/step5";
import Step6Summary from "@/components/booking/consultation/step6";

export default function ConsultationForm() {
  const router = useRouter();
  const supabase = createClient(); 
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "", 
    stage: "",
    company: "", 
    phone: "", 
    countryCode: "+63", 
    city: "", 
    province: "", 
    address: "",
    startDate: "", 
    endDate: "",
    areas_of_focus: [] as string[],
    objective_explanation: "",      
    consultation_package: "", 
    delivery_format: "",      
    notes: ""                 
  });

  const updateData = (fields: Partial<typeof formData>) => setFormData(prev => ({ ...prev, ...fields }));

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const canContinue = () => {
    if (step === 1) return formData.name && formData.stage;
    if (step === 2) return formData.company && formData.phone && formData.city;
    if (step === 3) return formData.startDate && formData.endDate;
    if (step === 4) return formData.areas_of_focus.length > 0 && formData.objective_explanation.trim() !== "";
    if (step === 5) return formData.consultation_package && formData.delivery_format;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Session not found. Please ensure you are logged in.");
      }

      // Generate a dynamic title for the dashboard
      const generatedTitle = formData.company 
        ? `${formData.company} - Strategy Consultation` 
        : `${formData.name} - Private Consultation`;

      const { data, error } = await supabase
        .from("bookings")
        .insert([
          {
            user_id: user.id,
            booking_type: "Consultation",
            title: generatedTitle, // FIX: Injected Title
            recipient_name: formData.name,
            business_stage: formData.stage,
            company_name: formData.company,
            phone_number: `${formData.countryCode} ${formData.phone}`,
            location_city: formData.city,
            location_address: `${formData.address}, ${formData.province}`,
            // FIX: Convert empty strings to null to avoid Postgres Date format errors
            event_date: formData.startDate || null, 
            event_end_date: formData.endDate || null,
            areas_of_focus: formData.areas_of_focus,
            objective_explanation: formData.objective_explanation,
            consultation_package: formData.consultation_package,
            delivery_format: formData.delivery_format,
            notes: formData.notes,
            status: "open"
          }
        ])
        .select();

      if (error) throw error;

      router.push("/booking/success"); 

    } catch (error: any) {
      console.error("Submission Error:", error.message);
      alert("Submission failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur border-b border-border py-8 px-6 flex justify-center">
        <div className="w-full max-w-7xl flex justify-between items-center">
          <button 
            onClick={() => router.push("/booking/new")} 
            className="text-[10px] uppercase tracking-widest font-bold opacity-50 hover:text-primary transition-colors"
          >
            <X size={14} className="inline mr-2" /> Change Event
          </button>
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Step {step} / 6</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto py-16 px-6">
        <AnimatePresence mode="wait">
          <StepAnimation key={step} step={step}>
            {step === 1 && <Step1Intro data={formData} update={updateData} />}
            {step === 2 && <Step2Identity data={formData} update={updateData} />}
            {step === 3 && <Step3Calendar data={formData} update={updateData} />}
            {step === 4 && <Step4Objectives data={formData} update={updateData} />}
            {step === 5 && <Step5Packages data={formData} update={updateData} />}
            {step === 6 && <Step6Summary data={formData} />}
          </StepAnimation>
        </AnimatePresence>
      </main>

      <footer className="sticky bottom-0 z-40 w-full bg-background border-t border-border py-6 flex justify-center">
        <div className="w-full max-w-7xl flex justify-between items-center px-6">
          <button 
            onClick={prevStep} 
            disabled={step === 1 || loading} 
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold disabled:opacity-0 transition-opacity"
          >
            <ArrowLeft size={14} /> Previous
          </button>
          
          <button 
            onClick={step === 6 ? handleSubmit : nextStep}
            disabled={!canContinue() || loading}
            className="bg-primary text-primary-foreground px-16 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:opacity-90 disabled:opacity-20 transition-all flex items-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {step === 6 ? "Confirm Brief" : "Next Step"} 
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}