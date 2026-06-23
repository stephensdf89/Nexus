export type SupportDoc = {
  slug: string;
  title: string;
  fileName: string;
  description: string;
  category: "setup" | "deployment" | "policy" | "reference";
};

export const SUPPORT_DOCS: SupportDoc[] = [
  {
    slug: "quick-start",
    title: "Quick Start",
    fileName: "QUICK_START.md",
    description: "Get the app running quickly with the minimum setup path.",
    category: "setup",
  },
  {
    slug: "setup-actions",
    title: "Setup Actions",
    fileName: "SETUP_ACTIONS.md",
    description: "Action checklist for initial project and integration setup.",
    category: "setup",
  },
  {
    slug: "supabase-setup",
    title: "Supabase Setup",
    fileName: "SUPABASE_SETUP.md",
    description: "Database and auth setup steps for the Supabase backend.",
    category: "setup",
  },
  {
    slug: "facebook-integration-setup",
    title: "Facebook Integration Setup",
    fileName: "FACEBOOK_INTEGRATION_SETUP.md",
    description: "Configure Facebook app credentials and callback flow.",
    category: "setup",
  },
  {
    slug: "deployment-setup",
    title: "Deployment Setup",
    fileName: "DEPLOYMENT_SETUP.md",
    description: "Deployment configuration for production environments.",
    category: "deployment",
  },
  {
    slug: "deployment-checklist",
    title: "Deployment Checklist",
    fileName: "DEPLOYMENT_CHECKLIST.md",
    description: "Pre-flight checklist before shipping to production.",
    category: "deployment",
  },
  {
    slug: "optimization",
    title: "Optimization Guide",
    fileName: "OPTIMIZATION.md",
    description: "Performance optimization notes and follow-up improvements.",
    category: "reference",
  },
  {
    slug: "readme",
    title: "Project README",
    fileName: "README.md",
    description: "Core project overview, scripts, and architecture notes.",
    category: "reference",
  },
  {
    slug: "godaddy-setup",
    title: "GoDaddy Setup",
    fileName: "GODADDY_SETUP.md",
    description: "DNS/domain setup notes for GoDaddy-managed domains.",
    category: "deployment",
  },
];

export function getSupportDocBySlug(slug: string) {
  return SUPPORT_DOCS.find((doc) => doc.slug === slug);
}
