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
  carrent,
  jobit,
  tripguide,
  threejs,
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
    date: "Jan 2023 – Dec 2023",
    points: [
      "Selected as Developer Intern at the Robotics Society of BVCOE — joined from 2nd year of engineering.",
      "Worked on drone development and automation including flight control scripting and hardware interfacing.",
      "Managed Apache and Nginx server deployments, sometimes running on a Raspberry Pi 4 for low-cost on-site hosting.",
      "Built a collaborative internal cloud server using old unused hard drives networked together via NAS — zero-waste hardware initiative.",
      "Gained hands-on experience with Robot Operating System (ROS) and Ubuntu for robotics programming workflows.",
    ],
  },
  {
    title: "Programming Head",
    company_name: "Innovation and Robotics Lab, BVCOE",
    icon: irlLogo,
    iconBg: "#0d1b0d",
    date: "Jan 2024 – Jan 2025",
    points: [
      "Promoted to Programming Head — led the software development wing of the lab during 3rd year of engineering.",
      "Built I&RL Inventory Management App (Flutter + Firebase) — streamlined equipment borrowing for 30 lab users, reducing manual tracking by 80% following a complete SDLC approach.",
      "Implemented automated reminder system using Firebase Cloud Messaging API, improving equipment return rates by 45%.",
      "Mentored junior developer interns, conducted code reviews and set coding standards for the team.",
      "Coordinated cross-functional collaboration between programming, robotics, and event management teams.",
    ],
  },
  {
    title: "President",
    company_name: "Innovation and Robotics Lab, BVCOE",
    icon: irlLogo,
    iconBg: "#0d1b0d",
    date: "Feb 2025 – Feb 2026",
    points: [
      "Elected President of the Innovation and Robotics Lab — led the society through final year of engineering.",
      "Oversaw all technical, operational, and strategic decisions for the lab's projects and events.",
      "Continued drone R&D and server infrastructure management while guiding the team's technical roadmap.",
      "Scaled the internal NAS cloud server and maintained uptime for lab infrastructure across multiple concurrent projects.",
      "Represented the lab in college-level technical fests and inter-college robotics competitions.",
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
    name: "Car Rent",
    description:
      "Web-based platform that allows users to search, book, and manage car rentals from various providers, providing a convenient and efficient solution for transportation needs.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "mongodb",
        color: "green-text-gradient",
      },
      {
        name: "tailwind",
        color: "pink-text-gradient",
      },
    ],
    image: carrent,
    source_code_link: "https://github.com/",
  },
  {
    name: "Job IT",
    description:
      "Web application that enables users to search for job openings, view estimated salary ranges for positions, and locate available jobs based on their current location.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "restapi",
        color: "green-text-gradient",
      },
      {
        name: "scss",
        color: "pink-text-gradient",
      },
    ],
    image: jobit,
    source_code_link: "https://github.com/",
  },
  {
    name: "Trip Guide",
    description:
      "A comprehensive travel booking platform that allows users to book flights, hotels, and rental cars, and offers curated recommendations for popular destinations.",
    tags: [
      {
        name: "nextjs",
        color: "blue-text-gradient",
      },
      {
        name: "supabase",
        color: "green-text-gradient",
      },
      {
        name: "css",
        color: "pink-text-gradient",
      },
    ],
    image: tripguide,
    source_code_link: "https://github.com/",
  },
];

export { services, technologies, experiences, testimonials, projects };
