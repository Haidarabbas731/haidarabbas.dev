import type { ResumeData } from '@/types/resumeData'

/** Plain text as it would come out of a PDF. */
export const SAMPLE_SOURCE = `Priya Nair
Bengaluru, India | priya.nair@example.com | +91 98765 43210
github.com/priyanair | linkedin.com/in/priya-nair

SUMMARY
Backend engineer with 4 years of experience building data pipelines and APIs.

EXPERIENCE
Data Engineer, Acme Analytics  Jan 2022 - Present
- Built ETL pipelines in Python and Airflow that process 2 million events per day.
- Cut nightly batch time by 35% by moving joins into Postgres.
Software Engineer, Brightside Labs  Jul 2020 - Dec 2021
- Developed REST APIs in FastAPI serving 12 internal teams.

PROJECTS
Logwise, a log search tool built with Elasticsearch and React.

SKILLS
Python, SQL, Airflow, FastAPI, PostgreSQL, Docker, React

EDUCATION
B.Tech in Computer Science, NIT Calicut  2016 - 2020`

export const SAMPLE_DATA: ResumeData = {
  name: 'Priya Nair',
  contact: {
    email: 'priya.nair@example.com',
    phone: '+91 98765 43210',
    location: 'Bengaluru, India',
    links: [
      { label: 'GitHub', url: 'https://github.com/priyanair' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/priya-nair' },
    ],
  },
  summary: 'Data engineer with 4 years of experience building reliable pipelines and APIs.',
  experience: [
    {
      company: 'Acme Analytics',
      role: 'Data Engineer',
      period: 'Jan 2022 - Present',
      bullets: [
        'Built ETL pipelines in Python and Airflow that process 2 million events per day.',
        'Cut nightly batch time by 35% by moving joins into Postgres.',
      ],
    },
    {
      company: 'Brightside Labs',
      role: 'Software Engineer',
      period: 'Jul 2020 - Dec 2021',
      bullets: ['Developed REST APIs in FastAPI serving 12 internal teams.'],
    },
  ],
  projects: [
    {
      name: 'Logwise',
      bullets: ['Log search tool built with Elasticsearch and React.'],
    },
  ],
  skills: [
    { group: 'Languages', items: ['Python', 'SQL'] },
    { group: 'Tools', items: ['Airflow', 'FastAPI', 'PostgreSQL', 'Docker', 'React'] },
  ],
  education: [
    {
      school: 'NIT Calicut',
      degree: 'B.Tech in Computer Science',
      period: '2016 - 2020',
      details: [],
    },
  ],
  extras: [],
}
