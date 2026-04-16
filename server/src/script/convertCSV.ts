import fs   from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const CLEAN_PATH   = path.resolve(__dirname, "../data/clean_jobs.csv");
const POSTS_PATH   = path.resolve(__dirname, "../data/job_postings.csv");
const TREND_PATH   = path.resolve(__dirname, "../data/Trending_Tech_Jobs_2026.csv");
const JSON_PATH    = path.resolve(__dirname, "../data/jobData.json");

// ── Types ─────────────────────────────────────────────────────
interface CleanRow {
  id:              string;
  title:           string;
  company:         string;
  location:        string;
  work_type:       string;
  employment_type: string;
  description:     string;
  date_posted:     string;
}

interface PostingRow {
  job_id:                     string;
  title:                      string;
  description:                string;
  max_salary:                 string;
  med_salary:                 string;
  min_salary:                 string;
  pay_period:                 string;
  location:                   string;
  remote_allowed:             string;
  formatted_experience_level: string;
  skills_desc:                string;
  currency:                   string;
}

interface TrendRow {
  Job_ID:           string;
  Role:             string;
  Company:          string;
  Location:         string;
  Required_Skill:   string;
  Experience_Level: string;
  Salary_LPA:       string;
  Remote_Option:    string;
  Posting_Year:     string;
}

// ── Unified internal row ──────────────────────────────────────
interface UnifiedRow {
  title:    string;
  salary:   number | null;
  remote:   boolean;
  skills:   string[];
  location: string;
  source:   string;
}

// ── Category keyword map ──────────────────────────────────────
const CATEGORY_MAP: Record<string, string[]> = {
  ai: [
    "artificial intelligence", "machine learning", "ml engineer",
    "ai engineer", "deep learning", "nlp", "computer vision", "llm",
    "mlops", "data scientist", "neural", "tensorflow", "pytorch",
    "prompt engineer", "generative ai", "ai researcher",
  ],
  software: [
    "software engineer", "software developer", "full stack", "fullstack",
    "frontend", "front-end", "backend", "back-end", "web developer",
    "react developer", "node developer", "javascript developer",
    "typescript", "java developer", "python developer", ".net developer",
    "mobile developer", "ios developer", "android developer",
  ],
  data: [
    "data analyst", "data engineer", "business analyst", "bi analyst",
    "analytics engineer", "data warehouse", "tableau developer",
    "power bi", "sql developer", "business intelligence",
    "reporting analyst", "quantitative analyst",
  ],
  cybersecurity: [
    "security engineer", "security analyst", "cybersecurity",
    "cyber security", "penetration tester", "soc analyst",
    "information security", "network security", "cloud security",
    "devsecops", "ethical hacker", "incident responder",
  ],
  cloud: [
    "cloud engineer", "cloud architect", "devops engineer",
    "site reliability", "sre", "platform engineer",
    "infrastructure engineer", "kubernetes engineer",
    "aws engineer", "azure engineer", "gcp engineer",
  ],
  healthcare: [
    "nurse", "physician", "doctor", "medical", "clinical",
    "healthcare", "health informatics", "pharmacist", "therapist",
    "radiologist", "dental", "mental health", "surgeon",
  ],
  finance: [
    "financial analyst", "finance analyst", "accountant", "auditor",
    "investment banker", "trading", "fintech", "risk analyst",
    "actuary", "tax analyst", "portfolio manager", "controller",
  ],
  green: [
    "solar engineer", "wind energy", "sustainability", "environmental",
    "renewable energy", "green energy", "climate", "carbon analyst",
    "clean energy", "esg analyst",
  ],
  blockchain: [
    "blockchain", "smart contract", "solidity", "web3",
    "ethereum", "defi", "nft", "crypto", "quantum computing",
    "qiskit", "quantum engineer",
  ],
  design: [
    "ux designer", "ui designer", "product designer",
    "graphic designer", "ux researcher", "visual designer",
    "interaction designer", "figma", "creative director",
  ],
};

// ── Classify ─────────────────────────────────────────────────
const classify = (title: string): string | null => {
  const lower = title.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return null;
};

// ── Salary parsers ────────────────────────────────────────────
const parseSalaryUSD = (
  val: string,
  period: string = "YEARLY"
): number | null => {
  const n = parseFloat(val);
  if (isNaN(n) || n <= 0) return null;
  const p = period.toUpperCase();
  if (p === "HOURLY")  return Math.round(n * 2080);
  if (p === "MONTHLY") return Math.round(n * 12);
  return Math.round(n);
};

// Extract salary from description text (clean_jobs)
const extractSalaryFromText = (text: string): number | null => {
  const patterns = [
    /\$(\d{2,3}),?(\d{3})\s*\/\s*year/i,
    /\$(\d{2,3}),?(\d{3})\s*-\s*\$(\d{2,3}),?(\d{3})/i,
    /salary[:\s]+\$(\d{2,3}),?(\d{3})/i,
    /(\d{2,3}),?(\d{3})\s*-\s*(\d{2,3}),?(\d{3})\s*\/\s*year/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const raw = m[1] + (m[2] ?? "000");
      const n   = parseInt(raw.replace(/,/g, ""));
      if (n > 20000 && n < 1000000) return n;
    }
  }
  return null;
};

// Convert LPA (Indian Lakhs Per Annum) to USD
const lpaToUSD = (lpa: string): number | null => {
  const n = parseFloat(lpa);
  if (isNaN(n) || n <= 0) return null;
  // 1 LPA ≈ $1,220 USD (1 Lakh = 100,000 INR, 1 USD ≈ 82 INR)
  return Math.round(n * 100000 / 82);
};

// ── Skills parsers ────────────────────────────────────────────
const KNOWN_SKILLS = [
  "Python","JavaScript","TypeScript","Java","SQL","React","Node.js","AWS",
  "Azure","Docker","Kubernetes","TensorFlow","PyTorch","Excel","Tableau",
  "Power BI","Git","Linux","Figma","MongoDB","PostgreSQL","C++","C#",
  "Go","Rust","Swift","Kotlin","Spark","Hadoop","Terraform","Jenkins",
  "REST","GraphQL","Machine Learning","Deep Learning","AI","NLP",
  "Solidity","Ethereum","Web3","Qiskit","Quantum","Climate Data",
  "GIS","R","MATLAB","Scala","Airflow","dbt","Looker","Snowflake",
];

const extractSkillsFromText = (text: string): string[] => {
  if (!text) return [];
  return KNOWN_SKILLS.filter((sk) =>
    text.toLowerCase().includes(sk.toLowerCase())
  ).slice(0, 8);
};

const parseSkillField = (val: string): string[] => {
  if (!val || val === "nan") return [];
  return val
    .split(/[,;|\/]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 50)
    .slice(0, 6);
};

// ── Enrichment ────────────────────────────────────────────────
const ENRICHMENT: Record<string, {
  title:            string;
  demandScore:      number;
  growthRate:       number;
  trend:            "rising" | "declining" | "stable";
  keywords:         string[];
  historicalDemand: number[];
  years:            number[];
  education:        string;
  summary:          string;
}> = {
  ai: {
    title:            "Artificial Intelligence & Machine Learning",
    demandScore:      94, growthRate: 38, trend: "rising",
    keywords:         ["artificial intelligence","machine learning","deep learning","neural network","ai","ml","python","tensorflow","pytorch","llm","mlops","nlp","computer vision","generative ai"],
    historicalDemand: [60,65,72,78,85,90,94], years: [2018,2019,2020,2021,2022,2023,2024],
    education:        "Bachelor or Master in CS or related field",
    summary:          "AI and ML roles are growing at 38% year over year. Highest demand in model fine-tuning, MLOps, and applied AI. Entry barriers are lowering with online platforms and bootcamps.",
  },
  software: {
    title:            "Software Development",
    demandScore:      88, growthRate: 25, trend: "rising",
    keywords:         ["software","developer","programming","javascript","typescript","react","nodejs","python","fullstack","frontend","backend","api","devops","aws","github"],
    historicalDemand: [70,73,76,80,83,86,88], years: [2018,2019,2020,2021,2022,2023,2024],
    education:        "Bachelor in CS or self-taught with strong portfolio",
    summary:          "Software development remains the largest tech hiring category globally. Full stack and cloud-skilled developers are most in demand. Remote opportunities are very abundant.",
  },
  data: {
    title:            "Data Science & Analytics",
    demandScore:      87, growthRate: 28, trend: "rising",
    keywords:         ["data science","data analyst","analytics","sql","tableau","power bi","statistics","excel","business intelligence","data engineer","spark","visualization","reporting"],
    historicalDemand: [55,62,68,74,79,83,87], years: [2018,2019,2020,2021,2022,2023,2024],
    education:        "Bachelor in Statistics, Mathematics, or CS",
    summary:          "Data roles are expanding beyond tech into every industry. SQL and Python remain the core skills. Business analytics and data engineering are the fastest growing sub-fields.",
  },
  cybersecurity: {
    title:            "Cybersecurity",
    demandScore:      91, growthRate: 35, trend: "rising",
    keywords:         ["cybersecurity","security","hacking","penetration testing","network security","firewall","encryption","malware","soc","incident response","cloud security","zero trust"],
    historicalDemand: [65,70,75,80,85,88,91], years: [2018,2019,2020,2021,2022,2023,2024],
    education:        "Bachelor in CS or Cybersecurity plus certifications CISSP CEH",
    summary:          "Cybersecurity has a critical talent shortage with 3.5 million unfilled positions globally. Demand driven by rising ransomware attacks, cloud adoption, and data breach incidents.",
  },
  cloud: {
    title:            "Cloud Computing",
    demandScore:      89, growthRate: 30, trend: "rising",
    keywords:         ["cloud","aws","azure","google cloud","kubernetes","docker","devops","terraform","serverless","microservices","infrastructure","sre","platform"],
    historicalDemand: [58,65,72,78,83,86,89], years: [2018,2019,2020,2021,2022,2023,2024],
    education:        "Bachelor in CS plus cloud certifications AWS Azure GCP",
    summary:          "Cloud adoption is accelerating across all industries. AWS leads at 32% market share followed by Azure and GCP. Multi-cloud and DevOps skills are increasingly valued by employers.",
  },
  healthcare: {
    title:            "Healthcare & Medical",
    demandScore:      82, growthRate: 15, trend: "rising",
    keywords:         ["healthcare","medical","nurse","doctor","hospital","clinical","patient","telehealth","ehr","physician","therapy","mental health","wellness"],
    historicalDemand: [68,70,78,75,78,80,82], years: [2018,2019,2020,2021,2022,2023,2024],
    education:        "Degree in Nursing, Medicine, or Health Informatics",
    summary:          "Healthcare is one of the most stable and growing job markets globally. Aging populations and telehealth expansion are key growth drivers. Health informatics is fastest growing adjacent role.",
  },
  finance: {
    title:            "Finance & Fintech",
    demandScore:      80, growthRate: 18, trend: "stable",
    keywords:         ["finance","fintech","banking","investment","trading","crypto","blockchain","financial analyst","risk","accounting","cfa","portfolio","economics","quant"],
    historicalDemand: [72,73,68,74,76,78,80], years: [2018,2019,2020,2021,2022,2023,2024],
    education:        "Bachelor in Finance, Economics, or CS",
    summary:          "Finance is being disrupted by fintech and blockchain. Traditional roles are declining while quantitative and tech-finance hybrid roles are surging. Python skills are increasingly expected.",
  },
  green: {
    title:            "Green Energy & Sustainability",
    demandScore:      76, growthRate: 22, trend: "rising",
    keywords:         ["green","sustainability","renewable energy","solar","wind","environment","climate","esg","carbon","clean energy","electric vehicle","recycling","conservation"],
    historicalDemand: [45,50,55,60,65,71,76], years: [2018,2019,2020,2021,2022,2023,2024],
    education:        "Bachelor in Environmental Science, Engineering, or Sustainability",
    summary:          "Green jobs are growing rapidly driven by government climate policies and corporate ESG commitments. Solar and wind energy roles are the fastest growing sub-fields in this category.",
  },
  blockchain: {
    title:            "Blockchain & Quantum Computing",
    demandScore:      78, growthRate: 32, trend: "rising",
    keywords:         ["blockchain","crypto","smart contract","solidity","web3","ethereum","defi","quantum","qiskit","quantum computing","distributed ledger"],
    historicalDemand: [30,38,45,55,65,72,78], years: [2018,2019,2020,2021,2022,2023,2024],
    education:        "Bachelor in CS, Mathematics, or Physics",
    summary:          "Blockchain and quantum computing are fast-emerging fields. Web3 development and quantum algorithm roles are highly sought with extremely limited talent supply globally.",
  },
  design: {
    title:            "UI/UX Design",
    demandScore:      78, growthRate: 16, trend: "rising",
    keywords:         ["design","ux","ui","user experience","figma","wireframe","prototype","product design","adobe","interaction design","usability","hci","visual design"],
    historicalDemand: [58,62,65,68,72,75,78], years: [2018,2019,2020,2021,2022,2023,2024],
    education:        "Bachelor in Design, HCI, or self-taught with portfolio",
    summary:          "UX design demand is growing as every company prioritises user experience. Figma has become the industry standard. Product designers with coding knowledge are highly valued.",
  },
};

// ══════════════════════════════════════════════════════════════
// STEP 1 — Read all 3 CSV files
// ══════════════════════════════════════════════════════════════

// Groups accumulator
const groups: Record<string, {
  rows:      UnifiedRow[];
  skills:    Map<string, number>;
  roles:     Map<string, number>;
  locations: Map<string, number>;
}> = {};

const addToGroup = (cat: string, row: UnifiedRow) => {
  if (!groups[cat]) {
    groups[cat] = {
      rows:      [],
      skills:    new Map(),
      roles:     new Map(),
      locations: new Map(),
    };
  }
  groups[cat].rows.push(row);

  row.skills.forEach((sk) => {
    const g = groups[cat]!;
    g.skills.set(sk, (g.skills.get(sk) || 0) + 1);
  });

  const g = groups[cat]!;
  const role = row.title.trim();
  if (role) g.roles.set(role, (g.roles.get(role) || 0) + 1);

  const loc = row.location.trim().split(",")[0]?.trim() || row.location.trim();
  if (loc) g.locations.set(loc, (g.locations.get(loc) || 0) + 1);
};

// ── File 1: clean_jobs.csv ────────────────────────────────────
console.log("📂 Reading clean_jobs.csv...");
const cleanRaw = fs.readFileSync(CLEAN_PATH, "utf-8");
const cleanRows = parse(cleanRaw, {
  columns:          true,
  skip_empty_lines: true,
  trim:             true,
  relax_column_count: true,
}) as CleanRow[];

let c1 = 0;
cleanRows.forEach((row) => {
  const cat = classify(row.title);
  if (!cat) return;
  c1++;
  const salary  = extractSalaryFromText(row.description || "");
  const skills  = extractSkillsFromText(row.description || "");
  const isRemote = (row.work_type || "").toLowerCase().includes("remote") ||
                   (row.description || "").toLowerCase().includes("remote");
  addToGroup(cat, {
    title:    row.title,
    salary,
    remote:   isRemote,
    skills,
    location: row.location || "",
    source:   "clean_jobs",
  });
});
console.log(`   ✅ ${c1} / ${cleanRows.length} classified`);

// ── File 2: job_postings.csv ──────────────────────────────────
console.log("📂 Reading job_postings.csv...");
const postsRaw  = fs.readFileSync(POSTS_PATH, "utf-8");
const postRows  = parse(postsRaw, {
  columns:          true,
  skip_empty_lines: true,
  trim:             true,
  relax_column_count: true,
}) as PostingRow[];

let c2 = 0;
postRows.forEach((row) => {
  if (row.currency && row.currency !== "USD") return;
  const cat = classify(row.title || "");
  if (!cat) return;
  c2++;

  const salaryRaw = row.med_salary || row.max_salary || row.min_salary;
  const salary    = parseSalaryUSD(salaryRaw, row.pay_period);
  const skills    = parseSkillField(row.skills_desc)
    .concat(extractSkillsFromText(row.description || ""))
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 8);
  const isRemote  = row.remote_allowed === "1" || row.remote_allowed?.toLowerCase() === "true";

  addToGroup(cat, {
    title:    row.title,
    salary,
    remote:   isRemote,
    skills,
    location: row.location || "",
    source:   "job_postings",
  });
});
console.log(`   ✅ ${c2} / ${postRows.length} classified`);

// ── File 3: Trending_Tech_Jobs_2026.csv ───────────────────────
console.log("📂 Reading Trending_Tech_Jobs_2026.csv...");
const trendRaw  = fs.readFileSync(TREND_PATH, "utf-8");
const trendRows = parse(trendRaw, {
  columns:          true,
  skip_empty_lines: true,
  trim:             true,
}) as TrendRow[];

let c3 = 0;
trendRows.forEach((row) => {
  const cat = classify(row.Role || "");
  if (!cat) return;
  c3++;

  const salary   = lpaToUSD(row.Salary_LPA);
  const skills   = parseSkillField(row.Required_Skill);
  const isRemote = (row.Remote_Option || "").toLowerCase() === "yes";

  addToGroup(cat, {
    title:    row.Role,
    salary,
    remote:   isRemote,
    skills,
    location: row.Location || "",
    source:   "trending_2026",
  });
});
console.log(`   ✅ ${c3} / ${trendRows.length} classified`);

const totalClassified = c1 + c2 + c3;
const totalRows       = cleanRows.length + postRows.length + trendRows.length;
console.log(`\n📊 Total classified: ${totalClassified.toLocaleString()} / ${totalRows.toLocaleString()}`);
console.log("📂 Groups found:");
Object.entries(groups).forEach(([cat, g]) => {
  console.log(`   ${cat.padEnd(15)}: ${g.rows.length.toLocaleString()} rows`);
});

// ══════════════════════════════════════════════════════════════
// STEP 2 — Build output JSON
// ══════════════════════════════════════════════════════════════
const output = Object.entries(groups)
  .filter(([cat]) => ENRICHMENT[cat])
  .map(([cat, g]) => {
    const enrich = ENRICHMENT[cat]!;

    // Salaries — filter realistic USD values
    const salaries = g.rows
      .map((r) => r.salary)
      .filter((s): s is number => s !== null && s > 20000 && s < 800000);

    const avgSalary = salaries.length > 0
      ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
      : 85000;

    const sorted = [...salaries].sort((a, b) => a - b);
    const q1Idx  = Math.floor(sorted.length * 0.25);
    const q3Idx  = Math.floor(sorted.length * 0.75);
    const q1     = sorted[q1Idx] ?? Math.round(avgSalary * 0.72);
    const q3     = sorted[q3Idx] ?? Math.round(avgSalary * 1.38);

    // Remote
    const remoteCount        = g.rows.filter((r) => r.remote).length;
    const remoteAvailability = g.rows.length > 0
      ? Math.round((remoteCount / g.rows.length) * 100)
      : 50;

    // Top skills
    const topSkills = Array.from(g.skills.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([sk]) => sk)
      .filter((s) => s !== "nan");

    // Top roles
    const topRoles = Array.from(g.roles.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([r]) => r);

    // Top locations
    const industries = Array.from(g.locations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([l]) => l)
      .filter((l) => l.length > 1 && l !== "nan");

   return {
  category : cat,
  title:              enrich.title,
  demandScore:        enrich.demandScore,
  growthRate:         enrich.growthRate,
  averageSalary:      avgSalary > 0 ? avgSalary : 85000,
  jobOpenings:        g.rows.length * 8 || 500,
  trend:              enrich.trend,
  topSkills:          topSkills.length  > 0 ? topSkills  : ["See job description"],
  topRoles:           topRoles.length   > 0 ? topRoles   : [enrich.title],
  industries:         industries.length > 0 ? industries : ["Tech", "Finance", "Healthcare"],
  education:          enrich.education,
  remoteAvailability: remoteAvailability || 50,
  entryLevelSalary:   q1,
  seniorLevelSalary:  q3,
  summary:            enrich.summary,
  keywords:           enrich.keywords,
  historicalDemand:   enrich.historicalDemand,
  years:              enrich.years,
};
  })
  .sort((a, b) => b.demandScore - a.demandScore);

// ══════════════════════════════════════════════════════════════
// STEP 3 — Write JSON
// ══════════════════════════════════════════════════════════════
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2));

console.log(`\n✅ jobData.json written with ${output.length} categories`);
console.log("\n📊 Final summary:");
output.forEach((cat) => {
  const arrow = cat.trend === "rising" ? "↑" : cat.trend === "declining" ? "↓" : "→";
  console.log(
    `   ${arrow} ${cat.title.padEnd(45)}` +
    ` | ${cat.jobOpenings.toLocaleString().padStart(8)} openings` +
    ` | avg $${cat.averageSalary.toLocaleString().padStart(7)}` +
    ` | remote ${cat.remoteAvailability}%`
  );
});