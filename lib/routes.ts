/**
 * Shared public route constants for the marketing site (apex hiremind.co.in).
 * Nav, footer and sitemap all read from here so a link never points at a page
 * that does not exist.
 *
 * TODO (planned pages, add to ROUTES + nav + footer + sitemap only when they ship):
 *  - /how-ai-job-matching-works (held: ships after BUG-01/BUG-03 fixes)
 *  - /ai-candidate-matching (held: live only after a test job shows real scores)
 *  (/for-agencies shipped in week 2; /improve-your-job-match in week 3.)
 *  - /blog hubs exist (week 3) but stay noindex and out of nav/footer/sitemap until 2+ articles each.
 *  - /ai-resume-parsing, /team-roles-permissions (week 4)
 *  - /job-safety, /about (week 5)
 *  - /features rewrite + /ai-capabilities 301 to /features (week 6)
 *  - /freshteam-alternative (week 7)
 */
export const ROUTES = {
  home: "/",
  jobSeekers: "/job-seekers",
  forRecruiters: "/for-recruiters",
  forAgencies: "/for-agencies",
  improveJobMatch: "/improve-your-job-match",
  blog: "/blog",
  blogJobSeekers: "/blog/job-seekers",
  blogRecruiters: "/blog/recruiters",
  features: "/features",
  faq: "/faq",
  contact: "/contact",
  bookDemo: "/book-demo",
  privacy: "/privacy",
  terms: "/terms",
} as const;

/** Signup and login live on each role's own subdomain app. */
export const APP_LINKS = {
  candidateLogin: "https://candidate.hiremind.co.in/login",
  recruiterLogin: "https://recruiter.hiremind.co.in/login",
  candidateRegister: "/register/candidate",
  recruiterRegister: "/register/company",
} as const;

/** Pages whose primary mobile CTA is "Book a Demo" (recruiter pages). */
export const RECRUITER_PATHS: string[] = [ROUTES.forRecruiters, ROUTES.forAgencies, ROUTES.contact];

export type NavLink = { href: string; title: string; external?: boolean };
export type NavGroup = { title: string; href: string; children: NavLink[] };

/** Header groups. Children list only pages that exist today (see TODO above). */
export const NAV_GROUPS: NavGroup[] = [
  {
    title: "For Job Seekers",
    href: ROUTES.jobSeekers,
    children: [
      { href: ROUTES.jobSeekers, title: "Overview" },
      { href: `${ROUTES.jobSeekers}#how-it-works`, title: "How Matching Works" },
      { href: ROUTES.improveJobMatch, title: "Improve Your Job Match" },
      { href: APP_LINKS.candidateRegister, title: "Upload Resume Free" },
    ],
  },
  {
    title: "For Recruiters",
    href: ROUTES.forRecruiters,
    children: [
      { href: ROUTES.forRecruiters, title: "Overview" },
      { href: `${ROUTES.forRecruiters}#matching-weights`, title: "AI Matching Weights" },
      { href: ROUTES.forAgencies, title: "For Recruitment Agencies" },
      { href: `${ROUTES.forRecruiters}#team-roles`, title: "Team Roles" },
      { href: APP_LINKS.recruiterRegister, title: "Register as Recruiter" },
    ],
  },
];

export const NAV_LINKS: NavLink[] = [
  { href: ROUTES.features, title: "Features" },
  { href: ROUTES.faq, title: "FAQ" },
];

export const SIGN_IN: NavLink[] = [
  { href: APP_LINKS.candidateLogin, title: "Job Seeker", external: true },
  { href: APP_LINKS.recruiterLogin, title: "Recruiter", external: true },
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Job Seekers",
    links: [
      { href: ROUTES.jobSeekers, title: "For Job Seekers" },
      { href: ROUTES.improveJobMatch, title: "Improve Your Job Match" },
      { href: APP_LINKS.candidateRegister, title: "Upload Resume Free" },
      { href: APP_LINKS.candidateLogin, title: "Job Seeker Sign In", external: true },
    ],
  },
  {
    title: "Recruiters",
    links: [
      { href: ROUTES.forRecruiters, title: "For Recruiters" },
      { href: ROUTES.forAgencies, title: "For Agencies" },
      { href: ROUTES.bookDemo, title: "Book a Demo" },
      { href: APP_LINKS.recruiterRegister, title: "Register as Recruiter" },
      { href: APP_LINKS.recruiterLogin, title: "Recruiter Sign In", external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { href: ROUTES.features, title: "Features" },
      { href: ROUTES.faq, title: "FAQ" },
      { href: ROUTES.contact, title: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: ROUTES.privacy, title: "Privacy Policy" },
      { href: ROUTES.terms, title: "Terms" },
    ],
  },
];
