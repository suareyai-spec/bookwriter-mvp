export interface SignatureData {
  personal: {
    fullName: string;
    jobTitle: string;
    company: string;
    department: string;
    email: string;
    phone: string;
    mobile: string;
    website: string;
    address: string;
  };
  images: {
    photo: string;
    logo: string;
    photoShape: 'square' | 'rounded' | 'circle';
    photoSize: number;
    logoSize: number;
  };
  social: { platform: string; url: string }[];
  design: {
    template: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    fontFamily: string;
    fontSize: { name: number; title: number; company: number; info: number };
    separator: 'line' | 'pipe' | 'dot' | 'none';
    layout: 'horizontal' | 'vertical' | 'two-column';
    iconStyle: 'colored' | 'monochrome' | 'outline';
    iconSize: 'small' | 'medium' | 'large';
    iconShape: 'square' | 'rounded' | 'circle';
  };
  addons: {
    cta: { enabled: boolean; text: string; url: string; color: string };
    banner: { enabled: boolean; image: string; url: string };
    disclaimer: { enabled: boolean; text: string };
    meeting: { enabled: boolean; url: string; platform: string };
    tagline: { enabled: boolean; text: string };
  };
}

export const defaultSignatureData: SignatureData = {
  personal: { fullName: '', jobTitle: '', company: '', department: '', email: '', phone: '', mobile: '', website: '', address: '' },
  images: { photo: '', logo: '', photoShape: 'circle', photoSize: 80, logoSize: 100 },
  social: [],
  design: {
    template: 'classic',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    textColor: '#1f2937',
    fontFamily: 'Arial',
    fontSize: { name: 16, title: 13, company: 13, info: 12 },
    separator: 'pipe',
    layout: 'horizontal',
    iconStyle: 'colored',
    iconSize: 'medium',
    iconShape: 'circle',
  },
  addons: {
    cta: { enabled: false, text: '', url: '', color: '#6366f1' },
    banner: { enabled: false, image: '', url: '' },
    disclaimer: { enabled: false, text: '' },
    meeting: { enabled: false, url: '', platform: 'calendly' },
    tagline: { enabled: false, text: '' },
  },
};

export const TEMPLATES = [
  { id: 'classic', name: 'Classic', description: 'Horizontal layout, photo left', category: 'professional' },
  { id: 'modern', name: 'Modern', description: 'Clean lines, minimal', category: 'professional' },
  { id: 'bold', name: 'Bold', description: 'Large name, accent bar', category: 'creative' },
  { id: 'elegant', name: 'Elegant', description: 'Serif-inspired, subtle', category: 'professional' },
  { id: 'compact', name: 'Compact', description: 'Minimal space, dense info', category: 'professional' },
  { id: 'creative', name: 'Creative', description: 'Colorful, standout', category: 'creative' },
  { id: 'corporate', name: 'Corporate', description: 'Formal, logo-focused', category: 'business' },
  { id: 'startup', name: 'Startup', description: 'Trendy, gradient accents', category: 'creative' },
  { id: 'legal', name: 'Legal', description: 'Formal, disclaimer-ready', category: 'business' },
  { id: 'realestate', name: 'Real Estate', description: 'Photo prominent', category: 'business' },
  { id: 'medical', name: 'Medical', description: 'Clean, credentials-focused', category: 'business' },
  { id: 'minimal', name: 'Minimal', description: 'Bare essentials only', category: 'professional' },
];

export const SOCIAL_PLATFORMS = [
  'linkedin', 'twitter', 'facebook', 'instagram', 'tiktok', 'youtube',
  'github', 'dribbble', 'behance', 'pinterest', 'snapchat', 'discord',
  'whatsapp', 'telegram', 'medium', 'substack',
];

export const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Georgia', 'Verdana', 'Trebuchet MS',
  'Times New Roman', 'Courier New', 'Inter', 'Roboto',
];
