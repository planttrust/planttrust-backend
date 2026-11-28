-- CreateEnum
CREATE TYPE "ScamRiskLevel" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "ScamReportStatus" AS ENUM ('open', 'reviewing', 'confirmed', 'dismissed');

-- CreateEnum
CREATE TYPE "ScamFlagSource" AS ENUM ('auto', 'user_report', 'admin');

-- CreateEnum
CREATE TYPE "ScamFlagStatus" AS ENUM ('raised', 'cleared');

-- CreateTable
CREATE TABLE "scam_typologies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "indicators" TEXT[],
    "severity" "ScamRiskLevel" NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scam_typologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scam_reports" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "typologyId" TEXT,
    "description" TEXT NOT NULL,
    "status" "ScamReportStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scam_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_clauses" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clauseText" TEXT NOT NULL,
    "typologyId" TEXT,
    "riskLevel" "ScamRiskLevel" NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_clauses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_flags" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "level" "ScamRiskLevel" NOT NULL,
    "reasons" TEXT[],
    "source" "ScamFlagSource" NOT NULL,
    "status" "ScamFlagStatus" NOT NULL DEFAULT 'raised',
    "anchorId" TEXT,
    "clearedBy" TEXT,
    "clearedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scam_typologies_code_key" ON "scam_typologies"("code");

-- CreateIndex
CREATE INDEX "scam_reports_projectId_idx" ON "scam_reports"("projectId");

-- CreateIndex
CREATE INDEX "scam_reports_reporterId_idx" ON "scam_reports"("reporterId");

-- CreateIndex
CREATE INDEX "contract_clauses_projectId_idx" ON "contract_clauses"("projectId");

-- CreateIndex
CREATE INDEX "risk_flags_projectId_idx" ON "risk_flags"("projectId");

-- CreateIndex
CREATE INDEX "risk_flags_status_idx" ON "risk_flags"("status");

-- CreateIndex
CREATE INDEX "chatbot_conversations_userId_idx" ON "chatbot_conversations"("userId");

-- AddForeignKey
ALTER TABLE "scam_reports" ADD CONSTRAINT "scam_reports_typologyId_fkey" FOREIGN KEY ("typologyId") REFERENCES "scam_typologies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_clauses" ADD CONSTRAINT "contract_clauses_typologyId_fkey" FOREIGN KEY ("typologyId") REFERENCES "scam_typologies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
