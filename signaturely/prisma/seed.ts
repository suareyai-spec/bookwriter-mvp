import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

const defaultSignatureData = JSON.stringify({
  personal: {
    fullName: "John Doe",
    jobTitle: "Senior Software Engineer",
    company: "Acme Corp",
    department: "Engineering",
    email: "john@acmecorp.com",
    phone: "+1 (555) 123-4567",
    mobile: "+1 (555) 987-6543",
    website: "https://acmecorp.com",
    address: "123 Main St, San Francisco, CA"
  },
  images: { photo: "", logo: "", photoShape: "circle", photoSize: 80, logoSize: 100 },
  social: [
    { platform: "linkedin", url: "https://linkedin.com/in/johndoe" },
    { platform: "twitter", url: "https://twitter.com/johndoe" },
    { platform: "github", url: "https://github.com/johndoe" }
  ],
  design: {
    template: "classic",
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    textColor: "#1f2937",
    fontFamily: "Arial",
    fontSize: { name: 16, title: 13, company: 13, info: 12 },
    separator: "pipe",
    layout: "horizontal",
    iconStyle: "colored",
    iconSize: "medium",
    iconShape: "circle"
  },
  addons: {
    cta: { enabled: false, text: "", url: "", color: "#6366f1" },
    banner: { enabled: false, image: "", url: "" },
    disclaimer: { enabled: false, text: "" },
    meeting: { enabled: false, url: "", platform: "calendly" },
    tagline: { enabled: true, text: "Building the future, one line of code at a time." }
  }
});

const secondSignatureData = JSON.stringify({
  personal: {
    fullName: "Jane Smith",
    jobTitle: "Marketing Director",
    company: "BrandCo",
    department: "Marketing",
    email: "jane@brandco.io",
    phone: "+1 (555) 222-3333",
    mobile: "",
    website: "https://brandco.io",
    address: ""
  },
  images: { photo: "", logo: "", photoShape: "rounded", photoSize: 70, logoSize: 90 },
  social: [
    { platform: "linkedin", url: "https://linkedin.com/in/janesmith" },
    { platform: "instagram", url: "https://instagram.com/janesmith" }
  ],
  design: {
    template: "modern",
    primaryColor: "#8b5cf6",
    secondaryColor: "#6366f1",
    textColor: "#374151",
    fontFamily: "Helvetica",
    fontSize: { name: 15, title: 12, company: 12, info: 11 },
    separator: "dot",
    layout: "horizontal",
    iconStyle: "colored",
    iconSize: "small",
    iconShape: "rounded"
  },
  addons: {
    cta: { enabled: true, text: "Book a Meeting", url: "https://calendly.com/janesmith", color: "#8b5cf6" },
    banner: { enabled: false, image: "", url: "" },
    disclaimer: { enabled: false, text: "" },
    meeting: { enabled: false, url: "", platform: "calendly" },
    tagline: { enabled: false, text: "" }
  }
});

async function main() {
  const password = await bcryptjs.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'suarey@gmail.com' },
    update: {},
    create: {
      email: 'suarey@gmail.com',
      name: 'Admin User',
      password,
      plan: 'pro',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'demo@signaturely.com' },
    update: {},
    create: {
      email: 'demo@signaturely.com',
      name: 'Demo User',
      password,
      plan: 'free',
    },
  });

  await prisma.signature.createMany({
    data: [
      { userId: admin.id, name: 'Professional Signature', template: 'classic', data: defaultSignatureData, isDefault: true },
      { userId: admin.id, name: 'Minimal Signature', template: 'minimal', data: secondSignatureData },
      { userId: user.id, name: 'My Signature', template: 'modern', data: secondSignatureData, isDefault: true },
    ],
  });

  console.log('Seeded database');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
