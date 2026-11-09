export type UserRole = "candidate" | "recruiter";

export interface LoginPayload {
  role: UserRole;
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  token: string;
}

/* ── Candidate Registration ── */

export interface Education {
  id: string;
  degree: string;
  institution: string;
  specialization: string;
  location: string;
  yearOfPassing: string;
  grade: string;
  educationType: string;
  description: string;
  attachmentFileKeys?: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  role: string;
  startDate: string;
  endDate: string;
  teamSize: string;
  technologies: string[];
}

export interface Experience {
  id: string;
  company: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  totalExperience: string;
  jobTitle: string;
  location: string;
  noticePeriod: string;
  /** What the candidate did in the role — used to measure experience per skill. */
  description?: string;
  expanded: boolean;
  projects: Project[];
}

export interface Certification {
  id: string;
  name: string;
  institution: string;
  credentialId?: string;
  certificateUrl?: string;
  passedYear: string;
  validTill: string;
  doesNotExpire: boolean;
  description?: string;
  displayOnProfile: boolean;
  certificateFileKey?: string;
}

export interface Skill {
  id: string;
  name: string;
  proficiency: string; // Beginner | Intermediate | Advanced | Expert | Master
  experienceValue: string; // "5"
  experienceUnit: string; // "Years" | "Months"
  lastUsed: string; // "May 2024"
  highlighted: boolean; // Top Skill
  additionalDetails?: string;
  /** "resume" when the years were measured from the résumé's dated roles; "candidate" when entered. */
  experienceSource?: "resume" | "candidate";
}

export interface CandidateRegStep1Data {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  currentLocation: string;
  professionalSummary: string;
  acceptTerms: boolean;
}

export interface CandidateRegStep2Data {
  education: Education[];
  experience: Experience[];
  resumeFileKey: string;
}

export interface CandidateRegStep3Data {
  skills: Skill[];
  certifications: Certification[];
  noticePeriod: string;
  expectedSalary: string;
  salaryType: string;
  jobRolePreferences: string[];
  preferredLocations: string[];
  openToRelocate: boolean;
  employmentTypes: string[];
  benefits: string[];
  additionalNotes: string;
}

export interface CandidateRegData {
  step1: CandidateRegStep1Data;
  step2: CandidateRegStep2Data;
  step3: CandidateRegStep3Data;
}

/* ── Company Registration ── */

export interface CompanyRegStep1Data {
  companyName: string;
  legalName: string;
  website: string;
  industry: string;
  companySize: string;
  foundedYear: string;
  companyType: string;
  gstNumber: string;
  panNumber: string;
  country: string;
  state: string;
  city: string;
  address: string;
  about: string;
  agree: boolean;
}

export interface CompanyRegStep2Data {
  fullName: string;
  designation: string;
  department: string;
  email: string;
  countryCode: string;
  mobile: string;
  altCountryCode: string;
  altMobile: string;
  password: string;
  confirmPassword: string;
  timeZone: string;
  language: string;
  emailNotifications: string;
}

export interface CompanyRegData {
  step1: CompanyRegStep1Data;
  step2: CompanyRegStep2Data;
}
