'use client'
import { signIn, signOut, useSession } from "next-auth/react"
import { useCreateUserMutation } from "@/services/mutations"
import { useGetUserQuery } from "@/services/queries"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Users, Calendar, BarChart2 } from "lucide-react"
import Link from "next/link"

// Feature card component
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
    <Icon className="h-8 w-8 mb-2" />
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
      {description}
    </p>
  </div>
)

// Testimonial card component
const TestimonialCard = ({ quote, author, role }) => (
  <div className="flex flex-col items-center space-y-2 border-gray-200 p-4 rounded-lg">
    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{quote}</p>
    <p className="font-semibold">{`- ${author}, ${role}`}</p>
  </div>
)

// Static data
const FEATURES = [
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together seamlessly with real-time updates and communication."
  },
  {
    icon: Calendar,
    title: "Task Scheduling",
    description: "Plan and organize tasks with our intuitive calendar interface."
  },
  {
    icon: BarChart2,
    title: "Progress Tracking",
    description: "Monitor project progress with detailed analytics and reports."
  },
  {
    icon: CheckCircle,
    title: "Task Prioritization",
    description: "Easily prioritize tasks to focus on what matters most."
  }
]

const TESTIMONIALS = [
  {
    quote: "This platform has revolutionized how our team manages projects. Highly recommended!",
    author: "Sarah J.",
    role: "Project Manager"
  },
  {
    quote: "The intuitive interface and powerful features have greatly improved our productivity.",
    author: "Mark T.",
    role: "Team Lead"
  },
  {
    quote: "I can't imagine managing our projects without this tool. It's become indispensable.",
    author: "Emily R.",
    role: "CEO"
  }
]

export default function Home() {
  const { data: session } = useSession()
  const { data: userData, isLoading, error } = useGetUserQuery()
  const createUserMutation = useCreateUserMutation()
  const targetedGmail = userData?.user.some(u => u.gmail == session?.user?.email)

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
    
    console.log(session?.user?.email)
  
  return (
    <div className="flex flex-col min-h-screen">

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full h-[100vh] py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl text-white font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Collaborate. Manage. Succeed.
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Streamline your team&apos;s workflow with our powerful and intuitive task management platform.
                </p>
              </div>
              <div className="space-x-4">
              <Link href="/mygroups/"><Button>Get Started</Button></Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full h-[100vh] py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Key Features
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-start justify-center">
              {FEATURES.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400 flex justify-center align-middle items-center">© 2024 Acme Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">Terms of Service</a>
          <a className="text-xs hover:underline underline-offset-4" href="#">Privacy</a>
        </nav>
      </footer>
    </div>
  )
}     