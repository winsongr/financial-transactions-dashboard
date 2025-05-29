export interface Investor {
  inv_name: string;
  total_amount: number;
  total_units: number;
}

export interface Scheme {
  scheme: string;
  users: Investor[];
}

export interface UserScheme {
  scheme: string;
  total_units: number;
  total_amount: number;
  nav_price: number;
}

export interface User {
  pan: string;
  inv_name: string;
  schemes: UserScheme[];
}

export interface DashboardSummary {
  total_investors: number;
  total_schemes: number;
  total_investments: number;
  total_nav_units: number;
  total_nav_amount: number;
}

export interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalInvestment: number;
  totalCurrentValue: number;
  totalReturn: number;
  schemes: UserSchemeDetail[];
}

export interface UserSchemeDetail {
  id: string;
  schemeName: string;
  investmentAmount: number;
  currentValue: number;
  units: number;
  navPerUnit: number;
  returnPercentage: number;
  investmentDate: string;
  status: 'active' | 'suspended' | 'matured';
}

export interface SchemeDistribution {
  scheme: string;
  total_units: number;
  total_amount: number;
} 