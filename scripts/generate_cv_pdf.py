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
        rightMargin=28,
        leftMargin=28,
        topMargin=22,
        bottomMargin=22
    )

    styles = getSampleStyleSheet()

    # Color Palette
    PRIMARY = colors.HexColor("#0F172A")    # Dark Navy Slate
    GOLD = colors.HexColor("#B99A5A")       # Accent Gold
    TEXT_DARK = colors.HexColor("#1E293B")  # Body Text
    TEXT_MUTED = colors.HexColor("#475569") # Secondary Text
    LINE_COLOR = colors.HexColor("#E2E8F0")

    # Custom Styles
    style_name = ParagraphStyle(
        'CVName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=21,
        textColor=PRIMARY,
        spaceAfter=1
    )

    style_tagline = ParagraphStyle(
        'CVTagline',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=GOLD,
        spaceAfter=2
    )

    style_contact = ParagraphStyle(
        'CVContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=TEXT_MUTED,
        alignment=TA_RIGHT
    )

    style_sec_title = ParagraphStyle(
        'CVSecTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=PRIMARY,
        spaceBefore=5,
        spaceAfter=2
    )

    style_job_title = ParagraphStyle(
        'CVJobTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=PRIMARY
    )

    style_job_sub = ParagraphStyle(
        'CVJobSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=GOLD
    )

    style_job_date = ParagraphStyle(
        'CVJobDate',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=10.5,
        textColor=TEXT_MUTED,
        alignment=TA_RIGHT
    )

    style_body = ParagraphStyle(
        'CVBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=TEXT_DARK,
        spaceAfter=2
    )

    style_bullet = ParagraphStyle(
        'CVBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=TEXT_DARK,
        leftIndent=8,
        firstLineIndent=-6,
        spaceAfter=1
    )

    story = []

    # --- HEADER ---
    header_data = [
        [
            Paragraph("BRIAC PÉCHEUR", style_name),
            Paragraph("3 Avenue Richelieu, 44100 Nantes  |  +33 6 64 35 10 54", style_contact)
        ],
        [
            Paragraph("Product Builder / Forward Deployed Engineer & Commercial B2B", style_tagline),
            Paragraph("briac.pech@gmail.com  |  linkedin.com/in/briac-p-571676114/", style_contact)
        ]
    ]

    header_table = Table(header_data, colWidths=[320, 219])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 3))
    story.append(HRFlowable(width="100%", thickness=1.2, color=GOLD, spaceAfter=4))

    # --- PROFIL ---
    story.append(Paragraph("PROFIL PROFESSIONNEL", style_sec_title))
    story.append(Paragraph(
        "Commercial dans le secteur agroalimentaire et les produits de la mer, avec une expertise confirmée (+15 ans) dans la gestion de portefeuilles clients (GMS, grossistes, comptes clés), la négociation et le développement stratégique. Reconverti avec succès dans le <b>Product Building, le No-Code et l'IA (Certification RNCP Niveau 6)</b> : capacité unique à faire le lien entre les besoins métier du terrain et la création de solutions digitales automatisées.",
        style_body
    ))
    story.append(Spacer(1, 3))

    def section_header(title):
        return [
            Paragraph(title.upper(), style_sec_title),
            HRFlowable(width="100%", thickness=0.6, color=LINE_COLOR, spaceAfter=3)
        ]

    # --- EXPÉRIENCES ---
    story.extend(section_header("Parcours Professionnel"))

    # Maestro No Code
    t_maestro = Table([
        [Paragraph("Product Builder / Forward Deployed Engineer", style_job_title), Paragraph("2026 – Présent", style_job_date)],
        [Paragraph("Maestro No Code — Certification RNCP41143 (Niveau 6)", style_job_sub), Paragraph("", style_job_date)]
    ], colWidths=[399, 140])
    t_maestro.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 0)]))
    
    story.append(KeepTogether([
        t_maestro,
        Spacer(1, 1),
        Paragraph("• <b>Conception & Architecture :</b> Modélisation de bases de données relationnelles et création de produits digitaux sur-mesure.", style_bullet),
        Paragraph("• <b>Automatisation & Workflows :</b> Connexion d'API et automatisation de processus métiers complexes avec Make, Zapier & Airtable.", style_bullet),
        Paragraph("• <b>IA & Vibe Coding :</b> Prototypage d'applications web (React, Supabase, LLMs/Ollama/Gemini) et intégration de CRM intelligents.", style_bullet),
        Spacer(1, 3)
    ]))

    # Elafood
    t_elafood = Table([
        [Paragraph("Commercial Import/Export — GMS & Grossistes (CDI)", style_job_title), Paragraph("11/2023 – 07/2025", style_job_date)],
        [Paragraph("Elafood — Nantes (CA géré : 20 M€)", style_job_sub), Paragraph("", style_job_date)]
    ], colWidths=[399, 140])
    t_elafood.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 0)]))

    story.append(KeepTogether([
        t_elafood,
        Spacer(1, 1),
        Paragraph("• <b>Gestion Commerciale & Grands Comptes :</b> Pilotage d'un portefeuille clients GMS & Grossistes (CA 20 M€). Prospection et closing.", style_bullet),
        Paragraph("• <b>Achats & Supply Chain :</b> Achats internationaux (Islande, Norvège, USA), suivi des approvisionnements, logistique et qualité (QHSE).", style_bullet),
        Paragraph("• <b>Négociation & Litiges :</b> Négociation des conditions de vente, contrats et résolution rapide des litiges commerciaux.", style_bullet),
        Spacer(1, 3)
    ]))

    # Les Viviers de Noirmoutier
    t_viviers = Table([
        [Paragraph("Commercial — Produits de la Mer Frais d'Exception (CDI)", style_job_title), Paragraph("01/2021 – 08/2023", style_job_date)],
        [Paragraph("Les Viviers de Noirmoutier — Saint-Gilles-Croix-de-Vie", style_job_sub), Paragraph("", style_job_date)]
    ], colWidths=[399, 140])
    t_viviers.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 0)]))

    story.append(KeepTogether([
        t_viviers,
        Spacer(1, 1),
        Paragraph("• Développement des relations commerciales pour le commerce de gros, l'export et la GMS pour des produits d'exception.", style_bullet),
        Paragraph("• Suivi des comptes clés, gestion des réclamations clients et solutions adaptées à la politique commerciale.", style_bullet),
        Spacer(1, 3)
    ]))

    # Pomona Terre Azur
    t_pomona1 = Table([
        [Paragraph("Commercial GMS — Produits de la Mer (CDI)", style_job_title), Paragraph("11/2017 – 01/2021", style_job_date)],
        [Paragraph("Pomona Terre Azur — Nantes (CA géré : 2,8 M€)", style_job_sub), Paragraph("", style_job_date)]
    ], colWidths=[399, 140])
    t_pomona1.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 0)]))

    story.append(KeepTogether([
        t_pomona1,
        Spacer(1, 1),
        Paragraph("• Gestion et développement d'un portefeuille d'hypermarchés et supermarchés. Analyse du marché et propositions adaptées.", style_bullet),
        Spacer(1, 3)
    ]))

    # Pomona Passion Froid
    t_pomona2 = Table([
        [Paragraph("Commercial RHD — Produits Agroalimentaires (CDI)", style_job_title), Paragraph("10/2014 – 07/2017", style_job_date)],
        [Paragraph("Pomona Passion Froid — Aix-en-Provence", style_job_sub), Paragraph("", style_job_date)]
    ], colWidths=[399, 140])
    t_pomona2.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 0)]))

    story.append(KeepTogether([
        t_pomona2,
        Spacer(1, 1),
        Paragraph("• Développement du portefeuille client en restauration hors domicile (RHD). Négociation de contrats et suivi des commandes.", style_bullet),
        Spacer(1, 3)
    ]))

    # Les Pêcheries Océane & Socavi
    t_autres = Table([
        [Paragraph("Commercial GMS — Les Pêcheries Océane (Nantes, CA : 1,8 M€)", style_job_title), Paragraph("01/2009 – 10/2014", style_job_date)],
        [Paragraph("Chef de Secteur GMS (Apprentissage) — Socavi (Groupe Unicopa)", style_job_title), Paragraph("09/2006 – 10/2008", style_job_date)]
    ], colWidths=[399, 140])
    t_autres.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 0)]))
    story.append(t_autres)
    story.append(Spacer(1, 4))

    # --- FORMATION & CERTIFICATIONS ---
    story.extend(section_header("Formation & Certifications"))

    edu_data = [
        [Paragraph("<b>Concepteur de solution No-code (RNCP41143 - Niveau 6)</b>", style_body), Paragraph("<b>LION / Maestro (2026)</b>", style_job_sub)],
        [Paragraph("Master 1 CC2A (Cadre Commercial pour l'Agroalimentaire)", style_body), Paragraph("SUP'TG Niort (2006–2008)", style_contact)],
        [Paragraph("BTS Industries Agroalimentaires", style_body), Paragraph("Lycée Agricole Laval (2005–2006)", style_contact)],
        [Paragraph("Baccalauréat STAE (Sciences & Tech. Agronomie & Environnement)", style_body), Paragraph("Lycée Jules Rieffel (2002–2004)", style_contact)],
    ]
    t_edu = Table(edu_data, colWidths=[369, 170])
    t_edu.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE'), ('BOTTOMPADDING', (0,0), (-1,-1), 0)]))
    story.append(t_edu)
    story.append(Spacer(1, 3))

    story.append(Paragraph("<b>Certifications Continues & IA :</b>", style_body))
    story.append(Paragraph("• <b>Ingénierie de Prompts ChatGPT / LLMs</b> (Vanderbilt)  |  <b>Google Sheets : Analyse & Automatisation</b> (Google Cloud)", style_bullet))
    story.append(Paragraph("• <b>Data & Analytics Foundations</b> (Google)  |  <b>High Performance Collaboration & Negotiation</b> (Northwestern)", style_bullet))
    story.append(Spacer(1, 4))

    # --- COMPÉTENCES & STACK ---
    story.extend(section_header("Compétences & Stack"))

    skills_table_data = [
        [
            Paragraph("<b>Commercial & Opérations :</b>", style_body),
            Paragraph("Négociation commerciale, Prospection B2B, Closing grands comptes, Achats internationaux, QHSE, Merchandising, CRM & Reporting.", style_body)
        ],
        [
            Paragraph("<b>No-Code, Dev & IA :</b>", style_body),
            Paragraph("Make, Zapier, Airtable, Softr, React, Supabase, Tailwind, Prompt Engineering, Agents IA (Ollama, Gemini, Groq), REST APIs, SQL.", style_body)
        ]
    ]
    t_skills = Table(skills_table_data, colWidths=[135, 404])
    t_skills.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 1)]))
    story.append(t_skills)

    doc.build(story)
    print(f"PDF successfully generated: {filename}")

if __name__ == '__main__':
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cv_root = os.path.join(root_dir, "CV BRIAC.pdf")
    cv_public = os.path.join(root_dir, "public", "CV_Briac_Pecheur.pdf")
    cv_public_alt = os.path.join(root_dir, "public", "CV BRIAC.pdf")

    build_pdf(cv_root)
    build_pdf(cv_public)
    build_pdf(cv_public_alt)
