import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client
from jobspy import scrape_jobs
import urllib.parse

# Chargement des variables d'environnement locales (.env ou .env.local)
load_dotenv('.env.local')
load_dotenv('.env')

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Erreur : Variables d'environnement Supabase introuvables.")
    exit(1)

# Initialisation du client Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def run_scraper(query="Product Builder No-Code Automatisation", location="France", results_wanted=20, hours_old=72):
    print(f"🔍 Démarrage du scraping JobSpy...")
    print(f"Recherche: '{query}' | Lieu: '{location}' | Max: {results_wanted}")
    
    try:
        # Exécution longue du scraper (qui timeoutait sur Vercel)
        jobs_df = scrape_jobs(
            site_name=["linkedin", "indeed", "glassdoor", "google"],
            search_term=query,
            location=location,
            results_wanted=results_wanted,
            hours_old=hours_old,
            country_indeed='France'
        )
        
        if jobs_df is None or jobs_df.empty:
            print("⚠️ Aucune offre trouvée.")
            return

        print(f"✅ Scraping terminé ! {len(jobs_df)} offres trouvées. Insertion dans Supabase...")
        
        inserted_count = 0
        for _, row in jobs_df.iterrows():
            job_url = str(row.get('job_url', ''))
            # Extraction d'un ID unique basé sur l'URL
            job_id = urllib.parse.quote(job_url, safe='') if job_url else str(hash(str(row)))

            job_data = {
                'id': job_id,
                'title': str(row.get('title', '')) or '',
                'company': str(row.get('company', '')) or '',
                'location': str(row.get('location', '')) or '',
                'platform': str(row.get('site', '')) or '',
                'url': job_url,
                'job_description': str(row.get('description', ''))[:5000] if row.get('description') else '',
                'salary': str(row.get('min_amount', '')) or '',
                'contract_type': str(row.get('job_type', 'CDI/CDD')) or 'CDI/CDD',
                'processed': False
            }
            
            # Upsert (insert or update)
            try:
                supabase.table('scraped_jobs').upsert(job_data).execute()
                inserted_count += 1
            except Exception as e:
                print(f"Erreur d'insertion pour l'offre {job_data['title']}: {e}")
                
        print(f"🎉 Terminé ! {inserted_count} offres ont été enregistrées avec succès dans Supabase.")
        
    except Exception as e:
        print(f"❌ Erreur critique lors du scraping : {str(e)}")

if __name__ == "__main__":
    # Vous pouvez modifier les termes de recherche par défaut ici
    run_scraper()
