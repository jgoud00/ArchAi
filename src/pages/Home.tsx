import React from 'react';
import { Button } from '../components/ui/Button';
import { ArrowRight, Zap, Code, Shield, CheckCircle, BarChart3, Layers, Globe, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; className?: string }> = ({ icon, title, description, className }) => (
  <div className={`group relative p-8 rounded-2xl overflow-hidden glass border border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1 ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10 flex flex-col items-start h-full">
      <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 mb-6 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  </div>
);

const StatCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center p-6 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm">
    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">{value}</div>
    <div className="text-slate-400 font-medium">{label}</div>
  </div>
);

const StepCard: React.FC<{ number: string; title: string; description: string }> = ({ number, title, description }) => (
  <div className="relative flex flex-col items-center text-center max-w-sm mx-auto">
    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-cyan-500/30 flex items-center justify-center text-2xl font-bold text-cyan-400 mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
      {number}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400">{description}</p>
  </div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; role: string }> = ({ quote, author, role }) => (
  <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm">
    <div className="flex text-cyan-500 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
      ))}
    </div>
    <p className="text-slate-300 mb-6 italic">"{quote}"</p>
    <div>
      <div className="font-bold text-white">{author}</div>
      <div className="text-sm text-slate-500">{role}</div>
    </div>
  </div>
);

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden selection:bg-cyan-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        <div className="blueprint-grid absolute inset-0 opacity-[0.15]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-12 lg:gap-20">
          <div className="w-full max-w-4xl text-center mx-auto animate-fade-in-up">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 mr-2 animate-pulse"></span>
              The Future of Construction Tech
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
              Build Smarter with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
                Intelligent AI
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
              Revolutionize your architectural workflow. Generate blueprints, optimize resources, and manage projects with next-gen AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-300"
                onClick={() => navigate('/signup')}
              >
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600"
                onClick={() => navigate('/login')}
              >
                View Live Demo
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-sm text-slate-500">
              <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-cyan-500" /> No credit card required</div>
              <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-cyan-500" /> 14-day free trial</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="relative z-10 py-10 border-y border-white/5 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Trusted by industry leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder Logos using text for now, replace with SVGs/Images in production */}
            {['ConstructCo', 'BuildTech', 'ArchFuture', 'Skyline', 'UrbanFlow'].map((brand) => (
              <div key={brand} className="text-xl font-bold text-slate-400 hover:text-white transition-colors cursor-default">{brand}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="relative z-10 py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to <span className="text-cyan-400">build better</span></h2>
          <p className="text-lg text-slate-400">Our platform combines powerful AI with intuitive tools to streamline every phase of your construction projects.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            className="md:col-span-2"
            icon={<Zap size={32} />}
            title="AI-Powered Generative Design"
            description="Instantly generate hundreds of design variations based on your specific constraints. Optimize for cost, sustainability, and aesthetics with a single click."
          />
          <FeatureCard
            className="md:col-span-1 bg-gradient-to-b from-slate-900 to-slate-900/50"
            icon={<Code size={32} />}
            title="Automated Blueprints"
            description="Convert 3D models into industry-standard CAD blueprints automatically."
          />
          <FeatureCard
            className="md:col-span-1"
            icon={<Shield size={32} />}
            title="Compliance Checking"
            description="Real-time validation against local building codes and safety regulations."
          />
          <FeatureCard
            className="md:col-span-2"
            icon={<BarChart3 size={32} />}
            title="Predictive Analytics Dashboard"
            description="Forecast project timelines, budget overruns, and resource needs with 98% accuracy using our historical data models."
          />
          <FeatureCard
            className="md:col-span-1"
            icon={<Globe size={32} />}
            title="Global Collaboration"
            description="Real-time multi-user editing and VR walkthroughs for stakeholders."
          />
          <FeatureCard
            className="md:col-span-1"
            icon={<Layers size={32} />}
            title="BIM Integration"
            description="Seamlessly sync with Revit, AutoCAD, and other industry tools."
          />
          <FeatureCard
            className="md:col-span-1"
            icon={<Cpu size={32} />}
            title="IoT Resource Tracking"
            description="Monitor equipment and material usage on-site in real-time."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">From Concept to Reality in <span className="text-cyan-400">3 Steps</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-cyan-500/0"></div>

            <StepCard
              number="1"
              title="Upload & Define"
              description="Upload your site scan or define your project parameters, constraints, and goals."
            />
            <StepCard
              number="2"
              title="AI Generation"
              description="Our AI analyzes the data and generates optimized architectural designs and structural plans."
            />
            <StepCard
              number="3"
              title="Execute & Monitor"
              description="Export blueprints and use our dashboard to manage construction with real-time insights."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard value="500+" label="Projects Managed" />
          <StatCard value="$2B+" label="Construction Value" />
          <StatCard value="98%" label="AI Accuracy" />
          <StatCard value="40%" label="Time Saved" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-slate-900/0 to-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">What Architects Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="ArchitectAI has completely transformed our design process. We're delivering projects 30% faster."
              author="Sarah Jenkins"
              role="Lead Architect, Skyline Design"
            />
            <TestimonialCard
              quote="The automated compliance checking alone has saved us countless hours of revision time."
              author="Michael Chen"
              role="Project Manager, BuildTech"
            />
            <TestimonialCard
              quote="Finally, an AI tool that actually understands the nuances of structural engineering."
              author="David Ross"
              role="Structural Engineer, UrbanFlow"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-cyan-900/50 to-blue-900/50 rounded-3xl p-12 border border-cyan-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/10 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to build the future?</h2>
            <p className="text-xl text-slate-300 mb-8">Join 500+ forward-thinking teams using ArchitectAI today.</p>
            <Button size="lg" className="bg-white text-slate-900 hover:bg-cyan-50 hover:text-cyan-700 font-bold px-8 py-6 text-lg" onClick={() => navigate('/signup')}>
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
