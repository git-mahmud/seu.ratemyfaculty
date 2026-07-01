import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p
            style={{
              fontSize: "0.82rem",
              color: "hsl(var(--muted-foreground))",
              marginBottom: "40px",
            }}
          >
            Last updated: June 2026
          </p>

          <p
            style={{
              fontSize: "0.92rem",
              color: "hsl(var(--foreground) / 0.85)",
              lineHeight: 1.8,
              marginBottom: "32px",
            }}
          >
            By accessing and using SEU Rate My Faculty, you agree to the following
            terms. If you do not agree, please do not use the platform.
          </p>

          <div
            style={{
              fontSize: "0.92rem",
              color: "hsl(var(--foreground) / 0.85)",
              lineHeight: 1.8,
            }}
            className="flex flex-col gap-8"
          >
            <section>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                1. Eligibility
              </h2>
              <p>
                This platform is exclusively for students, faculty, and staff of Southeast
                University. Only accounts with a valid @seu.edu.bd email address are
                permitted to sign in and submit content.
              </p>
            </section>

            <section>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                2. User Conduct
              </h2>
              <p>
                You agree to use this platform respectfully and honestly. You must not
                submit reviews that contain false information, personal attacks, hate
                speech, discrimination, abusive language, or content that could defame or
                harm any individual. Reviews must be based on your genuine personal
                academic experience.
              </p>
            </section>

            <section>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                3. Anonymous Reviews
              </h2>
              <p>
                While your reviews are displayed anonymously to the public, your identity
                is linked to your review in our system for moderation purposes. Submitting
                harmful or false content under the cover of anonymity is a violation of
                these terms.
              </p>
            </section>

            <section>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                4. Previous Year Questions
              </h2>
              <p>
                PYQ content uploaded to the platform must be academic in nature and
                relevant to Southeast University courses. Uploading copyrighted content
                without authorization or content unrelated to academics is not permitted.
              </p>
            </section>

            <section>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                5. Content Moderation
              </h2>
              <p>
                Platform administrators reserve the right to remove any review, comment, or
                uploaded content that violates these terms, without prior notice. Repeated
                violations may result in account suspension.
              </p>
            </section>

            <section>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                6. Disclaimer
              </h2>
              <p>
                SEU Rate My Faculty is a student-built platform and is not officially
                affiliated with or endorsed by Southeast University. All reviews represent
                the personal opinions of individual students and do not reflect the views
                of the university or the platform administrators.
              </p>
            </section>

            <section>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                7. Limitation of Liability
              </h2>
              <p>
                We are not responsible for any decisions made based on content found on
                this platform. Use the information here as one of many resources in your
                academic planning.
              </p>
            </section>

            <section>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                8. Changes to Terms
              </h2>
              <p>
                We reserve the right to update these Terms of Service at any time.
                Continued use of the platform after changes constitutes acceptance of the
                updated terms.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
