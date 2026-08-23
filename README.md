# <h2><p align="center">**ParaSayoPH :sunny:**</p></h2>

<div align="center">
  <img src="docs/front_page.png" alt="ParaSayo PH Front Page" width="100%">
</div>
<br>

ParaSa’yoPH is a self-healing discovery platform that gathers fragmented information about scholarships, government assistance, free training, and other public opportunities across the Philippines. It transforms scattered online postings into structured, validated, and searchable data, then matches users with programs based on their needs, location, education, employment status, and eligibility.

<div align="center">

  <a href="https://parasayoph.appwrite.network/" target="_blank">
    <img src="https://img.shields.io/badge/Explore_Live_App-ParaSayo_PH-blue?style=for-the-badge&logo=appwrite" alt="Live App">
  </a>
  <br>
  <em>https://parasayoph.appwrite.network/</em>

</div>

## What we are trying to solve?

Many Filipinos miss valuable opportunities because information is scattered across government websites, social media pages, and outdated announcements. Searching manually is time-consuming, confusing, and especially difficult for students, job seekers, low-income families, and underserved communities with limited access to reliable information.

ParaSayo PH solves this by bringing relevant opportunities into one accessible platform. Instead of forcing users to search through countless sources, it helps them quickly discover programs they may qualify for and explains why each recommendation is relevant. Our platform is designed for Filipinos seeking education, employment, financial assistance, skills training, and other forms of public support.

## The Architecture

ParaSayo PH uses a modular two-stage ETL pipeline powered entirely by custom Bright Data Scraper Studio collectors targeting three main Philippine directories (***[scholarship.com.ph](https://scholarship.com.ph/)***, ***[philscholar.com](https://philscholar.com/)***, and **[assistance.ph](https://assistance.ph/)**).

- **Stage 1 ([Target Indexing](https://github.com/erichiii/ParaSayoPH/tree/7710397ccb466b248dbb77d7334240838ff60038/brightdata/stage-1)):**

    Using Scraper Studio's multi-stage capabilities, the scraper ingests a structural ruleset to navigate unique pagination setups, index target article URLs, and pass them downstream.

- **Stage 2 ([Scraping](https://github.com/erichiii/ParaSayoPH/tree/7710397ccb466b248dbb77d7334240838ff60038/brightdata/stage-2)):**

    To avoid bloating the IDE with hard-coded conditional logic and extensive dictionaries, regex patterns and agency rulesets are stored externally in a Supabase PostgreSQL database. Bright Data's Dynamic Input Payloads inject these rulesets (*see rulesets for sources **[here](https://github.com/erichiii/ParaSayoPH/tree/7710397ccb466b248dbb77d7334240838ff60038/data/ruleset)***) into the scraper at runtime.


The scraper's execution environment applies the injected logic to map messy raw data directly into the unified JSON schema (capturing titles, providers, deadlines, and eligibility criteria). **Scraper Studio's self-healing** feature allows for quick and automated adaptation to layout shifts or DOM changes to keep the data pipeline uninterrupted. ***[Click here to see a Sample Output.](placeholder)***


<div align="center">

  <a href="https://brightdata.com" target="_blank">
    <img src="https://img.shields.io/badge/Powered_by-Bright_Data_Scraper_Studio-orange?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDBDNS4zNzMgMCAwIDUuMzczIDAgMTJzNS4zNzMgMTIgMTIgMTIgMTItNS4zNzMgMTItMTJTMTguNjI3IDAgMTIgMHptMCAyMmMtNS41MjMgMCAxMC00LjQ3NyAxMC0xMFMyMi41MjMgMiAxNyAyIDIgNi40NzcgMiAxMnMyLjQ3NyAxMCAxMCAxMHoiLz48L3N2Zz4=" alt="Powered by Bright Data">
  </a>
  <br>
  <em>Built with custom collectors and automated self-healing architecture powered by Bright Data Scraper Studio.</em>

</div>


## 🤖 AI Assistance Disclosure
In accordance with [Scrape-Verse hackathon](https://www.wemakedevs.org/hackathons/scrape-verse) guidelines, AI coding assistants (including LLMs and development tools) were utilized during the development of this project for rapid prototyping, debugging assistance, and documentation structuring. All core architecture decisions, implementation of the Bright Data Scraper Studio pipelines, and verification of the codebase were entirely conducted, reviewed, and tested by the human team members.