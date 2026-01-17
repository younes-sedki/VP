// Structured Data (JSON-LD) for better SEO
export default function StructuredData() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Younes SEDKI",
    jobTitle: "Full-Stack Developer",
    description: "Full-Stack Developer specializing in React, Next.js, Node.js, and DevOps",
    url: "https://sedkiy.dev", // Update with your actual domain
    email: "younes_sedki@hotmail.fr",
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "Institut Spécialisé de Technologie Appliquée de Hay Riad, Rabat",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Rabat",
        addressCountry: "MA",
      },
    },
    knowsAbout: [
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "DevOps",
      "Full-Stack Development",
      "Web Development",
    ],
    sameAs: [
      "https://github.com/younes-sedki",
      "https://gitlab.com/younes-sedki",
      "https://linkedin.com/in/younes-sedki",
    ],
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Younes SEDKI Portfolio",
    url: "https://sedkiy.dev", // Update with your actual domain
    description: "Full-Stack Developer Portfolio - React, Next.js, Node.js, DevOps",
    author: {
      "@type": "Person",
      name: "Younes SEDKI",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  )
}
