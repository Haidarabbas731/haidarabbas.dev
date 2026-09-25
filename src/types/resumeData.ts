export interface ResumeLink {
  label: string
  url: string
}

export interface ResumeContact {
  email?: string
  phone?: string
  location?: string
  links: ResumeLink[]
}

export interface ResumeJob {
  company: string
  role: string
  location?: string
  period: string
  bullets: string[]
}

export interface ResumeProject {
  name: string
  link?: string
  period?: string
  bullets: string[]
}

export interface ResumeSkillGroup {
  group: string
  items: string[]
}

export interface ResumeEducation {
  school: string
  degree: string
  location?: string
  period?: string
  details: string[]
}

/** Any other section the resume has, such as certifications or awards. */
export interface ResumeExtra {
  title: string
  items: string[]
}

export interface ResumeData {
  name: string
  contact: ResumeContact
  summary?: string
  experience: ResumeJob[]
  projects: ResumeProject[]
  skills: ResumeSkillGroup[]
  education: ResumeEducation[]
  extras: ResumeExtra[]
}

export type ResumeWarningKind =
  | 'number'
  | 'year'
  | 'company'
  | 'title'
  | 'school'
  | 'degree'
  | 'project'
  | 'skill'
  | 'contact'
  | 'link'

/** Something in the tailored resume that could not be found in the original. */
export interface ResumeWarning {
  kind: ResumeWarningKind
  value: string
  message: string
}
