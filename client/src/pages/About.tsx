import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

export default function About() {
  useEffect(() => {
    document.title = "About — SEU Rate My Faculty";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
        <article
          className="max-w-3xl mx-auto fade-in"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
              fontWeight: 800,
              color: "hsl(var(--foreground))",
              marginBottom: "8px",
            }}
          >
            About
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              color: "hsl(var(--muted-foreground))",
              marginBottom: "40px",
            }}
          >
            SEU Rate My Faculty
          </p>

          <div
            style={{
              fontSize: "0.92rem",
              color: "hsl(var(--foreground) / 0.85)",
              lineHeight: 1.8,
            }}
            className="flex flex-col gap-8"
          >
            <p className="slide-up stagger-1">
              SEU Rate My Faculty is a student-driven platform built exclusively for
              Southeast University students. Our mission is simple — help you make
              informed decisions about your academic journey by giving you access to
              honest faculty reviews and past year questions, all in one place.
            </p>

            <section className="slide-up stagger-2">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                What We Offer
              </h2>
              <p>
                Students can browse faculty profiles, read anonymous reviews from fellow
                students, and access previous year exam questions uploaded by the community.
                Every review covers key details like personality, marking style, exam
                difficulty, and which type of students a faculty member is best suited
                for — giving you a complete picture before you step into the classroom.
              </p>
            </section>

            <section className="slide-up stagger-3">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                Why We Built This
              </h2>
              <p>
                Choosing the right courses and understanding your faculty's teaching style
                can make a huge difference in your academic performance. Before this
                platform, that information was scattered across WhatsApp groups, word of
                mouth, and personal experience. We built SEU Rate My Faculty to centralize
                that knowledge and make it accessible to every SEU student.
              </p>
            </section>

            <section className="slide-up stagger-4">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                Our Community
              </h2>
              <p>
                Every review, every uploaded PYQ, and every piece of feedback on this
                platform comes from real SEU students. We rely on the honesty and integrity
                of our community to keep the information accurate and helpful. In return,
                we keep all reviews anonymous to protect student privacy.
              </p>
            </section>

            <section className="slide-up stagger-5">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                Contact
              </h2>
              <p>
                Have suggestions, found an issue, or want to contribute? Reach out to us
                at the university or through the platform. We're students too — we get it.
              </p>
            </section>
          </div>
        </article>
