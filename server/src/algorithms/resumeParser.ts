// ── Category keywords for accurate matching ───────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  ai: [
    "machine learning", "deep learning", "tensorflow", "pytorch",
    "scikit-learn", "nlp", "computer vision", "llm", "mlops",
    "pandas", "numpy", "opencv", "huggingface", "langchain",
    "neural network", "generative ai", "data scientist",
    "reinforcement learning", "chatgpt", "openai",
  ],
  software: [
    "react", "angular", "vue", "next.js", "nextjs", "node.js",
    "nodejs", "express", "nestjs", "php", "laravel", "wordpress",
    "django", "fastapi", "flask", "flutter", "react native",
    "spring", "spring boot", "ruby", "rails", "golang",
    "typescript", "javascript", "java", "kotlin", "swift",
    "fullstack", "frontend", "backend", "web developer",
    "unity", "game developer", "elixir", "scala",
  ],
  data: [
    "tableau", "power bi", "spark", "hadoop", "airflow",
    "dbt", "snowflake", "looker", "etl", "data warehouse",
    "data analysis", "statistics", "data visualization",
    "kafka", "databricks", "business intelligence",
    "data engineer", "data analyst",
  ],
  cybersecurity: [
    "cybersecurity", "penetration testing", "ethical hacking",
    "network security", "firewall", "encryption", "siem", "soc",
    "vulnerability assessment", "wireshark", "metasploit",
    "kali linux", "zero trust", "red team", "blue team",
    "threat intelligence", "incident response", "malware",
  ],
  cloud: [
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
    "ansible", "jenkins", "ci/cd", "devops", "serverless",
    "linux", "nginx", "helm", "cloudformation",
    "site reliability", "sre", "platform engineer",
  ],
  healthcare: [
    "ehr", "epic", "cerner", "hl7", "fhir", "hipaa", "dicom",
    "telemedicine", "telehealth", "nursing", "patient care",
    "pharmacology", "radiology", "medical coding",
    "health informatics", "clinical research", "biostatistics",
    "mental health", "physical therapy", "icd-10",
  ],
  finance: [
    "financial analysis", "financial modeling", "bloomberg terminal",
    "risk management", "portfolio management", "derivatives",
    "equity research", "investment banking", "accounting", "gaap",
    "ifrs", "cfa", "trading", "algorithmic trading",
    "quantitative analysis", "fintech", "cryptocurrency",
    "auditing", "valuation", "hedge fund",
  ],
  green: [
    "solar energy", "wind energy", "renewable energy", "sustainability",
    "esg", "carbon footprint", "climate change", "environmental science",
    "gis", "leed", "energy audit", "electric vehicles",
    "waste management", "energy efficiency", "carbon capture",
    "biomass", "hydrogen fuel", "clean tech",
  ],
  blockchain: [
    "solidity", "ethereum", "web3", "smart contracts", "blockchain",
    "defi", "nft", "hardhat", "truffle", "metamask",
    "quantum computing", "qiskit", "polkadot", "solana",
    "zero knowledge", "dapp", "tokenomics",
  ],
  design: [
    "figma", "sketch", "adobe xd", "photoshop", "illustrator",
    "ux design", "ui design", "wireframing", "prototyping",
    "user research", "design thinking", "motion design",
    "brand design", "design system", "indesign",
  ],
};

const SKILL_DATABASE: Record<string, string[]> = {
  languages: [
    "python", "javascript", "typescript", "java", "c++", "c#", "go",
    "rust", "swift", "kotlin", "ruby", "php", "scala", "r", "matlab",
    "perl", "bash", "shell", "powershell",
  ],
  frontend: [
    "react", "angular", "vue", "nextjs", "html", "css", "tailwind",
    "sass", "scss", "webpack", "vite", "redux", "graphql", "rest api",
    "typescript", "javascript", "bootstrap", "jquery",
  ],
  backend: [
    "node.js", "nodejs", "express", "django", "flask", "fastapi",
    "spring", "laravel", "rails", "asp.net", "nestjs", "microservices",
  ],
  databases: [
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "cassandra", "dynamodb", "sqlite", "oracle", "firebase",
  ],
  cloud: [
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
    "ansible", "jenkins", "ci/cd", "devops", "linux", "nginx",
    "serverless", "lambda", "s3", "ec2",
  ],
  ai: [
    "machine learning", "deep learning", "tensorflow", "pytorch",
    "scikit-learn", "nlp", "computer vision", "llm", "mlops",
    "pandas", "numpy", "opencv", "huggingface", "langchain",
    "neural network", "data science",
  ],
  data: [
    "tableau", "power bi", "excel", "sql", "spark", "hadoop",
    "airflow", "dbt", "snowflake", "looker", "data analysis",
    "statistics", "data visualization", "etl", "data warehouse",
  ],
  security: [
    "cybersecurity", "penetration testing", "ethical hacking",
    "network security", "firewall", "encryption", "siem", "soc",
    "vulnerability assessment", "wireshark", "metasploit", "kali linux",
  ],
  design: [
    "figma", "sketch", "adobe xd", "photoshop", "illustrator",
    "ux design", "ui design", "wireframing", "prototyping",
    "user research", "design thinking", "indesign",
  ],
  blockchain: [
    "solidity", "ethereum", "web3", "smart contracts", "blockchain",
    "defi", "nft", "hardhat", "truffle", "metamask",
  ],
  soft: [
    "leadership", "communication", "teamwork", "problem solving",
    "project management", "agile", "scrum", "jira", "confluence",
  ],
  healthcare: [
    "ehr", "electronic health records", "epic", "cerner", "meditech",
    "hl7", "fhir", "dicom", "medical imaging", "clinical trials",
    "hipaa", "icd-10", "cpt codes", "telemedicine", "telehealth",
    "nursing", "patient care", "anatomy", "pharmacology", "radiology",
    "medical coding", "health informatics", "public health",
    "clinical research", "medical device", "biostatistics",
    "healthcare management", "mental health", "physical therapy",
  ],
  finance: [
    "financial analysis", "financial modeling", "valuation",
    "bloomberg terminal", "vba", "risk management",
    "portfolio management", "derivatives", "fixed income",
    "equity research", "investment banking", "accounting", "gaap",
    "ifrs", "quickbooks", "sap", "cfa", "frm", "series 7",
    "trading", "algorithmic trading", "quantitative analysis",
    "fintech", "payment systems", "cryptocurrency",
    "tax preparation", "auditing", "forecasting", "budgeting",
  ],
  green: [
    "solar energy", "wind energy", "renewable energy", "sustainability",
    "esg", "carbon footprint", "emissions", "climate change",
    "environmental science", "gis", "autocad", "energy modeling",
    "leed", "energy audit", "power systems", "grid management",
    "battery storage", "electric vehicles", "ev", "hydrogen fuel",
    "environmental impact assessment", "waste management",
    "circular economy", "green building", "biomass",
    "energy efficiency", "carbon capture", "clean tech",
  ],
};

const ALL_SKILLS = Object.values(SKILL_DATABASE).flat();

// ── Extract skills from resume text ──────────────────────────
export const extractSkillsFromResume = (text: string): string[] => {
  const lower = text.toLowerCase();

  const found = ALL_SKILLS.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex   = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(lower);
  });

  const unique = [...new Set(found)].map(
    (s) => s.charAt(0).toUpperCase() + s.slice(1)
  );
  return unique;
};

// ── Match resume skills against CATEGORY KEYWORDS ────────────
// ✅ Uses CATEGORY_KEYWORDS not job.topSkills
export const calculateSkillMatch = (
  resumeSkills:    string[],
  categoryName:    string,    // ← category name e.g. "ai", "software"
): number => {
  const keywords = CATEGORY_KEYWORDS[categoryName] ?? [];
  if (keywords.length === 0) return 0;

  const resumeLower   = resumeSkills.map((s) => s.toLowerCase());

  // ✅ Exact match only — prevents "java" matching "javascript"
  const matched = keywords.filter((kw) =>
    resumeLower.some((rs) => rs === kw || rs === kw.toLowerCase())
  ).length;

  return Math.round((matched / keywords.length) * 100);
};

// ── Find skill gaps ───────────────────────────────────────────
export const findSkillGaps = (
  resumeSkills:   string[],
  categoryName:   string,
): { skill: string; importance: "high" | "medium" | "low" }[] => {
  const keywords    = CATEGORY_KEYWORDS[categoryName] ?? [];
  const resumeLower = resumeSkills.map((s) => s.toLowerCase());

  const missing = keywords.filter(
    (kw) => !resumeLower.some((rs) => rs === kw.toLowerCase())
  );

  return missing.slice(0, 8).map((skill, idx) => ({
    skill,
    importance: idx < 2 ? "high" : idx < 4 ? "medium" : "low",
  }));
};

// ── Generate summary ──────────────────────────────────────────
export const generateResumeSummary = (
  skills:       string[],
  matchedTitle: string,
  matchScore:   number,
  demandScore:  number,
): string => {
  const level =
    matchScore >= 70 ? "strong"   :
    matchScore >= 40 ? "moderate" :
                       "partial";

  return (
    `Your resume shows a ${level} match for ${matchedTitle} with a ${matchScore}% skill alignment. ` +
    `This career currently has a demand score of ${demandScore}/100. ` +
    `You have ${skills.length} relevant skills identified. ` +
    (matchScore >= 70
      ? "You are well positioned to apply for roles in this field."
      : "Adding a few key skills could significantly improve your market position.")
  );
};

// ── Calculate resume score ────────────────────────────────────
export const calculateResumeScore = (
  skillCount:  number,
  matchScore:  number,
  demandScore: number,
): number => {
  const skillWeight  = Math.min(skillCount / 15, 1) * 40;
  const matchWeight  = (matchScore  / 100) * 35;
  const demandWeight = (demandScore / 100) * 25;
  return Math.round(skillWeight + matchWeight + demandWeight);
};