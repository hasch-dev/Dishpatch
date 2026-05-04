"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Calendar, Info } from "lucide-react";

const STAGES = [
  "Starting from scratch", 
  "Building from detailed plan", 
  "Troubleshooting", 
  "Other"
];

const OBJECTIVES = [
  "Menu Development", "Kitchen Optimization", "Staff Training", "Concept Strategy"
];

const TARGET_AREAS = [
  "Food Costs", "Workflow Flow", "Equipment Sourcing", "Vendor Relations",
  "Plating & Presentation", "Sanitation Standards", "Menu Engineering", "Other"
];

const PACKAGES = [
  { tier: "Standard", price: "80,000 PHP", duration: "1 Week" },
  { tier: "Premium", price: "150,000 PHP", duration: "2-4 Weeks" },
  { tier: "Luxury", price: "400,000 PHP", duration: "1 Month+" }
];

export default function ConsultationForm() {
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    consultationName: "", businessStage: "", businessStageOther: "", primaryObjective: "",
    companyName: "", location: "", contactPerson: "", phoneCode: "+63", phoneNumber: "",
    date: "",
    targetAreas: [] as string[], targetAreaOther: "", explanation: "",
    package: ""
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleTargetArea = (area: string) => {
    setFormData(prev => {
      const array = prev.targetAreas;
      if (array.includes(area)) return { ...prev, targetAreas: array.filter(i => i !== area) };
      return { ...prev, targetAreas: [...array, area] };
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.consultationName && (formData.businessStage !== "Other" ? formData.businessStage : formData.businessStageOther) && formData.primaryObjective;
      case 2: return formData.companyName && formData.location && formData.contactPerson && formData.phoneNumber;
      case 3: return formData.date;
      case 4: return (formData.targetAreas.length > 0 || formData.targetAreaOther) && formData.explanation;
      case 5: return formData.package;
      default: return true;
    }
  };

  const handleNext = () => { if (isStepValid()) setStep(s => s + 1); };
  const handleBack = () => { if (step > 1) setStep(s => s - 1); };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="w-full p-6 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/booking/new" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
            <ArrowLeft size={16} />
            Change Event
          </Link>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm tracking-[0.2em] uppercase font-bold text-muted-foreground">
            Step {step} of 6
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Step 1: Overview */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Consultation Overview</h1>
                <p className="text-muted-foreground">Define the nature of your culinary consultation.</p>
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-bold tracking-widest uppercase">Name of Consultation</label>
                <input 
                  type="text" 
                  value={formData.consultationName}
                  onChange={e => updateForm('consultationName', e.target.value)}
                  className="w-full bg-input/50 border border-border p-4 text-lg not-italic outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold tracking-widest uppercase">Business Stage</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {STAGES.map(stage => (
                    <button
                      key={stage}
                      onClick={() => updateForm('businessStage', stage)}
                      className={`p-4 border text-sm text-left transition-all ${formData.businessStage === stage ? 'button-selected' : 'border-border bg-card hover:border-primary/50'}`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
                {formData.businessStage === "Other" && (
                  <input 
                    type="text" 
                    value={formData.businessStageOther}
                    onChange={e => updateForm('businessStageOther', e.target.value)}
                    className="w-full bg-input/50 border border-border p-4 mt-2 not-italic outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Please specify your stage"
                  />
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <label className="block text-sm font-bold tracking-widest uppercase">Primary Objective</label>
                <div className="grid grid-cols-2 gap-3">
                  {OBJECTIVES.map(obj => (
                    <button
                      key={obj}
                      onClick={() => updateForm('primaryObjective', obj)}
                      className={`p-4 border text-sm transition-all ${formData.primaryObjective === obj ? 'button-selected' : 'border-border bg-card'}`}
                    >
                      {obj}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Company Information</h1>
                <p className="text-muted-foreground">Entity and contact details.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-sm font-bold tracking-widest uppercase">Company / Host Name</label>
                  <input 
                    type="text" 
                    value={formData.companyName}
                    onChange={e => updateForm('companyName', e.target.value)}
                    className="w-full bg-input/50 border border-border p-4 not-italic outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-bold tracking-widest uppercase">HQ / Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={e => updateForm('location', e.target.value)}
                    className="w-full bg-input/50 border border-border p-4 not-italic outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-bold tracking-widest uppercase">Contact Person</label>
                  <input 
                    type="text" 
                    value={formData.contactPerson}
                    onChange={e => updateForm('contactPerson', e.target.value)}
                    className="w-full bg-input/50 border border-border p-4 not-italic outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-bold tracking-widest uppercase">Phone Number</label>
                  <div className="flex">
                    <input 
                      type="text" 
                      value={formData.phoneCode}
                      onChange={e => updateForm('phoneCode', e.target.value)}
                      className="w-20 bg-input/50 border border-border border-r-0 p-4 outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input 
                      type="tel" 
                      value={formData.phoneNumber}
                      onChange={e => updateForm('phoneNumber', e.target.value)}
                      className="w-full bg-input/50 border border-border p-4 not-italic outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Calendar */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Commencement Date</h1>
                <p className="text-muted-foreground">Select a starting date (minimum 1 month from today).</p>
              </div>

              <div className="space-y-4 max-w-md">
                <label className="block text-sm font-bold tracking-widest uppercase">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => updateForm('date', e.target.value)}
                    className="w-full bg-input/50 border border-border p-6 pl-12 not-italic text-lg outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Target Areas */}
          {step === 4 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Scope of Work</h1>
                <p className="text-muted-foreground">Select focus areas and explain your goals.</p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold tracking-widest uppercase">Target Areas</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TARGET_AREAS.map(area => (
                    <button
                      key={area}
                      onClick={() => {
                        if (area === "Other") return;
                        toggleTargetArea(area);
                      }}
                      className={`p-3 border text-sm transition-all ${area === "Other" && formData.targetAreaOther ? 'button-selected' : formData.targetAreas.includes(area) ? 'button-selected' : 'border-border bg-card'}`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={formData.targetAreaOther}
                  onChange={e => updateForm('targetAreaOther', e.target.value)}
                  className="w-full bg-input/50 border border-border p-4 mt-2 text-sm not-italic outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Specify other focus areas"
                />
              </div>

              <div className="space-y-4 pt-4">
                <label className="block text-sm font-bold tracking-widest uppercase">Explanation of Goals</label>
                <textarea 
                  value={formData.explanation}
                  onChange={e => updateForm('explanation', e.target.value)}
                  className="w-full bg-input/50 border border-border p-4 not-italic outline-none focus:ring-1 focus:ring-primary min-h-[150px] resize-none"
                  placeholder="How do you want to achieve success in this consultation?"
                />
              </div>
            </div>
          )}

          {/* Step 5: Package */}
          {step === 5 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Consultation Package</h1>
                <p className="text-muted-foreground">Select the tier that fits your operational needs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PACKAGES.map(pkg => (
                  <button
                    key={pkg.tier}
                    onClick={() => updateForm('package', pkg.tier)}
                    className={`p-8 border text-left flex flex-col gap-4 transition-all ${formData.package === pkg.tier ? 'button-selected' : 'border-border bg-card hover:border-primary/50'}`}
                  >
                    <span className="font-bold tracking-[0.2em] uppercase text-sm border-b border-border pb-4">{pkg.tier}</span>
                    <span className="text-2xl text-primary">{pkg.price}</span>
                    <span className="text-sm text-muted-foreground font-mono">{pkg.duration}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Summary */}
          {step === 6 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Final Review</h1>
                <p className="text-muted-foreground">Verify the consultation details.</p>
              </div>
              
              <div className="border border-border bg-card p-8 space-y-6">
                <div className="grid grid-cols-2 gap-y-6 text-sm border-b border-border pb-6">
                  <div><span className="text-muted-foreground block uppercase tracking-widest text-[10px] mb-1">Project</span><span className="font-medium">{formData.consultationName}</span></div>
                  <div><span className="text-muted-foreground block uppercase tracking-widest text-[10px] mb-1">Company</span><span className="font-medium">{formData.companyName}</span></div>
                  <div><span className="text-muted-foreground block uppercase tracking-widest text-[10px] mb-1">Objective</span><span className="font-medium">{formData.primaryObjective}</span></div>
                  <div><span className="text-muted-foreground block uppercase tracking-widest text-[10px] mb-1">Start Date</span><span className="font-medium">{formData.date}</span></div>
                </div>

                <div className="space-y-2">
                   <span className="text-muted-foreground block uppercase tracking-widest text-[10px]">Selected Package</span>
                   <div className="flex justify-between items-center bg-primary/5 p-6 border border-primary/20">
                     <span className="font-bold text-lg">{formData.package} Tier</span>
                     <span className="font-medium">
                       {PACKAGES.find(p => p.tier === formData.package)?.price}
                     </span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-12 flex items-center justify-between pt-6 border-t border-border">
            {step > 1 ? (
              <button 
                onClick={handleBack}
                className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div />}
            
            {step < 6 ? (
              <button 
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`bg-primary text-primary-foreground px-8 py-3 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}
              >
                Next Step <ChevronRight size={16} />
              </button>
            ) : (
              <button className="bg-primary text-primary-foreground px-8 py-3 text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90">
                Submit Request
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}