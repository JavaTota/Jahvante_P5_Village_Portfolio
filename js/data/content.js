// Content is deliberately separate from the p5 sketch so projects can be added without touching game logic.
// Professional details are based on the supplied resume and reference letters.
export const buildings = [
  { id:'projects', name:'PROJECT LAB', room:'Projects & case studies', short:'The things I build', icon:'⌘', color:'#ef8e67', x:8, y:7, w:9, h:7, doorX:12, doorY:14, description:'Explore three featured software projects, with their architecture, tech stack, live links and repositories.' },
  { id:'experience', name:'GUILD HALL', room:'Professional experience', short:'Where I have worked', icon:'★', color:'#678cc6', x:28, y:5, w:9, h:7, doorX:32, doorY:12, description:'See my freelance work, FinSight AI backend role, and Trep DigitalX internship — including my work for RIBER Italia.' },
  { id:'skills', name:'SKILL SHOP', room:'Technical skills', short:'Tools & technologies', icon:'◆', color:'#63ad8b', x:47, y:7, w:9, h:7, doorX:51, doorY:14, description:'View my frontend, backend, databases, testing, delivery tools, and the skills I am learning next.' },
  { id:'about', name:'MY HOME', room:'About & education', short:'The developer behind the game', icon:'⌂', color:'#b492d5', x:12, y:28, w:9, h:7, doorX:16, doorY:35, description:'Meet the developer behind the alien, read about my approach to building software, and see my education.' },
  { id:'credentials', name:'TROPHY HALL', room:'Certifications & references', short:'Badges, diplomas & references', icon:'♛', color:'#d9ae54', x:28, y:28, w:9, h:7, doorX:32, doorY:35, description:'View my Coding Temple specialist badges, diplomas, course certificates, and professional recommendation letters.' },
  { id:'contact', name:'POST OFFICE', room:'Contact & links', short:'Start a conversation', icon:'✉', color:'#e0ad5c', x:43, y:28, w:9, h:7, doorX:47, doorY:35, description:'Send a message, connect on LinkedIn, inspect my GitHub, or download my résumé.' },
];

export const projects = [
  {
    title: 'Advanced API Development Platform', type:'BACKEND / REST API', year:'2026',
    summary:'Secure Flask API with JWT authentication, relational data modeling, Pytest, interactive API docs, CI/CD, and Render deployment.',
    details:'A backend-focused engineering project emphasizing documented endpoints, authentication and maintainable architecture.',
    stack:['Python','Flask','SQLAlchemy','JWT','Swagger / OpenAPI','Pytest','GitHub Actions'],
    repo:'https://github.com/JavaTota/Advanced-API-Development-BE', live:'https://advanced-api-development-be.onrender.com/api/docs/'
  },
  {
    title:'GameFilter', type:'FRONTEND / PRODUCT', year:'2026',
    summary:'Responsive game-discovery application powered by an external REST API, with dynamic search and filtering.',
    details:'Transforms external game information into a searchable, responsive user interface.',
    stack:['React','TypeScript','REST APIs','Vercel'],
    repo:'https://github.com/JavaTota/games-filter', live:'https://gamefilter.vercel.app/'
  },
  {
    title:'E-Commerce Store', type:'FULL-STACK / WEB APP', year:'2026',
    summary:'React storefront connected to an Express and MongoDB backend with app state, cloud image storage, and CI/CD workflows.',
    details:'An end-to-end application demonstrating interface, server, persistence, and deployment work.',
    stack:['React','Express.js','MongoDB','State Management','Cloudinary','CI/CD'],
    repo:'https://github.com/JavaTota/ecommerce-store', live:'https://advanced-ecommerce-store.vercel.app/'
  },
];

export const experience = [
  {company:'Independent', role:'Freelance Full-Stack Developer & Consultant', dates:'OCT 2025 — PRESENT', location:'REMOTE · U.S. & EUROPE', description:'Develop web and mobile applications for small businesses and professionals. Translate requirements into UI, APIs, authentication, database design, testing, SEO, deployment and revisions.'},
  {company:'FinSight AI · Tech Residency', role:'Backend Developer', dates:'MAY — JUL 2026', location:'REMOTE · U.S.', description:'Built Python/Flask/FastAPI backend services and REST endpoints for an AI-powered investment intelligence platform. Integrated market-data workflows and contributed to AI-chat features with a five-person Agile team.'},
  {company:'Trep DigitalX', role:'Web Design & Development Intern', dates:'AUG 4 — OCT 17, 2025', location:'REMOTE · ITALY', description:'Developed web pages for AI-agent services and delivered client work, including the complete RIBER Italia website. Worked with WordPress and Elementor, on-page SEO / Rank Math, team coordination and client feedback; also explored AI automation and n8n.'}
];

export const skillGroups = [
  {label:'FRONTEND', items:['React','TypeScript','JavaScript','Next.js','HTML / CSS','Tailwind CSS','Zustand','React Router']},
  {label:'BACKEND', items:['Python','Flask','FastAPI','Node.js','Express.js','REST APIs','JWT','SQLAlchemy']},
  {label:'DATA & CLOUD', items:['PostgreSQL','MySQL','MongoDB','SQLite','Supabase','Firebase','Cloudinary']},
  {label:'TESTING & DELIVERY', items:['Pytest','Jest','Vitest','React Testing Library','GitHub Actions','Swagger / OpenAPI','Render','Vercel']},
  {label:'TOOLS & WORKFLOW', items:['Git / GitHub','Postman','Figma','WordPress','SEO','Agile / Scrum','Developer Tools']}
];

export const education = [
  {school:'University of London', program:'BSc Computer Science', period:'In progress'},
  {school:'App Academy', program:'Full-Stack Software Engineering Program', period:'Jan — Jul 2026'},
  {school:'Mia Academy', program:'Front-End Development Bootcamp', period:'Nov 2024 — Nov 2025'},
];
export const urls = {github:'https://github.com/JavaTota',linkedin:'https://www.linkedin.com/in/jahvantetota/',email:'mailto:jahvanteisatota@gmail.com',resume:'./assets/Jahvante_Tota_Resume.pdf'};

// All credential images and documents are local assets; no third-party accounts or embeds are required.
export const badges = [
  { title:'Backend Specialist', issuer:'Coding Temple', image:'./assets/credentials/badge-backend-specialist.png', description:'Backend development specialization badge.' },
  { title:'Frontend Specialist', issuer:'Coding Temple', image:'./assets/credentials/badge-frontend-specialist.png', description:'Frontend development specialization badge.' },
];
export const certificates = [
  { title:'Full-Stack Software Engineering', issuer:'Coding Temple', date:'July 22, 2026', type:'COMPLETION CERTIFICATE', preview:'coding-temple-full-stack.webp', pdf:'coding-temple-full-stack.pdf' },
  { title:'Software Engineering', issuer:'Coding Temple', date:'July 22, 2026', type:'COMPLETION CERTIFICATE', preview:'coding-temple-software-engineering.webp', pdf:'coding-temple-software-engineering.pdf' },
  { title:'Web Developer Front-End', issuer:'Mia Academy / IUL', date:'November 7, 2025', type:'SPECIALIZATION DIPLOMA · 100/100', preview:'mia-academy-frontend.webp', pdf:'mia-academy-frontend.pdf' },
  { title:'Node.js, Express, MongoDB & More', issuer:'Udemy · Jonas Schmedtmann', date:'July 23, 2025', type:'COURSE COMPLETION · 42 HOURS', preview:'udemy-node-express-mongodb.webp', pdf:'udemy-node-express-mongodb.pdf' },
  { title:'Web Developer Internship · Trep DigitalX', issuer:'Mia Academy', date:'November 7, 2025', type:'INTERNSHIP ATTENDANCE', preview:'mia-trep-internship.webp', pdf:'mia-trep-internship.pdf' },
];
export const recommendations = [
  { title:'Davide Pirola', issuer:'Trep DigitalX', description:'Recommendation covering website development, client delivery, initiative, teamwork, and AI-agent/automation exposure.', preview:'recommendation-trep-digitalx.webp', pdf:'recommendation-trep-digitalx.pdf' },
  { title:'Ellijah Jimenez', issuer:'Coding Temple', description:'Recommendation covering technical ownership, teamwork, communication, and leadership in the Tech Residency.', preview:'recommendation-coding-temple.webp', pdf:'recommendation-coding-temple.pdf' },
];
export const additionalTraining = [
  { title:'First Aid', issuer:'Mia Academy', date:'November 7, 2025', preview:'mia-first-aid.webp', pdf:'mia-first-aid.pdf' },
  { title:'Data Handling', issuer:'Mia Academy', date:'November 7, 2025', preview:'mia-data-handling.webp', pdf:'mia-data-handling.pdf' },
];
