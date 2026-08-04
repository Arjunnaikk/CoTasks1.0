'use client'

import { signIn, useSession } from "next-auth/react"
import { useCreateUserMutation } from "@/services/mutations"
import { useGetUserQuery } from "@/services/queries"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Users, CalendarDays, BarChart3, ChevronRight, ArrowRight, Send, Heart, Mail, MessageSquare } from "lucide-react"
import Link from "next/link"

// Feature card component
const FeatureCard = ({ icon: Icon, title, description, glowColor }) => (
  <div className="flex flex-col items-center space-y-4 bg-zinc-950/30 border border-zinc-900/60 p-8 rounded-2xl hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-300 group hover:shadow-2xl hover:shadow-black/50">
    <div className={`p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 text-zinc-400 group-hover:text-white group-hover:border-zinc-700/80 transition-all ${glowColor}`}>
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-sm font-semibold text-zinc-200 tracking-tight">{title}</h3>
    <p className="text-xs text-zinc-500 text-center leading-relaxed font-light">
      {description}
    </p>
  </div>
)

// Testimonial card component
const TestimonialCard = ({ quote, author, role }) => (
  <div className="flex flex-col items-center space-y-5 bg-zinc-950/20 border border-zinc-900/80 p-8 rounded-2xl relative hover:border-zinc-800 hover:bg-zinc-900/10 transition-all duration-300">
    <p className="text-xs text-zinc-400 text-center italic leading-relaxed font-light">&ldquo;{quote}&rdquo;</p>
    <div className="flex flex-col items-center">
      <p className="font-semibold text-zinc-300 text-xs">{author}</p>
      <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">{role}</p>
    </div>
  </div>
)

// Static data
const FEATURES = [
  {
    icon: Users,
    title: "Team Workspaces",
    description: "Collaborate in group workspaces with task checklists, comments, and members.",
    glowColor: "group-hover:shadow-neon-orange group-hover:text-orange-400"
  },
  {
    icon: CalendarDays,
    title: "Flexible Scheduling",
    description: "Define deadlines with precision date and time picker parameters.",
    glowColor: "group-hover:shadow-neon-cyan group-hover:text-cyan-400"
  },
  {
    icon: BarChart3,
    title: "Activity Log Feed",
    description: "Monitor team changes, comment postings, and timeline progress feeds.",
    glowColor: "group-hover:shadow-neon-pink group-hover:text-rose-400"
  },
  {
    icon: CheckCircle2,
    title: "Status Filtering",
    description: "Isolate tasks by status and priority using inline side-by-side search controls.",
    glowColor: "group-hover:shadow-neon-violet group-hover:text-violet-400"
  }
]

const TESTIMONIALS = [
  {
    quote: "CoTask streamlined our task assignments with zero clutter. The activity logs keep everyone in sync.",
    author: "Alex Davis",
    role: "Lead Engineer"
  },
  {
    quote: "The visual due badges and time settings make it easy to prevent overdue deliverables.",
    author: "Sophia Chen",
    role: "Product Coordinator"
  },
  {
    quote: "A premium, dark-themed experience that focuses purely on core project workflow.",
    author: "Liam Wright",
    role: "Product Designer"
  }
]

export default function Home() {
  const { data: session } = useSession()
  const { data: userData, isLoading } = useGetUserQuery()
  const createUserMutation = useCreateUserMutation()

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
    <div className="flex flex-col flex-1 w-full bg-transparent text-white selection:bg-white selection:text-black">
      <main className="flex-1 min-w-0">
        {/* Hero Section */}
        <section className="relative w-full min-h-[92vh] flex items-center justify-center py-20 px-4 md:px-6 overflow-hidden">
          
          {/* Ambient Background Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none"></div>

          {/* Floating Neon Icons */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 hidden md:block animate-float-slow pointer-events-none">
            <div className="p-4 rounded-2xl border border-cyan-500/30 bg-zinc-950/80 text-cyan-400 shadow-neon-cyan">
              <Send className="h-6 w-6 transform rotate-12" />
            </div>
          </div>

          <div className="absolute bottom-1/3 left-1/4 -translate-x-1/2 translate-y-1/2 hidden md:block animate-float-medium pointer-events-none">
            <div className="p-4 rounded-2xl border border-rose-500/30 bg-zinc-950/80 text-rose-500 shadow-neon-pink">
              <Heart className="h-6 w-6" />
            </div>
          </div>

          <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 hidden md:block animate-float-medium pointer-events-none">
            <div className="p-4 rounded-2xl border border-orange-500/30 bg-zinc-950/80 text-orange-400 shadow-neon-orange">
              <Mail className="h-6 w-6" />
            </div>
          </div>

          <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 hidden md:block animate-float-fast pointer-events-none">
            <div className="p-4 rounded-2xl border border-violet-500/30 bg-zinc-950/80 text-violet-400 shadow-neon-violet">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>

          <div className="container max-w-5xl mx-auto z-10 relative">
            <div className="flex flex-col items-center space-y-8 text-center">

              <div className="space-y-6 max-w-3xl mx-auto">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-white">
                  Collaborate and Deliver tasks
                  <span className="block mt-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse">
                    effortlessly
                  </span>
                </h1>
                <p className="mx-auto max-w-[620px] text-zinc-400 text-xs sm:text-sm md:text-sm leading-relaxed font-light mt-4">
                  Streamline team operations with collapsible checklists, group discussion boards, timeline activity logs, and presence status tracking.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-xs pt-4">
                {session ? (
                  <Link href="/mygroups/" className="w-full">
                    <Button className="h-12 w-full rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all text-xs shadow-lg shadow-indigo-600/30 border border-indigo-400/20">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    onClick={() => signIn()}
                    className="h-12 w-full rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all text-xs shadow-lg shadow-indigo-600/30 border border-indigo-400/20"
                  >
                    Start your inbox
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-28 px-4 md:px-6 border-y border-zinc-900/60 bg-zinc-950/20">
          <div className="container max-w-5xl mx-auto">
            <div className="text-center space-y-3 mb-20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Built for productivity</p>
              <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
                Product Features
              </h2>
            </div>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-28 px-4 md:px-6 bg-transparent">
          <div className="container max-w-5xl mx-auto">
            <div className="text-center space-y-3 mb-20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Workspace Reviews</p>
              <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
                Team Feedback
              </h2>
            </div>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
              {TESTIMONIALS.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900/60 bg-zinc-950/60 py-10 px-4 md:px-6 text-zinc-500 backdrop-blur-md">
        <div className="container max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] font-medium tracking-widest uppercase">
          <p>© 2026 CoTask Inc. All rights reserved.</p>
          <nav className="flex gap-8">
            <a className="hover:text-zinc-300 transition-colors duration-200" href="#">Terms of Service</a>
            <a className="hover:text-zinc-300 transition-colors duration-200" href="#">Privacy Policy</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}