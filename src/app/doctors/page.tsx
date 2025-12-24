"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, MapPin, Star, Calendar, Clock, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock Data
const DOCTORS = [
  {
    id: "1",
    name: "Dr. Emily Chen",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 124,
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    availability: "Available Today",
    price: "$120",
    location: "New York, NY"
  },
  {
    id: "2",
    name: "Dr. James Wilson",
    specialty: "Dermatologist",
    rating: 4.8,
    reviews: 89,
    image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    availability: "Next Available: Tomorrow",
    price: "$100",
    location: "San Francisco, CA"
  },
  {
    id: "3",
    name: "Dr. Sarah Johnson",
    specialty: "Pediatrician",
    rating: 5.0,
    reviews: 210,
    image: "https://i.pravatar.cc/150?u=a04258114e29026302d",
    availability: "Available Today",
    price: "$90",
    location: "Chicago, IL"
  },
  {
    id: "4",
    name: "Dr. Michael Brown",
    specialty: "Psychiatrist",
    rating: 4.9,
    reviews: 56,
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024d", // Reusing for mock
    availability: "Available Today",
    price: "$150",
    location: "Remote",
    online: true
  }
]

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [specialty, setSpecialty] = React.useState("all")

  const filteredDoctors = DOCTORS.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = specialty === "all" || doctor.specialty.toLowerCase() === specialty.toLowerCase()

    return matchesSearch && matchesSpecialty
  })

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      {/* Header */}
      <div className="bg-background border-b py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Find your Specialist</h1>
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or specialty..."
                className="pl-10 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="cardiologist">Cardiologist</SelectItem>
                  <SelectItem value="dermatologist">Dermatologist</SelectItem>
                  <SelectItem value="pediatrician">Pediatrician</SelectItem>
                  <SelectItem value="psychiatrist">Psychiatrist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow border-border/50 overflow-hidden">
                <CardHeader className="p-0">
                  <div className="h-24 bg-gradient-to-r from-primary/10 to-secondary/10 relative">
                    {doctor.online && (
                      <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600">Online Now</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-6 relative pt-0">
                  <div className="flex justify-between items-start">
                    <div className="-mt-12 mb-4">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                        <AvatarImage src={doctor.image} alt={doctor.name} />
                        <AvatarFallback>{doctor.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="mt-4 text-right">
                      <span className="text-lg font-bold text-primary">{doctor.price}</span>
                      <span className="text-xs text-muted-foreground block">per visit</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xl font-bold">{doctor.name}</h3>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      {doctor.specialty}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {doctor.location}
                    </div>
                    <div className="flex items-center gap-2 text-yellow-500 font-medium">
                      <Star className="h-4 w-4 fill-current" /> {doctor.rating} ({doctor.reviews} reviews)
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4 flex-wrap">
                    <Badge variant="secondary" className="font-normal">
                      Video Consult
                    </Badge>
                    <Badge variant="outline" className="font-normal text-muted-foreground">
                      Chat
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="px-6 py-4 bg-muted/20 border-t flex gap-3">
                  <Link href={`/doctors/${doctor.id}`} className="flex-1">
                    <Button className="w-full">Book Appointment</Button>
                  </Link>
                  <Button variant="outline" size="icon">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
