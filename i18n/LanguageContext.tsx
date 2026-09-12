import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage } from '../types';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    es: string;
    fr: string;
    te: string;
  };
}

const TRANSLATIONS: Translations = {
  // Navigation
  navNgoCenters: {
    en: 'NGO Centers',
    hi: 'एनजीओ केंद्र',
    es: 'Centros de ONG',
    fr: 'Centres ONG',
    te: 'ఎన్జీవో కేంద్రాలు',
  },
  navJobBoard: {
    en: 'Job & Tool Grants',
    hi: 'नौकरी और टूल अनुदान',
    es: 'Empleos y Becas',
    fr: 'Emplois & Outils',
    te: 'ఉద్యోగాలు & టూల్ గ్రాంట్లు',
  },
  navVerify: {
    en: 'Verify Certificate',
    hi: 'प्रमाणपत्र सत्यापन',
    es: 'Verificar Certificado',
    fr: 'Vérifier Certificat',
    te: 'సర్టిఫికేట్ ధృవీకరణ',
  },
  navStudentHub: {
    en: 'Student Hub',
    hi: 'छात्र पोर्टल',
    es: 'Portal de Estudiantes',
    fr: 'Espace Étudiant',
    te: 'విద్యార్థి పోర్టల్',
  },
  navAdminStudio: {
    en: 'Admin Studio',
    hi: 'व्यवस्थापक स्टूडियो',
    es: 'Estudio de Admin',
    fr: 'Studio Admin',
    te: 'అడ్మిన్ స్టూడియో',
  },
  navCoach: {
    en: 'AI Trade Coach',
    hi: 'एआई ट्रेड कोच',
    es: 'Coach de Oficio IA',
    fr: 'Coach Métier IA',
    te: 'ఏఐ ట్రేడ్ కోచ్',
  },
  navEmployers: {
    en: 'Employer Portal',
    hi: 'नियोक्ता पोर्टल',
    es: 'Portal Empleadores',
    fr: 'Portail Employeurs',
    te: 'ఎంప్లాయర్ పోర్టల్',
  },
  navWorkshops: {
    en: 'Workshop Map',
    hi: 'कार्यशाला मानचित्र',
    es: 'Mapa de Talleres',
    fr: 'Carte Ateliers',
    te: 'వర్క్‌షాప్ మ్యాప్',
  },
  navRegisterNgo: {
    en: 'Register NGO',
    hi: 'एनजीओ पंजीकृत करें',
    es: 'Registrar ONG',
    fr: 'Enregistrer ONG',
    te: 'ఎన్జీవో నమోదు',
  },
  navSignIn: {
    en: 'Sign In / Register',
    hi: 'साइन इन / पंजीकरण',
    es: 'Iniciar Sesión',
    fr: 'Connexion',
    te: 'సైన్ ఇన్ / రిజిస్టర్',
  },

  // Hero Section
  heroBadge: {
    en: 'Live Network Active • 2026 Vocational Cohorts Enrolling',
    hi: 'लाइव नेटवर्क सक्रिय • 2026 व्यावसायिक प्रशिक्षण नामांकन जारी',
    es: 'Red Activa • Cohortes Vocacionales 2026 Abiertas',
    fr: 'Réseau Actif • Inscriptions Professionnelles 2026 Ouvertes',
    te: 'లైవ్ నెట్‌వర్క్ క్రియాశీలంగా ఉంది • 2026 ఒకేషనల్ బ్యాచ్‌లు ప్రారంభం',
  },
  heroTitle1: {
    en: 'Empowering Real Skills.',
    hi: 'व्यावहारिक कौशल को सशक्त बनाना।',
    es: 'Impulsando Habilidades Reales.',
    fr: 'Développer de Vraies Compétences.',
    te: 'నిజమైన నైపుణ్యాలను పెంపొందించడం.',
  },
  heroTitle2: {
    en: 'Building Futures.',
    hi: 'भविष्य का निर्माण।',
    es: 'Construyendo Futuros.',
    fr: 'Construire l’Avenir.',
    te: 'ఉజ్వల భవిష్యత్తును నిర్మించడం.',
  },
  heroSubtitle: {
    en: 'SkillSpot 2.0 unifies trusted NGOs, practical trade workshops, and verified credentials under one transparent decentralized ecosystem.',
    hi: 'SkillSpot 2.0 विश्वसनीय गैर-सरकारी संगठनों, व्यावहारिक कार्यशालाओं और सत्यापित प्रमाणपत्रों को एक पारदर्शी मंच पर जोड़ता है।',
    es: 'SkillSpot 2.0 unifica ONG verificadas, talleres prácticos y credenciales digitales en un ecosistema transparente.',
    fr: 'SkillSpot 2.0 réunit ONG certifiées, ateliers d’apprentissage et diplômes vérifiés dans un écosystème décentralisé.',
    te: 'స్కిల్‌స్పాట్ 2.0 విశ్వసనీయ ఎన్జీవోలు, ప్రాక్టికల్ వర్క్‌షాప్‌లు మరియు ధృవీకరించబడిన సర్టిఫికెట్లను ఒకే పారదర్శక వేదికపైకి తెస్తుంది.',
  },
  browsePrograms: {
    en: 'Browse Vocational Programs',
    hi: 'व्यावसायिक कार्यक्रम ब्राउज़ करें',
    es: 'Explorar Programas',
    fr: 'Découvrir les Programmes',
    te: 'కోర్సులను అన్వేషించండి',
  },

  // Impact Stats
  partnerNgos: {
    en: 'Partner NGOs',
    hi: 'सहयोगी एनजीओ',
    es: 'ONG Aliadas',
    fr: 'ONG Partenaires',
    te: 'భాగస్వామ్య ఎన్జీవోలు',
  },
  activeCourses: {
    en: 'Vocational Courses',
    hi: 'व्यावसायिक पाठ्यक्रम',
    es: 'Cursos Vocacionales',
    fr: 'Formations Pro',
    te: 'వృత్తి శిక్షణా కోర్సులు',
  },
  activeStudents: {
    en: 'Active Students',
    hi: 'सक्रिय छात्र',
    es: 'Estudiantes Activos',
    fr: 'Apprenants Actifs',
    te: 'క్రియాశీల విద్యార్థులు',
  },
  certificatesIssued: {
    en: 'Certificates Issued',
    hi: 'प्रमाणपत्र जारी किए गए',
    es: 'Certificados Emitidos',
    fr: 'Certificats Délivrés',
    te: 'సర్టిఫికెట్లు జారీ చేయబడ్డాయి',
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('skillspot_language');
      return (saved as SupportedLanguage) || 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('skillspot_language', lang);
    } catch (e) {
      console.warn('Could not save language to storage', e);
    }
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key] && TRANSLATIONS[key][language]) {
      return TRANSLATIONS[key][language];
    }
    if (TRANSLATIONS[key] && TRANSLATIONS[key].en) {
      return TRANSLATIONS[key].en;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
