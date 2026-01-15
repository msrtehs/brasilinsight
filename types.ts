
export interface MunicipalityData {
  name: string;
  population: string;
  cemeteriesCount: string;
  cemeteriesStatus: string;
  averageIncome: string;
  economicSituation: string;
  groundingLinks: GroundingLink[];
}

export interface GroundingLink {
  title: string;
  uri: string;
}

export interface User {
  email: string;
  isLoggedIn: boolean;
}
