import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

interface TestimonialCardProps {
  name: string
  role: string
  image: string
  quote: string
}

export default function TestimonialCard({ name, role, image, quote }: TestimonialCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex justify-center">
          <Quote className="h-8 w-8 text-primary/40" />
        </div>
        <p className="mb-6 text-center text-muted-foreground">{quote}</p>
        <div className="flex flex-col items-center">
          <div className="mb-3 h-16 w-16 overflow-hidden rounded-full">
            <img src={image || "/placeholder.svg"} alt={name} className="h-full w-full object-cover" />
          </div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </CardContent>
    </Card>
  )
}
