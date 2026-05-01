"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Search, 
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
  Info,
  Utensils,
  AlertTriangle,
  Sun,
  Moon
} from "lucide-react"

// --- CONSTANTS & DATA ---
const ALLERGY_OPTIONS = ["Nuts", "Dairy", "Gluten", "Shellfish", "Soy", "Eggs", "Vegan", "None", "Other"]
const OCCASIONS = ["Wedding", "Company Meeting", "Birthday Party", "Anniversary", "Dinner Party", "Date Night", "Other"]
const CONSULT_TYPES = ["Starting from scratch", "Refining an existing concept", "Troubleshooting", "Scaling / Expansion", "Other"]

const PH_CITIES = [
  "Metro Manila: Makati", "Metro Manila: Taguig (BGC)", "Metro Manila: Quezon City", 
  "Metro Manila: Manila", "Metro Manila: Pasig", "Metro Manila: Muntinlupa",
  "Metro Manila: Mandaluyong", "Metro Manila: San Juan", "Metro Manila: Parañaque", "Metro Manila: Pasay",
  "Pampanga: Angeles City", "Pampanga: San Fernando", "Pampanga: Mabalacat",
  "Benguet: Baguio City", "Benguet: La Trinidad",
  "Cavite: Tagaytay", "Cavite: Dasmariñas", "Cavite: Imus", "Cavite: Bacoor", "Cavite: Silang",
  "Batangas: Lipa City", "Batangas: Batangas City", "Batangas: Nasugbu",
  "Laguna: Santa Rosa", "Laguna: Calamba", "Laguna: Biñan",
  "Cebu City", "Davao City", "Iloilo City", "Bacolod City", "Zamboanga City", "Cagayan de Oro City", "Other"
].sort()

const getHolidays = (year: number): Record<string, string> => {
  const holidays: Record<string, string> = {
    [`${year}-01-01`]: "New Year's Day", [`${year}-04-09`]: "Araw ng Kagitingan",
    [`${year}-05-01`]: "Labor Day", [`${year}-06-12`]: "Independence Day",
    [`${year}-08-21`]: "Ninoy Aquino Day", [`${year}-08-31`]: "National Heroes Day",
    [`${year}-11-01`]: "All Saints' Day", [`${year}-11-02`]: "All Souls' Day",
    [`${year}-11-30`]: "Bonifacio Day", [`${year}-12-08`]: "Feast of the Immaculate Conception",
    [`${year}-12-25`]: "Christmas Day", [`${year}-12-30`]: "Rizal Day", [`${year}-12-31`]: "New Year's Eve",
    [`${year}-04-02`]: "Maundy Thursday", [`${year}-04-03`]: "Good Friday"
  }
  return holidays
}

const MENU_SETS = [
  { id: "italian", name: "Italian" }, { id: "mediterranean", name: "Mediterranean" },
  { id: "asian-fusion", name: "Asian Fusion" }, { id: "bbq", name: "BBQ & Grill" },
  { id: "mexican", name: "Mexican" }, { id: "filipino", name: "Filipino" }, { id: "french", name: "French" }
]

const MENU_SET_EXAMPLES: Record<string, string[]> = {
  "Italian": ["Tomato Bruschetta", "Truffle Mushroom Risotto", "Chicken Parmesan", "Classic Tiramisu"],
  "Mediterranean": ["Mezze Platter", "Grilled Sea Bass", "Greek Salad", "Pistachio Baklava"],
  "Asian Fusion": ["Pork Belly Bao Buns", "Miso Glazed Black Cod", "Wagyu Fried Rice", "Matcha Cheesecake"],
  "BBQ & Grill": ["Smoked Beef Brisket", "Truffle Mac & Cheese", "Grilled Sweet Corn", "Apple Pie"],
  "Mexican": ["Shrimp Ceviche", "Beef Birria Tacos", "Elote", "Churros"],
  "Filipino": ["Kinilaw na Tuna", "Lechon Belly Roll", "Seafood Kare-Kare", "Leche Flan"],
  "French": ["Escargot", "Duck Confit", "Ratatouille", "Crème Brûlée"]
}

const MENU_CATALOG = {
  Starters: ["Kinilaw na Tuna", "Truffle Mushroom Soup", "Foie Gras Macarons", "Wagyu Beef Tartare", "Lumpia Wrapper Crisp", "Caprese Salad Skewers", "Grilled Octopus", "Chicken Satay"],
  Mains: ["Lechon Belly Roll", "Miso Glazed Black Cod", "Dry-Aged Ribeye", "Duck Confit", "Lobster Thermidor", "Truffle Mushroom Risotto", "Braised Short Ribs", "Pan-Seared Salmon"],
  Desserts: ["Deconstructed Halo-Halo", "Matcha Tiramisu", "Dark Chocolate Lava Cake", "Calamansi Tart", "Basque Burnt Cheesecake", "Mango Panna Cotta", "Artisan Gelato"]
}

const PACKAGES = {
  "Private Event": [
    { id: "Standard", price: 2000, desc: "Essential professional service. Intimate dinners.", icon: ShieldCheck },
    { id: "Premium", price: 2500, desc: "Elevated experience. Premium ingredients and curation.", icon: Sparkles },
    { id: "Luxury", price: 4000, desc: "The pinnacle. Full-service staff, elite execution.", icon: Trophy }
  ],
  "Consultation": [
    { id: "Standard", price: 80000, desc: "Up to 1 Week. Focused troubleshooting and audits.", icon: ShieldCheck },
    { id: "Premium", price: 150000, desc: "2-3 Weeks. In-depth analysis and implementation planning.", icon: Sparkles },
    { id: "Luxury", price: 400000, desc: "1 Month+. Comprehensive end-to-end development.", icon: Trophy }
  ]
}

export default function NewBookingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [citySearch, setCitySearch] = React.useState("")
  const [viewMonthOffset, setViewMonthOffset] = React.useState(0)
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({})

  const [formData, setFormData] = React.useState({
    booking_type: "Private Event",
    title: "",
    occasion: "", custom_occasion: "",
    consultation_type: "", custom_consultation_type: "",
    event_date: "",
    event_time_pref: "" as "Noon" | "Evening" | "",
    duration: "",
    guest_count: 2,
    location_city: "", location_address: "",
    selected_menu_theme: "", 
    excluded_menu_items: [] as string[],
    menu_selections: [] as string[], 
    custom_menu: "",
    consultation_topic: "", custom_consultation_topic: "",
    allergies: [] as string[], custom_allergy: "",
    budget_min: "", budget_max: "",
    service_package: "Standard",
    payment_plan: "Split",
    description: "" 
  })

  const totalSteps = 10; // Updated to accommodate time selection step
  const nextStep = React.useCallback(() => setStep(s => Math.min(s + 1, totalSteps)), []);
  const prevStep = React.useCallback(() => setStep(s => Math.max(s - 1, 1)), []);

  const holidays = React.useMemo(() => getHolidays(2026), [])
  const filteredCities = React.useMemo(() => 
    PH_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())), 
  [citySearch])

  const [showConfirm, setShowConfirm] = React.useState(false)
  const today = new Date()
  const currentMonthDate = new Date(today.getFullYear(), today.getMonth() + viewMonthOffset, 1)
  const daysInMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).getDay()

  const getDayDetails = (day: number) => {
    const dateObj = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), day)
    const dateStr = dateObj.toLocaleDateString('en-CA') 
    const holidayName = holidays[dateStr]
    const isPast = dateObj < new Date(today.setHours(0,0,0,0))
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6
    let status = holidayName || day === 15 || day === 28 ? 0 : isWeekend ? 1 : 2;
    return { dateStr, holidayName, isPast, status }
  }

  const handleMenuToggle = (item: string) => {
    setFormData(prev => ({
      ...prev,
      menu_selections: prev.menu_selections.includes(item) ? prev.menu_selections.filter(i => i !== item) : [...prev.menu_selections, item]
    }))
  }

  const handleExcludeToggle = (item: string) => {
    setFormData(prev => ({
      ...prev,
      excluded_menu_items: prev.excluded_menu_items.includes(item) ? prev.excluded_menu_items.filter(i => i !== item) : [...prev.excluded_menu_items, item]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push("/auth/login")

    let finalNotes = formData.description;
    if (formData.excluded_menu_items.length > 0) finalNotes += `\n\nExclusions: ${formData.excluded_menu_items.join(", ")}`;

    const { error } = await supabase.from("bookings").insert([{
      user_id: user.id,
      title: formData.title || `${formData.booking_type} Request`,
      booking_type: formData.booking_type,
      event_date: formData.event_date,
      event_time_pref: formData.event_time_pref, // Mapped to column
      duration: formData.duration,
      guest_count: formData.guest_count,
      location_city: formData.location_city,
      location_address: formData.location_address,
      service_package: formData.service_package,
      selected_menu_theme: formData.selected_menu_theme,
      menu_selections: formData.menu_selections,
      excluded_menu_items: formData.excluded_menu_items,
      payment_plan: formData.payment_plan,
      budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
      budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
      allergies: formData.allergies,
      custom_allergy: formData.custom_allergy,
      occasion: formData.occasion,
      custom_occasion: formData.custom_occasion,
      consultation_type: formData.consultation_type,
      consultation_topic: formData.consultation_topic,
      notes: finalNotes,
      status: "pending"
    }])

    if (!error) {
        router.push("/user-dashboard")
    } else {
        console.error("Booking Error:", error.message)
        alert("There was an error saving your booking. Please try again.")
    }
    setLoading(false)
  }

  const formatNumberWithCommas = (value: string) => {
    if (!value) return "";
    return new Intl.NumberFormat('en-US').format(Number(value));
  }

  const handleNumberInput = (field: "budget_min" | "budget_max", value: string) => {
    const rawNumber = value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, [field]: rawNumber }));
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-serif italic tracking-tight cursor-default">Book your<span className="not-italic text-primary"> Event</span></h1>
        <div className="flex items-center gap-2">
          {Array.from({length: totalSteps}).map((_, i) => (
            <div key={i} className={`h-1 w-5 md:w-8 transition-all duration-700 ${i + 1 <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
      </div>

      {/* STEP 1: Type Selection */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <Label className="text-2xl font-serif italic text-center block">What service do you need?</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["Private Event", "Consultation"].map((type) => (
               <button 
                key={type}
                onClick={() => { setFormData({...formData, booking_type: type}); nextStep(); }} 
                className={cn(
                  "p-8 border-2 text-left transition-all duration-300 hover:border-primary hover:bg-primary/[0.02] hover:shadow-md active:scale-[0.98]", 
                  formData.booking_type === type ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <h3 className="text-2xl font-serif italic mb-2">{type}</h3>
                <p className="text-sm text-muted-foreground">{type === "Private Event" ? "Personal chef services and curated celebrations." : "F&B business strategy and kitchen audits."}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Naming & Occasion */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in">
          <div className="space-y-4">
            <Label className="text-2xl font-serif italic">Let's name your project</Label>
            <Input 
              placeholder="e.g. Summer Soirée" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="h-16 text-xl rounded-none border-primary/40 focus:border-primary focus-visible:ring-0 font-serif italic transition-all" 
            />
          </div>
          <div className="space-y-4">
            <Label className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Purpose</Label>
            <div className="flex flex-wrap gap-3">
              {(formData.booking_type === "Private Event" ? OCCASIONS : CONSULT_TYPES).map(opt => (
                <Button 
                  key={opt} 
                  variant={(formData.booking_type === "Private Event" ? formData.occasion : formData.consultation_type) === opt ? "default" : "outline"} 
                  onClick={() => formData.booking_type === "Private Event" ? setFormData({...formData, occasion: opt}) : setFormData({...formData, consultation_type: opt})} 
                  className="rounded-none px-6 py-6 font-serif italic text-lg hover:border-primary transition-all active:scale-95"
                >{opt}</Button>
              ))}
            </div>
          </div>
          <NavButtons prev={prevStep} next={nextStep} disabled={!formData.title} />
        </div>
      )}

      {/* STEP 3: Calendar */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <Label className="text-3xl font-serif italic">Select your Date</Label>
             <div className="flex items-center gap-2 bg-muted/30 p-1 border">
               <Button variant="ghost" size="icon" onClick={() => setViewMonthOffset(prev => prev - 1)} className="hover:bg-primary/10"><ChevronLeft className="h-4 w-4" /></Button>
               <span className="text-xs font-bold w-32 text-center uppercase tracking-widest">{currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
               <Button variant="ghost" size="icon" onClick={() => setViewMonthOffset(prev => prev + 1)} className="hover:bg-primary/10"><ChevronRight className="h-4 w-4" /></Button>
             </div>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="md:col-span-3 rounded-none bg-muted/5 p-4 border-none shadow-none flex flex-col gap-4">
              <div className="grid grid-cols-7 gap-2">
                {Array.from({length: firstDay}).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({length: daysInMonth}).map((_, i) => {
                  const day = i + 1;
                  const { dateStr, holidayName, isPast, status } = getDayDetails(day);
                  const isSelected = formData.event_date === dateStr;
                  return (
                    <button 
                      key={day} 
                      disabled={isPast} 
                      onClick={() => setFormData({...formData, event_date: dateStr})} 
                      className={cn(
                        "h-16 border relative flex flex-col items-center justify-center font-serif text-lg transition-all hover:border-primary hover:bg-primary/[0.02]", 
                        isSelected ? "bg-primary text-white border-primary scale-105 z-10 shadow-lg" : "bg-background", 
                        isPast && "opacity-20 bg-muted cursor-not-allowed"
                      )}
                    >
                      <span>{day}</span>
                      {!isPast && <div className={cn("w-1.5 h-1.5 rounded-full mt-1", status === 2 ? 'bg-green-500' : status === 1 ? 'bg-yellow-400' : 'bg-red-500')} />}
                      {holidayName && <Info className="absolute top-1 right-1 h-2.5 w-2.5 text-red-400" />}
                    </button>
                  )
                })}
              </div>

              {formData.event_date && holidays[formData.event_date] && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 animate-in fade-in flex gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-orange-600" />
                  <div>
                    <p className="font-bold text-sm uppercase tracking-wider mb-1 text-orange-700">Date Advisory</p>
                    <p className="text-sm font-serif italic">
                      <strong>{holidays[formData.event_date]}</strong> falls on this day. Due to high demand, securing a reservation may be difficult.
                    </p>
                  </div>
                </div>
              )}
            </Card>

            <div className="space-y-4">
               <StatusItem color="bg-green-500" label="Standard" />
               <StatusItem color="bg-yellow-400" label="High Demand" />
               <StatusItem color="bg-red-500" label="Holidays" />
            </div>
          </div>
          <NavButtons prev={prevStep} next={nextStep} disabled={!formData.event_date} />
        </div>
      )}

      {/* NEW STEP 4: Event Time Selection */}
      {step === 4 && (
        <div className="space-y-8 animate-in fade-in">
          <Label className="text-3xl font-serif italic block text-center">Preferred Time</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: "Noon", icon: Sun, desc: "Lunch service or mid-day workshops." },
              { id: "Evening", icon: Moon, desc: "Dinner service or late-night consultations." }
            ].map((time) => (
              <button 
                key={time.id}
                onClick={() => setFormData({...formData, event_time_pref: time.id as "Noon" | "Evening"})} 
                className={cn(
                  "p-8 border-2 text-left transition-all duration-300 hover:border-primary hover:bg-primary/[0.02] flex items-start gap-4", 
                  formData.event_time_pref === time.id ? "border-primary bg-primary/5 shadow-md" : "border-border"
                )}
              >
                <time.icon className={cn("h-6 w-6 mt-1", formData.event_time_pref === time.id ? "text-primary" : "text-muted-foreground")} />
                <div>
                  <h3 className="text-2xl font-serif italic">{time.id}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{time.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <NavButtons prev={prevStep} next={nextStep} disabled={!formData.event_time_pref} />
        </div>
      )}

      {/* STEP 5: Logistics (Formerly Step 4) */}
      {step === 5 && (
        <div className="space-y-8 animate-in fade-in">
          <Label className="text-3xl font-serif italic">Timing & Scale</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Duration</Label>
              <Input placeholder="e.g. 4 Hours" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="h-14 rounded-none border-primary/20 hover:border-primary/50 transition-colors" />
            </div>
            {formData.booking_type === "Private Event" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pax</Label>
                <Input type="number" min="1" value={formData.guest_count} onChange={e => setFormData({...formData, guest_count: parseInt(e.target.value) || 0})} className="h-14 rounded-none border-primary/20 text-center" />
              </div>
            )}
          </div>
          <NavButtons prev={prevStep} next={nextStep} />
        </div>
      )}

      {/* STEP 6: Location (Formerly Step 5) */}
      {step === 6 && (
        <div className="space-y-8 animate-in fade-in">
          <Label className="text-3xl font-serif italic">Venue Location</Label>
          <div className="space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input placeholder="Search Cities..." value={citySearch} onChange={e => setCitySearch(e.target.value)} className="pl-12 h-14 rounded-none border-primary/40 focus:border-primary transition-all" />
            </div>
            <div className="max-h-56 overflow-y-auto border p-2 grid grid-cols-2 md:grid-cols-3 gap-2 bg-muted/5">
              {filteredCities.map(city => (
                <Button key={city} variant={formData.location_city === city ? "default" : "ghost"} onClick={() => setFormData({...formData, location_city: city})} className="justify-start rounded-none h-10 truncate hover:bg-primary/10 transition-colors">{city}</Button>
              ))}
            </div>
            <Input placeholder="Exact Address (Unit #, Street, Village)" value={formData.location_address} onChange={e => setFormData({...formData, location_address: e.target.value})} className="h-14 rounded-none border-primary/20 focus:border-primary transition-all" />
          </div>
          <NavButtons prev={prevStep} next={nextStep} disabled={!formData.location_city || !formData.location_address} />
        </div>
      )}

      {/* STEP 7: Menu Experience & Exclusions (Formerly Step 6) */}
      {step === 7 && (
        <div className="space-y-10 animate-in fade-in">
          <div className="space-y-4 bg-muted/5 p-6 border">
            <Label className="text-3xl font-serif italic">Curated Theme</Label>
            <Select onValueChange={val => setFormData({...formData, selected_menu_theme: val, excluded_menu_items: []})} value={formData.selected_menu_theme}>
              <SelectTrigger className="h-16 rounded-none border-primary text-lg font-serif italic bg-background hover:bg-primary/[0.02] transition-colors">
                <SelectValue placeholder="Select a culinary direction..." />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {MENU_SETS.map(m => <SelectItem key={m.id} value={m.name} className="py-3 font-serif italic hover:bg-primary/5">{m.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {formData.selected_menu_theme && (
              <div className="mt-6 pt-4 border-t border-primary/20">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4 block">Tap to Exclude from {formData.selected_menu_theme}</Label>
                <div className="flex flex-wrap gap-2">
                  {MENU_SET_EXAMPLES[formData.selected_menu_theme].map(dish => (
                    <button key={dish} onClick={() => handleExcludeToggle(dish)} className={cn("px-4 py-2 text-sm border transition-all flex items-center gap-2 hover:shadow-sm", formData.excluded_menu_items.includes(dish) ? "bg-red-50 text-red-600 border-red-300 line-through opacity-70" : "bg-background border-primary/30 hover:border-red-400 hover:text-red-500")}>
                      {dish} {formData.excluded_menu_items.includes(dish) ? <X className="h-3 w-3" /> : <Check className="h-3 w-3 text-primary opacity-50" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-8 border-t space-y-8">
            <Label className="text-3xl font-serif italic">A La Carte Catalog</Label>
            {Object.entries(MENU_CATALOG).map(([category, items]) => (
              <div key={category} className="space-y-4">
                <div className="flex justify-between items-end border-b pb-2">
                  <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-primary flex items-center gap-2"><Utensils className="h-3 w-3" /> {category}</h3>
                  <button onClick={() => setExpandedCategories(p => ({...p, [category]: !p[category]}))} className="text-[10px] font-bold text-muted-foreground uppercase hover:text-primary transition-colors">{expandedCategories[category] ? "View Less" : "Expand All"}</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(expandedCategories[category] ? items : items.slice(0, 3)).map(item => (
                    <button key={item} onClick={() => handleMenuToggle(item)} className={cn("flex items-center justify-between p-4 border text-left transition-all hover:border-primary hover:bg-primary/[0.01]", formData.menu_selections.includes(item) ? "border-primary bg-primary/5 font-bold shadow-sm" : "border-border")}>
                      <span className="text-sm">{item}</span>
                      {formData.menu_selections.includes(item) && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <NavButtons prev={prevStep} next={nextStep} />
        </div>
      )}

      {/* STEP 8: Allergies & Budget (Formerly Step 7) */}
      {step === 8 && (
        <div className="space-y-10 animate-in fade-in">
          <div className="space-y-6">
            <Label className="text-3xl font-serif italic">Health & Restrictions</Label>
            <div className="flex flex-wrap gap-3">
              {ALLERGY_OPTIONS.map(a => (
                <button key={a} onClick={() => setFormData(p => ({...p, allergies: p.allergies.includes(a) ? p.allergies.filter(x => x !== a) : [...p.allergies, a]}))} className={cn("px-6 py-4 border text-[10px] font-bold uppercase tracking-widest transition-all hover:border-red-400 active:scale-95", formData.allergies.includes(a) ? "bg-red-500 text-white border-red-500 shadow-md" : "bg-background")}>{a}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 pt-10 border-t">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Min Budget (₱)</Label>
              <Input 
                type="text" 
                placeholder="0" 
                value={formatNumberWithCommas(formData.budget_min)} 
                onChange={e => handleNumberInput("budget_min", e.target.value)} 
                className="h-16 text-center text-xl font-serif border-primary/20 focus:border-primary" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Max Budget (₱)</Label>
              <Input 
                type="text" 
                placeholder="0" 
                value={formatNumberWithCommas(formData.budget_max)} 
                onChange={e => handleNumberInput("budget_max", e.target.value)} 
                className="h-16 text-center text-xl font-serif border-primary/20 focus:border-primary" 
              />
            </div>
          </div>
          <NavButtons prev={prevStep} next={nextStep} />
        </div>
      )}

      {/* STEP 9: Tier Selection & Notes (Formerly Step 8) */}
      {step === 9 && (
        <div className="space-y-10 animate-in fade-in">
          <div className="space-y-4">
             <Label className="text-3xl font-serif italic block text-center">Chef's Notes & Suggestions</Label>
             <div className="p-1 bg-primary/10 border border-primary/20">
                <textarea 
                  className="w-full bg-background border-none p-4 text-lg font-serif italic outline-none transition-all resize-none focus:placeholder-transparent"
                  rows={3}
                  placeholder="Tell us about specific vibe or vision..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
             </div>
          </div>

          <div className="grid gap-4">
            <Label className="text-3xl font-serif italic block text-center">Service Tier</Label>
            {PACKAGES[formData.booking_type as "Private Event" | "Consultation"].map(pkg => (
              <button key={pkg.id} onClick={() => setFormData({...formData, service_package: pkg.id})} className={cn("p-8 border-2 flex items-center justify-between group transition-all duration-300 hover:shadow-md active:scale-[0.99]", formData.service_package === pkg.id ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/50")}>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{pkg.id}</p>
                  <p className="text-2xl font-serif italic">₱{pkg.price.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1 group-hover:translate-x-1 transition-transform">{pkg.desc}</p>
                </div>
                <pkg.icon className={cn("h-8 w-8", formData.service_package === pkg.id ? "text-primary" : "text-muted-foreground/20")} />
              </button>
            ))}
          </div>
          <NavButtons prev={prevStep} next={nextStep} />
        </div>
      )}

      {/* STEP 10: Final Review & Submit */}
      {step === 10 && (
        <div className="space-y-10 animate-in fade-in">
          <Label className="text-4xl font-serif italic block text-center">Review & Confirm Booking</Label>
          
          <div className="bg-muted/5 border shadow-inner">
            <div className="p-8 border-b border-border/50 bg-primary/5 text-center space-y-2">
                <h2 className="text-2xl font-serif italic">{formData.title || "Untitled Project"}</h2>
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  {formData.booking_type} • {formData.occasion || formData.consultation_type || "No Purpose Set"}
                </p>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6">
                <SummaryItem label="Date Selected" value={formData.event_date ? new Date(formData.event_date).toDateString() : "Pending"} />
                <SummaryItem label="Time Preference" value={formData.event_time_pref || "TBD"} />
                <SummaryItem label="Duration" value={formData.duration} />
                {formData.booking_type === "Private Event" && <SummaryItem label="Guest Count" value={`${formData.guest_count} Pax`} />}
                <SummaryItem label="Location City" value={formData.location_city} />
                <SummaryItem label="Exact Address" value={formData.location_address} />
                <SummaryItem label="Budget Range" value={formData.budget_min || formData.budget_max ? `₱${formatNumberWithCommas(formData.budget_min)} - ₱${formatNumberWithCommas(formData.budget_max)}` : "TBD"} />
                <SummaryItem label="Curated Theme" value={formData.selected_menu_theme || "Bespoke / None"} />
                <SummaryItem label="A La Carte Extras" value={formData.menu_selections.join(", ") || "None"} />
                <SummaryItem label="Exclusions" value={formData.excluded_menu_items.join(", ") || "None"} />
                <SummaryItem label="Allergies" value={formData.allergies.join(", ") || "None"} />
                <SummaryItem label="Service Tier" value={formData.service_package} />
            </div>

            <div className="p-8 border-t border-border/50 bg-background/50">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-2">Chef's Notes & Suggestions</p>
                <p className="font-serif italic text-lg whitespace-pre-wrap">{formData.description || "No custom notes provided."}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={prevStep} className="flex-1 h-16 rounded-none font-bold uppercase text-[10px] hover:bg-muted/50 transition-colors">Back to Edit</Button>
            {/* This button now just triggers the modal */}
            <Button 
              onClick={() => setShowConfirm(true)} 
              disabled={loading} 
              className="flex-[3] h-16 rounded-none bg-primary text-white font-serif italic text-2xl hover:bg-primary/90 hover:scale-[1.01] transition-all shadow-xl"
            >
              Finalize Booking
            </Button>
          </div>

          {/* CONFIRMATION OVERLAY */}
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white border border-border p-12 max-w-lg w-full shadow-2xl space-y-8">
                <div className="space-y-4 text-center">
                  <h3 className="text-4xl font-serif italic">Confirm Your Event?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Are you sure you want to finalize this commission? To ensure artisan focus, once submitted, the directive is locked for review and **cannot be modified or deleted** without assistance.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="h-16 rounded-none bg-primary text-white font-serif italic text-2xl hover:bg-primary/90 transition-all"
                  >
                    {loading ? "Processing..." : "Yes, Book Event"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowConfirm(false)}
                    className="h-12 rounded-none text-[10px] font-bold uppercase tracking-[0.2em]"
                  >
                    Wait, I need to check something
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- HELPERS ---
function NavButtons({ prev, next, disabled = false }: { prev: () => void, next: () => void, disabled?: boolean }) {
  return (
    <div className="flex gap-4 pt-12 mt-12 border-t">
      <Button variant="outline" onClick={prev} className="flex-1 h-14 rounded-none uppercase text-[10px] font-bold tracking-widest hover:bg-muted/50 transition-colors active:scale-95">Back</Button>
      <Button onClick={next} disabled={disabled} className="flex-1 h-14 rounded-none bg-primary text-white uppercase text-[10px] font-bold tracking-widest hover:bg-primary/90 transition-colors active:scale-[0.98]">Continue</Button>
    </div>
  )
}

function StatusItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-3 bg-muted/5 p-2 border border-border/50">
      <div className={cn("w-3 h-3 rounded-full", color)} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{label}</p>
      <p className="font-serif italic text-lg">{value || "To be defined"}</p>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}