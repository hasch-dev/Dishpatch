"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ChevronRight, 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  X, 
  ShoppingCart, 
  Info,
  ChefHat
} from "lucide-react";

// --- Configuration & Constants ---
const LUZON_PROVINCES = [
  "Metro Manila", "Bataan", "Batangas", "Bulacan", "Cavite", "Laguna", 
  "Pampanga", "Rizal", "Tarlac", "Zambales"
];

const OCCASIONS = [
  "Birthday", "Anniversary", "Corporate Gathering", "Family Reunion", 
  "Wedding Reception", "Holiday Party", "Dinner Party", "Other"
];

const ALLERGIES = [
  "Peanuts", "Tree Nuts", "Dairy", "Eggs", "Wheat/Gluten", 
  "Soy", "Fish", "Shellfish", "Other"
];

const EXCLUSIONS = [
  "Pork", "Beef", "Poultry", "Mushrooms", "Cilantro", 
  "Spicy Food", "Alcohol", "Other"
];

const COUNTRY_CODES = [
  { code: "+63", country: "Philippines" },
  { code: "+1", country: "US/Canada" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "Australia" },
  { code: "+81", country: "Japan" }
];

export default function PrivateEventForm() {
  const [step, setStep] = useState(1);
  
  // --- Form State ---
  const [formData, setFormData] = useState({
    eventName: "", occasion: "", occasionOther: "",
    hostName: "", phoneCode: "+63", phoneNumber: "", 
    province: "", city: "", cityOther: "", exactAddress: "",
    date: "", timePreference: "", duration: "", guestCount: "",
    culinaryDirection: "", exclusions: [] as string[], exclusionOther: "",
    budget: "", allergies: [] as string[], allergyOther: "",
    notes: "", serviceTier: "",
    cart: [] as any[]
  });

  // --- UI State ---
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogStep, setCatalogStep] = useState<"chefs" | "menu">("chefs");
  const [selectedChef, setSelectedChef] = useState<any>(null);
  const [catalogTab, setCatalogTab] = useState<"menu" | "alacarte">("menu");
  
  // --- Supabase Data States ---
  const [chefs, setChefs] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  // Fetch Supabase Data placeholder
  useEffect(() => {
    async function fetchCatalogData() {
      // Replace with actual Supabase fetch: supabase.from('chefs').select('*').eq('profile_completed', true)
      setChefs([]); // Defaults to empty, rendering "N/A" per instructions
      setMenuItems([]);
    }
    fetchCatalogData();
  }, []);

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(rawValue)) && rawValue !== '') {
      updateForm('budget', Number(rawValue).toLocaleString());
    } else if (rawValue === '') {
      updateForm('budget', '');
    }
  };

  const toggleArrayItem = (key: 'allergies' | 'exclusions', item: string) => {
    setFormData(prev => {
      const array = prev[key];
      if (array.includes(item)) return { ...prev, [key]: array.filter(i => i !== item) };
      return { ...prev, [key]: [...array, item] };
    });
  };

  // --- Validation ---
  const isStepValid = () => {
    switch (step) {
      case 1: return formData.eventName && (formData.occasion !== "Other" ? formData.occasion : formData.occasionOther);
      case 2: return formData.hostName && formData.phoneNumber && (formData.city !== "Other" ? formData.city : formData.cityOther) && formData.exactAddress;
      case 3: return formData.date && formData.timePreference && formData.duration && formData.guestCount;
      case 4: return formData.culinaryDirection && (formData.exclusions.length > 0 || formData.exclusionOther);
      case 5: return formData.budget && (formData.allergies.length > 0 || formData.allergyOther);
      case 6: return formData.notes && formData.serviceTier;
      default: return true;
    }
  };

  const handleNext = () => { if (isStepValid()) setStep(s => s + 1); };
  const handleBack = () => { if (step > 1) setStep(s => s - 1); };

  // --- Components ---
  const Tooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-2 cursor-help">
      <Info size={14} className="text-muted-foreground hover:text-primary transition-colors" />
      <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-2 z-50">
        {text}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="w-full p-6 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/booking/new" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
            <ArrowLeft size={16} />
            Change Event
          </Link>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm tracking-[0.2em] uppercase font-bold text-muted-foreground">
            Step {step} of 7
          </span>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Step 1: Occasion */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Event Details</h1>
                <p className="text-muted-foreground">Let us know what you are celebrating.</p>
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-bold tracking-widest uppercase">
                  Event Name <Tooltip text="A recognizable name for your booking." />
                </label>
                <input 
                  type="text" 
                  value={formData.eventName}
                  onChange={e => updateForm('eventName', e.target.value)}
                  className="w-full bg-input/50 border border-border p-4 text-lg not-italic focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                  placeholder="e.g. Smith Family Reunion"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold tracking-widest uppercase">
                  Occasion <Tooltip text="Select the primary reason for this event." />
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {OCCASIONS.map(occ => (
                    <button
                      key={occ}
                      onClick={() => updateForm('occasion', occ)}
                      className={`p-4 border text-sm transition-all ${formData.occasion === occ ? 'button-selected' : 'border-border bg-card hover:border-primary/50'}`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
                {formData.occasion === "Other" && (
                  <input 
                    type="text" 
                    value={formData.occasionOther}
                    onChange={e => updateForm('occasionOther', e.target.value)}
                    className="w-full bg-input/50 border border-border p-4 mt-2 text-lg not-italic outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Please specify"
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 2: Location & Contact */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Host & Venue</h1>
                <p className="text-muted-foreground">Contact details and exact location in Luzon.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-sm font-bold tracking-widest uppercase">Host Name</label>
                  <input 
                    type="text" 
                    value={formData.hostName}
                    onChange={e => updateForm('hostName', e.target.value)}
                    className="w-full bg-input/50 border border-border p-4 not-italic outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-bold tracking-widest uppercase">Phone Number</label>
                  <div className="flex">
                    <select 
                      value={formData.phoneCode}
                      onChange={e => updateForm('phoneCode', e.target.value)}
                      className="bg-input/50 border border-border border-r-0 p-4 outline-none focus:ring-1 focus:ring-primary min-w-[100px]"
                    >
                      {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </select>
                    <input 
                      type="tel" 
                      value={formData.phoneNumber}
                      onChange={e => updateForm('phoneNumber', e.target.value)}
                      className="w-full bg-input/50 border border-border p-4 not-italic outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-sm font-bold tracking-widest uppercase">Province (Luzon)</label>
                  <select 
                    value={formData.province}
                    onChange={e => updateForm('province', e.target.value)}
                    className="w-full bg-input/50 border border-border p-4 outline-none focus:ring-1 focus:ring-primary appearance-none"
                  >
                    <option value="" disabled>Select Province</option>
                    {LUZON_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">*Currently servicing Luzon region primarily.</p>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-bold tracking-widest uppercase">City</label>
                  {formData.province === "Other" ? (
                    <input 
                      type="text" 
                      value={formData.cityOther}
                      onChange={e => updateForm('cityOther', e.target.value)}
                      className="w-full bg-input/50 border border-border p-4 not-italic outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Specify City"
                    />
                  ) : (
                     <input 
                      type="text" 
                      value={formData.city}
                      onChange={e => updateForm('city', e.target.value)}
                      className="w-full bg-input/50 border border-border p-4 not-italic outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Enter City"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold tracking-widest uppercase">Exact Address</label>
                <textarea 
                  value={formData.exactAddress}
                  onChange={e => updateForm('exactAddress', e.target.value)}
                  className="w-full bg-input/50 border border-border p-4 not-italic outline-none focus:ring-1 focus:ring-primary min-h-[100px] resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Scheduling */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Schedule & Capacity</h1>
                <p className="text-muted-foreground">Select a date (1 month minimum gap) and logistics.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-sm font-bold tracking-widest uppercase">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input 
                      type="date" 
                      value={formData.date}
                      // 1 month gap logic would go here in min attribute
                      onChange={e => updateForm('date', e.target.value)}
                      className="w-full bg-input/50 border border-border p-4 pl-12 not-italic outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold tracking-widest uppercase">Time Preference</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => updateForm('timePreference', 'Noon')} className={`p-4 border flex items-center justify-center gap-2 ${formData.timePreference === 'Noon' ? 'button-selected' : 'border-border bg-card'}`}>
                      <Clock size={16} /> Noon
                    </button>
                    <button onClick={() => updateForm('timePreference', 'Evening')} className={`p-4 border flex items-center justify-center gap-2 ${formData.timePreference === 'Evening' ? 'button-selected' : 'border-border bg-card'}`}>
                      <Clock size={16} /> Evening
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold tracking-widest uppercase">Estimated Duration</label>
                  <select 
                    value={formData.duration}
                    onChange={e => updateForm('duration', e.target.value)}
                    className="w-full bg-input/50 border border-border p-4 outline-none focus:ring-1 focus:ring-primary appearance-none"
                  >
                    <option value="" disabled>Select Duration</option>
                    <option value="2 hours">2 Hours</option>
                    <option value="3 hours">3 Hours</option>
                    <option value="4+ hours">4+ Hours</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold tracking-widest uppercase">Guest Count</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input 
                      type="number" 
                      value={formData.guestCount}
                      onChange={e => updateForm('guestCount', e.target.value)}
                      className="w-full bg-input/50 border border-border p-4 pl-12 not-italic outline-none focus:ring-1 focus:ring-primary"
                      placeholder="e.g. 12"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Culinary Catalog */}
          {step === 4 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Culinary Direction</h1>
                <p className="text-muted-foreground">Curate your menu and list ingredient exclusions.</p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold tracking-widest uppercase">Menu Selection</label>
                <div className="p-8 border border-dashed border-border bg-input/10 flex flex-col items-center justify-center gap-4">
                  <ChefHat size={48} className="text-muted-foreground/50" />
                  <p className="text-sm text-center text-muted-foreground max-w-sm">
                    {formData.cart.length > 0 
                      ? `${formData.cart.length} items selected from the catalog.` 
                      : "Open the catalog to select a chef and curate your personalized menu items."}
                  </p>
                  <button 
                    onClick={() => setIsCatalogOpen(true)}
                    className="bg-primary text-primary-foreground px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
                  >
                    Open Culinary Catalog
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-border">
                <label className="block text-sm font-bold tracking-widest uppercase">
                  Ingredient Exclusions
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {EXCLUSIONS.map(ex => (
                    <button
                      key={ex}
                      onClick={() => {
                        if (ex === "Other") return;
                        toggleArrayItem('exclusions', ex);
                      }}
                      className={`p-3 border text-sm transition-all ${ex === "Other" && formData.exclusionOther ? 'button-selected' : formData.exclusions.includes(ex) ? 'button-selected' : 'border-border bg-card'}`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={formData.exclusionOther}
                  onChange={e => updateForm('exclusionOther', e.target.value)}
                  className="w-full bg-input/50 border border-border p-4 mt-2 text-sm not-italic outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Specify other exclusions (Optional)"
                />
              </div>
            </div>
          )}

          {/* Step 5: Budget & Dietary */}
          {step === 5 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Budget & Dietary</h1>
                <p className="text-muted-foreground">Set your parameters and list allergies.</p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold tracking-widest uppercase">Budget (PHP)</label>
                <input 
                  type="text" 
                  value={formData.budget}
                  onChange={handleBudgetChange}
                  className="w-full bg-card border border-border p-6 text-2xl font-bold not-italic outline-none focus:ring-1 focus:ring-primary solid-bg"
                  placeholder="100,000"
                />
              </div>

              <div className="space-y-4 pt-6">
                <label className="block text-sm font-bold tracking-widest uppercase">Dietary Allergies</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ALLERGIES.map(al => (
                    <button
                      key={al}
                      onClick={() => {
                        if (al === "Other") return;
                        toggleArrayItem('allergies', al);
                      }}
                      className={`p-3 border text-sm transition-all ${al === "Other" && formData.allergyOther ? 'button-selected' : formData.allergies.includes(al) ? 'button-selected' : 'border-border bg-card'}`}
                    >
                      {al}
                    </button>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={formData.allergyOther}
                  onChange={e => updateForm('allergyOther', e.target.value)}
                  className="w-full bg-input/50 border border-border p-4 mt-2 text-sm not-italic outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Specify other allergies"
                />
              </div>
            </div>
          )}

          {/* Step 6: Notes & Service Tier */}
          {step === 6 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Final Details</h1>
                <p className="text-muted-foreground">Service level and notes for the culinary team.</p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold tracking-widest uppercase">Service Tier</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { tier: "Standard", price: "2,000 PHP" },
                    { tier: "Premium", price: "2,500 PHP" },
                    { tier: "Luxury", price: "4,000 PHP" }
                  ].map(t => (
                    <button
                      key={t.tier}
                      onClick={() => updateForm('serviceTier', t.tier)}
                      className={`p-6 border text-left flex flex-col gap-2 transition-all ${formData.serviceTier === t.tier ? 'button-selected' : 'border-border bg-card hover:border-primary/50'}`}
                    >
                      <span className="font-bold tracking-widest uppercase text-sm">{t.tier}</span>
                      <span className="text-muted-foreground">{t.price} / pax</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold tracking-widest uppercase">Notes for the Chef</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => updateForm('notes', e.target.value)}
                  className="w-full bg-input/50 border border-border p-4 not-italic outline-none focus:ring-1 focus:ring-primary min-h-[150px] resize-none"
                  placeholder="Provide any specific instructions, kitchen details, or event flow information."
                />
              </div>
            </div>
          )}

          {/* Step 7: Summary */}
          {step === 7 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Review Booking</h1>
                <p className="text-muted-foreground">Verify your event details before submission.</p>
              </div>
              
              <div className="border border-border bg-card p-8 space-y-6">
                <div className="grid grid-cols-2 gap-y-6 gap-x-12 text-sm border-b border-border pb-6">
                  <div><span className="text-muted-foreground block uppercase tracking-widest text-[10px] mb-1">Event</span><span className="font-medium">{formData.eventName}</span></div>
                  <div><span className="text-muted-foreground block uppercase tracking-widest text-[10px] mb-1">Occasion</span><span className="font-medium">{formData.occasion === "Other" ? formData.occasionOther : formData.occasion}</span></div>
                  <div><span className="text-muted-foreground block uppercase tracking-widest text-[10px] mb-1">Host</span><span className="font-medium">{formData.hostName} ({formData.phoneCode} {formData.phoneNumber})</span></div>
                  <div><span className="text-muted-foreground block uppercase tracking-widest text-[10px] mb-1">Location</span><span className="font-medium">{formData.city}, {formData.province}</span></div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm border-b border-border pb-6">
                  <div><span className="text-muted-foreground block uppercase tracking-widest text-[10px] mb-1">Date</span><span className="font-medium">{formData.date}</span></div>
                  <div><span className="text-muted-foreground block uppercase tracking-widest text-[10px] mb-1">Time & Duration</span><span className="font-medium">{formData.timePreference}, {formData.duration}</span></div>
                  <div><span className="text-muted-foreground block uppercase tracking-widest text-[10px] mb-1">Guests</span><span className="font-medium">{formData.guestCount} pax</span></div>
                </div>

                <div className="space-y-2">
                   <span className="text-muted-foreground block uppercase tracking-widest text-[10px]">Tier & Budget</span>
                   <div className="flex justify-between items-center bg-input/30 p-4 border border-border">
                     <span className="font-bold">{formData.serviceTier} Tier</span>
                     <span className="font-medium text-primary">PHP {formData.budget}</span>
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
            
            {step < 7 ? (
              <button 
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`bg-primary text-primary-foreground px-8 py-3 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}
              >
                Next Step <ChevronRight size={16} />
              </button>
            ) : (
              <button className="bg-primary text-primary-foreground px-8 py-3 text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90">
                Confirm Booking
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Culinary Catalog Popup Overlay */}
      {isCatalogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-300">
          <div className="w-[90vw] h-[90vh] bg-card border border-border shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Popup Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-background">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Culinary Catalog</h2>
                <p className="text-sm text-muted-foreground">Select a chef and curate your menu.</p>
              </div>
              <button onClick={() => setIsCatalogOpen(false)} className="p-2 hover:bg-input transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Popup Body: 3 Sections */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Section 1: Chef Selection */}
              <div className="w-1/4 border-r border-border bg-input/10 overflow-y-auto p-4 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Select Chef</h3>
                {chefs.length === 0 ? (
                  <div className="text-sm text-muted-foreground italic p-4 border border-dashed border-border text-center">n/a</div>
                ) : (
                  chefs.map((chef: any) => (
                    <button 
                      key={chef.id}
                      onClick={() => { setSelectedChef(chef); setCatalogStep("menu"); }}
                      className={`w-full text-left p-4 border transition-all ${selectedChef?.id === chef.id ? 'button-selected' : 'border-border bg-card hover:border-primary/30'}`}
                    >
                      <div className="font-bold">{chef.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{chef.specialty}</div>
                    </button>
                  ))
                )}
              </div>

              {/* Section 2: Menu Tabs */}
              <div className="flex-1 flex flex-col bg-background">
                {selectedChef ? (
                  <>
                    <div className="flex border-b border-border px-6 pt-6 gap-6">
                      <button 
                        onClick={() => setCatalogTab("menu")} 
                        data-state={catalogTab === "menu" ? "active" : "inactive"}
                        className="request-tab"
                      >
                        Menu Groups
                      </button>
                      <button 
                        onClick={() => setCatalogTab("alacarte")} 
                        data-state={catalogTab === "alacarte" ? "active" : "inactive"}
                        className="request-tab"
                      >
                        A La Carte
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                      {menuItems.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">n/a</div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {/* Map items here */}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
                    <Search size={32} className="opacity-20" />
                    <p>Select a chef to view their specialties.</p>
                  </div>
                )}
              </div>

              {/* Section 3: Cart */}
              <div className="w-1/4 border-l border-border bg-card flex flex-col">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <ShoppingCart size={18} />
                  <span className="font-bold uppercase tracking-widest text-sm">Selection</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {formData.cart.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center pt-8">Cart is empty</div>
                  ) : (
                    formData.cart.map((item, idx) => (
                       <div key={idx} className="p-3 border border-border text-sm">
                         {item.name}
                       </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-border bg-input/30">
                   <button 
                    onClick={() => setIsCatalogOpen(false)}
                    className="w-full bg-primary text-primary-foreground py-3 text-sm font-bold uppercase tracking-widest"
                  >
                    Confirm Selection
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}