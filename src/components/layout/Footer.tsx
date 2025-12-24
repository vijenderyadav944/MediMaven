import Link from "next/link"
import { Stethoscope } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/50 backdrop-blur-sm py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">MediMaven</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Premium telehealth platform connecting you with top specialists instantly. Secure, private, and powered by AI.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-primary transition-colors">How it works</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">For Doctors</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
        <p>&copy; 2024 MediMaven Inc. All rights reserved.</p>
        <div className="flex gap-4">
          <span>Made for Hackathon</span>
        </div>
      </div>
    </footer>
  )
}
