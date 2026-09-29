import { Prisma, PrismaClient, QuestionType } from '@prisma/client';

type SeedQuestion = { code: string; order: number; type: QuestionType; prompt: string; payload: Prisma.InputJsonValue; correctAnswer: Prisma.InputJsonValue; explanation: string };

// Four original checkpoint questions per source level give each retry a varied 2-of-4 draw.
const questions: SeedQuestion[] = [
  { code: 'l1-1', order: 1, type: 'MULTIPLE_CHOICE', prompt: 'Mia ___ football after school.', payload: { options: ['play', 'plays', 'played', 'playing'] }, correctAnswer: 1, explanation: 'Mia là một người, nên động từ thêm -s.' },
  { code: 'l1-2', order: 1, type: 'MULTIPLE_CHOICE', prompt: '___ your friends train on Fridays?', payload: { options: ['Do', 'Does', 'Is', 'Has'] }, correctAnswer: 0, explanation: 'Chủ ngữ số nhiều dùng Do trong câu hỏi.' },
  { code: 'l1-3', order: 1, type: 'MULTIPLE_CHOICE', prompt: 'Our coach ___ early every day.', payload: { options: ['arrive', 'arrives', 'arriving', 'arrived'] }, correctAnswer: 1, explanation: 'Our coach là một người, nên dùng arrives.' },
  { code: 'l1-4', order: 1, type: 'MULTIPLE_CHOICE', prompt: 'We ___ our boots before the match.', payload: { options: ['checks', 'check', 'checking', 'checked'] }, correctAnswer: 1, explanation: 'We đi với động từ nguyên mẫu check.' },
  { code: 'l2-1', order: 2, type: 'FILL_BLANK', prompt: 'Điền từ: The referee ___ the whistle.', payload: { sentence: 'The referee ___ the whistle.' }, correctAnswer: 'blows', explanation: 'The referee là một người, nên blow thêm -s.' },
  { code: 'l2-2', order: 2, type: 'FILL_BLANK', prompt: 'Điền từ: I ___ to practice by bike.', payload: { sentence: 'I ___ to practice by bike.' }, correctAnswer: 'go', explanation: 'I đi với động từ nguyên mẫu go.' },
  { code: 'l2-3', order: 2, type: 'FILL_BLANK', prompt: 'Điền từ: She ___ not miss a match.', payload: { sentence: 'She ___ not miss a match.' }, correctAnswer: 'does', explanation: 'She dùng does not trong câu phủ định.' },
  { code: 'l2-4', order: 2, type: 'FILL_BLANK', prompt: 'Điền từ: The players ___ together.', payload: { sentence: 'The players ___ together.' }, correctAnswer: 'train', explanation: 'The players là số nhiều, nên dùng train.' },
  { code: 'l3-1', order: 3, type: 'MATCHING', prompt: 'Nối chủ ngữ với dạng động từ phù hợp.', payload: { left: ['The captain', 'We', 'My friends', 'He'], right: ['run', 'runs'] }, correctAnswer: [1, 0, 0, 1], explanation: 'Chủ ngữ số ít dùng runs; we và my friends dùng run.' },
  { code: 'l3-2', order: 3, type: 'MATCHING', prompt: 'Nối chủ ngữ với dạng động từ phù hợp.', payload: { left: ['I', 'The goalkeeper', 'They', 'Anna'], right: ['catch', 'catches'] }, correctAnswer: [0, 1, 0, 1], explanation: 'Chủ ngữ số ít dùng catches; I và they dùng catch.' },
  { code: 'l3-3', order: 3, type: 'MATCHING', prompt: 'Nối chủ ngữ với dạng động từ phù hợp.', payload: { left: ['You', 'She', 'The team', 'We'], right: ['practice', 'practices'] }, correctAnswer: [0, 1, 1, 0], explanation: 'She và the team là số ít; you và we dùng practice.' },
  { code: 'l3-4', order: 3, type: 'MATCHING', prompt: 'Nối chủ ngữ với dạng động từ phù hợp.', payload: { left: ['They', 'Our coach', 'I', 'My brother'], right: ['teach', 'teaches'] }, correctAnswer: [0, 1, 0, 1], explanation: 'Our coach và my brother dùng teaches; they và I dùng teach.' },
  { code: 'l4-1', order: 4, type: 'CLOZE', prompt: 'Chọn từ phù hợp cho mỗi chỗ trống.', payload: { segments: ['Nina ', ' the ball and ', ' to the goal.'], bank: ['kick', 'kicks', 'run', 'runs'] }, correctAnswer: [1, 3], explanation: 'Nina là số ít, nên dùng kicks và runs.' },
  { code: 'l4-2', order: 4, type: 'CLOZE', prompt: 'Chọn từ phù hợp cho mỗi chỗ trống.', payload: { segments: ['We ', ' warm-ups and ', ' water.'], bank: ['do', 'does', 'drink', 'drinks'] }, correctAnswer: [0, 2], explanation: 'We đi với do và drink.' },
  { code: 'l4-3', order: 4, type: 'CLOZE', prompt: 'Chọn từ phù hợp cho mỗi chỗ trống.', payload: { segments: ['The coach ', ' the team and ', ' the score.'], bank: ['help', 'helps', 'check', 'checks'] }, correctAnswer: [1, 3], explanation: 'The coach là số ít, nên dùng helps và checks.' },
  { code: 'l4-4', order: 4, type: 'CLOZE', prompt: 'Chọn từ phù hợp cho mỗi chỗ trống.', payload: { segments: ['They ', ' on the field and ', ' after school.'], bank: ['play', 'plays', 'practice', 'practices'] }, correctAnswer: [0, 2], explanation: 'They dùng play và practice.' },
  { code: 'l5-1', order: 5, type: 'TRUE_FALSE_NOT_GIVEN', prompt: 'Đọc và chọn Đúng, Sai hoặc Không đề cập.', payload: { passage: 'Linh practices football every Tuesday.', statement: 'Linh practices football on Tuesday.' }, correctAnswer: 'TRUE', explanation: 'Đoạn văn nêu rõ Linh tập vào thứ Ba.' },
  { code: 'l5-2', order: 5, type: 'TRUE_FALSE_NOT_GIVEN', prompt: 'Đọc và chọn Đúng, Sai hoặc Không đề cập.', payload: { passage: 'Sam walks to the stadium on Sundays.', statement: 'Sam rides a bike to the stadium.' }, correctAnswer: 'FALSE', explanation: 'Sam đi bộ, không đi xe đạp.' },
  { code: 'l5-3', order: 5, type: 'TRUE_FALSE_NOT_GIVEN', prompt: 'Đọc và chọn Đúng, Sai hoặc Không đề cập.', payload: { passage: 'The team trains after school.', statement: 'The team trains for one hour.' }, correctAnswer: 'NOT_GIVEN', explanation: 'Đoạn văn không cho biết thời lượng tập.' },
  { code: 'l5-4', order: 5, type: 'TRUE_FALSE_NOT_GIVEN', prompt: 'Đọc và chọn Đúng, Sai hoặc Không đề cập.', payload: { passage: 'Mai drinks water before every match.', statement: 'Mai drinks water after every match.' }, correctAnswer: 'FALSE', explanation: 'Đoạn văn nói trước trận, không phải sau trận.' },
];

export async function seedBoss(prisma: PrismaClient, tenseId: string) {
  const levels = await prisma.level.findMany({ where: { tenseId, order: { gte: 1, lte: 5 } } });
  if (levels.length !== 5) throw new Error('Boss seed requires Present Simple levels 1–5.');
  const boss = await prisma.bossCheckpoint.upsert({
    where: { tenseId_groupIndex: { tenseId, groupIndex: 1 } },
    create: { tenseId, groupIndex: 1, sourceStart: 1, sourceEnd: 5, name: 'Người Gác Ngữ Pháp', published: true, passThreshold: 7 },
    update: { name: 'Người Gác Ngữ Pháp', published: true, passThreshold: 7 },
  });
  for (const q of questions) {
    const sourceLevelId = levels.find(l => l.order === q.order)!.id;
    await prisma.bossQuestion.upsert({
      where: { bossId_code: { bossId: boss.id, code: q.code } },
      create: { bossId: boss.id, sourceLevelId, code: q.code, type: q.type, prompt: q.prompt, payload: q.payload, correctAnswer: q.correctAnswer, explanation: q.explanation, published: true },
      update: { sourceLevelId, type: q.type, prompt: q.prompt, payload: q.payload, correctAnswer: q.correctAnswer, explanation: q.explanation, published: true },
    });
  }
}
