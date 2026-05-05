"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import StepAnimation from "@/components/booking/StepAnimation";

// Your Step Imports
import Step1Occasion from "@/components/booking/private-event/step1";
import Step2Logistics from "@/components/booking/private-event/step2";
import Step3Timeline from "@/components/booking/private-event/step3";
import Step4Culinary from "@/components/booking/private-event/step4";
import Step5Finances from "@/components/booking/private-event/step5";
import Step6Notes from "@/components/booking/private-event/step6";
import Step7Summary from "@/components/booking/private-event/step7";
import { CulinaryCatalog } from "@/components/booking/private-event/culinary-catalog";

export default function PrivateEventForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "", occasion: "",
    hostName: "", phone: "", countryCode: "+63", city: "", province: "", address: "",
    time: "Evening", duration: "", pax: { adults: 0, teens: 0, seniors: 0, children: 0 },
    direction: "Modern Filipino", catalogItems: [],
    budget: "", allergies: [],
    serviceTier: "Standard", notes: ""
  });

  const updateData = (fields: Partial<typeof formData>) => setFormData(prev => ({ ...prev, ...fields }));

  const nextStep = () => setStep(s => Math.min(s + 1, 7));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const canContinue = () => {
    if (step === 1) return formData.eventName && formData.occasion;
    if (step === 2) return formData.hostName && formData.phone && formData.city && formData.address;
    if (step === 3) return formData.duration && (parseInt(formData.pax.adults.toString()) > 0);
    if (step === 5) return formData.budget;
    return true;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Sticky Header - Stays inside content area */}
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur border-b border-border py-8 px-6 flex justify-center">
        <div className="w-full max-w-7xl flex justify-between items-center">
          <button 
            onClick={() => router.push("/booking/new")} 
            className="text-[10px] uppercase tracking-widest font-bold opacity-50 hover:text-primary transition-colors"
          >
            <X size={14} className="inline mr-2" /> Change Event
          </button>
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Step {step} / 7</span>
        </div>
      </header>

      {/* Animated Step Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-16 px-6">
        <AnimatePresence mode="wait">
          <StepAnimation step={step}>
            {step === 1 && <Step1Occasion data={formData} update={updateData} />}
            {step === 2 && <Step2Logistics data={formData} update={updateData} />}
            {step === 3 && <Step3Timeline data={formData} update={updateData} />}
            {step === 4 && <Step4Culinary data={formData} update={updateData} onOpenCatalog={() => setIsCatalogOpen(true)} />}
            {step === 5 && <Step5Finances data={formData} update={updateData} />}
            {step === 6 && <Step6Notes data={formData} update={updateData} />}
            {step === 7 && <Step7Summary data={formData} />}
          </StepAnimation>
        </AnimatePresence>
      </main>

      {/* Sticky Footer */}
      <footer className="sticky bottom-0 z-40 w-full bg-background border-t border-border py-4 px-6 flex justify-center">
        <div className="w-full max-w-7xl flex justify-between items-center">
          <button onClick={prevStep} disabled={step === 1} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold disabled:opacity-0 transition-opacity">
            <ArrowLeft size={14} /> Previous
          </button>
          <button 
            onClick={step === 7 ? () => console.log("Submit", formData) : nextStep}
            disabled={!canContinue()}
            className="bg-primary text-primary-foreground px-16 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:opacity-90 disabled:opacity-20 transition-all"
          >
            {step === 7 ? "Submit Inquiry" : "Next Step"} <ArrowRight size={14} className="inline ml-2" />
          </button>
        </div>
      </footer>

      <CulinaryCatalog 
        isOpen={isCatalogOpen} 
        onClose={() => setIsCatalogOpen(false)} 
        onConfirm={(items: any) => { updateData({ catalogItems: items }); setIsCatalogOpen(false); }}
        currentSelection={formData.catalogItems}
      />
    </div>
  );
}