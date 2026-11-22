import { designFocus, experiences, projects, technologies } from "../constants";

export function projectAnchor(name) {
  return `project-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

export function projectFromHash(hash) {
  return projects.find((project) => hash === `#${projectAnchor(project.name)}`);
}

export const searchSections = [
  { id: "projects", title: "Projects", detail: "Desktop, web, and mobile applications", href: "#projects" },
  { id: "skills", title: "Tech stack", detail: "Languages, frameworks, and tools", href: "#skills" },
  { id: "work", title: "Experience", detail: "Internships and engineering work", href: "#work" },
  { id: "about", title: "Overview", detail: "Full-stack development and system design", href: "#about", keywords: designFocus },
  { id: "contact", title: "Contact", detail: "Get in touch", href: "#contact", keywords: ["hire", "email"] },
];

const entries = [
  ...searchSections,
  ...projects.map(({ name, type, description, tags }) => ({
    id: projectAnchor(name),
    title: name,
    detail: type[0].toUpperCase() + type.slice(1) + " project",
    href: `#${projectAnchor(name)}`,
    project: true,
    keywords: [description, ...tags.map(({ name: tag }) => tag)],
  })),
  ...experiences.map(({ title, company_name, subtitle, points }, index) => ({
    id: `experience-${index}`,
    title,
    detail: company_name,
    href: "#work",
    keywords: [subtitle, ...points],
  })),
  ...technologies.map(({ name }) => ({
    id: `technology-${name}`,
    title: name,
    detail: "Tech stack",
    href: "#skills",
  })),
];

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const index = entries.map((entry) => {
  const title = normalize(entry.title);
  return { entry, title, text: normalize([title, entry.detail, ...(entry.keywords ?? [])].join(" ")) };
});

export function searchPortfolio(query) {
  const input = normalize(query);
  if (!input) return query.trim() ? [] : searchSections;
  const words = input.split(" ");
  return index
    .filter(({ text }) => words.every((word) => text.includes(word)))
    .sort((a, b) => Number(b.title.includes(input)) - Number(a.title.includes(input)))
    .map(({ entry }) => entry);
}
