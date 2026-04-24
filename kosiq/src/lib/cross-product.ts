// Cross-product configuration: product metadata with colors for badges/links
export interface ProductInfo {
  id: string;
  name: string;
  accent: string;
  icon: string;
  basePath: string;
}

export const productMap: Record<string, ProductInfo> = {
  coreiq:          { id: 'coreiq',          name: 'CoreIQ',          accent: '#059669', icon: '🏥', basePath: '/coreiq' },
  atlasiq:         { id: 'atlasiq',         name: 'AtlasIQ',         accent: '#26acf7', icon: '🌐', basePath: '/dashboard' },
  riskEngine:      { id: 'riskEngine',      name: 'Risk Engine',     accent: '#F59E0B', icon: '⚡', basePath: '/risk-engine' },
  quality:         { id: 'quality',         name: 'Quality',         accent: '#10B981', icon: '✅', basePath: '/quality' },
  careManagement:  { id: 'careManagement',  name: 'Care Management', accent: '#EC4899', icon: '💗', basePath: '/care-management' },
  claimiq:         { id: 'claimiq',         name: 'ClaimIQ',         accent: '#7C3AED', icon: '📄', basePath: '/claimiq' },
  authiq:          { id: 'authiq',          name: 'AuthIQ',          accent: '#0891B2', icon: '🔐', basePath: '/authiq' },
  rpm:             { id: 'rpm',             name: 'RPM',             accent: '#06B6D4', icon: '📡', basePath: '/rpm' },
  behavioralHealth:{ id: 'behavioralHealth',name: 'Behavioral Health',accent: '#A855F7', icon: '🧠', basePath: '/behavioral-health' },
  fraudiq:         { id: 'fraudiq',         name: 'FraudIQ',         accent: '#DC2626', icon: '🛡️', basePath: '/fraudiq' },
  complianceiq:    { id: 'complianceiq',    name: 'ComplianceIQ',    accent: '#065F46', icon: '⚖️', basePath: '/complianceiq' },
  chartiq:         { id: 'chartiq',         name: 'ChartIQ',         accent: '#14B8A6', icon: '📋', basePath: '/chartiq' },
  pharmacy:        { id: 'pharmacy',        name: 'Pharmacy',        accent: '#F97316', icon: '💊', basePath: '/pharmacy' },
  costExplorer:    { id: 'costExplorer',    name: 'Cost Explorer',   accent: '#EF4444', icon: '💰', basePath: '/cost-explorer' },
  bridgeiq:        { id: 'bridgeiq',        name: 'BridgeIQ',        accent: '#3B82F6', icon: '🔗', basePath: '/bridgeiq' },
  cliniq:          { id: 'cliniq',          name: 'ClinIQ',          accent: '#8B5CF6', icon: '🧬', basePath: '/cliniq' },
};

export function getProduct(id: string): ProductInfo {
  return productMap[id] || productMap.coreiq;
}

// Standard API response format
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: { total: number; page: number; limit: number };
}

export function apiSuccess<T>(data: T, pagination?: { total: number; page: number; limit: number }): ApiResponse<T> {
  return { success: true, data, pagination };
}

export function apiError(error: string, status?: number): ApiResponse {
  return { success: false, error };
}

// Timeline event types
export interface TimelineEvent {
  id: string;
  date: string;
  type: string;
  title: string;
  description: string;
  product: string;
  productName: string;
  productColor: string;
  productIcon: string;
  metadata?: Record<string, unknown>;
  linkTo?: string;
}
