import { AMLCheck, AMLScreeningResult, AMLRiskLevel, BusinessVerification } from '@/types/aml';

const generateId = () => `aml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const SANCTIONS_LISTS = {
  ofac: [
    { name: 'Specially Designated Nationals (SDN)', lastUpdated: '2026-02-01' },
    { name: 'Sectoral Sanctions Identifications (SSI)', lastUpdated: '2026-02-01' },
    { name: 'Foreign Sanctions Evaders (FSE)', lastUpdated: '2026-02-01' },
    { name: 'Palestinian Legislative Council (PLC)', lastUpdated: '2026-02-01' },
  ],
  eu: [
    { name: 'EU Sanctions Map', lastUpdated: '2026-01-15' },
    { name: 'EU Terrorist List', lastUpdated: '2026-01-20' },
  ],
  un: [
    { name: 'UN Security Council Sanctions List', lastUpdated: '2026-01-10' },
  ],
  uk: [
    { name: 'UK HM Treasury Sanctions List', lastUpdated: '2026-02-01' },
    { name: 'UK DFAT Sanctions List', lastUpdated: '2026-01-25' },
  ],
};

const mockAMLChecks: AMLCheck[] = [];

class AMLService {
  private provider: 'sumsub' | 'complyadvantage' | 'refinitiv' | null = null;

  initialize(provider: 'sumsub' | 'complyadvantage' | 'refinitiv'): void {
    this.provider = provider;
  }

  async performBusinessVerification(params: {
    businessId: string;
    businessName: string;
    registrationNumber: string;
    country: string;
    address: string;
    directors: { name: string; nationality: string; dateOfBirth?: string }[];
  }): Promise<BusinessVerification> {
    const { businessId, businessName, registrationNumber, country, address, directors } = params;

    let verificationResult: BusinessVerification;

    if (!this.provider) {
      verificationResult = this.simulateBusinessVerification(params);
    } else {
      verificationResult = await this.callProviderAPI('verify-business', params);
    }

    const amlCheck: AMLCheck = {
      id: generateId(),
      userId: businessId,
      type: 'business',
      status: 'completed',
      result: verificationResult.isVerified ? 'approved' : 'rejected',
      riskLevel: verificationResult.riskScore,
      checkedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      details: {
        businessName,
        registrationNumber,
        country,
        address,
        directors,
        verificationScore: verificationResult.verificationScore,
        documentsVerified: verificationResult.documentsVerified,
      },
    };

    mockAMLChecks.push(amlCheck);
    return verificationResult;
  }

  private simulateBusinessVerification(params: any): BusinessVerification {
    const hasValidRegistration = params.registrationNumber && params.registrationNumber.length >= 5;
    const isHighRiskCountry = ['IR', 'KP', 'SY', 'CU', 'RU'].includes(params.country);

    return {
      isVerified: hasValidRegistration && !isHighRiskCountry,
      verificationScore: hasValidRegistration ? 85 : 40,
      riskScore: isHighRiskCountry ? 'high' : 'low',
      documentsVerified: hasValidRegistration ? ['business_registration', 'address_proof'] : [],
      missingDocuments: hasValidRegistration ? [] : ['business_registration'],
      notes: isHighRiskCountry ? 'Business from high-risk country requires additional review' : 'Standard verification passed',
    };
  }

  async screenAgainstSanctions(params: {
    entityId: string;
    name: string;
    dateOfBirth?: string;
    country: string;
    address?: string;
  }): Promise<AMLScreeningResult> {
    const { entityId, name, dateOfBirth, country, address } = params;

    let result: AMLScreeningResult;

    if (!this.provider) {
      result = this.simulateSanctionsScreening(params);
    } else {
      result = await this.callProviderAPI('screen-sanctions', params);
    }

    const amlCheck: AMLCheck = {
      id: generateId(),
      userId: entityId,
      type: 'sanctions',
      status: 'completed',
      result: result.isMatch ? 'flagged' : 'approved',
      riskLevel: result.isMatch ? 'high' : result.riskScore,
      checkedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      details: {
        individualName: name,
        country,
        address,
        matches: result.matches,
        listsChecked: result.listsChecked,
      },
    };

    mockAMLChecks.push(amlCheck);
    return result;
  }

  private simulateSanctionsScreening(params: any): AMLScreeningResult {
    const highRiskNames = ['osama', 'kim jong', 'putin', 'maduro', 'assad'];
    const isHighRiskName = highRiskNames.some(n => params.name.toLowerCase().includes(n));
    const isHighRiskCountry = ['IR', 'KP', 'SY', 'CU', 'VE', 'BY'].includes(params.country);

    if (isHighRiskName) {
      return {
        isMatch: true,
        riskScore: 'high',
        matches: [
          {
            listName: 'OFAC SDN List',
            matchScore: 95,
            matchedName: params.name,
            reason: 'Name matches sanctioned individual',
          },
        ],
        listsChecked: ['ofac', 'eu', 'un', 'uk'],
      };
    }

    return {
      isMatch: false,
      riskScore: isHighRiskCountry ? 'medium' : 'low',
      matches: [],
      listsChecked: ['ofac', 'eu', 'un', 'uk'],
    };
  }

  async performPEPSearch(params: {
    entityId: string;
    name: string;
    country: string;
  }): Promise<{
    isPEP: boolean;
    riskScore: AMLRiskLevel;
    matches: { name: string; position: string; country: string; riskLevel: string }[];
  }> {
    const { entityId, name, country } = params;

    if (!this.provider) {
      return this.simulatePEPSearch(params);
    }

    return await this.callProviderAPI('search-pep', params);
  }

  private simulatePEPSearch(params: any): {
    isPEP: boolean;
    riskScore: AMLRiskLevel;
    matches: { name: string; position: string; country: string; riskLevel: string }[];
  } {
    const pepNames = ['minister', 'governor', 'president', 'senator', 'director'];
    const isPEPLike = pepNames.some(p => params.name.toLowerCase().includes(p));

    if (isPEPLike) {
      return {
        isPEP: true,
        riskScore: 'medium',
        matches: [
          {
            name: params.name,
            position: 'Government Official',
            country: params.country,
            riskLevel: 'medium',
          },
        ],
      };
    }

    return {
      isPEP: false,
      riskScore: 'low',
      matches: [],
    };
  }

  async performAdverseMediaSearch(params: {
    entityId: string;
    name: string;
  }): Promise<{
    hasAdverseMedia: boolean;
    riskScore: AMLRiskLevel;
    articles: { title: string; source: string; date: string; severity: string }[];
  }> {
    const { entityId, name } = params;

    if (!this.provider) {
      return this.simulateAdverseMediaSearch(params);
    }

    return await this.callProviderAPI('search-adverse-media', params);
  }

  private simulateAdverseMediaSearch(params: any): {
    hasAdverseMedia: boolean;
    riskScore: AMLRiskLevel;
    articles: { title: string; source: string; date: string; severity: string }[];
  } {
    const highRiskKeywords = ['fraud', 'scandal', 'investigation', 'corruption'];
    const hasHighRiskKeyword = highRiskKeywords.some(k => 
      params.name.toLowerCase().includes(k)
    );

    if (hasHighRiskKeyword) {
      return {
        hasAdverseMedia: true,
        riskScore: 'high',
        articles: [
          {
            title: `${params.name} under investigation`,
            source: 'News Source',
            date: '2025-12-01',
            severity: 'high',
          },
        ],
      };
    }

    return {
      hasAdverseMedia: false,
      riskScore: 'low',
      articles: [],
    };
  }

  async performFullAMLCheck(params: {
    userId: string;
    businessName: string;
    registrationNumber: string;
    country: string;
    address: string;
    directors: { name: string; nationality: string; dateOfBirth?: string }[];
    beneficialOwners?: { name: string; nationality: string; dateOfBirth?: string }[];
  }): Promise<AMLCheck> {
    const checks: AMLScreeningResult[] = [];

    const businessVerification = await this.performBusinessVerification({
      businessId: params.userId,
      businessName: params.businessName,
      registrationNumber: params.registrationNumber,
      country: params.country,
      address: params.address,
      directors: params.directors,
    });

    const sanctionsCheck = await this.screenAgainstSanctions({
      entityId: params.userId,
      name: params.businessName,
      country: params.country,
      address: params.address,
    });
    checks.push(sanctionsCheck);

    for (const director of params.directors) {
      const directorSanctionsCheck = await this.screenAgainstSanctions({
        entityId: params.userId,
        name: director.name,
        dateOfBirth: director.dateOfBirth,
        country: director.nationality,
      });
      checks.push(directorSanctionsCheck);
    }

    if (params.beneficialOwners) {
      for (const owner of params.beneficialOwners) {
        const ownerSanctionsCheck = await this.screenAgainstSanctions({
          entityId: params.userId,
          name: owner.name,
          dateOfBirth: owner.dateOfBirth,
          country: owner.nationality,
        });
        checks.push(ownerSanctionsCheck);
      }
    }

    const pepSearch = await this.performPEPSearch({
      entityId: params.userId,
      name: params.businessName,
      country: params.country,
    });

    const adverseMediaSearch = await this.performAdverseMediaSearch({
      entityId: params.userId,
      name: params.businessName,
    });

    const hasSanctionsMatch = checks.some(c => c.isMatch);
    const hasPEP = pepSearch.isPEP;
    const hasAdverseMedia = adverseMediaSearch.hasAdverseMedia;

    let overallRisk: AMLRiskLevel = 'low';
    if (hasSanctionsMatch || hasAdverseMedia) {
      overallRisk = 'high';
    } else if (hasPEP || businessVerification.riskScore === 'high') {
      overallRisk = 'medium';
    }

    const amlCheck: AMLCheck = {
      id: generateId(),
      userId: params.userId,
      type: 'full',
      status: 'completed',
      result: overallRisk === 'high' ? 'rejected' : 'approved',
      riskLevel: overallRisk,
      checkedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      details: {
        businessName: params.businessName,
        verificationScore: businessVerification.verificationScore,
        sanctionsMatch: hasSanctionsMatch,
        pepMatch: hasPEP,
        adverseMedia: hasAdverseMedia,
      },
    };

    mockAMLChecks.push(amlCheck);
    return amlCheck;
  }

  async getAMLCheck(checkId: string): Promise<AMLCheck | null> {
    return mockAMLChecks.find(c => c.id === checkId) || null;
  }

  async getUserAMLChecks(userId: string): Promise<AMLCheck[]> {
    return mockAMLChecks.filter(c => c.userId === userId);
  }

  async recheckAML(userId: string): Promise<AMLCheck> {
    const previousChecks = mockAMLChecks.filter(c => c.userId === userId);
    const latestCheck = previousChecks[previousChecks.length - 1];

    if (!latestCheck) {
      throw new Error('No previous AML check found');
    }

    return this.performFullAMLCheck({
      userId,
      businessName: latestCheck.details.businessName || 'Unknown',
      registrationNumber: 'RECHECK',
      country: 'NG',
      address: '',
      directors: [],
    });
  }

  getSanctionsLists(): { list: string; name: string; lastUpdated: string }[] {
    const lists: { list: string; name: string; lastUpdated: string }[] = [];
    
    for (const [source, listData] of Object.entries(SANCTIONS_LISTS)) {
      for (const item of listData as any[]) {
        lists.push({
          list: source.toUpperCase(),
          name: item.name,
          lastUpdated: item.lastUpdated,
        });
      }
    }
    
    return lists;
  }

  private async callProviderAPI(endpoint: string, params: any): Promise<any> {
    const baseUrl = this.getProviderBaseUrl();
    
    try {
      const response = await fetch(`${baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`AML API error (${endpoint}):`, error);
      throw error;
    }
  }

  private getProviderBaseUrl(): string {
    switch (this.provider) {
      case 'sumsub':
        return '/api/aml/sumsub';
      case 'complyadvantage':
        return '/api/aml/complyadvantage';
      case 'refinitiv':
        return '/api/aml/refinitiv';
      default:
        return '/api/aml/mock';
    }
  }
}

export const amlService = new AMLService();
