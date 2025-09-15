// Enterprise Audit and Compliance System
// Comprehensive audit trails, compliance monitoring, and regulatory reporting

import { z } from 'zod'
import crypto from 'crypto'

// Audit Types
export interface AuditLog {
  id: string
  organizationId: string
  userId?: string
  action: string
  resource: string
  resourceId: string
  details: AuditDetails
  metadata: AuditMetadata
  timestamp: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
}

export interface AuditDetails {
  operation: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'reject'
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  changes?: FieldChange[]
  reason?: string
  approvedBy?: string
  reviewedBy?: string[]
}

export interface FieldChange {
  field: string
  oldValue: any
  newValue: any
  type: 'added' | 'modified' | 'removed'
}

export interface AuditMetadata {
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: AuditCategory
  tags: string[]
  correlationId?: string
  parentId?: string
  isAutomated: boolean
  complianceFlags: ComplianceFlag[]
}

export type AuditCategory = 
  | 'authentication'
  | 'authorization'
  | 'data_access'
  | 'data_modification'
  | 'financial'
  | 'governance'
  | 'security'
  | 'privacy'
  | 'regulatory'
  | 'system'

export interface ComplianceFlag {
  regulation: string
  requirement: string
  status: 'compliant' | 'non_compliant' | 'requires_review'
  notes?: string
}

// Compliance Configuration
export interface ComplianceConfig {
  id: string
  organizationId: string
  name: string
  regulations: RegulationConfig[]
  policies: PolicyConfig[]
  controls: ControlConfig[]
  reportingRequirements: ReportingRequirement[]
  isActive: boolean
  lastReview: string
  nextReview: string
  createdAt: string
  updatedAt: string
}

export interface RegulationConfig {
  id: string
  name: string
  jurisdiction: string
  version: string
  requirements: Requirement[]
  applicability: ApplicabilityRule[]
  penalties: PenaltyInfo[]
}

export interface Requirement {
  id: string
  title: string
  description: string
  category: string
  mandatory: boolean
  controls: string[]
  evidence: EvidenceRequirement[]
  testing: TestingRequirement[]
}

export interface ApplicabilityRule {
  condition: string
  scope: string[]
  exceptions?: string[]
}

export interface PenaltyInfo {
  type: 'fine' | 'suspension' | 'revocation' | 'criminal'
  severity: 'minor' | 'major' | 'severe'
  description: string
  maxAmount?: number
}

export interface PolicyConfig {
  id: string
  name: string
  version: string
  category: string
  description: string
  scope: string[]
  owner: string
  approver: string
  effectiveDate: string
  reviewCycle: number
  controls: string[]
  procedures: Procedure[]
}

export interface Procedure {
  id: string
  name: string
  steps: ProcedureStep[]
  roles: string[]
  automation?: AutomationConfig
}

export interface ProcedureStep {
  order: number
  description: string
  role: string
  inputs?: string[]
  outputs?: string[]
  controls?: string[]
  evidence?: string[]
}

export interface ControlConfig {
  id: string
  name: string
  type: ControlType
  category: string
  description: string
  objectives: string[]
  implementation: ControlImplementation
  testing: ControlTesting
  owner: string
  status: ControlStatus
  lastTested: string
  nextTest: string
  effectiveness: 'effective' | 'ineffective' | 'needs_improvement' | 'not_tested'
}

export type ControlType = 
  | 'preventive'
  | 'detective'
  | 'corrective'
  | 'compensating'
  | 'administrative'
  | 'technical'
  | 'physical'

export interface ControlImplementation {
  method: 'manual' | 'automated' | 'hybrid'
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  automation?: AutomationConfig
  documentation: string[]
  dependencies: string[]
}

export interface ControlTesting {
  method: 'inquiry' | 'observation' | 'inspection' | 'reperformance' | 'analytical'
  frequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual'
  sampleSize?: number
  criteria: string[]
  evidence: string[]
}

export type ControlStatus = 
  | 'designed'
  | 'implemented'
  | 'operating'
  | 'remediation_required'
  | 'retired'

export interface AutomationConfig {
  system: string
  trigger: string
  conditions: Record<string, any>
  actions: AutomationAction[]
  notifications: NotificationConfig[]
}

export interface AutomationAction {
  type: string
  target: string
  parameters: Record<string, any>
  rollback?: boolean
}

export interface NotificationConfig {
  recipient: string
  method: 'email' | 'slack' | 'webhook'
  template: string
  conditions?: Record<string, any>
}

export interface ReportingRequirement {
  id: string
  name: string
  regulation: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  deadline: number // Days from period end
  format: 'json' | 'xml' | 'csv' | 'pdf' | 'custom'
  recipients: string[]
  automation: boolean
  template?: string
}

export interface EvidenceRequirement {
  type: string
  description: string
  retention: number // Days
  format: string[]
  classification: 'public' | 'internal' | 'confidential' | 'restricted'
}

export interface TestingRequirement {
  type: 'unit' | 'integration' | 'penetration' | 'audit'
  frequency: string
  coverage: number // Percentage
  criteria: string[]
}

// Risk Assessment
export interface RiskAssessment {
  id: string
  organizationId: string
  name: string
  scope: string[]
  methodology: string
  risks: IdentifiedRisk[]
  controls: RiskControl[]
  residualRisk: RiskLevel
  status: 'draft' | 'in_review' | 'approved' | 'expired'
  assessor: string
  reviewer: string
  approver: string
  conductedAt: string
  validUntil: string
}

export interface IdentifiedRisk {
  id: string
  category: string
  description: string
  impact: RiskLevel
  likelihood: RiskLevel
  inherentRisk: RiskLevel
  mitigatingControls: string[]
  residualRisk: RiskLevel
  treatment: 'accept' | 'mitigate' | 'transfer' | 'avoid'
  owner: string
  dueDate?: string
}

export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high'

export interface RiskControl {
  riskId: string
  controlId: string
  effectiveness: 'high' | 'medium' | 'low'
  coverage: number // Percentage
  gaps?: string[]
}

// Incident Management
export interface ComplianceIncident {
  id: string
  organizationId: string
  title: string
  description: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  regulations: string[]
  requirements: string[]
  impact: IncidentImpact
  timeline: IncidentTimeline
  investigation: Investigation
  remediation: RemediationPlan
  reportedBy: string
  assignedTo: string
  createdAt: string
  updatedAt: string
}

export interface IncidentImpact {
  financial?: number
  operational?: string
  reputational?: string
  regulatory?: string
  dataSubjects?: number
}

export interface IncidentTimeline {
  discovered: string
  reported: string
  contained?: string
  resolved?: string
  notifications: NotificationEvent[]
}

export interface NotificationEvent {
  recipient: string
  method: string
  sentAt: string
  acknowledged?: string
}

export interface Investigation {
  findings: string[]
  rootCause: string
  evidence: string[]
  interviews: Interview[]
  timeline: string
  conclusions: string
}

export interface Interview {
  person: string
  role: string
  date: string
  summary: string
  evidence?: string[]
}

export interface RemediationPlan {
  actions: RemediationAction[]
  timeline: string
  responsible: string
  budget?: number
  monitoring: MonitoringPlan
}

export interface RemediationAction {
  id: string
  description: string
  type: 'immediate' | 'short_term' | 'long_term'
  owner: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  evidence?: string[]
}

export interface MonitoringPlan {
  metrics: string[]
  frequency: string
  thresholds: Record<string, number>
  reporting: string
}

// Audit and Compliance System Class
export class AuditComplianceSystem {
  private auditLogs: Map<string, AuditLog> = new Map()
  private complianceConfigs: Map<string, ComplianceConfig> = new Map()
  private riskAssessments: Map<string, RiskAssessment> = new Map()
  private incidents: Map<string, ComplianceIncident> = new Map()

  constructor() {
    this.initializeDefaultConfigs()
  }

  // Audit Logging
  async logAction(data: {
    organizationId: string
    userId?: string
    action: string
    resource: string
    resourceId: string
    operation: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'reject'
    oldValues?: Record<string, any>
    newValues?: Record<string, any>
    reason?: string
    severity?: 'low' | 'medium' | 'high' | 'critical'
    category?: AuditCategory
    metadata?: Record<string, any>
  }): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: `audit_${crypto.randomUUID()}`,
      organizationId: data.organizationId,
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: {
        operation: data.operation,
        oldValues: data.oldValues,
        newValues: data.newValues,
        changes: this.calculateChanges(data.oldValues, data.newValues),
        reason: data.reason
      },
      metadata: {
        severity: data.severity || 'low',
        category: data.category || 'system',
        tags: this.generateTags(data),
        isAutomated: !data.userId,
        complianceFlags: await this.checkCompliance(data)
      },
      timestamp: new Date().toISOString()
    }

    this.auditLogs.set(auditLog.id, auditLog)
    
    // Trigger compliance analysis
    await this.analyzeCompliance(auditLog)
    
    return auditLog
  }

  private calculateChanges(oldValues?: Record<string, any>, newValues?: Record<string, any>): FieldChange[] {
    if (!oldValues || !newValues) return []

    const changes: FieldChange[] = []
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)])

    for (const key of allKeys) {
      const oldValue = oldValues[key]
      const newValue = newValues[key]

      if (!(key in oldValues)) {
        changes.push({ field: key, oldValue: undefined, newValue, type: 'added' })
      } else if (!(key in newValues)) {
        changes.push({ field: key, oldValue, newValue: undefined, type: 'removed' })
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field: key, oldValue, newValue, type: 'modified' })
      }
    }

    return changes
  }

  private generateTags(data: any): string[] {
    const tags: string[] = []
    
    if (data.userId) tags.push('user_action')
    else tags.push('system_action')
    
    if (data.resource.includes('financial')) tags.push('financial')
    if (data.resource.includes('personal')) tags.push('privacy')
    if (data.operation === 'delete') tags.push('deletion')
    
    return tags
  }

  private async checkCompliance(data: any): Promise<ComplianceFlag[]> {
    const flags: ComplianceFlag[] = []
    
    // Example compliance checks
    if (data.category === 'privacy' || data.resource.includes('personal')) {
      flags.push({
        regulation: 'GDPR',
        requirement: 'Article 6 - Lawfulness of processing',
        status: 'requires_review',
        notes: 'Personal data processing detected'
      })
    }

    if (data.category === 'financial') {
      flags.push({
        regulation: 'SOX',
        requirement: 'Section 404 - Internal Controls',
        status: 'compliant',
        notes: 'Financial transaction logged'
      })
    }

    return flags
  }

  // Compliance Configuration
  async createComplianceConfig(data: Partial<ComplianceConfig>): Promise<ComplianceConfig> {
    const config: ComplianceConfig = {
      id: `compliance_${crypto.randomUUID()}`,
      organizationId: data.organizationId!,
      name: data.name || 'Compliance Configuration',
      regulations: data.regulations || [],
      policies: data.policies || [],
      controls: data.controls || [],
      reportingRequirements: data.reportingRequirements || [],
      isActive: true,
      lastReview: new Date().toISOString(),
      nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.complianceConfigs.set(config.id, config)
    return config
  }

  // Risk Assessment
  async createRiskAssessment(data: {
    organizationId: string
    name: string
    scope: string[]
    methodology: string
    assessor: string
  }): Promise<RiskAssessment> {
    const assessment: RiskAssessment = {
      id: `risk_${crypto.randomUUID()}`,
      organizationId: data.organizationId,
      name: data.name,
      scope: data.scope,
      methodology: data.methodology,
      risks: [],
      controls: [],
      residualRisk: 'medium',
      status: 'draft',
      assessor: data.assessor,
      reviewer: '',
      approver: '',
      conductedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }

    this.riskAssessments.set(assessment.id, assessment)
    return assessment
  }

  async addRiskToAssessment(assessmentId: string, risk: IdentifiedRisk): Promise<void> {
    const assessment = this.riskAssessments.get(assessmentId)
    if (!assessment) {
      throw new Error('Risk assessment not found')
    }

    assessment.risks.push(risk)
    assessment.residualRisk = this.calculateOverallRisk(assessment.risks)
  }

  private calculateOverallRisk(risks: IdentifiedRisk[]): RiskLevel {
    if (risks.length === 0) return 'very_low'
    
    const riskValues = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 }
    const totalRisk = risks.reduce((sum, risk) => sum + riskValues[risk.residualRisk], 0)
    const avgRisk = totalRisk / risks.length

    if (avgRisk <= 1.5) return 'very_low'
    if (avgRisk <= 2.5) return 'low'
    if (avgRisk <= 3.5) return 'medium'
    if (avgRisk <= 4.5) return 'high'
    return 'very_high'
  }

  // Incident Management
  async createIncident(data: {
    organizationId: string
    title: string
    description: string
    category: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    regulations: string[]
    reportedBy: string
  }): Promise<ComplianceIncident> {
    const incident: ComplianceIncident = {
      id: `incident_${crypto.randomUUID()}`,
      organizationId: data.organizationId,
      title: data.title,
      description: data.description,
      category: data.category,
      severity: data.severity,
      status: 'open',
      regulations: data.regulations,
      requirements: [],
      impact: {},
      timeline: {
        discovered: new Date().toISOString(),
        reported: new Date().toISOString(),
        notifications: []
      },
      investigation: {
        findings: [],
        rootCause: '',
        evidence: [],
        interviews: [],
        timeline: '',
        conclusions: ''
      },
      remediation: {
        actions: [],
        timeline: '',
        responsible: '',
        monitoring: {
          metrics: [],
          frequency: '',
          thresholds: {},
          reporting: ''
        }
      },
      reportedBy: data.reportedBy,
      assignedTo: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.incidents.set(incident.id, incident)
    
    // Auto-assign based on severity
    if (data.severity === 'critical' || data.severity === 'high') {
      await this.escalateIncident(incident.id)
    }

    return incident
  }

  private async escalateIncident(incidentId: string): Promise<void> {
    const incident = this.incidents.get(incidentId)
    if (!incident) return

    // Escalation logic
    incident.assignedTo = 'compliance_manager'
    incident.timeline.notifications.push({
      recipient: 'compliance_manager',
      method: 'email',
      sentAt: new Date().toISOString()
    })
  }

  // Compliance Analysis
  private async analyzeCompliance(auditLog: AuditLog): Promise<void> {
    const config = Array.from(this.complianceConfigs.values())
      .find(c => c.organizationId === auditLog.organizationId)

    if (!config) return

    // Check for policy violations
    await this.checkPolicyCompliance(auditLog, config)
    
    // Check for regulatory requirements
    await this.checkRegulatoryCompliance(auditLog, config)
    
    // Update compliance metrics
    await this.updateComplianceMetrics(auditLog)
  }

  private async checkPolicyCompliance(auditLog: AuditLog, config: ComplianceConfig): Promise<void> {
    // Policy compliance checks
    for (const policy of config.policies) {
      if (policy.scope.includes(auditLog.resource) || policy.scope.includes('*')) {
        // Check if action complies with policy
        const isCompliant = await this.evaluatePolicy(auditLog, policy)
        if (!isCompliant) {
          await this.createIncident({
            organizationId: auditLog.organizationId,
            title: `Policy Violation: ${policy.name}`,
            description: `Action ${auditLog.action} violates policy ${policy.name}`,
            category: 'policy_violation',
            severity: 'medium',
            regulations: [],
            reportedBy: 'system'
          })
        }
      }
    }
  }

  private async evaluatePolicy(auditLog: AuditLog, policy: PolicyConfig): Promise<boolean> {
    // Simplified policy evaluation
    return true // Always compliant for demo
  }

  private async checkRegulatoryCompliance(auditLog: AuditLog, config: ComplianceConfig): Promise<void> {
    for (const regulation of config.regulations) {
      for (const requirement of regulation.requirements) {
        if (this.isApplicable(auditLog, requirement)) {
          const isCompliant = await this.evaluateRequirement(auditLog, requirement)
          if (!isCompliant) {
            auditLog.metadata.complianceFlags.push({
              regulation: regulation.name,
              requirement: requirement.title,
              status: 'non_compliant',
              notes: 'Regulatory requirement not met'
            })
          }
        }
      }
    }
  }

  private isApplicable(auditLog: AuditLog, requirement: Requirement): boolean {
    // Check if requirement applies to this audit log
    return requirement.category === auditLog.metadata.category
  }

  private async evaluateRequirement(auditLog: AuditLog, requirement: Requirement): Promise<boolean> {
    // Simplified requirement evaluation
    return Math.random() > 0.1 // 90% compliance rate for demo
  }

  private async updateComplianceMetrics(auditLog: AuditLog): Promise<void> {
    // Update compliance dashboards and metrics
    console.log(`Compliance metrics updated for ${auditLog.organizationId}`)
  }

  // Reporting
  async generateComplianceReport(organizationId: string, regulation: string, period: {
    start: string
    end: string
  }): Promise<{
    summary: ComplianceReportSummary
    details: ComplianceReportDetails
    recommendations: string[]
  }> {
    const logs = Array.from(this.auditLogs.values())
      .filter(log => 
        log.organizationId === organizationId &&
        log.timestamp >= period.start &&
        log.timestamp <= period.end
      )

    const incidents = Array.from(this.incidents.values())
      .filter(incident =>
        incident.organizationId === organizationId &&
        incident.regulations.includes(regulation) &&
        incident.createdAt >= period.start &&
        incident.createdAt <= period.end
      )

    return {
      summary: {
        totalActions: logs.length,
        complianceRate: this.calculateComplianceRate(logs),
        incidents: incidents.length,
        criticalFindings: incidents.filter(i => i.severity === 'critical').length,
        period
      },
      details: {
        actionsByCategory: this.groupByCategory(logs),
        incidentsByType: this.groupIncidentsByType(incidents),
        controlsEffectiveness: await this.assessControlsEffectiveness(organizationId),
        gaps: await this.identifyComplianceGaps(organizationId, regulation)
      },
      recommendations: await this.generateRecommendations(organizationId, regulation)
    }
  }

  private calculateComplianceRate(logs: AuditLog[]): number {
    if (logs.length === 0) return 100

    const compliantActions = logs.filter(log =>
      log.metadata.complianceFlags.every(flag => flag.status === 'compliant')
    ).length

    return (compliantActions / logs.length) * 100
  }

  private groupByCategory(logs: AuditLog[]): Record<string, number> {
    const groups: Record<string, number> = {}
    for (const log of logs) {
      groups[log.metadata.category] = (groups[log.metadata.category] || 0) + 1
    }
    return groups
  }

  private groupIncidentsByType(incidents: ComplianceIncident[]): Record<string, number> {
    const groups: Record<string, number> = {}
    for (const incident of incidents) {
      groups[incident.category] = (groups[incident.category] || 0) + 1
    }
    return groups
  }

  private async assessControlsEffectiveness(organizationId: string): Promise<Record<string, string>> {
    // Mock controls effectiveness assessment
    return {
      'access_control': 'effective',
      'data_protection': 'needs_improvement',
      'audit_logging': 'effective'
    }
  }

  private async identifyComplianceGaps(organizationId: string, regulation: string): Promise<string[]> {
    // Mock gap analysis
    return [
      'Insufficient data retention controls',
      'Missing privacy impact assessments',
      'Incomplete incident response procedures'
    ]
  }

  private async generateRecommendations(organizationId: string, regulation: string): Promise<string[]> {
    return [
      'Implement automated compliance monitoring',
      'Enhance staff training on data protection',
      'Update incident response procedures',
      'Conduct quarterly compliance assessments'
    ]
  }

  private initializeDefaultConfigs(): void {
    // Initialize with default compliance configuration
    const defaultConfig: ComplianceConfig = {
      id: 'compliance_default',
      organizationId: 'org_default',
      name: 'Default Compliance',
      regulations: this.getDefaultRegulations(),
      policies: this.getDefaultPolicies(),
      controls: this.getDefaultControls(),
      reportingRequirements: [],
      isActive: true,
      lastReview: new Date().toISOString(),
      nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.complianceConfigs.set(defaultConfig.id, defaultConfig)
  }

  private getDefaultRegulations(): RegulationConfig[] {
    return [
      {
        id: 'gdpr',
        name: 'GDPR',
        jurisdiction: 'EU',
        version: '2018',
        requirements: [],
        applicability: [{ condition: 'processes_personal_data', scope: ['*'] }],
        penalties: [{ type: 'fine', severity: 'severe', description: 'Up to 4% of annual turnover', maxAmount: 20000000 }]
      }
    ]
  }

  private getDefaultPolicies(): PolicyConfig[] {
    return [
      {
        id: 'data_protection',
        name: 'Data Protection Policy',
        version: '1.0',
        category: 'privacy',
        description: 'Policy for protecting personal data',
        scope: ['*'],
        owner: 'dpo',
        approver: 'ciso',
        effectiveDate: new Date().toISOString(),
        reviewCycle: 365,
        controls: ['data_encryption', 'access_control'],
        procedures: []
      }
    ]
  }

  private getDefaultControls(): ControlConfig[] {
    return [
      {
        id: 'access_control',
        name: 'Access Control',
        type: 'technical',
        category: 'security',
        description: 'Control access to systems and data',
        objectives: ['Prevent unauthorized access'],
        implementation: {
          method: 'automated',
          frequency: 'continuous',
          documentation: [],
          dependencies: []
        },
        testing: {
          method: 'reperformance',
          frequency: 'quarterly',
          criteria: ['All access properly authorized'],
          evidence: ['Access logs', 'User reviews']
        },
        owner: 'it_security',
        status: 'operating',
        lastTested: new Date().toISOString(),
        nextTest: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        effectiveness: 'effective'
      }
    ]
  }
}

// Types for reporting
interface ComplianceReportSummary {
  totalActions: number
  complianceRate: number
  incidents: number
  criticalFindings: number
  period: { start: string, end: string }
}

interface ComplianceReportDetails {
  actionsByCategory: Record<string, number>
  incidentsByType: Record<string, number>
  controlsEffectiveness: Record<string, string>
  gaps: string[]
}

// Export singleton
export const auditComplianceSystem = new AuditComplianceSystem()