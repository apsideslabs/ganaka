export interface NavItem {
  label: string;
  href: string;
  description?: string;
  isPlaceholder?: boolean;
}

export const SITE_CONFIG = {
  name: 'Gaṇaka',
  nameAscii: 'Ganaka',
  sanskrit: 'गणक',
  descriptor: 'Jyotiṣa Calculation & Research',
  tagline: 'A modern platform for astronomical calculation, classical Jyotiṣa methods, and traceable sources.',
  navItems: [
    { label: 'Home', href: '/' },
    { label: 'Pañcāṅga', href: '/panchanga' },
    { label: 'About', href: '/about' },
    { label: 'Research', href: '/research' },
    { label: 'Documentation', href: '/documentation' },
  ] satisfies NavItem[],
  workspaceItem: {
    label: 'Workspace',
    href: '/workspace',
    ctaLabel: 'Enter Workspace',
  },
  footerLinks: {
    product: [
      { label: 'Overview', href: '/' },
      { label: 'Pañcāṅga (Daily Calendar)', href: '/panchanga' },
      { label: 'Capabilities', href: '/#capabilities' },
      { label: 'Architecture', href: '/#architecture' },
      { label: 'Workspace', href: '/workspace' },
    ],
    research: [
      { label: 'Classical Texts', href: '/research#classical-texts' },
      { label: 'Rule Provenance', href: '/research#rule-provenance' },
      { label: 'Astronomical Methods', href: '/research#astronomical-methods' },
      { label: 'Regional Traditions', href: '/research#regional-traditions' },
    ],
    documentation: [
      { label: 'System Overview', href: '/documentation' },
      { label: 'Calculation Philosophy', href: '/documentation#philosophy' },
      { label: 'Coordinate Standards', href: '/documentation#standards' },
      { label: 'Changelog', href: '/documentation#changelog' },
    ],
    about: [
      { label: 'What is Gaṇaka?', href: '/about' },
      { label: 'Our Principles', href: '/about#principles' },
      { label: 'Contact & Inquiry', href: '/about#contact' },
    ],
  },
};
