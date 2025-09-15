// Regulatory Compliance and Reporting System
// Comprehensive system for managing regulatory compliance across multiple jurisdictions

import { z } from 'zod'
import crypto from 'crypto'

// Regulatory Framework Types
export interface RegulatoryFramework {
  id: string
  name: string
  jurisdiction: string
  type: 'financial' | 'data_protection' | 'consumer' | 'securities' | 'aml' | 'tax' | 'general'
  authority: RegulatoryAuthority
  version: string
  effectiveDate: string
  requirements: RegulatoryRequirement[]
  penalties: Penalty[]
  exemptions: Exemption[]
  applicability: ApplicabilityCriteria
  lastUpdated: string
}

export interface RegulatoryAuthority {
  name: string
  acronym: string
  country: string
  website: string
  contactInfo: ContactInfo
  jurisdiction: string[]
  powers: AuthorityPower[]
}

export interface ContactInfo {
  email: string
  phone: string
  address: string
  businessHours: string
  emergencyContact?: string
}

export interface AuthorityPower {
  type: 'investigation' | 'enforcement' | 'licensing' | 'rulemaking' | 'supervision'
  scope: string[]
  limitations: string[]
}

export interface RegulatoryRequirement {
  id: string
  title: string
  description: string
  category: RequirementCategory
  priority: 'low' | 'medium' | 'high' | 'critical'
  mandatory: boolean
  deadline?: string
  frequency: ComplianceFrequency
  evidence: EvidenceRequirement[]
  controls: ControlRequirement[]
  reporting: ReportingObligation[]
  testing: TestingRequirement[]
  exceptions: string[]
}

export type RequirementCategory = 
  | 'licensing'
  | 'registration'
  | 'disclosure'
  | 'record_keeping'
  | 'reporting'
  | 'capital'
  | 'operational'
  | 'governance'
  | 'risk_management'
  | 'consumer_protection'
  | 'market_conduct'
  | 'cybersecurity'
  | 'data_protection'
  | 'aml_kyc'
  | 'sanctions'

export type ComplianceFrequency = 
  | 'once'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'semi_annual'
  | 'annual'
  | 'ad_hoc'
  | 'continuous'

export interface EvidenceRequirement {
  type: string
  description: string
  format: string[]
  retention: number // Days
  access: string[]
  validation: ValidationRule[]
}

export interface ValidationRule {
  rule: string
  parameters: Record<string, any>
  errorMessage: string
}

export interface ControlRequirement {
  id: string
  type: 'preventive' | 'detective' | 'corrective'
  description: string
  implementation: string[]
  testing: string
  frequency: string
  owner: string
}

export interface ReportingObligation {
  id: string
  name: string
  description: string
  frequency: ComplianceFrequency
  format: 'xml' | 'json' | 'csv' | 'pdf' | 'custom'
  template?: string
  deadline: number // Days from period end
  recipients: string[]
  validation: ValidationRule[]
  submission: SubmissionMethod
}

export interface SubmissionMethod {
  method: 'portal' | 'email' | 'api' | 'ftp' | 'mail'
  endpoint?: string
  authentication?: string
  encryption?: string
  confirmation: boolean
}

export interface TestingRequirement {
  type: 'internal' | 'external' | 'regulatory'
  frequency: string
  scope: string[]
  criteria: string[]
  documentation: string[]
}

export interface Penalty {
  type: 'fine' | 'suspension' | 'revocation' | 'criminal' | 'reputational'
  severity: 'minor' | 'moderate' | 'major' | 'severe'
  description: string
  calculation: PenaltyCalculation
  mitigatingFactors: string[]
  precedents: Precedent[]
}

export interface PenaltyCalculation {
  baseAmount?: number
  percentage?: number
  multiplier?: number
  cap?: number
  factors: string[]
}

export interface Precedent {
  case: string
  date: string
  penalty: string
  circumstances: string[]
  url?: string
}

export interface Exemption {
  id: string
  name: string
  criteria: string[]
  limitations: string[]
  duration?: number
  requirements: string[]
}

export interface ApplicabilityCriteria {
  entityTypes: string[]
  activities: string[]
  thresholds: Threshold[]
  jurisdictions: string[]
  exclusions: string[]
}

export interface Threshold {
  metric: string
  value: number
  operator: '>' | '<' | '>=' | '<=' | '='
  unit: string
  period?: string
}

// Compliance Status and Monitoring
export interface ComplianceStatus {
  id: string
  organizationId: string
  requirement: string
  framework: string
  status: 'compliant' | 'non_compliant' | 'partial' | 'unknown' | 'not_applicable'
  lastAssessed: string
  nextAssessment: string
  evidence: Evidence[]
  gaps: ComplianceGap[]
  remediation: RemediationPlan[]
  risk: RiskAssessment
  assignee: string
  reviewer: string
}

export interface Evidence {
  id: string
  type: string
  description: string
  source: string
  date: string
  url?: string
  hash?: string
  verifiedBy?: string
  expiresAt?: string
}

export interface ComplianceGap {
  id: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  impact: string
  rootCause: string
  recommendation: string
  timeline: string
  cost?: number
}

export interface RemediationPlan {
  id: string
  gapId: string
  description: string
  actions: RemediationAction[]
  timeline: string
  budget?: number
  owner: string
  status: 'planned' | 'in_progress' | 'completed' | 'overdue'
  milestones: Milestone[]
}

export interface RemediationAction {
  id: string
  description: string
  type: 'process' | 'technology' | 'training' | 'documentation' | 'policy'
  priority: number
  effort: string
  dependencies: string[]
  deliverables: string[]
  success: string[]
}

export interface Milestone {
  id: string
  name: string
  dueDate: string
  status: 'pending' | 'completed' | 'overdue'
  deliverables: string[]
  evidence?: string[]
}

export interface RiskAssessment {
  likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  impact: 'minimal' | 'minor' | 'moderate' | 'major' | 'severe'
  overall: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  factors: RiskFactor[]
  mitigation: string[]
}

export interface RiskFactor {
  factor: string
  weight: number
  description: string
  mitigation?: string
}

// Regulatory Reporting
export interface RegulatoryReport {
  id: string
  organizationId: string
  requirement: string
  framework: string
  period: ReportingPeriod
  status: 'draft' | 'review' | 'approved' | 'submitted' | 'acknowledged' | 'rejected'
  data: ReportData
  validation: ValidationResult
  submission: SubmissionRecord
  metadata: ReportMetadata
  createdAt: string
  updatedAt: string
}

export interface ReportingPeriod {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  start: string
  end: string
  dueDate: string
  submitted?: string
}

export interface ReportData {
  format: string
  schema: string
  content: Record<string, any>
  attachments: Attachment[]
  calculations: Calculation[]
  sources: DataSource[]
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  hash: string
  description?: string
}

export interface Calculation {
  field: string
  formula: string
  inputs: Record<string, any>
  result: any
  verification: string
}

export interface DataSource {
  system: string
  table: string
  query: string
  timestamp: string
  records: number
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  completeness: number
  accuracy: number
  timeliness: number
}

export interface ValidationError {
  field: string
  rule: string
  message: string
  severity: 'error' | 'warning' | 'info'
  code?: string
}

export interface ValidationWarning {
  field: string
  message: string
  impact: string
  recommendation?: string
}

export interface SubmissionRecord {
  method: string
  endpoint?: string
  timestamp: string
  confirmationId?: string
  response: SubmissionResponse
  retries: number
  errors: string[]
}

export interface SubmissionResponse {
  status: 'success' | 'failure' | 'pending'
  code?: string
  message?: string
  receipt?: string
  nextSteps?: string[]
}

export interface ReportMetadata {
  preparedBy: string
  reviewedBy: string[]
  approvedBy?: string
  submittedBy?: string
  version: string
  jurisdiction: string
  language: string
  currency: string
  confidence: number
}

// Change Management
export interface RegulatoryChange {
  id: string
  type: 'new_regulation' | 'amendment' | 'interpretation' | 'enforcement' | 'sunset'
  framework: string
  title: string
  description: string
  impact: ChangeImpact
  timeline: ChangeTimeline
  requirements: string[]
  affected: AffectedArea[]
  response: ChangeResponse
  status: 'proposed' | 'enacted' | 'effective' | 'superseded'
}

export interface ChangeImpact {
  severity: 'low' | 'medium' | 'high' | 'critical'
  scope: string[]
  entities: string[]
  effort: string
  cost?: number
  risk: string[]
}

export interface ChangeTimeline {
  proposed: string
  enacted?: string
  effective: string
  transition?: string
  deadline?: string
  milestones: ChangeTimeline[]
}

export interface AffectedArea {
  area: string
  impact: string
  actions: string[]
  owner: string
  deadline: string
}

export interface ChangeResponse {
  strategy: 'comply' | 'seek_exemption' | 'challenge' | 'monitor'
  plan: ResponsePlan
  resources: ResourceRequirement[]
  timeline: string
  approval: string
}

export interface ResponsePlan {
  phases: ResponsePhase[]
  dependencies: string[]
  risks: string[]
  success: string[]
}

export interface ResponsePhase {
  name: string
  description: string
  activities: string[]
  deliverables: string[]
  duration: string
  resources: string[]
}

export interface ResourceRequirement {
  type: 'budget' | 'personnel' | 'technology' | 'external'
  description: string
  quantity: number
  cost?: number
  timeline: string
}

// Regulatory Compliance Manager Class
export class RegulatoryComplianceManager {
  private frameworks: Map<string, RegulatoryFramework> = new Map()
  private statuses: Map<string, ComplianceStatus> = new Map()
  private reports: Map<string, RegulatoryReport> = new Map()
  private changes: Map<string, RegulatoryChange> = new Map()

  constructor() {
    this.initializeFrameworks()
  }

  // Framework Management
  async addFramework(framework: RegulatoryFramework): Promise<void> {
    this.frameworks.set(framework.id, framework)
    
    // Auto-assess applicability for existing organizations
    await this.assessFrameworkApplicability(framework)
  }

  async updateFramework(id: string, updates: Partial<RegulatoryFramework>): Promise<RegulatoryFramework> {
    const framework = this.frameworks.get(id)
    if (!framework) {
      throw new Error('Framework not found')
    }

    const updated = { ...framework, ...updates, lastUpdated: new Date().toISOString() }
    this.frameworks.set(id, updated)

    // Re-assess compliance for affected organizations
    await this.reassessCompliance(id)

    return updated
  }

  private async assessFrameworkApplicability(framework: RegulatoryFramework): Promise<void> {
    // Logic to determine which organizations this framework applies to
    console.log(`Assessing applicability of ${framework.name}`)
  }

  private async reassessCompliance(frameworkId: string): Promise<void> {
    // Re-assess compliance status for all organizations using this framework
    console.log(`Reassessing compliance for framework ${frameworkId}`)
  }

  // Compliance Assessment
  async assessCompliance(organizationId: string, requirementId: string): Promise<ComplianceStatus> {
    const requirement = this.findRequirement(requirementId)
    if (!requirement) {
      throw new Error('Requirement not found')
    }

    const status: ComplianceStatus = {
      id: `status_${crypto.randomUUID()}`,
      organizationId,
      requirement: requirementId,
      framework: requirement.framework,
      status: 'unknown',
      lastAssessed: new Date().toISOString(),
      nextAssessment: this.calculateNextAssessment(requirement.frequency),
      evidence: [],
      gaps: [],
      remediation: [],
      risk: this.assessRisk(requirement),
      assignee: '',
      reviewer: ''
    }

    // Perform actual assessment
    await this.performAssessment(status, requirement)

    this.statuses.set(status.id, status)
    return status
  }

  private findRequirement(requirementId: string): (RegulatoryRequirement & { framework: string }) | null {
    for (const [frameworkId, framework] of this.frameworks.entries()) {
      const requirement = framework.requirements.find(r => r.id === requirementId)
      if (requirement) {
        return { ...requirement, framework: frameworkId }
      }
    }
    return null
  }

  private calculateNextAssessment(frequency: ComplianceFrequency): string {
    const now = new Date()
    const intervals: Record<ComplianceFrequency, number> = {
      once: 0,
      daily: 1,
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      semi_annual: 180,
      annual: 365,
      ad_hoc: 0,
      continuous: 1
    }

    const days = intervals[frequency] || 365
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
  }

  private async performAssessment(status: ComplianceStatus, requirement: RegulatoryRequirement): Promise<void> {
    // Collect evidence
    status.evidence = await this.collectEvidence(requirement.evidence)
    
    // Identify gaps
    status.gaps = await this.identifyGaps(requirement, status.evidence)
    
    // Determine overall status
    status.status = status.gaps.length === 0 ? 'compliant' : 
                   status.gaps.some(g => g.severity === 'critical' || g.severity === 'high') ? 'non_compliant' : 'partial'
    
    // Create remediation plans for gaps
    if (status.gaps.length > 0) {
      status.remediation = await this.createRemediationPlans(status.gaps)
    }
  }

  private async collectEvidence(requirements: EvidenceRequirement[]): Promise<Evidence[]> {
    const evidence: Evidence[] = []
    
    for (const req of requirements) {
      // Mock evidence collection
      evidence.push({
        id: `evidence_${crypto.randomUUID()}`,
        type: req.type,
        description: req.description,
        source: 'automated_system',
        date: new Date().toISOString(),
        verifiedBy: 'compliance_officer'
      })
    }
    
    return evidence
  }

  private async identifyGaps(requirement: RegulatoryRequirement, evidence: Evidence[]): Promise<ComplianceGap[]> {
    const gaps: ComplianceGap[] = []
    
    // Mock gap identification logic
    if (Math.random() < 0.3) { // 30% chance of gap for demo
      gaps.push({
        id: `gap_${crypto.randomUUID()}`,
        description: `Insufficient evidence for ${requirement.title}`,
        severity: 'medium',
        impact: 'Potential regulatory penalty',
        rootCause: 'Manual process lacking automation',
        recommendation: 'Implement automated compliance monitoring',
        timeline: '30 days',
        cost: 50000
      })
    }
    
    return gaps
  }

  private async createRemediationPlans(gaps: ComplianceGap[]): Promise<RemediationPlan[]> {
    return gaps.map(gap => ({
      id: `plan_${crypto.randomUUID()}`,
      gapId: gap.id,
      description: `Remediation plan for ${gap.description}`,
      actions: [{
        id: `action_${crypto.randomUUID()}`,
        description: gap.recommendation,
        type: 'technology',
        priority: 1,
        effort: '2-4 weeks',
        dependencies: [],
        deliverables: ['Automated monitoring system'],
        success: ['100% compliance achievement']
      }],
      timeline: gap.timeline,
      budget: gap.cost,
      owner: 'compliance_team',
      status: 'planned',
      milestones: []
    }))
  }

  private assessRisk(requirement: RegulatoryRequirement): RiskAssessment {
    const severity = requirement.priority
    const likelihood = requirement.mandatory ? 'high' : 'medium'
    
    return {
      likelihood,
      impact: severity === 'critical' ? 'severe' : severity === 'high' ? 'major' : 'moderate',
      overall: this.calculateOverallRisk(likelihood, severity),
      factors: [{
        factor: 'Regulatory priority',
        weight: 0.8,
        description: `Requirement priority is ${severity}`
      }],
      mitigation: ['Regular compliance monitoring', 'Staff training', 'Process automation']
    }
  }

  private calculateOverallRisk(likelihood: string, priority: string): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' {
    const matrix: Record<string, Record<string, string>> = {
      'very_low': { low: 'very_low', medium: 'low', high: 'low', critical: 'medium' },
      'low': { low: 'low', medium: 'low', high: 'medium', critical: 'medium' },
      'medium': { low: 'low', medium: 'medium', high: 'medium', critical: 'high' },
      'high': { low: 'medium', medium: 'medium', high: 'high', critical: 'high' },
      'very_high': { low: 'medium', medium: 'high', high: 'high', critical: 'very_high' }
    }
    
    return (matrix[likelihood]?.[priority] || 'medium') as any
  }

  // Regulatory Reporting
  async generateReport(organizationId: string, requirementId: string, period: ReportingPeriod): Promise<RegulatoryReport> {
    const requirement = this.findRequirement(requirementId)
    if (!requirement) {
      throw new Error('Requirement not found')
    }

    const report: RegulatoryReport = {
      id: `report_${crypto.randomUUID()}`,
      organizationId,
      requirement: requirementId,
      framework: requirement.framework,
      period,
      status: 'draft',
      data: await this.collectReportData(organizationId, requirement, period),
      validation: { isValid: false, errors: [], warnings: [], completeness: 0, accuracy: 0, timeliness: 0 },
      submission: { method: '', timestamp: '', response: { status: 'pending' }, retries: 0, errors: [] },
      metadata: {
        preparedBy: 'compliance_system',
        reviewedBy: [],
        version: '1.0',
        jurisdiction: requirement.framework,
        language: 'en',
        currency: 'USD',
        confidence: 95
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Validate report
    report.validation = await this.validateReport(report)

    this.reports.set(report.id, report)
    return report
  }

  private async collectReportData(organizationId: string, requirement: RegulatoryRequirement, period: ReportingPeriod): Promise<ReportData> {
    // Mock data collection
    return {
      format: 'json',
      schema: 'regulatory_v1.0',
      content: {
        organizationId,
        period,
        metrics: this.generateMockMetrics(),
        transactions: this.generateMockTransactions(),
        compliance: this.generateMockComplianceData()
      },
      attachments: [],
      calculations: [],
      sources: [{
        system: 'core_platform',
        table: 'transactions',
        query: 'SELECT * FROM transactions WHERE date BETWEEN ? AND ?',
        timestamp: new Date().toISOString(),
        records: 10000
      }]
    }
  }

  private generateMockMetrics(): Record<string, number> {
    return {
      totalTransactions: Math.floor(Math.random() * 100000),
      totalVolume: Math.floor(Math.random() * 10000000),
      activeUsers: Math.floor(Math.random() * 50000),
      complianceScore: 85 + Math.floor(Math.random() * 15)
    }
  }

  private generateMockTransactions(): any[] {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `tx_${i + 1}`,
      amount: Math.floor(Math.random() * 10000),
      currency: 'USD',
      date: new Date().toISOString(),
      type: 'payment'
    }))
  }

  private generateMockComplianceData(): Record<string, any> {
    return {
      kycVerifications: Math.floor(Math.random() * 1000),
      amlFlags: Math.floor(Math.random() * 10),
      suspiciousActivities: Math.floor(Math.random() * 5),
      reportedIncidents: Math.floor(Math.random() * 3)
    }
  }

  private async validateReport(report: RegulatoryReport): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Mock validation logic
    if (!report.data.content.organizationId) {
      errors.push({
        field: 'organizationId',
        rule: 'required',
        message: 'Organization ID is required',
        severity: 'error'
      })
    }

    // Calculate quality metrics
    const completeness = errors.length === 0 ? 100 : 100 - (errors.length * 10)
    const accuracy = 100 - (warnings.length * 5)
    const timeliness = new Date(report.period.dueDate) > new Date() ? 100 : 80

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness: Math.max(0, completeness),
      accuracy: Math.max(0, accuracy),
      timeliness: Math.max(0, timeliness)
    }
  }

  async submitReport(reportId: string): Promise<SubmissionRecord> {
    const report = this.reports.get(reportId)
    if (!report) {
      throw new Error('Report not found')
    }

    if (!report.validation.isValid) {
      throw new Error('Report validation failed')
    }

    const submission: SubmissionRecord = {
      method: 'api',
      endpoint: 'https://regulatory-api.gov/submit',
      timestamp: new Date().toISOString(),
      confirmationId: `conf_${crypto.randomUUID()}`,
      response: {
        status: 'success',
        code: '200',
        message: 'Report submitted successfully',
        receipt: `receipt_${crypto.randomUUID()}`,
        nextSteps: ['Await regulatory acknowledgment', 'Monitor for queries']
      },
      retries: 0,
      errors: []
    }

    report.submission = submission
    report.status = 'submitted'
    report.updatedAt = new Date().toISOString()

    return submission
  }

  // Change Management
  async registerChange(change: RegulatoryChange): Promise<void> {
    this.changes.set(change.id, change)
    
    // Assess impact on existing compliance
    await this.assessChangeImpact(change)
    
    // Notify affected stakeholders
    await this.notifyStakeholders(change)
  }

  private async assessChangeImpact(change: RegulatoryChange): Promise<void> {
    // Analyze impact on existing compliance statuses
    console.log(`Assessing impact of regulatory change: ${change.title}`)
  }

  private async notifyStakeholders(change: RegulatoryChange): Promise<void> {
    // Send notifications about regulatory changes
    console.log(`Notifying stakeholders about change: ${change.title}`)
  }

  // Analytics and Reporting
  async getComplianceDashboard(organizationId: string): Promise<{
    overview: ComplianceOverview
    requirements: RequirementSummary[]
    gaps: ComplianceGap[]
    reports: ReportSummary[]
    trends: ComplianceTrend[]
  }> {
    const statuses = Array.from(this.statuses.values())
      .filter(s => s.organizationId === organizationId)

    const reports = Array.from(this.reports.values())
      .filter(r => r.organizationId === organizationId)

    return {
      overview: {
        totalRequirements: statuses.length,
        compliant: statuses.filter(s => s.status === 'compliant').length,
        nonCompliant: statuses.filter(s => s.status === 'non_compliant').length,
        partial: statuses.filter(s => s.status === 'partial').length,
        complianceScore: this.calculateComplianceScore(statuses),
        riskScore: this.calculateRiskScore(statuses)
      },
      requirements: this.summarizeRequirements(statuses),
      gaps: statuses.flatMap(s => s.gaps),
      reports: this.summarizeReports(reports),
      trends: await this.calculateTrends(organizationId)
    }
  }

  private calculateComplianceScore(statuses: ComplianceStatus[]): number {
    if (statuses.length === 0) return 0
    
    const scores = { compliant: 100, partial: 50, non_compliant: 0, unknown: 25, not_applicable: 100 }
    const totalScore = statuses.reduce((sum, status) => sum + scores[status.status], 0)
    
    return Math.round(totalScore / statuses.length)
  }

  private calculateRiskScore(statuses: ComplianceStatus[]): number {
    if (statuses.length === 0) return 0
    
    const riskValues = { very_low: 20, low: 40, medium: 60, high: 80, very_high: 100 }
    const totalRisk = statuses.reduce((sum, status) => sum + riskValues[status.risk.overall], 0)
    
    return Math.round(totalRisk / statuses.length)
  }

  private summarizeRequirements(statuses: ComplianceStatus[]): RequirementSummary[] {
    return statuses.map(status => ({
      id: status.requirement,
      status: status.status,
      lastAssessed: status.lastAssessed,
      nextAssessment: status.nextAssessment,
      riskLevel: status.risk.overall,
      gapCount: status.gaps.length
    }))
  }

  private summarizeReports(reports: RegulatoryReport[]): ReportSummary[] {
    return reports.map(report => ({
      id: report.id,
      requirement: report.requirement,
      period: report.period,
      status: report.status,
      dueDate: report.period.dueDate,
      qualityScore: (report.validation.completeness + report.validation.accuracy + report.validation.timeliness) / 3
    }))
  }

  private async calculateTrends(organizationId: string): Promise<ComplianceTrend[]> {
    // Mock trend data
    return [
      {
        metric: 'complianceScore',
        periods: ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4'],
        values: [78, 82, 85, 88]
      },
      {
        metric: 'riskScore',
        periods: ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4'],
        values: [65, 60, 55, 50]
      }
    ]
  }

  private initializeFrameworks(): void {
    // Initialize with common regulatory frameworks
    const gdpr: RegulatoryFramework = {
      id: 'gdpr',
      name: 'General Data Protection Regulation',
      jurisdiction: 'EU',
      type: 'data_protection',
      authority: {
        name: 'European Data Protection Board',
        acronym: 'EDPB',
        country: 'EU',
        website: 'https://edpb.europa.eu',
        contactInfo: {
          email: 'info@edpb.europa.eu',
          phone: '+32 2 281 95 00',
          address: 'Rue Wiertz 60, 1047 Brussels, Belgium',
          businessHours: '9:00-17:00 CET'
        },
        jurisdiction: ['EU', 'EEA'],
        powers: [
          { type: 'enforcement', scope: ['data_protection'], limitations: [] },
          { type: 'investigation', scope: ['data_breaches'], limitations: [] }
        ]
      },
      version: '2016/679',
      effectiveDate: '2018-05-25',
      requirements: [],
      penalties: [
        {
          type: 'fine',
          severity: 'severe',
          description: 'Up to 4% of annual global turnover or €20 million',
          calculation: {
            percentage: 4,
            cap: 20000000,
            factors: ['turnover', 'nature_of_violation', 'cooperation']
          },
          mitigatingFactors: ['voluntary_disclosure', 'remedial_action', 'cooperation'],
          precedents: []
        }
      ],
      exemptions: [],
      applicability: {
        entityTypes: ['data_controller', 'data_processor'],
        activities: ['personal_data_processing'],
        thresholds: [],
        jurisdictions: ['EU', 'EEA'],
        exclusions: ['household_activities', 'law_enforcement']
      },
      lastUpdated: new Date().toISOString()
    }

    this.frameworks.set(gdpr.id, gdpr)
  }
}

// Supporting types for dashboard
interface ComplianceOverview {
  totalRequirements: number
  compliant: number
  nonCompliant: number
  partial: number
  complianceScore: number
  riskScore: number
}

interface RequirementSummary {
  id: string
  status: string
  lastAssessed: string
  nextAssessment: string
  riskLevel: string
  gapCount: number
}

interface ReportSummary {
  id: string
  requirement: string
  period: ReportingPeriod
  status: string
  dueDate: string
  qualityScore: number
}

interface ComplianceTrend {
  metric: string
  periods: string[]
  values: number[]
}

// Export singleton
export const regulatoryComplianceManager = new RegulatoryComplianceManager()