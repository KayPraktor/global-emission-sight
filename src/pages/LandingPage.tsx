import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2,
  LineChart,
  Shield,
  Zap,
  Building2,
  Target,
  ArrowRight,
  Play
} from 'lucide-react';
import { InteractiveProductTour } from '@/components/ProductTour/InteractiveProductTour';
import { DemoVideoSection } from '@/components/ProductTour/DemoVideoSection';
import { BRAND_NAME } from '@/lib/constants';

export default function LandingPage() {
  const navigate = useNavigate();
  const [tourOpen, setTourOpen] = useState(false);
  const [roiInputs, setRoiInputs] = useState({
    consultantFees: 120000,
    fteHours: 40,
    missedDeadlines: 2
  });

  const calculateROI = () => {
    const consultantSavings = roiInputs.consultantFees * 0.6;
    const timeSavings = roiInputs.fteHours * 52 * 75 * 0.6;
    const penaltyAvoidance = roiInputs.missedDeadlines * 50000;
    const totalAnnualSavings = consultantSavings + timeSavings + penaltyAvoidance;
    const platformCost = 25000;
    const netSavings = totalAnnualSavings - platformCost;
    const roi = ((netSavings / platformCost) * 100).toFixed(0);
    const paybackMonths = ((platformCost / totalAnnualSavings) * 12).toFixed(1);
    
    return { totalAnnualSavings, roi, paybackMonths };
  };

  const { totalAnnualSavings, roi, paybackMonths } = calculateROI();

  const painPoints = [
    {
      icon: Clock,
      title: "Drowning in Spreadsheets?",
      description: "Sustainability teams spend 40+ hours monthly on manual data aggregation and reporting",
      color: "text-destructive"
    },
    {
      icon: AlertCircle,
      title: "Worried About Missing CDP Deadlines?",
      description: "Audit failures and non-compliance penalties can cost over $100,000 and damage stakeholder trust",
      color: "text-orange-500"
    },
    {
      icon: DollarSign,
      title: "Consultant Fees Eating Your Budget?",
      description: "External consultants charge $120,000-$250,000 annually for work our platform automates",
      color: "text-destructive"
    },
    {
      icon: Target,
      title: "CEO Asking About Net Zero Progress?",
      description: "Executive dashboards that answer leadership questions in seconds, not weeks",
      color: "text-primary"
    }
  ];

  const features = [
    {
      icon: Clock,
      title: "60% Reduction in Reporting Time",
      description: "Automated data validation and report generation"
    },
    {
      icon: Shield,
      title: "Never Miss a Compliance Deadline",
      description: "Automated tracking for CDP, TCFD, CSRD, SBTi"
    },
    {
      icon: Zap,
      title: "AI-Powered Anomaly Detection",
      description: "Catch data errors before they become audit issues"
    },
    {
      icon: LineChart,
      title: "Executive Dashboards",
      description: "Real-time visibility into Net Zero progress and KPIs"
    }
  ];

  const complianceLogos = ['CDP', 'TCFD', 'CSRD', 'SBTi', 'GRI', 'ISO 14064'];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold gradient-heading">{BRAND_NAME}</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/roi-calculator')}>
                ROI Calculator
              </Button>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
              Stop Spending 40 Hours a Month on{' '}
              <span className="gradient-heading">Carbon Compliance</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 mb-8 font-medium leading-relaxed">
              Automate reporting, prevent audit failures, track Net Zero progress — all in one platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg h-12 px-8" onClick={() => navigate('/auth')}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-12 px-8" onClick={() => setTourOpen(true)}>
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required • 14-day free trial
            </p>
          </motion.div>
        </div>
      </section>

      {/* Demo Video Section */}
      <DemoVideoSection onOpenTour={() => setTourOpen(true)} />

      {/* Pain Points Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Problems We Solve
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Sustainability leaders in manufacturing face critical challenges that waste resources and create risk
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {painPoints.map((pain, index) => (
              <motion.div
                key={pain.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full card-hover">
                  <pain.icon className={`h-12 w-12 mb-4 ${pain.color}`} />
                  <h3 className="text-xl font-semibold mb-3 leading-relaxed">{pain.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{pain.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Calculate Your Potential Savings
              </h2>
              <p className="text-lg text-muted-foreground">
                Companies like yours save an average of $80,000+ annually
              </p>
            </div>

            <Card className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="consultantFees">Annual Consultant Fees ($)</Label>
                    <Input
                      id="consultantFees"
                      type="number"
                      value={roiInputs.consultantFees}
                      onChange={(e) => setRoiInputs({ ...roiInputs, consultantFees: Number(e.target.value) })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fteHours">Weekly FTE Hours on Compliance</Label>
                    <Input
                      id="fteHours"
                      type="number"
                      value={roiInputs.fteHours}
                      onChange={(e) => setRoiInputs({ ...roiInputs, fteHours: Number(e.target.value) })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="missedDeadlines">Missed Deadlines Per Year</Label>
                    <Input
                      id="missedDeadlines"
                      type="number"
                      value={roiInputs.missedDeadlines}
                      onChange={(e) => setRoiInputs({ ...roiInputs, missedDeadlines: Number(e.target.value) })}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground mb-2">Annual Savings</div>
                    <div className="text-4xl font-bold text-primary">
                      ${totalAnnualSavings.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-6 bg-secondary/5 rounded-lg border border-secondary/20">
                    <div className="text-sm text-muted-foreground mb-2">3-Year ROI</div>
                    <div className="text-4xl font-bold text-secondary">
                      {roi}%
                    </div>
                  </div>
                  <div className="p-6 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">Payback Period</div>
                    <div className="text-4xl font-bold">
                      {paybackMonths} months
                    </div>
                  </div>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={() => navigate('/roi-calculator')}>
                View Full ROI Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Leading Manufacturers Choose Us
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full card-hover">
                  <feature.icon className="h-10 w-10 mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2 leading-relaxed">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-lg text-muted-foreground mb-8">
              Trusted by 50+ manufacturing companies
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {complianceLogos.map((logo) => (
                <div key={logo} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">{logo}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-muted-foreground">
              Full compliance support for all major frameworks
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Carbon Management?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join leading manufacturers automating compliance and accelerating Net Zero progress
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg h-12 px-8" onClick={() => navigate('/auth')}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-12 px-8" onClick={() => navigate('/roi-calculator')}>
                Calculate ROI
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-semibold">{BRAND_NAME}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 {BRAND_NAME}. Empowering sustainable manufacturing.
            </p>
          </div>
        </div>
      </footer>

      {/* Product Tour Modal */}
      <InteractiveProductTour open={tourOpen} onOpenChange={setTourOpen} />
    </div>
  );
}
