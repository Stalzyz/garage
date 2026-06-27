import React from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"

// --- TYPES ---
export type PropType = 'text' | 'textarea' | 'color' | 'boolean' | 'select'

export interface ComponentPropDef {
  name: string
  label: string
  type: PropType
  defaultValue: any
  options?: { label: string, value: string }[] // for select
}

export interface CmsComponentDef {
  id: string
  name: string
  description: string
  props: ComponentPropDef[]
  component: React.FC<any>
}

// --- COMPONENTS ---

const HeroComponent: React.FC<any> = ({ title, subtitle, ctaText, bgColor, textColor }) => (
  <section className="relative overflow-hidden py-24 md:py-32 flex flex-col items-center justify-center text-center px-6" style={{ backgroundColor: bgColor || '#0f172a', color: textColor || '#ffffff' }}>
    <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
      <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
        {title || 'Hero Title Goes Here'}
      </h1>
      <p className="text-lg md:text-xl opacity-80 max-w-2xl mb-10 leading-relaxed">
        {subtitle || 'This is the subtitle where you explain your value proposition.'}
      </p>
      {ctaText && (
        <a href="#" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-105">
          {ctaText}
        </a>
      )}
    </div>
  </section>
)

const FeatureGridComponent: React.FC<any> = ({ heading, subheading, bgColor, feature1, feature2, feature3 }) => (
  <section className="py-24 px-6" style={{ backgroundColor: bgColor || '#f8fafc' }}>
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4 text-slate-900">{heading || 'Our Features'}</h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">{subheading || 'Discover what makes us the best choice.'}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[feature1, feature2, feature3].map((f, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">{f || `Feature ${i+1}`}</h3>
            <p className="text-slate-500 leading-relaxed">Description for this amazing feature. It provides massive value.</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const PricingComponent: React.FC<any> = ({ title, price, featureText, bgColor, btnColor }) => (
  <section className="py-24 px-6 flex justify-center" style={{ backgroundColor: bgColor || '#ffffff' }}>
    <div className="max-w-sm w-full bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
      <h3 className="text-2xl font-bold mb-2">{title || 'Pro Plan'}</h3>
      <p className="text-slate-400 mb-6 text-sm">Everything you need to scale.</p>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-5xl font-black">${price || '99'}</span>
        <span className="text-slate-400">/mo</span>
      </div>
      <div className="space-y-4 mb-8">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {featureText || 'Unlimited everything'} {i}
          </div>
        ))}
      </div>
      <button className="w-full py-4 rounded-xl font-bold transition-all hover:opacity-90" style={{ backgroundColor: btnColor || '#2563eb' }}>
        Subscribe Now
      </button>
    </div>
  </section>
)

const RawHtmlComponent: React.FC<any> = ({ html }) => (
  <div className="w-full relative" dangerouslySetInnerHTML={{ __html: html || '<div class="p-8 text-center bg-red-50 text-red-500 border border-red-200">Empty HTML Block</div>' }} />
)

// --- REGISTRY EXPORT ---
export const ComponentRegistry: Record<string, CmsComponentDef> = {
  Hero: {
    id: 'Hero',
    name: 'Hero Section',
    description: 'A large header section to introduce your page.',
    component: HeroComponent,
    props: [
      { name: 'title', label: 'Main Title', type: 'text', defaultValue: 'Welcome to the Future' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', defaultValue: 'We build beautiful things that work.' },
      { name: 'ctaText', label: 'Button Text', type: 'text', defaultValue: 'Get Started' },
      { name: 'bgColor', label: 'Background Color', type: 'color', defaultValue: '#0f172a' },
      { name: 'textColor', label: 'Text Color', type: 'color', defaultValue: '#ffffff' },
    ]
  },
  FeatureGrid: {
    id: 'FeatureGrid',
    name: 'Feature Grid',
    description: 'A 3-column grid highlighting key features.',
    component: FeatureGridComponent,
    props: [
      { name: 'heading', label: 'Heading', type: 'text', defaultValue: 'Why Choose Us' },
      { name: 'subheading', label: 'Subheading', type: 'text', defaultValue: 'The absolute best platform out there.' },
      { name: 'bgColor', label: 'Background Color', type: 'color', defaultValue: '#f8fafc' },
      { name: 'feature1', label: 'Feature 1 Name', type: 'text', defaultValue: 'Lightning Fast' },
      { name: 'feature2', label: 'Feature 2 Name', type: 'text', defaultValue: 'Secure by Default' },
      { name: 'feature3', label: 'Feature 3 Name', type: 'text', defaultValue: '24/7 Support' },
    ]
  },
  PricingTable: {
    id: 'PricingTable',
    name: 'Pricing Card',
    description: 'A single highlighted pricing tier.',
    component: PricingComponent,
    props: [
      { name: 'title', label: 'Plan Name', type: 'text', defaultValue: 'Enterprise' },
      { name: 'price', label: 'Monthly Price', type: 'text', defaultValue: '299' },
      { name: 'featureText', label: 'Base Feature Text', type: 'text', defaultValue: 'Premium Feature' },
      { name: 'bgColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
      { name: 'btnColor', label: 'Button Color', type: 'color', defaultValue: '#2563eb' },
    ]
  },
  RawHtml: {
    id: 'RawHtml',
    name: 'Raw HTML / AI Block',
    description: 'Render custom HTML (useful for AI generated components).',
    component: RawHtmlComponent,
    props: [
      { name: 'html', label: 'Raw HTML Code', type: 'textarea', defaultValue: '<div>Custom Code</div>' },
    ]
  }
}

export const getComponentDef = (id: string) => ComponentRegistry[id]
