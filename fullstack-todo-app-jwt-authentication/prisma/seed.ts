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

  // ============================================================
  // Seed Level 2-5 — 4 loại câu hỏi còn lại của Present Simple:
  // FILL_BLANK, MATCHING, CLOZE, TRUE_FALSE_NOT_GIVEN
  // (cùng tenseId với Level 1, order nối tiếp, passScore 70,
  // coinReward 50 tương tự Level 1).
  //
  // CONTRACT (khớp submitLevel — so sánh JSON.stringify):
  // correctAnswer CHỈ là string | number | mảng phẳng các
  // string/number — KHÔNG object (object serialize JSON không
  // đảm bảo thứ tự key giữa FE và DB → sai điểm âm thầm).
  // ============================================================
  const extraLevels: {
    order: number;
    type: QuestionType;
    questions: { prompt: string; payload: any; correctAnswer: any }[];
  }[] = [
    {
      // LEVEL 2 — FILL_BLANK
      // answer FE gửi: string đã trim().toLowerCase() → correctAnswer lưu dạng thường
      order: 2,
      type: QuestionType.FILL_BLANK,
      questions: [
        {
          prompt: 'Điền động từ đúng vào chỗ trống.',
          payload: { sentence: 'She ___ to school every day.', hint: 'go' },
          correctAnswer: 'goes',
        },
        {
          prompt: 'Điền động từ đúng vào chỗ trống.',
          payload: { sentence: 'They ___ football on Sundays.', hint: 'play' },
          correctAnswer: 'play',
        },
        {
          prompt: 'Điền động từ đúng vào chỗ trống.',
          payload: { sentence: 'I ___ my homework after dinner.', hint: 'do' },
          correctAnswer: 'do',
        },
        {
          prompt: 'Điền động từ đúng vào chỗ trống.',
          payload: { sentence: 'He ___ not like fish.', hint: 'do' },
          correctAnswer: 'does',
        },
        {
          prompt: 'Điền động từ đúng vào chỗ trống.',
          payload: { sentence: 'We ___ TV in the evening.', hint: 'watch' },
          correctAnswer: 'watch',
        },
      ],
    },
    {
      // LEVEL 3 — MATCHING (nối chủ ngữ với đúng dạng động từ)
      // answer FE gửi: number[] — answer[i] = index trong "right" ghép với left[i]
      order: 3,
      type: QuestionType.MATCHING,
      questions: [
        {
          prompt: 'Nối mỗi chủ ngữ với động từ đúng.',
          payload: { left: ['I', 'She', 'They', 'He'], right: ['go', 'goes'] },
          correctAnswer: [0, 1, 0, 1],
        },
        {
          prompt: 'Nối mỗi chủ ngữ với động từ đúng.',
          payload: { left: ['We', 'Tom', 'You', 'My cat'], right: ['play', 'plays'] },
          correctAnswer: [0, 1, 0, 1],
        },
        {
          prompt: 'Nối mỗi chủ ngữ với động từ đúng.',
          payload: { left: ['He', 'I', 'She', 'We'], right: ['watches', 'watch'] },
          correctAnswer: [0, 1, 0, 1],
        },
        {
          prompt: 'Nối mỗi chủ ngữ với động từ đúng.',
          payload: { left: ['The dog', 'The dogs', 'I', 'It'], right: ['runs', 'run'] },
          correctAnswer: [0, 1, 1, 0],
        },
        {
          prompt: 'Nối mỗi chủ ngữ với động từ đúng.',
          payload: { left: ['My mother', 'My sisters', 'You', 'He'], right: ['cooks', 'cook'] },
          correctAnswer: [0, 1, 1, 0],
        },
      ],
    },
    {
      // LEVEL 4 — CLOZE (đoạn văn nhiều chỗ trống, mỗi chỗ trắc nghiệm nhỏ)
      // segments.length - 1 = blanks.length
      // answer FE gửi: number[] — index đã chọn cho từng blank, đúng thứ tự
      order: 4,
      type: QuestionType.CLOZE,
      questions: [
        {
          prompt: 'Chọn từ đúng cho mỗi chỗ trống.',
          payload: {
            segments: ['Every morning, Tom ', ' up early and ', ' his teeth.'],
            blanks: [{ options: ['get', 'gets'] }, { options: ['brush', 'brushes'] }],
          },
          correctAnswer: [1, 1],
        },
        {
          prompt: 'Chọn từ đúng cho mỗi chỗ trống.',
          payload: {
            segments: ['She ', ' to school and ', ' English.'],
            blanks: [{ options: ['walk', 'walks'] }, { options: ['study', 'studies'] }],
          },
          correctAnswer: [1, 1],
        },
        {
          prompt: 'Chọn từ đúng cho mỗi chỗ trống.',
          payload: {
            segments: ['I ', ' milk, but my brother ', ' juice.'],
            blanks: [{ options: ['drink', 'drinks'] }, { options: ['drink', 'drinks'] }],
          },
          correctAnswer: [0, 1],
        },
        {
          prompt: 'Chọn từ đúng cho mỗi chỗ trống.',
          payload: {
            segments: ['We ', ' football on Sunday and ', ' home at 5 PM.'],
            blanks: [{ options: ['play', 'plays'] }, { options: ['go', 'goes'] }],
          },
          correctAnswer: [0, 0],
        },
        {
          prompt: 'Chọn từ đúng cho mỗi chỗ trống.',
          payload: {
            segments: ['The cat ', ' on the sofa and ', ' all day.'],
            blanks: [{ options: ['sit', 'sits'] }, { options: ['sleep', 'sleeps'] }],
          },
          correctAnswer: [1, 1],
        },
      ],
    },
    {
      // LEVEL 5 — TRUE_FALSE_NOT_GIVEN
      // answer FE gửi: "TRUE" | "FALSE" | "NOT_GIVEN"
      order: 5,
      type: QuestionType.TRUE_FALSE_NOT_GIVEN,
      questions: [
        {
          prompt: 'Đọc đoạn văn rồi chọn đáp án đúng.',
          payload: {
            passage: 'Tom always gets up at 6 AM and walks to school.',
            statement: 'Tom drives to school.',
          },
          correctAnswer: 'FALSE',
        },
        {
          prompt: 'Đọc đoạn văn rồi chọn đáp án đúng.',
          payload: {
            passage: 'Lan likes apples and bananas. She eats fruit every day.',
            statement: 'Lan eats fruit every day.',
          },
          correctAnswer: 'TRUE',
        },
        {
          prompt: 'Đọc đoạn văn rồi chọn đáp án đúng.',
          payload: {
            passage: 'Peter plays football on Sundays with his friends.',
            statement: 'Peter plays football on Saturdays.',
          },
          correctAnswer: 'NOT_GIVEN',
        },
        {
          prompt: 'Đọc đoạn văn rồi chọn đáp án đúng.',
          payload: {
            passage: 'My sister reads books in the evening. She does not watch TV.',
            statement: 'My sister watches TV in the evening.',
          },
          correctAnswer: 'FALSE',
        },
        {
          prompt: 'Đọc đoạn văn rồi chọn đáp án đúng.',
          payload: {
            passage: 'We study English on Monday and Wednesday.',
            statement: 'We study English on Monday.',
          },
          correctAnswer: 'TRUE',
        },
      ],
    },
  ];

  for (const def of extraLevels) {
    let extraLevel: any = await prisma.level.findFirst({
      where: { tenseId: tense.id, order: def.order },
    });

    if (!extraLevel) {
      extraLevel = await prisma.level.create({
        data: {
          tenseId: tense.id,
          order: def.order,
          passScore: 70,
          coinReward: 50,
        },
      });
      console.log(`Level ${def.order} created:`, extraLevel.id);
    } else {
      console.log(`Level ${def.order} already exists. Skipping.`);
    }

    const existingQs = await prisma.question.findMany({
      where: { levelId: extraLevel.id },
    });

    if (existingQs.length === 0) {
      let qOrder = 1;
      for (const q of def.questions) {
        await prisma.question.create({
          data: {
            levelId: extraLevel.id,
            type: def.type,
            prompt: q.prompt,
            payload: q.payload,
            correctAnswer: q.correctAnswer,
            order: qOrder++,
          },
        });
      }
      console.log(`Created 5 ${def.type} questions for Level ${def.order}`);
    } else {
      console.log(`Questions already exist for Level ${def.order}`);
    }
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