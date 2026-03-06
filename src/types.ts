export interface Expertise {
  title: string;
  description: string;
  iconName: string; // Store icon name as string for dynamic rendering
  cases: string;
}

export interface Judgment {
  id: string;
  court: string;
  year: string;
  type: string;
  subject: string;
  date: string;
  category: string;
  link: string;
}

export interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  about: {
    title: string;
    avatarUrl?: string;
    points: {
      number: string;
      title: string;
      description: string;
    }[];
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    facebook: string;
    instagram: string;
  };
  expertise: Expertise[];
  judgments: Judgment[];
}
