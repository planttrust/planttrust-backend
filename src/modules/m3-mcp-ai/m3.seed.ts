// M3 seed data: the scam typologies the assistant checks projects against, based on the
// Central Bank of Sri Lanka (CBSL) public warnings. Called from prisma/seed.ts.
// Safe to run again: each typology is upserted by its unique code.

import type { PrismaClient, ScamRiskLevel } from '@prisma/client';

interface SeedTypology {
  code: string;
  name: string;
  description: string;
  indicators: string[];
  severity: ScamRiskLevel;
  source: string;
}

export const scamTypologies: SeedTypology[] = [
  {
    code: 'PYRAMID_SCHEME',
    name: 'Pyramid scheme',
    description:
      'Returns are paid mainly from new members joining, not from a real business. Prohibited in Sri Lanka.',
    indicators: [
      'earnings depend on recruiting new investors',
      'joining fee or entry package required',
      'referral or level-based commissions',
      'little or no real product or project',
    ],
    severity: 'high',
    source: 'Banking Act No. 30 of 1988, Section 83C; CBSL public warnings on pyramid schemes',
  },
  {
    code: 'PONZI_GUARANTEED_RETURNS',
    name: 'Ponzi scheme / guaranteed high returns',
    description:
      'Promises fixed, unusually high returns with little or no risk, paying earlier investors with money from later ones.',
    indicators: [
      'guaranteed or risk-free returns',
      'returns far above bank deposit rates',
      'monthly payouts regardless of harvest or sales',
      'pressure to reinvest instead of withdrawing',
    ],
    severity: 'high',
    source: 'CBSL public warnings on investment schemes promising high returns',
  },
  {
    code: 'UNAUTHORISED_DEPOSIT_TAKING',
    name: 'Unauthorised deposit taking',
    description:
      'Collects deposits or money from the public without a CBSL licence, often presented as an investment.',
    indicators: [
      'accepts deposits with a promised interest rate',
      'not on the CBSL list of licensed finance companies',
      'calls investments "deposits" or "savings"',
    ],
    severity: 'high',
    source: 'Finance Business Act No. 42 of 2011; CBSL list of licensed finance companies',
  },
  {
    code: 'FAKE_PLANTATION_SCHEME',
    name: 'Fake or overstated plantation investment',
    description:
      'Sells shares in trees or crops (e.g. sandalwood, agarwood) with exaggerated yields, or on land the company does not control.',
    indicators: [
      'yield or price far above market figures',
      'land documents missing or not matching the boundary',
      'no progress reports or geotagged photos',
      'buy-back promise at a fixed high price',
    ],
    severity: 'medium',
    source: 'CBSL consumer awareness on agricultural and plantation investment schemes',
  },
  {
    code: 'VIRTUAL_CURRENCY_SCHEME',
    name: 'Crypto / virtual currency investment',
    description:
      'Asks for investment in crypto assets or tokens with promised profits. Virtual currencies are not legal tender in Sri Lanka and are not regulated by CBSL.',
    indicators: [
      'payment only in cryptocurrency',
      'own token or coin promised to rise in value',
      'mining or trading bot with fixed daily profit',
    ],
    severity: 'medium',
    source: 'CBSL public notices on the risks of virtual currencies',
  },
  {
    code: 'HIGH_PRESSURE_SALES',
    name: 'High-pressure or misleading sales',
    description:
      'Pushes people to invest quickly using urgency, secrecy or false claims of official approval.',
    indicators: [
      'offer only valid for a very short time',
      'claims of CBSL or government approval without proof',
      'asks to keep the investment secret',
      'contract terms differ from what was promised',
    ],
    severity: 'low',
    source: 'CBSL financial consumer protection guidance',
  },
];

export async function seedM3(prisma: PrismaClient) {
  for (const t of scamTypologies) {
    await prisma.scamTypology.upsert({
      where: { code: t.code },
      update: t,
      create: t,
    });
  }
  console.info(`M3: seeded ${scamTypologies.length} CBSL scam typologies.`);
}
