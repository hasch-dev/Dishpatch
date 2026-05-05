"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
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
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "", stage: "",
    company: "", phone: "", countryCode: "+63", city: "", province: "", address: "",
    startDate: "", endDate: "",
    target: "", objectiveDetails: "",
    package: ""
  });

  const updateData = (fields: Partial<typeof formData>) => setFormData(prev => ({ ...prev, ...fields }));

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const canContinue = () => {
    if (step === 1) return formData.name && formData.stage;
    if (step === 2) return formData.company && formData.phone && formData.city;
    if (step === 3) return formData.startDate && formData.endDate;
    if (step === 4) return formData.target && formData.objectiveDetails;
    if (step === 5) return formData.package;
    return true;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
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
          <StepAnimation step={step}>
            {step === 1 && <Step1Intro data={formData} update={updateData} />}
            {step === 2 && <Step2Identity data={formData} update={updateData} />}
            {step === 3 && <Step3Calendar data={formData} update={updateData} />}
            {step === 4 && <Step4Objectives data={formData} update={updateData} />}
            {step === 5 && <Step5Packages data={formData} update={updateData} />}
            {step === 6 && <Step6Summary data={formData} />}
          </StepAnimation>
        </AnimatePresence>
      </main>

      <footer className="sticky bottom-0 z-40 w-full bg-background border-t border-border py-6 px-6 flex justify-center">
        <div className="w-full max-w-7xl flex justify-between items-center">
          <button onClick={prevStep} disabled={step === 1} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold disabled:opacity-0 transition-opacity">
            <ArrowLeft size={14} /> Previous
          </button>
          <button 
            onClick={step === 6 ? () => console.log("Submit", formData) : nextStep}
            disabled={!canContinue()}
            className="bg-primary text-primary-foreground px-16 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:opacity-90 disabled:opacity-20 transition-all"
          >
            {step === 6 ? "Confirm Brief" : "Next Step"} <ArrowRight size={14} className="inline ml-2" />
          </button>
        </div>
      </footer>
    </div>
  );
}