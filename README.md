# Portfolio Immersif 3D & Career Ops IA

Bienvenue sur le code source de mon Portfolio interactif et de mon système de gestion de carrière ("Career Ops") propulsé par l'IA.

**🌐 Visiter le site en ligne :** [https://briac-pecheur.vercel.app/](https://briac-pecheur.vercel.app/)

## 🚨 Le Problème
Les CV traditionnels (PDF) et les portfolios classiques ne parviennent pas à démontrer concrètement des compétences transverses : **Vente B2B, Développement web, Automatisation et Intelligence Artificielle**.
La recherche d'emploi et la veille sont chronophages, et les recruteurs manquent de moyens pour interagir directement avec un profil de façon engageante.

## 💡 La Solution
Cette application web full-stack résout ces problématiques via une approche double (Inbound et Outbound) :

* **Un Portfolio Immersif 3D (Inbound) :**
  Une carte de visite interactive (React Three Fiber / Three.js) qui démontre visuellement mes compétences. Une interface fluide, esthétique et optimisée pour la conversion.
* **Un Assistant "Closer" IA :**
  Un agent conversationnel (LLMs via Groq/Gemini) entraîné sur mon profil. Il répond aux objections des recruteurs, pitche mes compétences et capte des leads en temps réel.
* **Un Système "Career Ops" et "Job Spy" (Outbound) :**
  Un back-office sécurisé complet (relié à Supabase). Un robot (Cron Job) scrappe automatiquement les offres d'emploi chaque matin. L'IA les analyse, les score, génère des CV/lettres de motivation sur-mesure et envoie des alertes pertinentes.
* **Optimisation SEO & AEO experte :**
  Implémentation de `llms.txt` pour être parfaitement indexé par ChatGPT et Perplexity, en plus du SEO technique classique (JSON-LD, Sitemap).

## 🛠️ Stack Technique
- **Front-end :** React 18, TypeScript, TailwindCSS, Framer Motion
- **3D :** Three.js, React Three Fiber, React Three Drei, Blender (pour la modélisation)
- **Back-end & API :** Vercel Edge Functions, Vercel Serverless
- **Base de Données & Auth :** Supabase (PostgreSQL, Row Level Security, Storage)
- **Intelligence Artificielle :** Vercel AI SDK, Groq (Llama 3), Google Gemini
- **Automatisation :** Scraping Python, Vercel Cron Jobs

## 🎯 Mon Rôle dans ce projet
* **Product Manager & UX/UI :** Définition des parcours utilisateurs orientés "Conversion" et conception du design.
* **Développeur Full-Stack :** Architecture de l'application React, intégration de la 3D, et développement backend.
* **Spécialiste IA & Data :** Ingénierie de prompts avancée, automatisation du RAG (Retrieval-Augmented Generation), et modélisation de la base de données.
