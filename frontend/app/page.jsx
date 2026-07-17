'use client'
import { signIn, useSession } from "next-auth/react"
import { useCreateUserMutation } from "@/services/mutations"
import { useGetUserQuery } from "@/services/queries"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Users, CalendarDays, BarChart3, ChevronRight, ArrowRight } from "lucide-react"
import Link from "next/link"

// Feature card component
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center space-y-3 bg-zinc-950/40 border border-zinc-900 p-6 rounded-xl hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-300 group">
    <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 group-hover:text-white group-hover:border-zinc-700 transition-all">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
    <p className="text-sm text-zinc-400 text-center leading-relaxed">
      {description}
    </p>
  </div>
)

// Testimonial card component
const TestimonialCard = ({ quote, author, role }) => (
  <div className="flex flex-col items-center space-y-4 bg-zinc-950/20 border border-zinc-900 p-6 rounded-xl relative">
    <p className="text-sm text-zinc-400 text-center italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
    <div className="flex flex-col items-center">
      <p className="font-semibold text-zinc-200 text-sm">{author}</p>
      <p className="text-xs text-zinc-500">{role}</p>
    </div>
  </div>
)

// Static data
const FEATURES = [
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together seamlessly with real-time updates and group communication channels."
  },
  {
    icon: CalendarDays,
    title: "Task Scheduling",
    description: "Plan and organize tasks using custom deadlines and priority hierarchies."
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Monitor project status with visual updates, status indicators, and tracking cards."
  },
  {
    icon: CheckCircle2,
    title: "Task Prioritization",
    description: "Order tasks based on severity to ensure critical items get immediate attention."
  }
]

const TESTIMONIALS = [
  {
    quote: "This platform has revolutionized how our team manages projects. Highly recommended for any fast-paced team.",
    author: "Sarah J.",
    role: "Project Manager"
  },
  {
    quote: "The intuitive interface and powerful features have greatly improved our day-to-day productivity.",
    author: "Mark T.",
    role: "Engineering Director"
  },
  {
    quote: "Clean, fast, and does exactly what you need without the bloat of other task managers.",
    author: "Emily R.",
    role: "Product Lead"
  }
]

export default function Home() {
  const { data: session } = useSession()
  const { data: userData, isLoading } = useGetUserQuery()
  const createUserMutation = useCreateUserMutation()
  const targetedGmail = userData?.user?.some(u => u.gmail == session?.user?.email)

  useEffect(() => {
    const handleCreateUser = async () => {
      if (isLoading || !userData || !session?.user?.email || createUserMutation.isLoading) return;
      
      const userExists = userData?.user?.some(u => u.gmail === session?.user?.email);
      
      if (!userExists && !createUserMutation.isSuccess) {
        try {
          await createUserMutation.mutateAsync({
            name: session?.user?.name,
            gmail: session?.user?.email,
            imgText: session?.user?.image,
          });
          console.log("User created successfully");
        } catch (error) {
          console.error("Failed to create user:", error);
        }
      }
    };
  
    handleCreateUser();
  }, [session, userData, isLoading, createUserMutation.isLoading, createUserMutation.isSuccess]);

  return (
    <div className="flex flex-col flex-1 w-full bg-zinc-950 text-white selection:bg-white selection:text-black">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full min-h-[90vh] flex items-center justify-center py-20 px-6 border-b border-zinc-900 overflow-hidden">
          {/* Ambient Background Glows */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-zinc-800/10 blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-zinc-800/15 blur-[120px] pointer-events-none"></div>

          <div className="container max-w-5xl mx-auto z-10">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 font-medium">
                <span>CoTask Beta 1.0 is now live</span>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
              </div>

              <div className="space-y-4 max-w-3xl mx-auto">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
                  Collaborate. Manage. Succeed.
                </h1>
                <p className="mx-auto max-w-[640px] text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed">
                  Streamline your team&apos;s workflow with a powerful, modern, and zero-bloat task management dashboard built for real-time cooperation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                {session ? (
                  <Link href="/mygroups/">
                    <Button className="h-11 px-6 rounded-lg bg-white text-black hover:bg-zinc-200 font-semibold flex items-center gap-2 active:scale-95 transition-all">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    onClick={() => signIn()}
                    className="h-11 px-6 rounded-lg bg-white text-black hover:bg-zinc-200 font-semibold flex items-center gap-2 active:scale-95 transition-all"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 px-6 border-b border-zinc-900 bg-zinc-950">
          <div className="container max-w-5xl mx-auto">
            <div className="text-center space-y-3 mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Built for productivity</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Key Features
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {FEATURES.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-20 px-6 bg-zinc-950">
          <div className="container max-w-5xl mx-auto">
            <div className="text-center space-y-3 mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Social Proof</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                What Teams Say
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 bg-zinc-950/50 py-8 px-6 text-zinc-500">
        <div className="container max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 CoTask Inc. All rights reserved.</p>
          <nav className="flex gap-6">
            <a className="hover:text-zinc-300 transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-zinc-300 transition-colors" href="#">Privacy</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}