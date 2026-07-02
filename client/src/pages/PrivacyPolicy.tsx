import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy — SEU Rate My Faculty";
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
            Privacy Policy
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

          <div
            style={{
              fontSize: "0.92rem",
              color: "hsl(var(--foreground) / 0.85)",
              lineHeight: 1.8,
            }}
            className="flex flex-col gap-8"
          >
            <section className="slide-up stagger-1">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                1. Information We Collect
              </h2>
              <p>
                When you sign in to SEU Rate My Faculty, we collect your SEU Google
                account email address and basic profile information provided by Google
                OAuth. We do not collect passwords, phone numbers, or any sensitive
                personal data beyond what is required for authentication.
              </p>
            </section>

            <section className="slide-up stagger-2">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                2. How We Use Your Information
              </h2>
              <p>
                Your email address is used solely to authenticate your identity as an SEU
                student and to associate your submitted reviews with your account. Your
                identity is never revealed publicly — all reviews appear as "Anonymous
                Student" to other users.
              </p>
            </section>

            <section className="slide-up stagger-3">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                3. Reviews and Content
              </h2>
              <p>
                Reviews you submit are stored in our database and displayed publicly
                without your name or email. Only platform administrators can view the
                identity of reviewers for moderation purposes. Uploaded PYQ links are
                attributed to the platform, not individual users.
              </p>
            </section>

            <section className="slide-up stagger-4">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                4. Data Sharing
              </h2>
              <p>
                We do not sell, rent, or share your personal information with any third
                parties. Your data is used exclusively for operating this platform and is
                never used for advertising or marketing purposes.
              </p>
            </section>

            <section className="slide-up stagger-5">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                5. Data Security
              </h2>
              <p>
                We take reasonable measures to protect your information. Authentication is
                handled through Google OAuth, meaning we never store your password. All
                data is stored securely on our servers.
              </p>
            </section>

            <section className="slide-up stagger-6">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                6. Your Rights
              </h2>
              <p>
                You may request deletion of your account and associated data at any time
                by contacting a platform administrator. Reviews you have submitted may be
                deleted by you directly from the platform.
              </p>
            </section>

            <section className="slide-up" style={{ animationDelay: "0.4s" }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  marginBottom: "12px",
                }}
              >
                7. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. Continued use of the
                platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
