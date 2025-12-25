import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getDoctorById } from "@/app/actions/doctor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Clock, DollarSign, MapPin, Star, Video, Calendar } from "lucide-react"

export default async function DoctorProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const doctor = await getDoctorById(params.id)

  if (!doctor) {
    notFound()
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar / Info Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden border-border/50 shadow-lg">
            <div className="aspect-square relative bg-muted">
              {doctor.image ? (
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-bold">
                  {doctor.name[0]}
                </div>
              )}
            </div>
            <CardContent className="p-6 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{doctor.name}</h1>
                <p className="text-primary font-medium">{doctor.specialty}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-foreground">{doctor.rating}</span>
                <span>({doctor.reviews} reviews)</span>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-medium">${doctor.price} / Visit</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{doctor.consultationDuration} min session</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Video className="h-4 w-4 text-primary" />
                  <span>Online Consultation</span>
                </div>
              </div>

              <Button className="w-full" asChild>
                <Link href={`/session/book?doctorId=${doctor.id}`}>Book Appointment</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {doctor.bio || "No biography available."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Qualifications</h2>
              <div className="flex flex-wrap gap-2">
                {doctor.qualifications && doctor.qualifications.length > 0 ? (
                  doctor.qualifications.map((q: string, i: number) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1">
                      {q}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No qualifications listed.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for Reviews - we will add this later */}
          <Card className="border-border/50">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Patient Reviews</h2>
              <div className="bg-muted/30 border-dashed border-2 rounded-lg p-6 text-center text-muted-foreground">
                Reviews coming soon...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
