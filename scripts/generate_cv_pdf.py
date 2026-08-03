import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=24,
        leftMargin=24,
        topMargin=18,
        bottomMargin=18
    )

    styles = getSampleStyleSheet()

    # Colors
    PRIMARY = colors.HexColor("#0284C7")    # Sky Blue
    DARK_BLUE = colors.HexColor("#0F172A")  # Deep Slate Headings
    TEXT_DARK = colors.HexColor("#334155")  # Body Text
    TEXT_MUTED = colors.HexColor("#64748B") # Muted Text
    LINE_COLOR = colors.HexColor("#CBD5E1")

    # Typography Styles
    style_name = ParagraphStyle('Name', fontName='Helvetica-Bold', fontSize=20, leading=23, textColor=DARK_BLUE, spaceAfter=1)
    style_sub = ParagraphStyle('Sub', fontName='Helvetica-Bold', fontSize=9.5, leading=12, textColor=PRIMARY, spaceAfter=2)
    style_tags = ParagraphStyle('Tags', fontName='Helvetica-Bold', fontSize=7, leading=9.5, textColor=TEXT_MUTED, spaceAfter=2)
    style_contact = ParagraphStyle('Contact', fontName='Helvetica', fontSize=7.5, leading=10.5, textColor=TEXT_MUTED, alignment=TA_RIGHT)

    style_sec_title = ParagraphStyle('SecTitle', fontName='Helvetica-Bold', fontSize=10, leading=12.5, textColor=DARK_BLUE, spaceBefore=3, spaceAfter=1.5)
    style_body = ParagraphStyle('Body', fontName='Helvetica', fontSize=7.8, leading=10.6, textColor=TEXT_DARK, spaceAfter=1.5)
    style_bullet = ParagraphStyle('Bullet', fontName='Helvetica', fontSize=7.5, leading=10.2, textColor=TEXT_DARK, leftIndent=7, firstLineIndent=-5, spaceAfter=1)

    style_item_title = ParagraphStyle('ItemTitle', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=DARK_BLUE)
    style_item_sub = ParagraphStyle('ItemSub', fontName='Helvetica', fontSize=7.5, leading=10, textColor=TEXT_MUTED, alignment=TA_RIGHT)

    story = []

    # --- HEADER ---
    header_data = [
        [
            Paragraph("Briac Pécheur", style_name),
            Paragraph("Nantes, France · +33 6 64 35 10 54 · briac.pech@gmail.com", style_contact)
        ],
        [
            Paragraph("Business & Opérations | Développement commercial, coordination & outils digitaux", style_sub),
            Paragraph("LinkedIn: linkedin.com/in/briac-p-571676114 · Portfolio: briac-pecheur.vercel.app", style_contact)
        ],
        [
            Paragraph("COMPTES CLÉS · DÉVELOPPEMENT COMMERCIAL · GESTION DE PROJET · OPÉRATIONS · OUTILS MÉTIER · AUTOMATISATION", style_tags),
            Paragraph("GitHub: github.com/briacPech", style_contact)
        ]
    ]

    header_table = Table(header_data, colWidths=[340, 207])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 2))
    story.append(HRFlowable(width="100%", thickness=1, color=LINE_COLOR, spaceAfter=3))

    # --- PROFIL ---
    story.append(Paragraph("PROFIL", style_sec_title))
    story.append(Paragraph(
        "Professionnel du business B2B et des opérations avec près de 20 ans d'expérience en développement commercial, gestion de comptes, négociation, achats internationaux et coordination logistique. Habitué à piloter des portefeuilles significatifs (20 M€), analyser les marges et faire avancer des projets impliquant clients, fournisseurs et équipes. Je complète cette expérience terrain par la mise en place d'outils digitaux, de données structurées et d'automatisations utiles (RNCP Niveau 6 No-Code & IA) pour fiabiliser les processus et améliorer le suivi. Disponible immédiatement.",
        style_body
    ))
    story.append(Spacer(1, 2))

    def sec_hdr(title):
        return [
            Paragraph(title.upper(), style_sec_title),
            HRFlowable(width="100%", thickness=0.5, color=LINE_COLOR, spaceAfter=2)
        ]

    # --- IMPACT EN BREF ---
    story.extend(sec_hdr("Impact en bref"))
    impact_data = [
        [
            Paragraph("• <b>20 M€</b> — Portefeuille GMS et grossistes piloté", style_body),
            Paragraph("• <b>Près de 20 ans</b> — Business B2B, comptes clés & ops", style_body)
        ],
        [
            Paragraph("• <b>Projets digitaux</b> — Outils métiers, automatisation & IA", style_body),
            Paragraph("• <b>Disponible</b> — CDI, CDD, transition ou freelance", style_body)
        ]
    ]
    t_impact = Table(impact_data, colWidths=[273, 274])
    t_impact.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 0)]))
    story.append(t_impact)
    story.append(Spacer(1, 2))

    # --- COMPÉTENCES ---
    story.extend(sec_hdr("Compétences"))
    skills_data = [
        [
            Paragraph("<b>BUSINESS & OPÉRATIONS :</b>", style_body),
            Paragraph("Gestion de comptes B2B et comptes clés · Développement commercial · Négociation et contrats · Négociation de marge et rentabilité · Achats internationaux · Approvisionnement · Coordination logistique · Litiges · Grande distribution · Export · RHD · Management de projet.", style_body)
        ],
        [
            Paragraph("<b>OUTILS MÉTIERS & PILOTAGE :</b>", style_body),
            Paragraph("CRM et suivi client · Structuration de bases de données · Airtable · Notion · Excel · Google Sheets · Reporting commercial & opérationnel · Tableaux de bord · Documentation de processus · Recueil des besoins · PostgreSQL.", style_body)
        ],
        [
            Paragraph("<b>AUTOMATISATION & IA :</b>", style_body),
            Paragraph("n8n · Make · Workflows automatisés · IA générative · Prompting · APIs · Webhooks · Formulaires · Notifications · Relances · Génération de documents · GitHub · Cursor · Développement assisté par IA.", style_body)
        ]
    ]
    t_skills = Table(skills_data, colWidths=[140, 407])
    t_skills.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 1)]))
    story.append(t_skills)
    story.append(Spacer(1, 2))

    # --- PROJETS DIGITAUX ---
    story.extend(sec_hdr("Projets Digitaux"))
    
    t_proj1 = Table([[Paragraph("Festival Connect — Créateur, organisateur & Product Builder", style_item_title), Paragraph("2025–2026", style_item_sub)]], colWidths=[430, 117])
    t_proj1.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 0)]))
    story.append(t_proj1)
    story.append(Paragraph("• Application web de gestion opérationnelle du festival Les Plages Musicales : contacts, artistes, bénévoles, messagerie, billetterie HelloAsso et opérations terrain (React, TypeScript, Supabase, Make).", style_bullet))

    t_proj2 = Table([[Paragraph("CRM & outils de suivi — Projet no-code & IA", style_item_title), Paragraph("2025–2026", style_item_sub)]], colWidths=[430, 117])
    t_proj2.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 0)]))
    story.append(t_proj2)
    story.append(Paragraph("• Création d'outils de suivi clients, demandes, tâches et relances ; centralisation de données et automatisation via Make, Airtable et IA générative.", style_bullet))

    t_proj3 = Table([[Paragraph("Outils d'aide au recrutement — Automatisation & IA", style_item_title), Paragraph("2025–2026", style_item_sub)]], colWidths=[430, 117])
    t_proj3.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 0)]))
    story.append(t_proj3)
    story.append(Paragraph("• Collecte, structuration et génération de CV, lettres de motivation et préparation d'entretiens.", style_bullet))
    story.append(Spacer(1, 2))

    # --- EXPÉRIENCE PROFESSIONNELLE ---
    story.extend(sec_hdr("Expérience Professionnelle"))

    exps = [
        ("Commercial Import-Export — Elafood, Nantes", "Nov. 2023 – Juil. 2025 | CDI", "Portefeuille GMS et grossistes (20 M€) ; achats internationaux (Islande, Norvège, USA), approvisionnements, logistique, QHSE, facturation, litiges et négociation."),
        ("Commercial Produits de la Mer Premium — Les Viviers de Noirmoutier", "Jan. 2021 – Août 2023 | CDI", "Produits premium pour GMS, grossistes et export ; comptes clés, qualité de service, réclamations et veille."),
        ("Commercial GMS Produits de la Mer — Pomona Terre Azur, Nantes", "Nov. 2017 – Jan. 2021 | CDI", "Portefeuille d'hypermarchés et supermarchés (2,8 M€) ; analyse des performances, recommandations et négociation."),
        ("Commercial RHD Produits Agroalimentaires — Pomona Passion Froid, Aix-en-Provence", "Oct. 2014 – Juil. 2017 | CDI", "Développement portefeuille haut de gamme St-Tropez / Riviera ; vente, négociation de contrats et suivi de commandes."),
        ("Commercial GMS Produits de la Mer — Les Pêcheries Océane, Nantes", "Jan. 2009 – Oct. 2014 | CDI", "Portefeuille RHD (1,8 M€) ; analyse de marché, développement commercial et suivi client."),
        ("Chef de Secteur GMS — Socavi Groupe Unicopa, Languidic", "Sept. 2006 – Oct. 2008 | Apprentissage", "Stratégie commerciale volaille, merchandising, accompagnement magasins, référencement et visibilité.")
    ]

    for title, dates, desc in exps:
        t_exp = Table([[Paragraph(title, style_item_title), Paragraph(dates, style_item_sub)]], colWidths=[385, 162])
        t_exp.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 0)]))
        story.append(KeepTogether([
            t_exp,
            Paragraph(f"• {desc}", style_bullet),
            Spacer(1, 1)
        ]))

    story.append(Spacer(1, 2))

    # --- FORMATION ---
    story.extend(sec_hdr("Formation"))

    edu = [
        ("Certification Concepteur de solutions No-Code & IA — RNCP Niveau 6", "LION / Maestro | 2026"),
        ("Master 1 — Cadre Commercial pour l'Agroalimentaire (CC2A)", "SUP'T G, Niort | 2006–2008"),
        ("BTS Industries Agroalimentaires", "Lycée Agricole de Laval | 2005–2006"),
        ("Baccalauréat Sciences et Technologies de l'Agronomie et de l'Environnement", "Lycée Jules Rieffel, Saint-Herblain | 2002–2004")
    ]

    for title, detail in edu:
        t_ed = Table([[Paragraph(f"<b>{title}</b>", style_body), Paragraph(detail, style_item_sub)]], colWidths=[375, 172])
        t_ed.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 0.5)]))
        story.append(t_ed)

    story.append(Spacer(1, 2))

    # --- FORMATIONS COMPLÉMENTAIRES ---
    story.append(Paragraph("<b>FORMATIONS COMPLÉMENTAIRES :</b>", style_body))
    story.append(Paragraph("No-code, product building, automatisation et IA appliquée | Foundations: Data, Data, Everywhere — Google / Coursera | Google Sheets — Analyse et automatisation | Prompt Engineering for ChatGPT — Vanderbilt University | Analyse d'entreprise avec les tableurs — Coursera | Leadership, teamwork & negotiation — Northwestern University", style_body))
    story.append(Spacer(1, 2))

    # --- LANGUES & CENTRES D'INTÉRÊT ---
    story.extend(sec_hdr("Langues, Engagements & Centres d'Intérêt"))
    story.append(Paragraph("• <b>Langues :</b> français (maternelle) · anglais (professionnel élémentaire A2).  |  <b>Rugby :</b> 25 ans (Fédérale 3), entraîneur 4 saisons.", style_bullet))
    story.append(Paragraph("• <b>Événementiel & Centres d'intérêt :</b> créateur/organisateur festival Les Plages Musicales Damgan · kitesurf · voile · pêche · musique · voyages · BAFA.", style_bullet))

    doc.build(story)
    print(f"PDF successfully generated: {filename}")

if __name__ == '__main__':
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cv_root = os.path.join(root_dir, "CV BRIAC.pdf")
    cv_public = os.path.join(root_dir, "public", "CV_Briac_Pecheur.pdf")
    cv_public_alt = os.path.join(root_dir, "public", "CV BRIAC.pdf")
    cv_user_file = os.path.join(root_dir, "BriacPrcheur (3).pdf")

    build_pdf(cv_root)
    build_pdf(cv_public)
    build_pdf(cv_public_alt)
    build_pdf(cv_user_file)
