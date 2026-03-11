## Aspida

**Days 1-2 — Insurance Domain**

* Day 1: Phase 0 crash course (annuity types, policy lifecycle, key terms) + understand what a CRM does in this context (agent workflows, lead → quote → application → issued)
* Day 2: Deeper dive — policy admin systems, DTCC, how agents actually use these tools day-to-day. Read Aspida's website, skim their job postings to understand their tech landscape.

**Days 3-4 — Behavioral**

* Day 3: Write all 5 STAR stories + "tell me about yourself"
* Day 4: Practice out loud, record, trim. Prep questions for them.

**→ HR screen ready. Schedule for Day 5-7 window.**

**Day 5 — DynamoDB Crash Course**

* Core mental model, single-table design, insurance schema exercise, when to use Dynamo vs Postgres. One focused day.

**Days 6-9 — System Design**

* Day 6: Framework (7 steps) + building blocks + notification system practice problem
* Day 7: CRM for Insurance Agents — full design + deep dives
* Day 8: Document Generation Pipeline + Secure File Transfer
* Day 9: Zendesk Migration / Integration Architecture

**Day 10 — Dry Run + Rest**

* Full timed mock (behavioral + CRM design). Light review. Stop.

**→ Super day targets Day 12-14 window.**

This flows better — insurance knowledge feeds into behavioral stories which feed into DynamoDB schema decisions which feed into system design. Each phase builds on the last.

Website: [https://aspida.com/](https://aspida.com/)

---

Claude Response:

# Aspida Lead Engineer — 14-Day Interview Cram Plan

**Context:** You're prepping for a design-heavy, behavioral-heavy interview at a life insurance startup. No leetcode. You know system design concepts roughly but have never practiced. You don't know DynamoDB or the insurance domain. They move fast — this plan assumes 2-3 hours/day with weekends flexible.

---

**Days 1-2 — Insurance Domain + Vendor Platform Context**

* Day 1: Annuity types (fixed, indexed, variable), policy lifecycle (application → underwriting → issuance → in-force → claim), key terms (accumulation, annuitization, surrender charge, death benefit, DTCC). Understand Aspida's customer: 60-65 year old boomer rolling a 401k into guaranteed income.
* Day 2: What CRM/CCM/MFT actually do in insurance workflows. Why Zendesk for agent case management, why SmartCom for generating policy documents, why Axway for secure file exchange with distributors and DTCC. Understand the agent's day-to-day — they're the primary user of everything this role touches. Skim Aspida's website and other job postings to map their tech landscape.

**Days 3-4 — Behavioral**

* Day 3: Write 5 STAR stories targeting these specific signals: (1) owned end-to-end delivery, (2) managed/integrated a vendor platform or made a build-vs-buy decision, (3) translated fuzzy business requirements into a technical plan, (4) led root-cause analysis on a production issue in a system you didn't build, (5) mentored a developer while staying hands-on. Write your "tell me about yourself" narrative.
* Day 4: Practice out loud, record, trim to 2-3 min each. Prep 3-5 questions for them. Story 3 (stakeholder translation) is the most important — rehearse it extra.

**→ HR screen ready. Schedule for Day 5-7 window.**

**Day 5 — DynamoDB Crash Course**

* Core mental model (access-pattern-driven, not schema-first). Partition key, sort key, single-table design, GSIs. Build the insurance schema exercise (policies by customer, by agent, by date range). When Dynamo vs Postgres. One focused day.

**Days 6-9 — System Design**

* Day 6: Memorize the 7-step framework. Learn building blocks (API Gateway, SQS, Lambda, S3, ElastiCache, etc.). Practice on notification system problem — timed, talking out loud.
* Day 7: CRM integration design — NOT from scratch. Design the integration layer between Zendesk and the policy admin system. How do you extend Zendesk when it doesn't have insurance-specific fields? How does agent activity in Zendesk stay in sync with policy data? Include monitoring and compliance/audit story.
* Day 8: Document generation pipeline (orchestrating around SmartCom) + secure file transfer system (orchestrating around Axway). Frame both as "vendor does the core thing, you own the pipeline around it." Add retry strategies, audit trails, regulatory retention.
* Day 9: Zendesk → custom CRM migration. Strangler fig pattern, data migration, dual-running, feature flag rollout, rollback plan. This is probably the single most likely design question. Also re-do the Day 7 CRM problem from scratch, timed at 35 minutes.

**Day 10 — Dry Run + Rest**

* Morning: Full timed mock — behavioral warm-up (tell me about yourself + 2 STAR questions) then 35-minute system design (CRM integration). Refine any stories that felt weak during the HR screen.
* Afternoon: Light review of DynamoDB schemas, STAR stories, Aspida's website. Then stop.

**→ Super day targets Day 12-14 window.**

---

Reading this JD closely, there are some clear signals about what kind of person they want:

**Signal 1: This is a "glue" role, not a greenfield architect.**
The JD says "maintenance of system software, including CRM, CCM, vendor products." They list Zendesk, SmartCom, Axway by name. This person isn't building from scratch — they're managing, integrating, and modernizing existing vendor platforms. The word "manage" appears alongside "design."

**Signal 2: They want an owner, not just a builder.**
"Takes full ownership," "consistently drives tasks to completion," "end-to-end technical delivery including planning, development, testing, and deployment." They've probably been burned by people who design but don't ship, or who code but don't own outcomes.

**Signal 3: Stakeholder translation is a core job function.**
"Collaborate with cross-functional IT and business teams to translate requirements into technical designs." "Analyzing and reproducing technical issues, evaluating upcoming changes, and offering well-informed recommendations to support product launches." This person sits between business and engineering. They need someone who can talk to a product owner about annuity surrender charges AND then write the technical spec.

**Signal 4: Operational maturity matters a lot.**
"Troubleshoot production issues and lead root-cause analysis." "Compliance with enterprise architecture and governance standards." "CI/CD pipelines." They're in regulated insurance — uptime, auditability, and process discipline aren't nice-to-haves.

**Signal 5: People leadership, but hands-on.**
"Leading development team" + "provide hands-on technical guidance" + "mentor developers on best practices" + "review code." They want a player-coach, not a pure manager.

---

### Job Description:


Company Description:

Aspida is a tech-driven, nimble insurance carrier. Backed by Ares Management
Corporation, a leading global alternative asset manager, we offer simple and secure
retirement solutions and annuity products with speed and precision. More than that,
we’re in the business of protecting dreams; those of our partners, our producers, and
especially our clients. Our suite of products, available through our elegant and intuitive
digital platform, focuses on secure, stable retirement solutions with attractive features
and downside protection. A subsidiary of Ares Management Corporation (NYSE: ARES)
acts as the dedicated investment manager, capital solutions and corporate development
partner to Aspida.  For more information, please visit www.aspida.com or follow them
on LinkedIn. 

Who We Are:

Sometimes, a group of people come together and create something amazing. They
don’t let egos get in the way. They don’t settle for the status quo, and they don’t
complain when things get tough. Instead, they see a common vision for the future and
each person makes an unspoken commitment to building that future together. That’s the
culture, the moxie, and the story of Aspida.
Our business focuses on annuities and life insurance. At first, it might not sound flashy,
but that’s why we’re doing things differently than everyone else in our industry. We’re
dedicated to developing data-driven tech solutions, providing amazing customer
experiences, and applying an entrepreneurial spirit to everything we do. Our work ethic
is built on three main tenets: Get $#!+ Done, Do It with Moxie, and Have Fun. If this
sounds like the place for you, read on, and then apply at aspida.com/careers.

What We Are Looking For:

 Reporting to the Senior Manager, the Lead Engineer will play a key role in delivering
technical solutions for the design, development, and maintenance of system software,
including CRM, CCM, vendor products, and cloud-based solutions. They are tasked
with creating technical solutions, overseeing engineering teams, and working closely
with developers, testers, and business stakeholders to facilitate effective
implementation throughout every stage of the software development lifecycle (SDLC).

The Application Services team supports the Policy Administration platform along with
other configurable systems, including customer relationship management, data
transport, and document generation services.

A successful candidate will be a strong communicator who takes full ownership of their
responsibilities and consistently drives tasks to completion. They will collaborate closely
with business users, product owners, developers, testers, and deployment teams to
provide comprehensive system support. This includes analyzing and reproducing
technical issues, evaluating upcoming changes, and offering well-informed
recommendations to support product launches.

The role requires previous experience as a technical lead or similar IT position, plus
demonstrated expertise in advanced technology. Familiarity with CRM, CCM and MFT
tools is highly preferred. This role is required to be onsite at our Durham office 3 days a
week.  

What You Will Do:
 Design end-to-end technical solutions, develop the technology roadmap, and
lead the implementation efforts.
 Evaluate system components, propose modernization strategies, and drive the
implementation of improvements.
 Leading development team to design and implementation of technical solutions.
 Design and architect scalable, secure solutions using Node.js, React, AWS, and
DynamoDB.
 Manage vendor-based platforms such as Zendesk (CRM), SmartCom (CCM),
Axway (MFT), etc.
 Lead full-stack development efforts and provide hands-on technical guidance to
the engineering team.
 Build and optimize CI/CD pipelines and code workflows using Bitbucket and
automation tools.
 Collaborate with cross-functional IT and business teams to translate
requirements into technical designs.

 Review code, enforce engineering standards, and mentor developers on best
practices.
 Drive end-to-end technical delivery, including planning, development, testing, and
deployment.
 Troubleshoot production issues and lead root-cause analysis for application and
integration systems.
 Maintain documentation and ensure compliance with enterprise architecture and
governance standards
What We Provide:
 Salaried, DOE
 Long-Term Incentive Plan
 Full-Time
 Full Benefits Package Available
What We Believe:

At Aspida Financial Services, LLC, we are committed to creating a diverse and inclusive
environment and are proud to be an equal opportunity employer. As such, Aspida does
not and will not discriminate in employment and personnel practices on the basis of
race, sex, age, handicap, religion, national origin or any other basis prohibited by
applicable law. Hiring, transferring and promotion practices are performed without
regard to the above listed items.
Requirements
What We Require:
 Bachelor’s degree with major coursework in computer information systems and
technologies 
 8+ years of progressive experience in software engineering, and understanding
of database and application components, including web services.
 Experienced in full-stack development with strong technical skills in AWS
services, Node.js, React, JavaScript, and DynamoDB.
 Critical thinking and decision making in uncertainty
 Strong verbal and written communications.

 Strong interpersonal relations, management, and supervisory skills. 
 Strong background in the support of applications used in the insurance domain.
 Ability to thrive under pressure and manage concurrent and conflicting priorities
and deadlines. 
 Organize, prioritize, and track tasks, requests, and projects effectively.
 Establish, maintain, and foster positive, productive relationships
