import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { fileURLToPath } from "url";

// __dirname replacement for ES modules

// const __filename = fileURLToPath(import.meta.url);
// const __dirname  = path.dirname(__filename);

// const CSV_PATH  = path.resolve(__dirname, "../data/job_postings.csv");
// const JSON_PATH = path.resolve(__dirname, "../data/jobData.json");

// const raw = fs.readFileSync(CSV_PATH, "utf-8");

// const records: Record<string, string>[] = parse(raw, {
//   columns:          true,
//   skip_empty_lines: true,
//   trim:             true,
// });

// console.log("CSV loaded");
// console.log("Columns found:", Object.keys(records[0] ?? {}));
// console.log("Total rows:",    records.length);
// console.log("Sample row:",    records[0]);
// import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const CSV_PATH = path.resolve(__dirname, "../data/job_postings.csv");
console.log(CSV_PATH)
const JSON_PATH = path.resolve(__dirname, "../data/jobData.json");

interface RawRow {
  job_id: string;
  title: string;
  description: string;
  max_salary: string;
  med_salary: string;
  min_salary: string;
  pay_period: string;
  formatted_work_type: string;
  location: string;
  remote_allowed: string;
  formatted_experience_level: string;
  skills_desc: string;
  work_type: string;
  currency: string;
}
const CATEGORY_KEYWORD: Record<string, string[]> = {
  ai: [
    "machine learning",
    "ml engineer",
    "ai engineer",
    "artificial intelligence",
    "deep learning",
    "nlp",
    "data scientist",
    "computer vision",
    "llm",
    "mlops",
    "prompt engineer",
    "neural",
    "tensorflow",
    "pytorch",
  ],
  software: [
    "software engineer",
    "software developer",
    "full stack",
    "fullstack",
    "frontend",
    "front-end",
    "backend",
    "back-end",
    "web developer",
    "react",
    "node",
    "javascript",
    "typescript",
    "java developer",
    "python developer",
    ".net",
    "mobile developer",
    "ios",
    "android",
  ],
  data: [
    "data analyst",
    "data engineer",
    "business analyst",
    "bi analyst",
    "business intelligence",
    "data warehouse",
    "analytics engineer",
    "tableau",
    "power bi",
    "sql developer",
    "database analyst",
  ],
  cybersecurity: [
    "security engineer",
    "security analyst",
    "cybersecurity",
    "cyber security",
    "penetration",
    "soc analyst",
    "information security",
    "network security",
    "cloud security",
    "devsecops",
    "ethical hacker",
  ],
  cloud: [
    "cloud engineer",
    "cloud architect",
    "devops",
    "site reliability",
    "sre",
    "aws",
    "azure",
    "gcp",
    "infrastructure engineer",
    "platform engineer",
    "kubernetes",
    "docker",
    "terraform",
  ],
  healthcare: [
    "nurse",
    "physician",
    "doctor",
    "medical",
    "clinical",
    "healthcare",
    "health",
    "pharmacist",
    "therapist",
    "radiologist",
    "surgeon",
    "dental",
    "pharmacy",
    "mental health",
    "physical therapist",
  ],
  finance: [
    "financial analyst",
    "finance",
    "accountant",
    "auditor",
    "banker",
    "investment",
    "trading",
    "fintech",
    "risk analyst",
    "quantitative",
    "actuary",
    "tax",
    "portfolio",
    "cfo",
    "controller",
  ],
  remote: [
    "remote",
    "work from home",
    "virtual assistant",
    "freelance",
    "telecommute",
    "distributed",
  ],
  green: [
    "solar",
    "wind energy",
    "sustainability",
    "environmental",
    "renewable",
    "green energy",
    "climate",
    "carbon",
    "clean energy",
    "esg",
  ],
  design: [
    "ux designer",
    "ui designer",
    "product designer",
    "graphic designer",
    "ux researcher",
    "visual designer",
    "interaction designer",
    "figma",
    "creative director",
    "art director",
  ],
};
// Classify a job title into a category
const classifyJob = (title: string): string | null => {
  const lower = title.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORD)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return null;
};

// Parse salary to yearly USD number => . Salary Normalization (IMPORTANT LOGIC)
const parasSalary = (row: RawRow): number | null => {
  const period = row.pay_period.toUpperCase();
  const raw = row.med_salary || row.max_salary || row.min_salary;
  if (!raw || row.currency !== "USD") return null;
  const amount = parseInt(raw);
  if (isNaN(amount) || amount <= 0) return null;

  if (period === "HOURLY") return Math.round(amount * 2080); //40 hrs/week × 52 weeks
  if (period === "MONTHLY") return Math.round(amount * 12);
  if (period === "YEARLY") return Math.round(amount);

  return null;
};

// ── Extract skills from title + skills_desc ───────────────────
const SKILL_KEYWORDS = [
  "Python", "JavaScript", "TypeScript", "Java", "SQL", "React", "Node.js",
  "AWS", "Azure", "Docker", "Kubernetes", "TensorFlow", "PyTorch", "Excel",
  "Tableau", "Power BI", "Git", "Linux", "Figma", "MongoDB", "PostgreSQL",
  "C++", "C#", "Go", "Rust", "Swift", "Kotlin", "Spark", "Hadoop",
  "Terraform", "Jenkins", "REST", "GraphQL", "Machine Learning", "AI",
];

const extractSkills = (title: string, desc: string): string[] => {
  const text   = `${title} ${desc}`.toLowerCase();
  const found  = SKILL_KEYWORDS.filter((sk) =>
    text.includes(sk.toLowerCase())
  );
  return found.length > 0 ? found.slice(0, 6) : ["See job description"];
};

const extractRole =(titles : string[]):string[]=>{
    const freq = new Map<string,number>();
    titles.forEach((t)=>{
        const clean = t.trim()
        freq.set(clean,(freq.get(clean) || 0)+1)
    }) 
    return Array.from(freq.entries()).sort((a,b)=>b[1] - a[1]).slice(0,5).map(([titles])=>titles)
}

// Extract top locations / industries
const extractLocation =(location:string[]):string[]=>{
    const freq = new Map<string,number>()
    location?.forEach((loc)=>{
        const state = loc.split(",")[1]?.trim() || loc?.trim()
        if(state) freq.set(state ,(freq.get(state) || 0)+1)
    })
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([loc]) => loc);
}
//Static enrichment data per category 
// These fields cannot be derived from the CSV so we keep them curated

const ENRICHMENT: Record<string, {
  demandScore:        number;
  growthRate:         number;
  trend:              "rising" | "declining" | "stable";
  keywords:           string[];
  historicalDemand:   number[];
  years:              number[];
  education:          string;
  summary:            string;
}> = {
  ai: {
    demandScore: 94, growthRate: 38, trend: "rising",
    keywords: ["artificial intelligence","machine learning","deep learning","neural network","ai","ml","python","tensorflow","pytorch","llm","gpt","automation","nlp","computer vision","mlops"],
    historicalDemand: [60,65,72,78,85,90,94], years: [2018,2019,2020,2021,2022,2023,2024],
    education: "Bachelor or Master in CS or related field",
    summary: "AI and ML roles are growing at 38% year over year. Highest demand is in model fine-tuning, MLOps, and applied AI.",
  },
  software: {
    demandScore: 88, growthRate: 25, trend: "rising",
    keywords: ["software","developer","programming","javascript","typescript","react","nodejs","python","fullstack","frontend","backend","web","api","devops","aws","github"],
    historicalDemand: [70,73,76,80,83,86,88], years: [2018,2019,2020,2021,2022,2023,2024],
    education: "Bachelor in CS or self-taught with portfolio",
    summary: "Software development remains the largest tech hiring category. Full stack and cloud-skilled developers are most in demand.",
  },
  data: {
    demandScore: 87, growthRate: 28, trend: "rising",
    keywords: ["data science","data analyst","analytics","sql","tableau","power bi","statistics","excel","business intelligence","spark","visualization","reporting"],
    historicalDemand: [55,62,68,74,79,83,87], years: [2018,2019,2020,2021,2022,2023,2024],
    education: "Bachelor in Statistics, Math, or CS",
    summary: "Data roles are expanding beyond tech into every industry. SQL and Python remain the core skills.",
  },
  cybersecurity: {
    demandScore: 91, growthRate: 35, trend: "rising",
    keywords: ["cybersecurity","security","hacking","penetration testing","network security","firewall","encryption","malware","ransomware","soc","incident response","cloud security"],
    historicalDemand: [65,70,75,80,85,88,91], years: [2018,2019,2020,2021,2022,2023,2024],
    education: "Bachelor in CS or Cybersecurity plus certifications",
    summary: "Cybersecurity has a critical talent shortage with 3.5 million unfilled positions globally.",
  },
  cloud: {
    demandScore: 89, growthRate: 30, trend: "rising",
    keywords: ["cloud","aws","azure","google cloud","kubernetes","docker","devops","terraform","serverless","microservices","infrastructure","sre","deployment"],
    historicalDemand: [58,65,72,78,83,86,89], years: [2018,2019,2020,2021,2022,2023,2024],
    education: "Bachelor in CS plus cloud certifications",
    summary: "Cloud adoption is accelerating across all industries. AWS leads at 32% market share.",
  },
  healthcare: {
    demandScore: 82, growthRate: 15, trend: "rising",
    keywords: ["healthcare","medical","nurse","doctor","hospital","clinical","patient","pharma","telehealth","ehr","physician","therapy","mental health","wellness"],
    historicalDemand: [68,70,78,75,78,80,82], years: [2018,2019,2020,2021,2022,2023,2024],
    education: "Degree in Nursing, Medicine, or Health Informatics",
    summary: "Healthcare is one of the most stable and growing job markets globally.",
  },
  finance: {
    demandScore: 80, growthRate: 18, trend: "stable",
    keywords: ["finance","fintech","banking","investment","trading","crypto","blockchain","financial analyst","risk","accounting","cfa","portfolio","economics"],
    historicalDemand: [72,73,68,74,76,78,80], years: [2018,2019,2020,2021,2022,2023,2024],
    education: "Bachelor in Finance, Economics, or CS",
    summary: "Finance is being disrupted by fintech. Quantitative and tech-finance hybrid roles are surging.",
  },
  remote: {
    demandScore: 65, growthRate: -12, trend: "declining",
    keywords: ["remote","work from home","wfh","virtual","online job","freelance","hybrid","telecommute","distributed","async","digital nomad"],
    historicalDemand: [40,42,85,78,72,68,65], years: [2018,2019,2020,2021,2022,2023,2024],
    education: "Varies by role",
    summary: "Remote job postings dropped 12% in 2024 as companies enforce return-to-office policies.",
  },
  green: {
    demandScore: 76, growthRate: 22, trend: "rising",
    keywords: ["green","sustainability","renewable energy","solar","wind","environment","climate","esg","carbon","clean energy","electric vehicle","ev","recycling"],
    historicalDemand: [45,50,55,60,65,71,76], years: [2018,2019,2020,2021,2022,2023,2024],
    education: "Bachelor in Environmental Science or Engineering",
    summary: "Green jobs are growing rapidly driven by government climate policies and corporate ESG commitments.",
  },
  design: {
    demandScore: 78, growthRate: 16, trend: "rising",
    keywords: ["design","ux","ui","user experience","figma","wireframe","prototype","product design","graphic design","adobe","interaction design","usability","visual design"],
    historicalDemand: [58,62,65,68,72,75,78], years: [2018,2019,2020,2021,2022,2023,2024],
    education: "Bachelor in Design, HCI, or self-taught with portfolio",
    summary: "UX design demand is growing as every company prioritises user experience. Figma is now the industry standard.",
  },
};

const TITLES: Record<string, string> = {
  ai:             "Artificial Intelligence & Machine Learning",
  software:       "Software Development",
  data:           "Data Science & Analytics",
  cybersecurity:  "Cybersecurity",
  cloud:          "Cloud Computing",
  healthcare:     "Healthcare & Medical",
  finance:        "Finance & Fintech",
  remote:         "Remote Work",
  green:          "Green Energy & Sustainability",
  design:         "UI/UX Design",
};
// ══════════════════════════════════════════════════════════════
// MAIN — Read CSV and build jobData.json
// ══════════════════════════════════════════════════════════════

const raw = fs.readFileSync(CSV_PATH,"utf-8")
const records = parse(raw,{
    columns : true,
    skip_empty_lines : true,
    trim : true
}) as RawRow[]

console.log(`Loaded ${records.length} rows from CSV`);
// group row by category 
const groups:Record<string,RawRow[]>={}
let classified = 0;

records.forEach((row)=>{
    const category = classifyJob(row.title)
      if (!category) return;
    if (!groups[category]) groups[category] = [];
  groups[category].push(row);
  classified++;
})
console.log(`Classified ${classified} / ${records.length} rows`);
console.log("Groups found:", Object.keys(groups).map(
  (k) => `${k}: ${groups[k]?.length ?? 0} jobs`
));

// build out array 
const output = Object.entries(groups).map(([category,row])=>{
    const enrich = ENRICHMENT[category];
     const salaries = row
    .map((r) => parasSalary(r))
    .filter((s): s is number => s !== null && s >= 20000 && s <= 500000);

  const avgSalary   = salaries.length > 0
    ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
    : 80000;

      const entrySalaries = row
    .filter((r) => ["EN","ENTRY_LEVEL",""].includes(r.formatted_experience_level))
    .map((r) => parasSalary(r))
    .filter((s): s is number => s !== null);

  const seniorSalaries = row
    .filter((r) => ["SE","MI","SENIOR","MID_SENIOR_LEVEL"].includes(r.formatted_experience_level))
    .map((r) => parasSalary(r))
    .filter((s): s is number => s !== null);

  const entryLevelSalary = entrySalaries.length > 0
    ? Math.round(entrySalaries.reduce((a, b) => a + b, 0) / entrySalaries.length)
    : Math.round(avgSalary * 0.7);

  const seniorLevelSalary = seniorSalaries.length > 0
    ? Math.round(seniorSalaries.reduce((a, b) => a + b, 0) / seniorSalaries.length)
    : Math.round(avgSalary * 1.4);

      // Remote availability
  const remoteCount = row.filter((r) => r.remote_allowed === "1").length;
  const remoteAvailability = Math.round((remoteCount / row.length) * 100);

    // Top skills, roles, locations
  const allSkills = row.flatMap((r) =>
    extractSkills(r.title, r.skills_desc)
  );
  const skillFreq = new Map<string, number>();
  allSkills.forEach((s) => skillFreq.set(s, (skillFreq.get(s) || 0) + 1));
  const topSkills = Array.from(skillFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([s]) => s);

  const topRoles     = extractRole(row.map((r) => r.title));
  const industries   = extractLocation(row.map((r) => r.location));

  return {
    category,
    title:            TITLES[category] ?? category,
    demandScore:      enrich.demandScore,
    growthRate:       enrich.growthRate,
    averageSalary:    avgSalary,
    jobOpenings:      row.length * 10, // scale up from sample
    trend:            enrich.trend,
    topSkills:        topSkills.length > 0 ? topSkills : ["See job description"],
    topRoles,
    industries,
    education:        enrich.education,
    remoteAvailability,
    entryLevelSalary,
    seniorLevelSalary,
    summary:          enrich.summary,
    keywords:         enrich.keywords,
    historicalDemand: enrich.historicalDemand,
    years:            enrich.years,
  };
})
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2));
console.log(`\n✅ jobData.json written with ${output.length} categories`);
console.log("\n📊 Category summary:");
output.forEach((cat) => {
  console.log(
    `   ${cat.trend === "rising" ? "↑" : cat.trend === "declining" ? "↓" : "→"} ` +
    `${cat.title} — ${cat.jobOpenings.toLocaleString()} openings — avg $${cat.averageSalary.toLocaleString()}`
  );
});