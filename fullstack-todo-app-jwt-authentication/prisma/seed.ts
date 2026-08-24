import { PrismaClient, Role, QuestionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping admin seed.');
  } else {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);

      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          role: Role.ADMIN,
        },
      });

      console.log('Admin user created:', admin.email);
    } else {
      console.log('Admin user already exists. Skipping admin seed.');
    }
  }

  // Seed Present Simple Tense
  const existingTense = await prisma.tense.findUnique({
    where: { code: 'PRESENT_SIMPLE' },
  });

  let tense: any;
  if (!existingTense) {
    tense = await prisma.tense.create({
      data: {
        code: 'PRESENT_SIMPLE',
        name: 'Present Simple',
        order: 1,
      },
    });
    console.log('Tense created:', tense.name);
  } else {
    tense = existingTense;
    console.log('Tense already exists:', tense.name);
  }

  // Seed Level 1 for Present Simple
  const existingLevel = await prisma.level.findFirst({
    where: { tenseId: tense.id, order: 1 },
  });

  let level: any;
  if (!existingLevel) {
    level = await prisma.level.create({
      data: {
        tenseId: tense.id,
        order: 1,
        passScore: 70,
        coinReward: 50,
      },
    });
    console.log('Level created:', level.id);
  } else {
    level = existingLevel;
    console.log('Level already exists:', level.id);
  }

  // Seed 5 MULTIPLE_CHOICE questions
  const existingQuestions = await prisma.question.findMany({
    where: { levelId: level.id },
  });

  if (existingQuestions.length === 0) {
    const questions = [
      {
        type: QuestionType.MULTIPLE_CHOICE,
        prompt: 'She _____ to school every day.',
        payload: { options: ['go', 'goes', 'going', 'went'] },
        correctAnswer: 1, // index of 'goes'
        order: 1,
      },
      {
        type: QuestionType.MULTIPLE_CHOICE,
        prompt: 'They _____ football on weekends.',
        payload: { options: ['plays', 'play', 'playing', 'played'] },
        correctAnswer: 1, // index of 'play'
        order: 2,
      },
      {
        type: QuestionType.MULTIPLE_CHOICE,
        prompt: 'He _____ not like coffee.',
        payload: { options: ['do', 'does', 'is', 'are'] },
        correctAnswer: 1, // index of 'does'
        order: 3,
      },
      {
        type: QuestionType.MULTIPLE_CHOICE,
        prompt: '_____ you speak English?',
        payload: { options: ['Do', 'Does', 'Is', 'Are'] },
        correctAnswer: 0, // index of 'Do'
        order: 4,
      },
      {
        type: QuestionType.MULTIPLE_CHOICE,
        prompt: 'My mother _____ dinner at 7 PM.',
        payload: { options: ['cook', 'cooks', 'cooking', 'cooked'] },
        correctAnswer: 1, // index of 'cooks'
        order: 5,
      },
    ];

    for (const q of questions) {
      await prisma.question.create({
        data: {
          levelId: level.id,
          type: q.type,
          prompt: q.prompt,
          payload: q.payload,
          correctAnswer: q.correctAnswer,
          order: q.order,
        },
      });
    }
    console.log('Created 5 MULTIPLE_CHOICE questions for Level 1');
  } else {
    console.log('Questions already exist for Level 1');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
