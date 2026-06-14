from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            params = json.loads(body.decode('utf-8')) if body else {}

            query = params.get('query', 'Product Builder No-Code Automatisation')
            location = params.get('location', 'France')
            hours_old = params.get('hours_old', 72)
            results_wanted = params.get('results_wanted', 20)
            platforms = params.get('platforms', ['linkedin', 'indeed', 'glassdoor', 'google'])

            from jobspy import scrape_jobs
            jobs_df = scrape_jobs(
                site_name=platforms,
                search_term=query,
                location=location,
                results_wanted=results_wanted,
                hours_old=hours_old,
                country_indeed='France',
            )

            jobs = []
            if jobs_df is not None and not jobs_df.empty:
                for _, row in jobs_df.iterrows():
                    jobs.append({
                        'title': str(row.get('title', '') or ''),
                        'company': str(row.get('company', '') or ''),
                        'location': str(row.get('location', '') or ''),
                        'platform': str(row.get('site', '') or ''),
                        'url': str(row.get('job_url', '') or ''),
                        'job_description': str(row.get('description', '') or '')[:3000],
                        'salary': str(row.get('min_amount', '') or ''),
                        'contract_type': str(row.get('job_type', 'CDI/CDD') or 'CDI/CDD'),
                    })

            response = json.dumps({'jobs': jobs, 'total': len(jobs)})
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(response.encode())

        except Exception as e:
            error_response = json.dumps({'error': str(e), 'jobs': []})
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(error_response.encode())

    def log_message(self, format, *args):
        pass
