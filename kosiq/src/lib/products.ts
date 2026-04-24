export interface ProductNav {
  href: string;
  label: string;
  icon: string;
  children?: { href: string; label: string }[];
}

export interface Product {
  id: string;
  name: string;
  accent: string;
  icon: string;
  description: string;
  nav: ProductNav[];
  external?: string; // external link
}

export const products: Product[] = [
  {
    id: 'pophealth',
    name: 'AtlasIQ',
    accent: '#26acf7',
    icon: '🏥',
    description: 'Population Health Analytics',
    nav: [
      { href: '/dashboard', label: 'Action Center', icon: 'AC' },
      {
        href: '/business-insights', label: 'Business Insights', icon: 'BI',
        children: [
          { href: '/business-insights/executive', label: 'Executive View' },
          { href: '/business-insights/scorecards', label: 'Physician Scorecards' },
          { href: '/business-insights/footprint', label: 'Business Footprint' },
          { href: '/business-insights/survey', label: 'Survey Results' },
        ],
      },
      {
        href: '/membership', label: 'Membership', icon: 'MB',
        children: [
          { href: '/membership', label: 'Dashboard' },
          { href: '/membership/list', label: 'Membership List' },
          { href: '/membership/engagement', label: 'Patient Engagement' },
          { href: '/membership/outside-area', label: 'Patients Outside Service Area' },
        ],
      },
      {
        href: '/pharmacy', label: 'Pharmacy', icon: 'RX',
        children: [
          { href: '/pharmacy', label: 'Dashboards' },
          { href: '/pharmacy/list', label: 'Pharmacy List' },
          { href: '/pharmacy/top-rx', label: 'Top Rx' },
          { href: '/pharmacy/top-drugs-pcp', label: 'Top Drugs by PCP' },
          { href: '/pharmacy/top-utilizers', label: 'Top Utilizers' },
          { href: '/pharmacy/brand-vs-generic', label: 'Brand vs Generic' },
        ],
      },
      {
        href: '/hospitalization', label: 'Hospitalization', icon: 'HO',
        children: [
          { href: '/hospitalization', label: 'Statistics' },
          { href: '/hospitalization/live-census', label: 'Live Census' },
          { href: '/hospitalization/insurance-census', label: 'Insurance Census' },
          { href: '/hospitalization/top-utilizers', label: 'Top Patient Utilizers' },
          { href: '/hospitalization/discharged', label: 'Discharged Patients' },
          { href: '/hospitalization/er', label: 'ER' },
        ],
      },
      {
        href: '/complex-cases', label: 'Complex Cases', icon: 'CC',
        children: [
          { href: '/complex-cases', label: 'Dashboard' },
          { href: '/complex-cases/details', label: 'Details' },
          { href: '/complex-cases/high-utilizers', label: 'High Utilizers' },
        ],
      },
      { href: '/claims', label: 'Claims', icon: 'CL' },
      {
        href: '/billing', label: 'Billing & Coding', icon: 'BC',
        children: [
          { href: '/billing', label: 'MRA' },
        ],
      },
      {
        href: '/referrals', label: 'Referrals', icon: 'RF',
        children: [
          { href: '/referrals', label: 'Dashboards' },
          { href: '/referrals/details', label: 'Details' },
          { href: '/referrals/analysis', label: 'Analysis' },
        ],
      },
      {
        href: '/finance', label: 'Finance', icon: 'FN',
        children: [
          { href: '/finance', label: 'Dashboards' },
          { href: '/finance/revenue-details', label: 'Revenue Details' },
          { href: '/finance/trend', label: 'Financial Trend' },
        ],
      },
      { href: '/population-health', label: 'Population Health', icon: 'PH' },
      {
        href: '/predictive', label: 'Predictive AI', icon: 'PA',
        children: [
          { href: '/predictive#risk-stratification', label: 'Risk Stratification' },
          { href: '/predictive#predictive-models', label: 'Predictive Models' },
          { href: '/predictive#care-targeting', label: 'Care Targeting' },
          { href: '/predictive#provider-performance', label: 'Provider Performance' },
        ],
      },
      { href: '/prescriptive', label: 'Prescriptive AI', icon: 'Rx' },
      { href: '/ai-reports', label: 'AI Recommendations', icon: 'AI' },
      { href: '/reports', label: 'Reports', icon: 'RP' },
      { href: '/ens', label: 'ENS Feed', icon: 'EN' },
      { href: '/upload', label: 'Data Upload', icon: 'UP' },
      { href: '/exports', label: 'Exports', icon: 'EX' },
      { href: '/settings', label: 'Settings', icon: 'ST' },
    ],
  },
  {
    id: 'cliniq',
    name: 'ClinIQ',
    accent: '#8B5CF6',
    icon: '🧬',
    description: 'Clinical Intelligence for PHR',
    nav: [
      { href: '/cliniq', label: 'Dashboard', icon: 'DB' },
      { href: '/cliniq/analysis', label: 'Analysis Trees', icon: 'AT' },
      { href: '/cliniq/builder', label: 'Tree Builder', icon: 'TB' },
      { href: '/cliniq/templates', label: 'Templates', icon: 'TP' },
      { href: '/cliniq/alerts', label: 'Alerts', icon: 'AL' },
      { href: '/cliniq/metrics', label: 'Metrics Library', icon: 'ML' },
    ],
  },
  {
    id: 'risk-engine',
    name: 'Risk Engine',
    accent: '#F59E0B',
    icon: '⚡',
    description: 'Risk Adjustment & Stratification',
    nav: [
      { href: '/risk-engine', label: 'Dashboard', icon: 'DB' },
      { href: '/risk-engine/hcc', label: 'HCC Risk Adjustment', icon: 'HC' },
      { href: '/risk-engine/arc', label: 'ARC Classification', icon: 'AR' },
      { href: '/risk-engine/providers', label: 'Provider Drill-Down', icon: 'PD' },
      { href: '/risk-engine/gaps', label: 'Coding Gaps', icon: 'CG' },
    ],
  },
  {
    id: 'quality',
    name: 'Quality',
    accent: '#10B981',
    icon: '✅',
    description: 'Quality Measures & HEDIS',
    nav: [
      { href: '/quality', label: 'Dashboard', icon: 'DB' },
      { href: '/quality/hedis', label: 'HEDIS Measures', icon: 'HE' },
      { href: '/quality/pcmh', label: 'PCMH', icon: 'PC' },
      { href: '/quality/gaps', label: 'Gap-in-Care', icon: 'GC' },
      { href: '/quality/providers', label: 'Provider Scorecard', icon: 'PS' },
    ],
  },
  {
    id: 'care-management',
    name: 'Care Management',
    accent: '#EC4899',
    icon: '💗',
    description: 'CCM, PCM, TCM Programs',
    nav: [
      { href: '/care-management', label: 'Dashboard', icon: 'DB' },
      { href: '/care-management/ccm', label: 'CCM', icon: 'CM' },
      { href: '/care-management/pcm', label: 'PCM', icon: 'PM' },
      { href: '/care-management/apcm', label: 'APCM', icon: 'AP' },
      { href: '/care-management/tcm', label: 'TCM', icon: 'TC' },
      { href: '/care-management/care-plans', label: 'Care Plans', icon: 'CP' },
    ],
  },
  {
    id: 'rpm',
    name: 'RPM',
    accent: '#06B6D4',
    icon: '📡',
    description: 'Remote Patient Monitoring',
    nav: [
      { href: '/rpm', label: 'Dashboard', icon: 'DB' },
      { href: '/rpm/devices', label: 'Devices', icon: 'DV' },
      { href: '/rpm/vitals', label: 'Vitals Trending', icon: 'VT' },
      { href: '/rpm/alerts', label: 'Alerts', icon: 'AL' },
      { href: '/rpm/work-queue', label: 'Work Queue', icon: 'WQ' },
    ],
  },
  {
    id: 'behavioral-health',
    name: 'Behavioral Health',
    accent: '#A855F7',
    icon: '🧠',
    description: 'Mental & Behavioral Health',
    nav: [
      { href: '/behavioral-health', label: 'Dashboard', icon: 'DB' },
      { href: '/behavioral-health/screenings', label: 'Screenings', icon: 'SC' },
      { href: '/behavioral-health/bhm', label: 'BHM', icon: 'BH' },
      { href: '/behavioral-health/bhis', label: 'BHIS', icon: 'BI' },
      { href: '/behavioral-health/caseload', label: 'Caseload', icon: 'CL' },
    ],
  },
  {
    id: 'cost-explorer',
    name: 'Cost Explorer',
    accent: '#EF4444',
    icon: '💰',
    description: 'Claims & Cost Analysis',
    nav: [
      { href: '/cost-explorer', label: 'Dashboard', icon: 'DB' },
      { href: '/cost-explorer/claims', label: 'Claims Analysis', icon: 'CA' },
      { href: '/cost-explorer/utilization', label: 'Utilization', icon: 'UT' },
      { href: '/cost-explorer/er', label: 'ER Analysis', icon: 'ER' },
      { href: '/cost-explorer/gaps', label: 'Care Gaps', icon: 'CG' },
      { href: '/cost-explorer/mlr', label: 'MLR Analysis', icon: 'ML' },
    ],
  },
  {
    id: 'payer-analytics',
    name: 'Payer Analytics',
    accent: '#F97316',
    icon: '📊',
    description: 'Multi-Payer Intelligence',
    nav: [
      { href: '/payer-analytics', label: 'Dashboard', icon: 'DB' },
      { href: '/payer-analytics/quality', label: 'Quality', icon: 'QL' },
      { href: '/payer-analytics/hcc', label: 'HCC', icon: 'HC' },
      { href: '/payer-analytics/er', label: 'ER Visits', icon: 'ER' },
      { href: '/payer-analytics/costs', label: 'Predictive Costs', icon: 'PC' },
      { href: '/payer-analytics/rx', label: 'Rx Analytics', icon: 'RX' },
      { href: '/payer-analytics/referrals', label: 'Referrals', icon: 'RF' },
      { href: '/payer-analytics/kpi', label: 'KPI Tracking', icon: 'KP' },
      { href: '/payer-analytics/portal', label: 'Payer Portal', icon: 'PP' },
    ],
  },
  {
    id: 'bridgeiq',
    name: 'BridgeIQ',
    accent: '#3B82F6',
    icon: '🔗',
    description: 'Interoperability Hub',
    nav: [
      { href: '/bridgeiq', label: 'Dashboard', icon: 'DB' },
      { href: '/bridgeiq/timeline', label: 'Health Timeline', icon: 'TL' },
      { href: '/bridgeiq/records', label: 'Record Import', icon: 'RI' },
      { href: '/bridgeiq/messaging', label: 'Provider Messaging', icon: 'PM' },
      { href: '/bridgeiq/network', label: 'Network Directory', icon: 'ND' },
      { href: '/bridgeiq/fhir', label: 'FHIR Exchange', icon: 'FH' },
    ],
  },
  {
    id: 'coreiq',
    name: 'CoreIQ',
    accent: '#059669',
    icon: '🏥',
    description: 'Electronic Medical Records',
    nav: [
      { href: '/coreiq', label: 'Dashboard', icon: 'DB' },
      { href: '/coreiq/scheduling', label: 'Scheduling', icon: 'SC' },
      { href: '/coreiq/encounters', label: 'Encounters', icon: 'EN' },
      { href: '/coreiq/patients', label: 'Patients', icon: 'PT' },
      { href: '/coreiq/prescriptions', label: 'E-Prescribing', icon: 'RX' },
      { href: '/coreiq/labs', label: 'Lab Orders', icon: 'LB' },
      { href: '/coreiq/billing', label: 'Billing', icon: 'BL' },
      { href: '/coreiq/portal', label: 'Patient Portal', icon: 'PP' },
      { href: '/coreiq/templates', label: 'Templates', icon: 'TP' },
      { href: '/coreiq/room-in-out', label: 'Room In/Out', icon: 'RI' },
      { href: '/coreiq/documents', label: 'Documents', icon: 'DC' },
      { href: '/coreiq/senior-care', label: 'Senior Care', icon: 'SR' },
      { href: '/coreiq/messaging', label: 'Messaging', icon: 'MS' },
      { href: '/coreiq/referrals', label: 'Referrals', icon: 'RF' },
    ],
  },
  {
    id: 'chartiq',
    name: 'ChartIQ',
    accent: '#14B8A6',
    icon: '📋',
    description: 'Intelligent Charting',
    nav: [
      { href: '/chartiq', label: 'Dashboard', icon: 'DB' },
      { href: '/chartiq/patients', label: 'Patients', icon: 'PT' },
      { href: '/chartiq/handoff', label: 'Handoff Reports', icon: 'HO' },
      { href: '/chartiq/settings', label: 'Settings', icon: 'ST' },
    ],
  },
  {
    id: 'fraudiq',
    name: 'FraudIQ',
    accent: '#DC2626',
    icon: '🛡️',
    description: 'Fraud, Waste & Abuse Detection',
    nav: [
      { href: '/fraudiq', label: 'Dashboard', icon: 'DB' },
      { href: '/fraudiq/anomalies', label: 'Anomaly Detection', icon: 'AD' },
      { href: '/fraudiq/providers', label: 'Provider Outliers', icon: 'PO' },
      { href: '/fraudiq/investigations', label: 'Investigations', icon: 'IN' },
      { href: '/fraudiq/provider-comparison', label: 'Provider Analytics', icon: 'PA' },
      { href: '/fraudiq/reports', label: 'Reports', icon: 'RP' },
    ],
  },
  {
    id: 'claimiq',
    name: 'ClaimIQ',
    accent: '#7C3AED',
    icon: '📄',
    description: 'Claims Processing Engine',
    nav: [
      { href: '/claimiq', label: 'Dashboard', icon: 'DB' },
      { href: '/claimiq/queue', label: 'Claims Queue', icon: 'CQ' },
      { href: '/claimiq/scrubbing', label: 'Scrubbing', icon: 'SC' },
      { href: '/claimiq/denials', label: 'Denials', icon: 'DN' },
      { href: '/claimiq/denial-trends', label: 'Denial Analytics', icon: 'DA' },
      { href: '/claimiq/appeals', label: 'Appeals', icon: 'AP' },
      { href: '/claimiq/eligibility', label: 'Eligibility', icon: 'EL' },
      { href: '/claimiq/era', label: 'ERA Posting', icon: 'ER' },
    ],
  },
  {
    id: 'authiq',
    name: 'AuthIQ',
    accent: '#0891B2',
    icon: '🔐',
    description: 'Prior Authorization',
    nav: [
      { href: '/authiq', label: 'Dashboard', icon: 'DB' },
      { href: '/authiq/queue', label: 'Auth Queue', icon: 'AQ' },
      { href: '/authiq/new', label: 'New Request', icon: 'NR' },
      { href: '/authiq/tracking', label: 'Tracking', icon: 'TR' },
      { href: '/authiq/analytics', label: 'Analytics', icon: 'AN' },
      { href: '/authiq/turnaround', label: 'Turnaround Times', icon: 'TT' },
      { href: '/authiq/p2p-reviews', label: 'P2P Reviews', icon: 'P2' },
    ],
  },
  {
    id: 'complianceiq',
    name: 'ComplianceIQ',
    accent: '#065F46',
    icon: '⚖️',
    description: 'Regulatory Compliance',
    nav: [
      { href: '/complianceiq', label: 'Dashboard', icon: 'DB' },
      { href: '/complianceiq/hipaa', label: 'HIPAA', icon: 'HP' },
      { href: '/complianceiq/training', label: 'Training', icon: 'TR' },
      { href: '/complianceiq/incidents', label: 'Incidents', icon: 'IC' },
      { href: '/complianceiq/audits', label: 'Audits', icon: 'AU' },
      { href: '/complianceiq/policies', label: 'Policies', icon: 'PL' },
      { href: '/complianceiq/risk-assessment', label: 'Risk Assessment', icon: 'RA' },
    ],
  },
];

export function getProductFromPath(pathname: string): Product {
  // Check if path matches any non-pophealth product
  for (const p of products) {
    if (p.id !== 'pophealth' && pathname.startsWith('/' + p.id)) {
      return p;
    }
  }
  // Default to pophealth
  return products[0];
}
