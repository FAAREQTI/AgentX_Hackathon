import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { 
  MessageSquare, 
  BarChart3, 
  Shield, 
  Zap, 
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
  Star,
  Globe,
  Lock,
  Sparkles,
  Brain,
  Target,
  Award,
  Play,
  ChevronRight,
  Building2,
  Lightbulb,
  Rocket,
  Timer,
  Database,
  Cloud
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Advanced machine learning algorithms analyze complaint patterns, sentiment, and risk factors with 96% accuracy.",
      highlight: "96% Accuracy",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Enterprise Compliance",
      description: "Built-in regulatory frameworks for GDPR, CCPA and industry-specific requirements with automated audit trails.",
      highlight: "SOC 2 Certified",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Target,
      title: "Predictive Risk Assessment",
      description: "Real-time risk scoring and escalation pathways prevent disputes from becoming costly legal proceedings.",
      highlight: "67% Risk Reduction",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Zap,
      title: "Intelligent Automation",
      description: "Generate contextual responses and resolution letters in seconds, not hours, with personalized AI assistance.",
      highlight: "10x Faster",
      color: "from-purple-500 to-pink-500"
    }
  ];

  const stats = [
    { label: "Enterprise Clients", value: "500+", icon: Users, growth: "+127%" },
    { label: "Total Complaints", value: "2.4M", icon: MessageSquare, growth: "+89%" },
    { label: "Avg Resolution Time", value: "1.2h", icon: TrendingUp, growth: "-73%" },
    { label: "Customer Satisfaction", value: "98.4%", icon: CheckCircle, growth: "+12%" }
  ];

  const benefits = [
    {
      icon: Timer,
      title: "Reduce Resolution Time",
      description: "Cut complaint resolution time by 73% with AI-powered analysis and automated workflows.",
      metric: "73% Faster"
    },
    {
      icon: Database,
      title: "Increase Accuracy",
      description: "Achieve 96% accuracy in risk assessment and complaint categorization with machine learning.",
      metric: "96% Accurate"
    },
    {
      icon: Cloud,
      title: "Scale Effortlessly",
      description: "Handle 10x more complaints without increasing headcount through intelligent automation.",
      metric: "10x Scale"
    }
  ];

  const testimonials = [
    {
      quote: "Transformed our complaint handling process completely. The AI insights are incredibly accurate and the automation has saved us countless hours.",
      author: "Sarah Chen",
      role: "Head of Customer Experience",
      company: "Global Financial Services",
      rating: 5
    },
    {
      quote: "The regulatory compliance features are outstanding. We've reduced our audit preparation time by 80% and never miss a deadline.",
      author: "Michael Rodriguez",
      role: "Chief Compliance Officer", 
      company: "TechCorp Industries",
      rating: 5
    },
    {
      quote: "ROI was evident within the first month. The predictive risk assessment has prevented several major disputes from escalating.",
      author: "Emma Thompson",
      role: "VP Operations",
      company: "Retail Excellence Ltd",
      rating: 5
    }
  ];

  const integrations = [
    { name: "Salesforce", logo: "SF", description: "CRM Integration" },
    { name: "ServiceNow", logo: "SN", description: "ITSM Platform" },
    { name: "Zendesk", logo: "ZD", description: "Customer Support" },
    { name: "Microsoft", logo: "MS", description: "Office 365" },
    { name: "SAP", logo: "SAP", description: "Enterprise Software" },
    { name: "Oracle", logo: "OR", description: "Database Systems" }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl animate-float" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-2xl opacity-50" />
      
      <Header title="Complaint Intelligence" showNavigation={true} />
      
      {/* Hero Section */}
      <section className="relative px-4 py-20 lg:py-28">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 transition-colors">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Enterprise AI Platform
                </Badge>
                
                <h1 className="text-6xl lg:text-8xl font-bold tracking-tight leading-none">
                  Complaint Compass
                </h1>
                
                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl">
                  Transform customer complaints into strategic insights with AI-powered analysis, automated risk assessment, and intelligent response generation.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-all duration-300 group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                    Get Started
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-10 py-7 hover:bg-primary/5 transition-colors group">
                  <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center text-sm font-semibold">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold">500+ Enterprise Clients</p>
                    <p className="text-sm text-muted-foreground">Trust our platform</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold">4.9/5 Rating</p>
                    <p className="text-sm text-muted-foreground">From 2,400+ reviews</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <div className="glass-effect rounded-3xl p-8 shadow-2xl border border-white/20">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">Live Analysis Dashboard</h3>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
                        Real-time
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                          <div className="text-3xl font-bold text-primary mb-2">2,847</div>
                          <div className="text-sm text-muted-foreground">Complaints Processed</div>
                          <div className="flex items-center gap-1 mt-2">
                            <TrendingUp className="h-3 w-3 text-success" />
                            <span className="text-xs text-success">+23% this month</span>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-2xl p-6 border border-success/20">
                          <div className="text-3xl font-bold text-success mb-2">1.2h</div>
                          <div className="text-sm text-muted-foreground">Avg Resolution</div>
                          <div className="flex items-center gap-1 mt-2">
                            <TrendingUp className="h-3 w-3 text-success rotate-180" />
                            <span className="text-xs text-success">-67% faster</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-warning/10 to-warning/5 rounded-2xl p-6 border border-warning/20">
                          <div className="text-3xl font-bold text-warning mb-2">High</div>
                          <div className="text-sm text-muted-foreground">Risk Level</div>
                          <div className="w-full bg-warning/20 rounded-full h-2 mt-3">
                            <div className="bg-warning h-2 rounded-full w-3/4 animate-pulse" />
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-6 border border-accent/20">
                          <div className="text-3xl font-bold text-accent mb-2">98.4%</div>
                          <div className="text-sm text-muted-foreground">Satisfaction</div>
                          <div className="flex items-center gap-1 mt-2">
                            <CheckCircle className="h-3 w-3 text-success" />
                            <span className="text-xs text-success">Above target</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">AI Processing Status</span>
                        <span className="text-sm text-muted-foreground">87% Complete</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: '87%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl animate-float blur-sm" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-success/20 to-primary/20 rounded-full animate-pulse-slow blur-sm" />
              <div className="absolute top-1/2 -right-4 w-16 h-16 bg-gradient-to-bl from-warning/20 to-destructive/20 rounded-xl animate-float delay-1000 blur-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative px-4 py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 border-primary/20 text-primary">
              <Rocket className="h-3 w-3 mr-1" />
              Measurable Impact
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Transform Your Operations
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See immediate improvements in efficiency, precision and customer satisfaction with our AI-powered complaint intelligence platform.
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <Card className="relative border-0 bg-background/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                      <benefit.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="text-4xl font-bold text-primary mb-3">{benefit.metric}</div>
                    <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative px-4 py-24 bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-xl text-muted-foreground">Join thousands of enterprises already transforming their complaint management</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300 group-hover:scale-110">
                    <stat.icon className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-5xl lg:text-6xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">{stat.value}</div>
                  <div className="text-lg font-medium text-muted-foreground mb-2">{stat.label}</div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                    <TrendingUp className="h-3 w-3" />
                    {stat.growth}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 py-28">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4 border-primary/20 text-primary">
              <Award className="h-3 w-3 mr-1" />
              Industry Leading
            </Badge>
            <h2 className="mb-6 text-4xl lg:text-5xl font-bold">
              Next-Generation Intelligence
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
              Sophisticated AI capabilities designed for the most demanding enterprise environments, with security, compliance and scalability at the core.
            </p>
          </div>
          
          <div className="grid gap-10 lg:grid-cols-2">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 rounded-3xl blur-2xl group-hover:opacity-10 transition-opacity duration-500`} />
                <Card className="relative border-0 bg-background/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-90`} />
                  <div className="absolute inset-0 bg-black/20" />
                  <CardHeader className="relative z-10 pb-6 pt-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 border border-white/30">
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 font-semibold backdrop-blur-sm">
                        {feature.highlight}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl mb-4 text-white font-bold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-0">
                    <CardDescription className="text-base leading-relaxed mb-6 text-white/90">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative bg-gradient-to-b from-muted/30 to-background px-4 py-28">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-4xl font-bold">Trusted by Industry Leaders</h2>
            <p className="text-xl text-muted-foreground">
              See how enterprises are transforming their complaint management
            </p>
          </div>
          
          <div className="grid gap-10 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <Card className="relative border-0 bg-background/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="flex mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <blockquote className="text-lg mb-8 leading-relaxed font-medium">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary">
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.author}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        <div className="text-sm text-primary font-medium">{testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="relative px-4 py-24 bg-gradient-to-r from-muted/20 via-background to-muted/20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 border-primary/20 text-primary">
              <Building2 className="h-3 w-3 mr-1" />
              Seamless Integration
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Works with Your Existing Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connect with your favorite platforms and tools. Our extensive integration library ensures smooth data flow across your entire tech stack.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {integrations.map((integration, index) => (
              <div key={index} className="group text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center font-bold text-lg group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-300 group-hover:scale-110">
                    {integration.logo}
                  </div>
                </div>
                <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors duration-300">
                  {integration.name}
                </h4>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Button variant="outline" size="lg" className="gap-2 hover:bg-primary/5">
              View All Integrations
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 py-28 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse-slow" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-primary/5 to-transparent rounded-full blur-2xl" />
        </div>
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="space-y-10">
            <div className="space-y-6">
              <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                <Lightbulb className="h-3 w-3 mr-1" />
                Ready to Transform?
              </Badge>
              <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                Start Your Intelligence Journey
              </h2>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Join hundreds of enterprises already using our platform to streamline complaint handling, reduce risks and improve customer satisfaction.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/login">
                <Button size="lg" className="text-xl px-12 py-8 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group">
                  Get Started Free
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-xl px-12 py-8 hover:bg-primary/5 transition-colors group">
                <Users className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                Schedule Demo
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-12 pt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-success" />
                <span className="font-medium">Enterprise security</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-success" />
                <span className="font-medium">Global compliance</span>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-success" />
                <span className="font-medium">SOC 2 certified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t bg-gradient-to-b from-muted/30 to-muted/50 px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">CC</span>
                </div>
                <span className="text-3xl font-bold">Complaint Compass</span>
              </div>
              <p className="text-muted-foreground mb-8 max-w-md text-lg leading-relaxed">
                Enterprise-grade AI platform for intelligent complaint analysis and dispute risk management. 
                Transform your customer service operations with cutting-edge technology.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="outline" className="bg-success/10 text-success border-success/20 px-4 py-2">
                  <Lock className="h-4 w-4 mr-2" />
                  SOC 2 Certified
                </Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
                  <Shield className="h-4 w-4 mr-2" />
                  GDPR Compliant
                </Badge>
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 px-4 py-2">
                  <Globe className="h-4 w-4 mr-2" />
                  Global Scale
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Product</h4>
              <div className="space-y-4 text-muted-foreground">
                <Link href="/complaint" className="block hover:text-primary transition-colors duration-200 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Complaint Analysis
                </Link>
                <Link href="/analytics" className="block hover:text-primary transition-colors duration-200 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Analytics Dashboard
                </Link>
                <Link href="/letters" className="block hover:text-primary transition-colors duration-200 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  AI Letter Generation
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Company</h4>
              <div className="space-y-4 text-muted-foreground">
                <Link href="/about" className="block hover:text-primary transition-colors duration-200 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  About Us
                </Link>
                <Link href="/security" className="block hover:text-primary transition-colors duration-200 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Security
                </Link>
                <Link href="/privacy" className="block hover:text-primary transition-colors duration-200 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Privacy Policy
                </Link>
                <Link href="/terms" className="block hover:text-primary transition-colors duration-200 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Terms of Service
                </Link>
                <Link href="/contact" className="block hover:text-primary transition-colors duration-200 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Contact
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-muted-foreground">
              © 2025 Complaint Compass. All rights reserved.
            </p>
            <div className="flex items-center gap-8 text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}