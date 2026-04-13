import {
  mobile,
  backend,
  creator,
  web,
  javascript,
  typescript,
  html,
  css,
  reactjs,
  redux,
  tailwind,
  nodejs,
  mongodb,
  git,
  figma,
  docker,
  afiml,
  irlLogo,
  irlInventory,
  irlInventory2,
  irlInventory3,
  miniCloud,
  miniCloud2,
  miniCloud3,
  irlApp1,
  irlApp2,
  irlApp3,
  mha1,
  mha2,
  mha3,
  threejs,
  rawTorrent3,
  rawTorrent4,
  rawTorrent5,
  rawTorrent6,
  rawTorrent7,
} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "work",
    title: "Work",
  },
  {
    id: "projects",
    title: "Projects",
  },
  {
    id: "contact",
    title: "Contact",
  },
];

const services = [
  {
    title: "Full Stack Developer",
    icon: web,
  },
  {
    title: "React / Next.js Dev",
    icon: mobile,
  },
  {
    title: "Backend & API Dev",
    icon: backend,
  },
  {
    title: "Penetration Tester",
    icon: creator,
  },
];

const technologies = [
  {
    name: "HTML 5",
    icon: html,
  },
  {
    name: "CSS 3",
    icon: css,
  },
  {
    name: "JavaScript",
    icon: javascript,
  },
  {
    name: "TypeScript",
    icon: typescript,
  },
  {
    name: "React JS",
    icon: reactjs,
  },
  {
    name: "Redux Toolkit",
    icon: redux,
  },
  {
    name: "Tailwind CSS",
    icon: tailwind,
  },
  {
    name: "Node JS",
    icon: nodejs,
  },
  {
    name: "MongoDB",
    icon: mongodb,
  },
  {
    name: "Three JS",
    icon: threejs,
  },
  {
    name: "git",
    icon: git,
  },
  {
    name: "figma",
    icon: figma,
  },
  {
    name: "docker",
    icon: docker,
  },
];

const experiences = [
  {
    title: "Developer Intern",
    company_name: "Innovation and Robotics Lab, BVCOE",
    icon: irlLogo,
    iconBg: "#0d1b0d",
    date: "Jan 2023 – Jan 2025",
    points: [
      "Selected as Developer Intern at the Robotics Society of BVCOE — joined from 2nd year of engineering.",
      "Worked on drone development and automation including flight control scripting and hardware interfacing.",
      "Managed Apache and Nginx server deployments, sometimes running on a Raspberry Pi 4 for low-cost on-site hosting.",
      "Built a collaborative internal cloud server using old unused hard drives networked together via NAS — zero-waste hardware initiative.",
      "Promoted to Programming Head — led the software development wing of the lab during 3rd year of engineering.",
      "Built I&RL Inventory Management App (Flutter + Firebase) — streamlined equipment borrowing for 30 lab users, reducing manual tracking by 80% following a complete SDLC approach.",
      "Implemented automated reminder system using Firebase Cloud Messaging API, improving equipment return rates by 45%.",
      "Mentored junior developer interns, conducted code reviews and set coding standards for the team.",
    ],
  },
  {
    title: "Project Trainee Intern",
    company_name: "AFIML",
    icon: afiml,
    iconBg: "#1a1a2e",
    date: "May 2025 – Aug 2025",
    points: [
      "Developed a secure digital payments mobile application (GPay-like) using Flutter integrating live financial APIs.",
      "Implemented HTTPS encryption, token-based authentication, and secure session handling to protect financial transactions and user credentials.",
      "Applied secure coding practices including input validation, error handling, and protection against OWASP Mobile Top 10 vulnerabilities.",
      "Ensured safe handling of sensitive financial data and compliance with fintech security best practices.",
      "Gained deep exposure to mobile security architecture — bridging cybersecurity thinking with full-stack mobile development.",
    ],
  },
];

const testimonials = [
  {
    testimonial:
      "I thought it was impossible to make a website as beautiful as our product, but Rick proved me wrong.",
    name: "Sara Lee",
    designation: "CFO",
    company: "Acme Co",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    testimonial:
      "I've never met a web developer who truly cares about their clients' success like Rick does.",
    name: "Chris Brown",
    designation: "COO",
    company: "DEF Corp",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    testimonial:
      "After Rick optimized our website, our traffic increased by 50%. We can't thank them enough!",
    name: "Lisa Wang",
    designation: "CTO",
    company: "456 Enterprises",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
  },
];

const projects = [
  {
    name: "RawTorrent",
    type: "desktop",
    description:
      "A high-performance modern Desktop BitTorrent client built with web technologies but designed to operate seamlessly as a native desktop application. Implements an isomorphic, multi-process architecture with a Next.js frontend and a backend daemon powered by Node.js, Express, WebTorrent, and bittorrent-dht to bypass Electron memory constraints. Features granular protocol controls including geospatial swarm mapping, live WebSocket integration, and a dedicated sequential writing pipeline.",
    tags: [
      { name: "nextjs", color: "blue-text-gradient" },
      { name: "electron", color: "green-text-gradient" },
      { name: "nodejs", color: "pink-text-gradient" },
      { name: "webtorrent", color: "blue-text-gradient" },
      { name: "bittorrent-dht", color: "green-text-gradient" },
      { name: "websockets", color: "pink-text-gradient" },
      { name: "express", color: "blue-text-gradient" },
    ],
    images: [rawTorrent3, rawTorrent4, rawTorrent5, rawTorrent6, rawTorrent7],
    source_code_link: "https://github.com/CodeSageAbhijit/raw-torrent",
    exe_link: "https://github.com/CodeSageAbhijit/raw-torrent/releases/download/v0.1.0/RawTorrent.Setup.0.1.0.exe",
  },
  {
    name: "I&RL Inventory Dashboard",
    type: "web",
    description:
      "Flutter + Firebase inventory management system for the Innovation & Robotics Lab. Tracks equipment requests, approvals, and stock levels — reducing manual tracking overhead by 80%.",
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "typescript", color: "green-text-gradient" },
      { name: "firebase", color: "pink-text-gradient" },
      { name: "vercel", color: "blue-text-gradient" },
    ],
    images: [irlInventory, irlInventory2, irlInventory3],
    source_code_link: "https://github.com/CodeSageAbhijit/irl_admin_dashboard",
    live_link: "https://irl-admin-dashboard.vercel.app/",
  },
  {
    name: "Mini Cloud",
    type: "web",
    description:
      "Converted old hard drives into a personal cloud system using a Raspberry Pi (Ubuntu), accessible over the internet via Ngrok tunneling and port forwarding. Built a simple web UI with Flask.",
    tags: [
      { name: "flask", color: "blue-text-gradient" },
      { name: "raspberry-pi", color: "green-text-gradient" },
      { name: "ngrok", color: "pink-text-gradient" },
      { name: "html", color: "blue-text-gradient" },
      { name: "css", color: "green-text-gradient" },
      { name: "javascript", color: "pink-text-gradient" },
      { name: "php", color: "blue-text-gradient" },
    ],
    images: [miniCloud, miniCloud2, miniCloud3],
    source_code_link: "https://github.com/CodeSageAbhijit/mini_cloud",
    live_link: "https://minicloud.vercel.app/",
  },
  {
    name: "I&RL Inventory App",
    type: "mobile",
    description:
      "Flutter mobile app built for the Innovation & Robotics Lab robotics society to digitalise component borrowing. Features real-time request management, wishlist, and admin approval flow — actively serving 100+ students.",
    tags: [
      { name: "flutter", color: "blue-text-gradient" },
      { name: "firebase", color: "green-text-gradient" },
      { name: "dart", color: "pink-text-gradient" },
    ],
    images: [irlApp1, irlApp2, irlApp3],
    source_code_link: "https://github.com/CodeSageAbhijit",
    apk_link: "https://drive.google.com/file/d/1p0hH_cj27MMg9cqcek4tCIkWnKWME3z_/view?usp=drive_link",
  },
  {
    name: "My Health App",
    type: "mobile",
    description:
      "Freelance Flutter app connecting patients with psychiatrists, counselors, and wellness buddies. Features mood tracking, session booking, real-time chat, and a wallet system — serving 1000+ users via REST API backend.",
    tags: [
      { name: "flutter", color: "blue-text-gradient" },
      { name: "rest-api", color: "green-text-gradient" },
      { name: "dart", color: "pink-text-gradient" },
    ],
    images: [mha1, mha2, mha3],
    source_code_link: "https://github.com/CodeSageAbhijit",
    apk_blocked: true,
  },
];

export { services, technologies, experiences, testimonials, projects };
