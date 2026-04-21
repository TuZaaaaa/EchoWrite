PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "Passage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "sourceEnglish" TEXT NOT NULL,
  "referenceChinese" TEXT,
  "topic" TEXT,
  "difficulty" TEXT CHECK ("difficulty" IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  "tags" TEXT NOT NULL DEFAULT '[]',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Attempt" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "passageId" TEXT NOT NULL,
  "userChinese" TEXT NOT NULL,
  "userBackTranslatedEnglish" TEXT,
  "evaluationJson" TEXT,
  "overallScore" INTEGER,
  "meaningScore" INTEGER,
  "naturalnessScore" INTEGER,
  "grammarScore" INTEGER,
  "styleScore" INTEGER,
  "learnabilityScore" INTEGER,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attempt_passageId_fkey"
    FOREIGN KEY ("passageId") REFERENCES "Passage" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "MistakeItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "attemptId" TEXT NOT NULL,
  "category" TEXT NOT NULL CHECK ("category" IN ('grammar', 'collocation', 'unnatural_phrasing', 'omitted_information', 'added_information', 'chinese_influenced_expression', 'weak_sentence_variety')),
  "severity" TEXT NOT NULL CHECK ("severity" IN ('low', 'medium', 'high')),
  "originalFragment" TEXT,
  "userFragment" TEXT,
  "explanation" TEXT NOT NULL,
  "suggestion" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MistakeItem_attemptId_fkey"
    FOREIGN KEY ("attemptId") REFERENCES "Attempt" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Attempt_passageId_idx" ON "Attempt" ("passageId");
CREATE INDEX IF NOT EXISTS "Attempt_createdAt_idx" ON "Attempt" ("createdAt");
CREATE INDEX IF NOT EXISTS "Attempt_overallScore_idx" ON "Attempt" ("overallScore");
CREATE INDEX IF NOT EXISTS "MistakeItem_attemptId_idx" ON "MistakeItem" ("attemptId");
CREATE INDEX IF NOT EXISTS "MistakeItem_category_idx" ON "MistakeItem" ("category");
CREATE INDEX IF NOT EXISTS "MistakeItem_severity_idx" ON "MistakeItem" ("severity");
