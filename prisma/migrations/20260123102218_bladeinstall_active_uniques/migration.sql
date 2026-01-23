-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saw" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sawType" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "side" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Saw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BladeType" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "hasSide" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "artikkel" TEXT,

    CONSTRAINT "BladeType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SawBlade" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "IdNummer" TEXT NOT NULL,
    "kunde" TEXT,
    "note" TEXT,
    "produsent" TEXT,
    "artikkel" TEXT,
    "side" TEXT,
    "bladeTypeId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleteReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "SawBlade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BladeInstall" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "bladeId" TEXT NOT NULL,
    "sawId" TEXT NOT NULL,
    "installedAt" TIMESTAMP(3) NOT NULL,
    "installedById" TEXT,
    "removedAt" TIMESTAMP(3),
    "removedById" TEXT,
    "side" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BladeInstall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BladeService" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "bladeId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "datoInn" TIMESTAMP(3) NOT NULL,
    "datoUt" TIMESTAMP(3),
    "antRep" INTEGER NOT NULL DEFAULT 0,
    "antTannslipp" INTEGER NOT NULL DEFAULT 0,
    "feilkode" TEXT,
    "handling" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "BladeService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BladeRunLog" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "installId" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sagtid" DOUBLE PRECISION,
    "feilkode" TEXT,
    "temperatur" INTEGER,
    "sideklaring" DOUBLE PRECISION,
    "ampere" DOUBLE PRECISION,
    "stokkAnt" INTEGER,
    "anmSag" TEXT,
    "anmKS" TEXT,
    "sgSag" TEXT,
    "sgKS" TEXT,
    "alt" TEXT,
    "bladType" TEXT,
    "sawType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "BladeRunLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_orgId_idx" ON "Post"("orgId");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "Saw_orgId_idx" ON "Saw"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Saw_orgId_name_key" ON "Saw"("orgId", "name");

-- CreateIndex
CREATE INDEX "BladeType_orgId_idx" ON "BladeType"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "BladeType_orgId_name_key" ON "BladeType"("orgId", "name");

-- CreateIndex
CREATE INDEX "SawBlade_orgId_idx" ON "SawBlade"("orgId");

-- CreateIndex
CREATE INDEX "SawBlade_orgId_bladeTypeId_idx" ON "SawBlade"("orgId", "bladeTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "SawBlade_orgId_IdNummer_key" ON "SawBlade"("orgId", "IdNummer");

-- CreateIndex
CREATE INDEX "BladeInstall_orgId_idx" ON "BladeInstall"("orgId");

-- CreateIndex
CREATE INDEX "BladeInstall_orgId_bladeId_idx" ON "BladeInstall"("orgId", "bladeId");

-- CreateIndex
CREATE INDEX "BladeInstall_orgId_sawId_idx" ON "BladeInstall"("orgId", "sawId");

-- CreateIndex
CREATE INDEX "BladeInstall_orgId_installedAt_idx" ON "BladeInstall"("orgId", "installedAt");

-- CreateIndex
CREATE INDEX "BladeInstall_orgId_removedAt_idx" ON "BladeInstall"("orgId", "removedAt");

-- CreateIndex
CREATE INDEX "BladeInstall_orgId_sawId_removedAt_idx" ON "BladeInstall"("orgId", "sawId", "removedAt");

-- CreateIndex
CREATE INDEX "BladeInstall_orgId_bladeId_removedAt_idx" ON "BladeInstall"("orgId", "bladeId", "removedAt");

-- CreateIndex
CREATE INDEX "BladeService_orgId_idx" ON "BladeService"("orgId");

-- CreateIndex
CREATE INDEX "BladeService_orgId_bladeId_idx" ON "BladeService"("orgId", "bladeId");

-- CreateIndex
CREATE INDEX "BladeService_orgId_datoInn_idx" ON "BladeService"("orgId", "datoInn");

-- CreateIndex
CREATE INDEX "BladeRunLog_orgId_idx" ON "BladeRunLog"("orgId");

-- CreateIndex
CREATE INDEX "BladeRunLog_orgId_installId_idx" ON "BladeRunLog"("orgId", "installId");

-- CreateIndex
CREATE INDEX "BladeRunLog_orgId_loggedAt_idx" ON "BladeRunLog"("orgId", "loggedAt");

-- AddForeignKey
ALTER TABLE "SawBlade" ADD CONSTRAINT "SawBlade_bladeTypeId_fkey" FOREIGN KEY ("bladeTypeId") REFERENCES "BladeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BladeInstall" ADD CONSTRAINT "BladeInstall_bladeId_fkey" FOREIGN KEY ("bladeId") REFERENCES "SawBlade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BladeInstall" ADD CONSTRAINT "BladeInstall_sawId_fkey" FOREIGN KEY ("sawId") REFERENCES "Saw"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BladeService" ADD CONSTRAINT "BladeService_bladeId_fkey" FOREIGN KEY ("bladeId") REFERENCES "SawBlade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BladeRunLog" ADD CONSTRAINT "BladeRunLog_installId_fkey" FOREIGN KEY ("installId") REFERENCES "BladeInstall"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Ensure only ONE active install per saw (per org)
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_active_install_per_saw"
ON "BladeInstall" ("orgId", "sawId")
WHERE "removedAt" IS NULL;

-- Ensure only ONE active install per blade (per org)
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_active_install_per_blade"
ON "BladeInstall" ("orgId", "bladeId")
WHERE "removedAt" IS NULL;
