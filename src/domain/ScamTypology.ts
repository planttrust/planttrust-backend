export interface ScamRuleResult {
  ruleName: string;
  triggered: boolean;
  score: number;
  description: string;
}

export class ScamTypology {
  private static readonly SUSPICIOUS_KEYWORDS = [
    'guaranteed returns',
    'risk-free',
    'double your money',
    '100% profit',
    'secret investment',
    'urgent transfer'
  ];

  public static analyzePitch(text: string): { flags: string[]; overallRisk: 'clear' | 'low' | 'medium' | 'high' } {
    const lower = text.toLowerCase();
    const flags: string[] = [];

    for (const kw of ScamTypology.SUSPICIOUS_KEYWORDS) {
      if (lower.includes(kw)) {
        flags.push(`Flagged keyword: "${kw}"`);
      }
    }

    let overallRisk: 'clear' | 'low' | 'medium' | 'high' = 'clear';
    if (flags.length >= 3) overallRisk = 'high';
    else if (flags.length === 2) overallRisk = 'medium';
    else if (flags.length === 1) overallRisk = 'low';

    return { flags, overallRisk };
  }
}
