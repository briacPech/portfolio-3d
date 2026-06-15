import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Types pour la structure du CV
export interface CVData {
  identity: { name: string; contact: string; location: string };
  title: string;
  summary: string;
  skills: { hard: string[]; soft: string[] };
  experience: { company: string; role: string; duration: string; bullets: string[] }[];
  projects: { name: string; description: string; technologies: string[] }[];
  education: { degree: string; school: string; date: string }[];
  tools: string[];
}

interface Props {
  data: CVData;
  template: 'classic' | 'premium' | 'corporate';
}

// -----------------------------------------------------------------------------
// STYLES : CLASSIC (Minimaliste, noir & blanc)
// -----------------------------------------------------------------------------
const classicStyles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  title: { fontSize: 14, color: '#666', marginBottom: 5 },
  contact: { fontSize: 9, color: '#888' },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8, color: '#000' },
  item: { marginBottom: 10 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  itemTitle: { fontWeight: 'bold' },
  itemSubtitle: { fontStyle: 'italic', color: '#555' },
  itemDate: { fontSize: 9, color: '#777' },
  bullet: { flexDirection: 'row', marginBottom: 2 },
  bulletPoint: { width: 10, fontSize: 10 },
  bulletText: { flex: 1 },
  textRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: { backgroundColor: '#f0f0f0', padding: '2 4', borderRadius: 2, fontSize: 8, marginRight: 4, marginBottom: 4 }
});

// -----------------------------------------------------------------------------
// STYLES : PREMIUM (Moderne, couleurs sombres/or, marges généreuses)
// -----------------------------------------------------------------------------
const premiumStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#2C3E50', backgroundColor: '#FAFAFA' },
  header: { marginBottom: 25, alignItems: 'center' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', letterSpacing: 1 },
  title: { fontSize: 13, color: '#B99A5A', marginTop: 4, textTransform: 'uppercase', letterSpacing: 2 },
  contact: { fontSize: 9, color: '#64748B', marginTop: 8 },
  summary: { fontSize: 10, lineHeight: 1.5, textAlign: 'center', marginHorizontal: 20, marginBottom: 20, fontStyle: 'italic', color: '#475569' },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 14, color: '#0F172A', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 4, marginBottom: 10 },
  item: { marginBottom: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  itemTitle: { fontSize: 11, fontWeight: 'bold', color: '#1E293B' },
  itemSubtitle: { fontSize: 10, color: '#B99A5A' },
  itemDate: { fontSize: 9, color: '#94A3B8' },
  bullet: { flexDirection: 'row', marginBottom: 3 },
  bulletPoint: { width: 12, fontSize: 10, color: '#B99A5A' },
  bulletText: { flex: 1, color: '#334155', lineHeight: 1.4 },
  textRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { backgroundColor: '#E2E8F0', color: '#334155', padding: '3 6', borderRadius: 4, fontSize: 8, marginRight: 5, marginBottom: 5 }
});

// -----------------------------------------------------------------------------
// STYLES : CORPORATE (Structuré, 2 colonnes, bleu marine)
// -----------------------------------------------------------------------------
const corporateStyles = StyleSheet.create({
  page: { flexDirection: 'row', fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  sidebar: { width: '30%', backgroundColor: '#1E3A8A', padding: 20, color: '#FFF' },
  main: { width: '70%', padding: 20, backgroundColor: '#FFF' },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  title: { fontSize: 12, color: '#93C5FD', marginBottom: 15 },
  contactItem: { fontSize: 9, marginBottom: 5, color: '#DBEAFE' },
  sidebarSection: { marginTop: 20 },
  sidebarTitle: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#3B82F6', paddingBottom: 4, marginBottom: 10, color: '#FFF' },
  sidebarText: { fontSize: 9, marginBottom: 4, color: '#BFDBFE' },
  mainSection: { marginBottom: 15 },
  mainTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E3A8A', borderBottomWidth: 2, borderBottomColor: '#1E3A8A', paddingBottom: 4, marginBottom: 10 },
  summary: { fontSize: 10, lineHeight: 1.4, marginBottom: 15 },
  item: { marginBottom: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemTitle: { fontWeight: 'bold', fontSize: 11, color: '#1E3A8A' },
  itemSubtitle: { fontStyle: 'italic', color: '#4B5563' },
  itemDate: { fontSize: 9, color: '#6B7280' },
  bullet: { flexDirection: 'row', marginBottom: 2 },
  bulletPoint: { width: 10, fontSize: 10, color: '#1E3A8A' },
  bulletText: { flex: 1, lineHeight: 1.3 },
  tag: { fontSize: 9, marginBottom: 3, color: '#DBEAFE' }
});


// -----------------------------------------------------------------------------
// COMPOSANTS DE TEMPLATE
// -----------------------------------------------------------------------------

const ClassicTemplate = ({ data }: { data: CVData }) => (
  <Page size="A4" style={classicStyles.page}>
    <View style={classicStyles.header}>
      <Text style={classicStyles.name}>{data.identity?.name}</Text>
      <Text style={classicStyles.title}>{data.title}</Text>
      <Text style={classicStyles.contact}>{data.identity?.contact} • {data.identity?.location}</Text>
    </View>

    {data.summary && (
      <View style={classicStyles.section}>
        <Text style={classicStyles.sectionTitle}>Profil</Text>
        <Text style={{ lineHeight: 1.4 }}>{data.summary}</Text>
      </View>
    )}

    {data.experience && data.experience.length > 0 && (
      <View style={classicStyles.section}>
        <Text style={classicStyles.sectionTitle}>Expérience</Text>
        {data.experience.map((exp, i) => (
          <View key={i} style={classicStyles.item}>
            <View style={classicStyles.itemHeader}>
              <Text style={classicStyles.itemTitle}>{exp.role} — <Text style={classicStyles.itemSubtitle}>{exp.company}</Text></Text>
              <Text style={classicStyles.itemDate}>{exp.duration}</Text>
            </View>
            {exp.bullets?.map((b, j) => (
              <View key={j} style={classicStyles.bullet}>
                <Text style={classicStyles.bulletPoint}>•</Text>
                <Text style={classicStyles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    )}

    {data.projects && data.projects.length > 0 && (
      <View style={classicStyles.section}>
        <Text style={classicStyles.sectionTitle}>Projets</Text>
        {data.projects.map((proj, i) => (
          <View key={i} style={classicStyles.item}>
            <View style={classicStyles.itemHeader}>
              <Text style={classicStyles.itemTitle}>{proj.name}</Text>
            </View>
            <Text style={{ marginBottom: 3, lineHeight: 1.3 }}>{proj.description}</Text>
            <View style={classicStyles.textRow}>
              {proj.technologies?.map((t, j) => <Text key={j} style={classicStyles.tag}>{t}</Text>)}
            </View>
          </View>
        ))}
      </View>
    )}

    <View style={classicStyles.section}>
      <Text style={classicStyles.sectionTitle}>Compétences & Outils</Text>
      {data.skills?.hard && data.skills.hard.length > 0 && (
        <Text style={{ marginBottom: 5 }}><Text style={{ fontWeight: 'bold' }}>Hard Skills: </Text>{data.skills.hard.join(' • ')}</Text>
      )}
      {data.skills?.soft && data.skills.soft.length > 0 && (
        <Text style={{ marginBottom: 5 }}><Text style={{ fontWeight: 'bold' }}>Soft Skills: </Text>{data.skills.soft.join(' • ')}</Text>
      )}
      {data.tools && data.tools.length > 0 && (
        <Text><Text style={{ fontWeight: 'bold' }}>Outils: </Text>{data.tools.join(' • ')}</Text>
      )}
    </View>

    {data.education && data.education.length > 0 && (
      <View style={classicStyles.section}>
        <Text style={classicStyles.sectionTitle}>Formation</Text>
        {data.education.map((edu, i) => (
          <View key={i} style={classicStyles.itemHeader}>
            <Text style={classicStyles.itemTitle}>{edu.degree} — <Text style={classicStyles.itemSubtitle}>{edu.school}</Text></Text>
            <Text style={classicStyles.itemDate}>{edu.date}</Text>
          </View>
        ))}
      </View>
    )}
  </Page>
);

const PremiumTemplate = ({ data }: { data: CVData }) => (
  <Page size="A4" style={premiumStyles.page}>
    <View style={premiumStyles.header}>
      <Text style={premiumStyles.name}>{data.identity?.name}</Text>
      <Text style={premiumStyles.title}>{data.title}</Text>
      <Text style={premiumStyles.contact}>{data.identity?.contact}  |  {data.identity?.location}</Text>
    </View>

    {data.summary && <Text style={premiumStyles.summary}>{data.summary}</Text>}

    {data.experience && data.experience.length > 0 && (
      <View style={premiumStyles.section}>
        <Text style={premiumStyles.sectionTitle}>Expérience Professionnelle</Text>
        {data.experience.map((exp, i) => (
          <View key={i} style={premiumStyles.item}>
            <View style={premiumStyles.itemHeader}>
              <View>
                <Text style={premiumStyles.itemTitle}>{exp.role}</Text>
                <Text style={premiumStyles.itemSubtitle}>{exp.company}</Text>
              </View>
              <Text style={premiumStyles.itemDate}>{exp.duration}</Text>
            </View>
            {exp.bullets?.map((b, j) => (
              <View key={j} style={premiumStyles.bullet}>
                <Text style={premiumStyles.bulletPoint}>›</Text>
                <Text style={premiumStyles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    )}

    {data.projects && data.projects.length > 0 && (
      <View style={premiumStyles.section}>
        <Text style={premiumStyles.sectionTitle}>Projets Clés</Text>
        {data.projects.map((proj, i) => (
          <View key={i} style={premiumStyles.item}>
            <Text style={premiumStyles.itemTitle}>{proj.name}</Text>
            <Text style={{ fontSize: 9, color: '#475569', marginBottom: 4, marginTop: 2, lineHeight: 1.3 }}>{proj.description}</Text>
            <View style={premiumStyles.textRow}>
              {proj.technologies?.map((t, j) => <Text key={j} style={premiumStyles.tag}>{t}</Text>)}
            </View>
          </View>
        ))}
      </View>
    )}

    <View style={premiumStyles.section}>
      <Text style={premiumStyles.sectionTitle}>Expertise</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: '48%' }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4, color: '#1E293B' }}>Hard Skills</Text>
          {data.skills?.hard?.map((s, i) => <Text key={i} style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>• {s}</Text>)}
        </View>
        <View style={{ width: '48%' }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4, color: '#1E293B' }}>Soft Skills & Outils</Text>
          {data.skills?.soft?.map((s, i) => <Text key={i} style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>• {s}</Text>)}
          {data.tools?.map((t, i) => <Text key={`t-${i}`} style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>• {t}</Text>)}
        </View>
      </View>
    </View>

    {data.education && data.education.length > 0 && (
      <View style={premiumStyles.section}>
        <Text style={premiumStyles.sectionTitle}>Formation</Text>
        {data.education.map((edu, i) => (
          <View key={i} style={premiumStyles.itemHeader}>
            <View>
              <Text style={premiumStyles.itemTitle}>{edu.degree}</Text>
              <Text style={premiumStyles.itemSubtitle}>{edu.school}</Text>
            </View>
            <Text style={premiumStyles.itemDate}>{edu.date}</Text>
          </View>
        ))}
      </View>
    )}
  </Page>
);

const CorporateTemplate = ({ data }: { data: CVData }) => {
  const contactParts = data.identity?.contact?.split('•').map(s => s.trim()) || [];
  
  return (
    <Page size="A4" style={corporateStyles.page}>
      {/* SIDEBAR */}
      <View style={corporateStyles.sidebar}>
        <Text style={corporateStyles.name}>{data.identity?.name}</Text>
        <Text style={corporateStyles.title}>{data.title}</Text>
        
        <View style={corporateStyles.sidebarSection}>
          <Text style={corporateStyles.sidebarTitle}>Contact</Text>
          {contactParts.map((c, i) => <Text key={i} style={corporateStyles.contactItem}>{c}</Text>)}
          <Text style={corporateStyles.contactItem}>{data.identity?.location}</Text>
        </View>

        <View style={corporateStyles.sidebarSection}>
          <Text style={corporateStyles.sidebarTitle}>Compétences</Text>
          {data.skills?.hard?.map((s, i) => <Text key={i} style={corporateStyles.sidebarText}>• {s}</Text>)}
        </View>

        <View style={corporateStyles.sidebarSection}>
          <Text style={corporateStyles.sidebarTitle}>Soft Skills</Text>
          {data.skills?.soft?.map((s, i) => <Text key={i} style={corporateStyles.sidebarText}>• {s}</Text>)}
        </View>

        <View style={corporateStyles.sidebarSection}>
          <Text style={corporateStyles.sidebarTitle}>Outils</Text>
          {data.tools?.map((t, i) => <Text key={i} style={corporateStyles.sidebarText}>• {t}</Text>)}
        </View>

        {data.education && data.education.length > 0 && (
          <View style={corporateStyles.sidebarSection}>
            <Text style={corporateStyles.sidebarTitle}>Formation</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#FFF' }}>{edu.degree}</Text>
                <Text style={{ fontSize: 9, color: '#DBEAFE' }}>{edu.school}</Text>
                <Text style={{ fontSize: 8, color: '#93C5FD' }}>{edu.date}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* MAIN CONTENT */}
      <View style={corporateStyles.main}>
        {data.summary && (
          <View style={corporateStyles.mainSection}>
            <Text style={corporateStyles.mainTitle}>Profil Professionnel</Text>
            <Text style={corporateStyles.summary}>{data.summary}</Text>
          </View>
        )}

        {data.experience && data.experience.length > 0 && (
          <View style={corporateStyles.mainSection}>
            <Text style={corporateStyles.mainTitle}>Expérience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={corporateStyles.item}>
                <View style={corporateStyles.itemHeader}>
                  <Text style={corporateStyles.itemTitle}>{exp.role}</Text>
                  <Text style={corporateStyles.itemDate}>{exp.duration}</Text>
                </View>
                <Text style={corporateStyles.itemSubtitle}>{exp.company}</Text>
                <View style={{ marginTop: 4 }}>
                  {exp.bullets?.map((b, j) => (
                    <View key={j} style={corporateStyles.bullet}>
                      <Text style={corporateStyles.bulletPoint}>•</Text>
                      <Text style={corporateStyles.bulletText}>{b}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {data.projects && data.projects.length > 0 && (
          <View style={corporateStyles.mainSection}>
            <Text style={corporateStyles.mainTitle}>Projets Majeurs</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={corporateStyles.item}>
                <Text style={corporateStyles.itemTitle}>{proj.name}</Text>
                <Text style={{ fontSize: 9, marginBottom: 3, lineHeight: 1.3 }}>{proj.description}</Text>
                <Text style={{ fontSize: 8, fontStyle: 'italic', color: '#6B7280' }}>Tech: {proj.technologies?.join(', ')}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Page>
  );
};

export const CvPdfDocument = ({ data, template }: Props) => {
  return (
    <Document>
      {template === 'classic' && <ClassicTemplate data={data} />}
      {template === 'premium' && <PremiumTemplate data={data} />}
      {template === 'corporate' && <CorporateTemplate data={data} />}
    </Document>
  );
};
