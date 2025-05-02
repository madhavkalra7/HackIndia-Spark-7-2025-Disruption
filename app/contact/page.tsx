"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MapPin, Phone, Send, MessageSquare } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Contact() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // This would normally connect to a backend
    setFormSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormSubmitted(false)
    }, 3000)
  }

  const handleStartChat = () => {
    setChatStarted(true)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Contact Us</h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          Have questions about Job Shield? We're here to help you navigate safe job hunting.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
              {formSubmitted ? (
                <Alert className="mb-6 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50">
                  <AlertTitle>Message Sent!</AlertTitle>
                  <AlertDescription>
                    Thank you for contacting us. We'll respond to your inquiry shortly.
                  </AlertDescription>
                </Alert>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Your Name
                  </label>
                  <Input id="name" placeholder="John Smith" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email Address
                  </label>
                  <Input id="email" type="email" placeholder="john@example.com" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-medium">
                    Subject
                  </label>
                  <Input id="subject" placeholder="How can we help you?" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your question or concern..."
                    className="min-h-[150px]"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Reach out to us through any of these channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Our Location</h3>
                  <p className="text-muted-foreground">
                    Chitkara University, Rajpura 140410
                    <br />
                    Punjab, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Email Us</h3>
                  <p className="text-muted-foreground">teamdisruption@jobshield.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Call Us</h3>
                  <p className="text-muted-foreground">
                    +91 9813569096
                    <br />
                    Monday-Friday, 9:00 AM - 6:00 PM IST
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Support</CardTitle>
              <CardDescription>Need immediate assistance? Chat with our support team.</CardDescription>
            </CardHeader>
            <CardContent>
              {chatStarted ? (
                <div className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      JS
                    </div>
                    <div>
                      <p className="text-sm font-medium">Job Shield Support</p>
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  </div>
                  <div className="mb-4 space-y-2">
                    <div className="rounded-lg bg-muted p-2 text-sm">Hello! How can I help you today?</div>
                    <div className="ml-auto max-w-[80%] rounded-lg bg-primary p-2 text-sm text-primary-foreground">
                      I have a question about recruiter verification.
                    </div>
                    <div className="rounded-lg bg-muted p-2 text-sm">
                      I'd be happy to explain our verification process. What would you like to know?
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Type your message..." className="flex-1" />
                    <Button size="sm">Send</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">Live Chat</h3>
                      <p className="text-sm text-muted-foreground">Available 24/7</p>
                    </div>
                  </div>
                  <Button onClick={handleStartChat}>Start Chat</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full overflow-hidden rounded-md">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3430.2304456526147!2d76.6590537!3d30.7016036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390feef88a7e1ee9%3A0xc0b29bad8e2b3f32!2sChitkara%20University!5e0!3m2!1sen!2sin!4v1651234567890!5m2!1sen!2sin"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
