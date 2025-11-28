import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Box, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import { Button } from '../components/ui/Button';
import { ArrowRight, Zap, Code, Shield } from 'lucide-react';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="group relative p-6 rounded-xl overflow-hidden glass transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30">
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
    <div className="relative z-10 flex flex-col items-start space-y-4">
      <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-slate-300">{description}</p>
      <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20">
        Learn More <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
);

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="blueprint-grid absolute inset-0 z-0 opacity-20"></div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-80px)] p-8 md:p-16 bg-gradient-to-br from-slate-950 to-primary/20">
        <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0 animate-fade-in-left">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white mb-6">
            Build Smarter with <span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-lg mx-auto lg:mx-0">
            Revolutionizing construction and architecture through intelligent design and automation.
          </p>
          <div className="flex justify-center lg:justify-start space-x-4">
            <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white hover-lift">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-400 hover:bg-cyan-900/30 hover-lift">
              View Demo
            </Button>
          </div>
        </div>

        <div className="lg:w-1/2 h-80 lg:h-[600px] flex items-center justify-center animate-fade-in-right">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="cyan" />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
            <Box args={[2.5, 2.5, 2.5]}>
              <MeshDistortMaterial
                color="#06B6D4" // cyan-500
                factor={0.5}
                speed={2}
                distort={0.8}
                roughness={0.5}
                metalness={0.8}
                transmission={0.9}
                iridescence={0.8}
                iridescenceIOR={1.5}
                iridescenceThicknessRange={[0, 1000]}
              />
            </Box>
          </Canvas>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-8 md:px-16 bg-slate-950">
        <h2 className="text-4xl font-bold text-center text-white mb-16">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Zap size={36} />}
            title="AI-Powered Design"
            description="Generate intricate architectural designs with intelligent algorithms, optimizing for efficiency and aesthetics."
          />
          <FeatureCard
            icon={<Code size={36} />}
            title="Automated Blueprints"
            description="Seamlessly convert conceptual designs into detailed, executable blueprints ready for construction."
          />
          <FeatureCard
            icon={<Shield size={36} />}
            title="Real-time Analytics"
            description="Monitor project progress, resource allocation, and potential issues with real-time, data-driven insights."
          />
          <FeatureCard
            icon={<ArrowRight size={36} />} // Placeholder icon, replace with relevant Lucide icon
            title="Collaborative Platform"
            description="Bring your team together with a shared workspace for streamlined communication and project management."
          />
          <FeatureCard
            icon={<ArrowRight size={36} />} // Placeholder icon
            title="Sustainable Solutions"
            description="Incorporate eco-friendly materials and energy-efficient designs, guided by AI recommendations."
          />
          <FeatureCard
            icon={<ArrowRight size={36} />} // Placeholder icon
            title="Modular Construction"
            description="Design and manage modular building components for faster, more cost-effective construction."
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
