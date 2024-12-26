'use client'
import { signIn, signOut, useSession } from "next-auth/react"
import { useCreateUserMutation } from "@/services/mutations"
import { useGetUserQuery } from "@/services/queries"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Users, Calendar, BarChart2 } from "lucide-react"

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
  const mutation = useCreateUserMutation()
  // console.log(session?.user?.image)
  // console.log("WTF",userData.user[0])
  // console.log("WTF",userData?.user[0])
  const targetedGmail = userData?.user.some(u => u.gmail == session?.user?.email)
    console.log(targetedGmail)

    // if(!targetedGmail){
    //   try{
    //     const result = await mutation.mutateAsync(
    //     {
    //       name: session?.user?.name,
    //       email: session?.user?.email,
    //       image: session?.user?.image
    //     },
    //     {
    //       onSuccess: (data) => {
    //         console.log("Task created successfully:", data);
    //       },
    //       onError: (error) => {
    //         console.error("Mutation error:", error);
    //         console.error("Error response:", error.response?.data);
    //         alert("Failed to create task: " + (error.response?.data?.message || error.message));
    //       },
    //     })
    //   }
    //   catch (error) {
    //     console.error("Submit error:", error);
    //     alert("Error creating task. Please try again.");
    //   }
    // }

    useEffect(() => {
      const handleCreateUser = async () => {
        if (isLoading || !userData || !session?.user?.email) return;
    
        const targetedGmail = userData?.user?.some(u => u.gmail === session?.user?.email);
    
        if (!targetedGmail) {
          try {
            await mutation.mutateAsync({
              name: session?.user?.name,
              gmail: session?.user?.email,
              imgText: session?.user?.image,
            });
            console.log("User created successfully");
          } catch (error) {
            console.error("Failed to create user:", error);
            alert("Error creating user. Please try again.");
          }
        }
      };
    
      handleCreateUser();
    }, [session, userData, isLoading]);
    
    
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      {/* <header className="px-4 lg:px-6 h-14 flex items-center text-white">
        <a className="flex items-center justify-center" href="#">
          <CheckCircle className="h-6 w-6" />
          <span className="sr-only">Acme Inc</span>
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#">Features</a>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#">Pricing</a>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#">About</a>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#">Contact</a>
        </nav>
      </header> */}

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl text-white font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Collaborate. Manage. Succeed.
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Streamline your team's workflow with our powerful and intuitive task management platform.
                </p>
              </div>
              <div className="space-x-4">
                <Button onClick={() => signIn('google')}>Get Started</Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
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

        {/* Testimonials Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl text-white font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              What Our Users Say
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 text-white">
              {TESTIMONIALS.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to boost your team's productivity?
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Sign up now and experience the power of seamless collaboration.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2" >
                  <Input className="max-w-lg flex-1" placeholder="Enter your email" type="email" />
                  <Button type="submit">Sign Up</Button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  By signing up, you agree to our Terms & Conditions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Acme Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">Terms of Service</a>
          <a className="text-xs hover:underline underline-offset-4" href="#">Privacy</a>
        </nav>
      </footer>
    </div>
  )
}     