// Everything the page says lives here, so copy edits never touch JSX.
// Sourced from the resume. See NOTES.md for the few things inferred.

export const profile = {
  firstName: "Kushagra",
  lastName: "Pratap Singh",
  fullName: "Kushagra Pratap Singh",
  role: "Fullstack Software Engineer",
  location: "Jaipur, India",
  timeZone: "Asia/Kolkata",
  email: "rajputkushagra26@gmail.com",
  phone: "+91 63985 64013",
  phoneHref: "+916398564013",
  status: "Open to full-time SDE roles from 2027",
  intro:
    "I build the backend systems that have to be right: permissions, payments, real-time sync. And the product surfaces people use on top of them.",
};

export const links = {
  github: "https://github.com/kushagra0526",
  linkedin: "https://www.linkedin.com/in/kushagra-pratap-singh/",
  leetcode: "https://leetcode.com/u/mWLZR3GFyh/",
  geeksforgeeks: "https://www.geeksforgeeks.org/user/kushagra0526/",
  resume: "/kushagra-pratap-singh-resume.pdf",
};

export const socials = [
  { label: "GitHub", href: links.github, icon: "github" },
  { label: "LinkedIn", href: links.linkedin, icon: "linkedin" },
  { label: "LeetCode", href: links.leetcode, icon: "leetcode" },
  { label: "GeeksforGeeks", href: links.geeksforgeeks, icon: "geeksforgeeks" },
];

// Every numbered section, in page order. The mobile menu numbers these by
// position, so leaving one out (Highlights was) shifts every number after it
// and the menu contradicts the "05 / Highlights" on the page.
export const navItems = [
  { id: "overview", label: "Overview" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Work" },
  { id: "stack", label: "Stack" },
  { id: "highlights", label: "Highlights" },
  { id: "contact", label: "Contact" },
];

// The band between sections. Short nouns only: each one has to stay readable
// while it is moving past at display size.
export const marqueeTerms = [
  "Permissions",
  "Payments",
  "Real-time sync",
  "Event-driven",
  "Vector search",
  "Distributed systems",
];

export const heroStats = [
  { value: 7000, suffix: "+", comma: true, label: "users on a platform I shipped backend for" },
  { value: 99.9, decimals: 1, suffix: "%", label: "uptime across 100+ daily payments" },
  { value: 3, label: "products built and deployed" },
  { value: 450, suffix: "+", label: "DSA problems solved" },
];

export const motto = ["Learn from the world.", "Build for it.", "Find my place in it."];

export const overview = {
  note: "Who I am, what I work on, and where I'm headed.",
  statement:
    "I'm a fullstack engineer in my final year at LNMIIT Jaipur. What I care about most: whether someone is allowed to do the thing they're trying to do, whether a payment went through exactly once, and whether two people editing the same file end up with the same file.",
  paragraphs: [
    "At Marine Edge Technologies I owned backend features end to end on a platform with 7,000+ users. That meant a configurable RBAC system, Razorpay payments held at 99.9% uptime, analytics APIs for monitoring, and a React front end that got 30% faster to load.",
    "On my own time I build things to actually understand them. A CRDT written from scratch, a microservice backend held together by Kafka, an LLM feature grounded in a pgvector index.",
  ],
  facts: [
    { label: "Studying", value: "B.Tech, Communication & Computer Engg." },
    { label: "University", value: "LNMIIT Jaipur, 2023 to 2027" },
    { label: "Based in", value: "Jaipur, India" },
    { label: "Currently", value: "Final year" },
    { label: "Open to", value: "Full-time SDE roles, 2027" },
  ],
  pillars: [
    {
      icon: "server",
      title: "Backend & distributed systems",
      body: "APIs, auth and payments that hold up in production. Services that talk through events instead of tight coupling.",
      tags: ["Node.js", "GraphQL", "Kafka", "PostgreSQL"],
    },
    {
      icon: "layout",
      title: "Fullstack product engineering",
      body: "React front ends that load fast, real-time collaboration over WebSockets, and dashboards that turn data into decisions.",
      tags: ["React", "Socket.io", "Recharts", "REST"],
    },
    {
      icon: "spark",
      title: "Applied AI",
      body: "LLM features grounded in real data. Structured extraction, retrieval over vector indexes, and pipelines that keep raw user data private.",
      tags: ["Gemini", "Bedrock", "RAG", "pgvector"],
    },
  ],
};

export const experience = [
  {
    id: "marine-edge",
    company: "Marine Edge Technologies",
    monogram: "ME",
    title: "Software Development Engineer Intern",
    period: "Jun 2025 to Nov 2025",
    location: "Remote",
    summary:
      "Owned backend features end to end on a scalable, distributed web platform serving 7,000+ users globally, working inside a cross-functional engineering team.",
    bullets: [
      "Implemented a configurable 3-tier RBAC system and integrated Razorpay payments, maintaining 99.9% uptime across 100+ daily transactions.",
      "Improved front-end performance and reliability with React.js, cutting load times by 30% and API error rates by 25%.",
      "Deployed Jitsi Meet video classes supporting 500+ concurrent attendees.",
      "Added real-time admin analytics APIs to monitor platform availability and performance.",
    ],
    metrics: [
      { value: 7000, suffix: "+", comma: true, label: "users on the platform" },
      { value: 99.9, decimals: 1, suffix: "%", label: "payment uptime" },
      { value: 100, suffix: "+", label: "transactions a day" },
      { value: 30, prefix: "−", suffix: "%", label: "front-end load time" },
      { value: 25, prefix: "−", suffix: "%", label: "API error rate" },
      { value: 500, suffix: "+", label: "concurrent attendees" },
    ],
    stack: ["React.js", "RBAC", "Razorpay", "Jitsi Meet", "REST APIs", "Analytics APIs"],
  },
];

export const projects = [
  {
    id: "ecom-graphql",
    index: "01",
    name: "Ecom Microservices",
    category: "Backend · Microservices",
    summary:
      "An e-commerce backend split into user, product and order services, sitting behind a single GraphQL gateway.",
    highlights: [
      "Unified GraphQL gateway with JWT authentication and role-based access control.",
      "Apache Kafka for event-driven communication, so services scale and fail independently.",
      "All three services containerised with Docker, with CI/CD on GitHub Actions.",
    ],
    stack: ["Node.js", "Express", "GraphQL", "Apollo", "MongoDB", "Kafka", "Docker"],
    links: {
      live: "https://frontend-phi-two-61.vercel.app",
      github: "https://github.com/kushagra0526/ecom_microservice_graphql",
    },
    visual: "services",
  },
  {
    id: "later-probably",
    index: "02",
    name: "Later, Probably",
    category: "AI · Fullstack",
    summary:
      "An AI task-estimation app. Describe a task in plain language, get back a structured task with a time estimate, then watch how the predictions compare with reality over time.",
    highlights: [
      "Gemini extracts structured fields from freeform task descriptions.",
      "pgvector HNSW index over 1536-dimension embeddings for fast semantic similarity search.",
      "Privacy-first pipeline. Stats are pre-aggregated server-side, so no raw task data is ever sent to the LLM.",
      "React + Recharts dashboards tracking predicted against actual duration.",
    ],
    stack: ["Node.js", "PostgreSQL", "Prisma", "pgvector", "Gemini API", "React", "Recharts"],
    links: {
      live: "https://later-probably.vercel.app",
      github: "https://github.com/kushagra0526/Later-Probably",
    },
    visual: "vectors",
  },
  {
    id: "interlace",
    index: "03",
    name: "Interlace",
    category: "Real-time · Distributed systems",
    summary:
      "A collaborative code editor where concurrent edits always converge, built on a CRDT I implemented from scratch instead of pulling in a library.",
    highlights: [
      "Custom RGA CRDT with no Yjs or Automerge dependency, guaranteeing strong eventual consistency with zero central coordination.",
      "Append-only MongoDB operations log with offline queuing.",
      "Socket.io sync across JWT-secured editing rooms.",
    ],
    stack: ["Node.js", "Express", "Socket.io", "MongoDB", "CRDT (RGA)", "JWT"],
    links: {
      live: "https://interlace-sepia.vercel.app/",
      github: "https://github.com/kushagra0526/Interlace",
    },
    visual: "crdt",
  },
];

// `icon` keys resolve in BrandIcon.jsx. Items without one get a short mono tag.
export const stack = [
  {
    group: "Languages & frontend",
    note: "JavaScript everywhere, Python for ML work, React on the front end.",
    items: [
      { name: "JavaScript", icon: "javascript" },
      { name: "Python", icon: "python" },
      { name: "React.js", icon: "react" },
      { name: "HTML", icon: "html" },
      { name: "CSS", icon: "css" },
      { name: "Recharts", short: "RC" },
    ],
  },
  {
    group: "Backend & APIs",
    note: "Where most of my time goes: APIs, gateways and real-time servers.",
    items: [
      { name: "Node.js", icon: "node" },
      { name: "Express.js", icon: "express" },
      { name: "GraphQL", icon: "graphql" },
      { name: "Apollo", icon: "apollo" },
      { name: "REST API design", short: "API" },
      { name: "Socket.io", icon: "socketio" },
    ],
  },
  {
    group: "Data & messaging",
    note: "Relational, document and vector data, with Kafka between services.",
    items: [
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "MongoDB", icon: "mongodb" },
      { name: "Redis", icon: "redis" },
      { name: "Prisma", icon: "prisma" },
      { name: "pgvector", short: "VEC" },
      { name: "Apache Kafka", icon: "kafka" },
    ],
  },
  {
    group: "AI & LLMs",
    note: "Structured extraction and retrieval that keep models grounded in real data.",
    items: [
      { name: "Gemini API", icon: "gemini" },
      { name: "Bedrock · Claude 3", icon: "claude" },
      { name: "Prompt engineering", short: "PE" },
      { name: "RAG", short: "RAG" },
      { name: "Vector search · HNSW", short: "KNN" },
    ],
  },
  {
    group: "Cloud & DevOps",
    note: "Containers, pipelines and serverless functions to ship it.",
    items: [
      { name: "Docker", icon: "docker" },
      { name: "GitHub Actions", icon: "githubactions" },
      { name: "CI/CD", short: "CI" },
      { name: "Git", icon: "git" },
      { name: "AWS Lambda", short: "λ" },
      { name: "DynamoDB", short: "DDB" },
    ],
  },
  {
    group: "Architecture & security",
    note: "Patterns for systems that scale, fail and sync safely.",
    items: [
      { name: "Microservices", short: "MS" },
      { name: "Event-driven design", short: "EDA" },
      { name: "CRDTs (RGA)", short: "CRDT" },
      { name: "JWT", icon: "jwt" },
      { name: "RBAC", short: "AC" },
    ],
  },
];

export const highlights = [
  {
    kicker: "Problem solving",
    value: "450+",
    title: "DSA problems solved",
    body: "Across LeetCode, GeeksforGeeks and Codeforces.",
    links: [
      { label: "LeetCode", href: links.leetcode },
      { label: "GeeksforGeeks", href: links.geeksforgeeks },
    ],
  },
  {
    kicker: "Certification",
    value: "100/100",
    title: "GenAI Workshop, LNMIIT",
    body: "A full-stack generative AI curriculum, completed with a perfect score.",
  },
  {
    kicker: "Hackathon",
    value: "CodeFlow AI",
    title: "Launched a serverless AI app",
    body: "A hackathon build that generates AI-guided learning roadmaps.",
  },
  {
    kicker: "Leadership",
    value: "7 to 10",
    title: "Creative Team Lead, ACM LNMIIT",
    body: "Led design and branding for two chapter-wide student chapter events.",
  },
];

export const education = [
  {
    school: "The LNM Institute of Information Technology",
    detail: "B.Tech, Communication & Computer Engineering",
    place: "Jaipur, Rajasthan",
    period: "2023 to 2027",
  },
  {
    school: "Aadharshila 'The School'",
    detail: "Class X: 95.6%  ·  Class XII: 96.4%",
    place: "",
    period: "2020 to 2022",
  },
];

export const contact = {
  note: "I'm looking for a full-time engineering role starting in 2027, ideally on a team where the backend is the hard part. If that sounds like yours, I'd like to hear about it.",
};

// The lit nodes on the hero sphere: the page's own content, in short form.
// Defined last so the project names come from `projects` rather than being
// typed twice and drifting apart. Both lines stay short on purpose — they
// have to be readable while the node carrying them is moving.
export const orbitLinks = [
  ...projects.map((project) => ({ call: project.name, note: project.category })),
  { call: "Marine Edge", note: "SDE intern · 2025" },
  { call: "7,000+ users", note: "backend I shipped" },
  { call: "99.9% uptime", note: "100+ payments a day" },
  { call: "Kafka", note: "event-driven services" },
  { call: "pgvector", note: "semantic search" },
  { call: "450+ DSA", note: "LeetCode · GFG" },
  { call: "LNMIIT Jaipur", note: "B.Tech · 2027" },
];
