import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowRight } from "lucide-react"

export default function BlogPage() {
  const posts = [
    {
      title: "The Future of Telemedicine: Trends to Watch in 2025",
      excerpt: "Explore how AI and wearable technology are reshaping the landscape of remote healthcare delivery and patient monitoring.",
      category: "Technology",
      author: "Dr. Sarah Chen",
      date: "Dec 12, 2024",
      readTime: "5 min read",
      image: "bg-blue-100",
    },
    {
      title: "Mental Health in the Digital Age",
      excerpt: "Strategies for maintaining mental wellness in an increasingly connected and fast-paced digital world.",
      category: "Wellness",
      author: "Dr. James Wilson",
      date: "Dec 10, 2024",
      readTime: "7 min read",
      image: "bg-green-100",
    },
    {
      title: "Understanding Your Health Data Privacy",
      excerpt: "A comprehensive guide to how we protect your sensitive medical information and what your rights are.",
      category: "Privacy",
      author: "Alex Morgan",
      date: "Dec 05, 2024",
      readTime: "10 min read",
      image: "bg-purple-100",
    },
  ]

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <section className="py-20 bg-muted/20">
        <div className="container px-4 mx-auto text-center">
          <Badge className="mb-4" variant="secondary">The MediMaven Blog</Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Insights for Better Health</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert advice, industry news, and wellness tips from our team of medical professionals.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="container px-4 mx-auto -mt-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <article key={index} className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className={`h-48 w-full ${post.image} relative`}>
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 font-bold text-4xl">
                  IMAGE
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="font-normal">{post.category}</Badge>
                  <span className="text-xs text-muted-foreground">{post.readTime}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 line-clamp-2 hover:text-primary cursor-pointer">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-1">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">{post.author}</p>
                      <p className="text-[10px] text-muted-foreground">{post.date}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto hover:bg-transparent hover:text-primary">
                    Read More <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="container px-4 mx-auto mt-20">
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">Subscribe to our newsletter</h3>
            <p className="text-primary-foreground/80">Get the latest health tips and news delivered to your inbox.</p>
          </div>
          <div className="flex w-full max-w-sm gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg text-foreground focus:outline-hidden focus:ring-2 focus:ring-secondary"
            />
            <Button variant="secondary" className="whitespace-nowrap">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
