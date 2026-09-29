-- CreateEnum
CREATE TYPE "BossAttemptStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "boss_checkpoints" (
    "id" TEXT NOT NULL,
    "tense_id" TEXT NOT NULL,
    "group_index" INTEGER NOT NULL,
    "source_start" INTEGER NOT NULL,
    "source_end" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "pass_threshold" INTEGER NOT NULL DEFAULT 7,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boss_checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boss_questions" (
    "id" TEXT NOT NULL,
    "boss_id" TEXT NOT NULL,
    "source_level_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "correct_answer" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boss_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boss_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "boss_id" TEXT NOT NULL,
    "best_score" INTEGER NOT NULL DEFAULT 0,
    "best_stars" INTEGER NOT NULL DEFAULT 0,
    "passed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boss_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boss_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "boss_id" TEXT NOT NULL,
    "status" "BossAttemptStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_position" INTEGER NOT NULL DEFAULT 1,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boss_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boss_attempt_questions" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "boss_question_id" TEXT NOT NULL,
    "source_level_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "type" "QuestionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "correct_answer" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "submitted_answer" JSONB,
    "is_correct" BOOLEAN,
    "answered_at" TIMESTAMP(3),

    CONSTRAINT "boss_attempt_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "boss_checkpoints_tense_id_source_end_idx" ON "boss_checkpoints"("tense_id", "source_end");

-- CreateIndex
CREATE UNIQUE INDEX "boss_checkpoints_tense_id_group_index_key" ON "boss_checkpoints"("tense_id", "group_index");

-- CreateIndex
CREATE INDEX "boss_questions_boss_id_source_level_id_published_idx" ON "boss_questions"("boss_id", "source_level_id", "published");

-- CreateIndex
CREATE UNIQUE INDEX "boss_questions_boss_id_code_key" ON "boss_questions"("boss_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "boss_progress_user_id_boss_id_key" ON "boss_progress"("user_id", "boss_id");

-- CreateIndex
CREATE INDEX "boss_attempts_user_id_boss_id_status_idx" ON "boss_attempts"("user_id", "boss_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "boss_attempt_questions_attempt_id_position_key" ON "boss_attempt_questions"("attempt_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "boss_attempt_questions_attempt_id_boss_question_id_key" ON "boss_attempt_questions"("attempt_id", "boss_question_id");

-- CreateIndex
CREATE UNIQUE INDEX "levels_tense_id_order_key" ON "levels"("tense_id", "order");

-- Only one live attempt per learner and checkpoint, including concurrent starts.
CREATE UNIQUE INDEX "boss_attempts_one_active_per_user_boss" ON "boss_attempts"("user_id", "boss_id") WHERE "status" = 'ACTIVE';

ALTER TABLE "boss_checkpoints" ADD CONSTRAINT "boss_checkpoints_range_check"
  CHECK ("group_index" > 0 AND "source_start" = ("group_index" - 1) * 5 + 1
    AND "source_end" = "group_index" * 5 AND "pass_threshold" BETWEEN 1 AND 10);
ALTER TABLE "boss_attempts" ADD CONSTRAINT "boss_attempts_position_check"
  CHECK ("current_position" BETWEEN 1 AND 11 AND "correct_count" BETWEEN 0 AND 10);
ALTER TABLE "boss_attempt_questions" ADD CONSTRAINT "boss_attempt_questions_position_check"
  CHECK ("position" BETWEEN 1 AND 10);
ALTER TABLE "boss_progress" ADD CONSTRAINT "boss_progress_score_check"
  CHECK ("best_score" BETWEEN 0 AND 10 AND "best_stars" BETWEEN 0 AND 3);

-- AddForeignKey
ALTER TABLE "boss_checkpoints" ADD CONSTRAINT "boss_checkpoints_tense_id_fkey" FOREIGN KEY ("tense_id") REFERENCES "tenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boss_questions" ADD CONSTRAINT "boss_questions_boss_id_fkey" FOREIGN KEY ("boss_id") REFERENCES "boss_checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boss_questions" ADD CONSTRAINT "boss_questions_source_level_id_fkey" FOREIGN KEY ("source_level_id") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boss_progress" ADD CONSTRAINT "boss_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boss_progress" ADD CONSTRAINT "boss_progress_boss_id_fkey" FOREIGN KEY ("boss_id") REFERENCES "boss_checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boss_attempts" ADD CONSTRAINT "boss_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boss_attempts" ADD CONSTRAINT "boss_attempts_boss_id_fkey" FOREIGN KEY ("boss_id") REFERENCES "boss_checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boss_attempt_questions" ADD CONSTRAINT "boss_attempt_questions_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "boss_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boss_attempt_questions" ADD CONSTRAINT "boss_attempt_questions_boss_question_id_fkey" FOREIGN KEY ("boss_question_id") REFERENCES "boss_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
