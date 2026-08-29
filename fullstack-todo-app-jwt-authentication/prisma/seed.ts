import { PrismaClient, Role, QuestionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/* ============================================================
   Seed Present Simple — 5 Level × 10 câu (cập nhật [14]).
   - Mỗi Level có `name` (tên dạng bài) — Vấn đề 2.
   - MỌI câu hỏi có payload.hint = câu quy tắc ngữ pháp — Vấn đề 4.
     (Riêng FILL_BLANK: `hint` đổi ý nghĩa thành câu lý thuyết,
     KHÔNG còn là nguyên mẫu động từ gợi ý đáp án.)
   - CLOZE dùng contract MỚI { segments, bank } — Vấn đề 3b.
     answer/correctAnswer = number[] (index trong bank theo thứ tự blank).
   - correctAnswer CHỈ là string / number / mảng phẳng — KHÔNG object.
   - Idempotent: Level đã có thì cập nhật `name`; Question xoá đi tạo lại
     để áp dụng contract + hint + đủ 10 câu.
   ============================================================ */

/* ---------------- Level 1 — Trắc Nghiệm (MULTIPLE_CHOICE) ---------------- */
const L1 = [
  { prompt: 'She ___ to school every day.', options: ['go', 'goes', 'going', 'went'], correctAnswer: 1, hint: 'Chủ ngữ số ít (she/he/it) → động từ thêm -s/-es ở Present Simple.' },
  { prompt: 'They ___ football on weekends.', options: ['plays', 'play', 'playing', 'played'], correctAnswer: 1, hint: 'Chủ ngữ số nhiều (they/we/you) → động từ giữ nguyên.' },
  { prompt: 'He ___ not like coffee.', options: ['do', 'does', 'is', 'are'], correctAnswer: 1, hint: 'Phủ định với he/she/it dùng "does not" + V nguyên mẫu.' },
  { prompt: '___ you speak English?', options: ['Do', 'Does', 'Is', 'Are'], correctAnswer: 0, hint: 'Câu hỏi với you/we/they bắt đầu bằng "Do".' },
  { prompt: 'My mother ___ dinner at 7 PM.', options: ['cook', 'cooks', 'cooking', 'cooked'], correctAnswer: 1, hint: '"My mother" = she → động từ thêm -s.' },
  { prompt: 'The sun ___ in the east.', options: ['rise', 'rises', 'rising', 'rose'], correctAnswer: 1, hint: 'Sự thật hiển nhiên dùng Present Simple; "the sun" số ít → rises.' },
  { prompt: 'I ___ my teeth every morning.', options: ['brush', 'brushes', 'brushing', 'brushed'], correctAnswer: 0, hint: 'Chủ ngữ "I" → động từ giữ nguyên.' },
  { prompt: '___ she live in Hanoi?', options: ['Do', 'Does', 'Is', 'Are'], correctAnswer: 1, hint: 'Câu hỏi với she/he/it bắt đầu bằng "Does".' },
  { prompt: 'We ___ to music after school.', options: ['listen', 'listens', 'listening', 'listened'], correctAnswer: 0, hint: '"We" số nhiều → động từ giữ nguyên.' },
  { prompt: 'The dog ___ loudly at night.', options: ['bark', 'barks', 'barking', 'barked'], correctAnswer: 1, hint: '"The dog" số ít → động từ thêm -s.' },
];

/* ---------------- Level 2 — Điền Từ (FILL_BLANK) ---------------- */
// correctAnswer: string viết thường. hint = câu lý thuyết (không phải đáp án).
const L2 = [
  { prompt: 'Điền động từ đúng: She ___ to school every day.', sentence: 'She ___ to school every day.', correctAnswer: 'goes', hint: 'Chủ ngữ số ít (she) → động từ thêm -s/-es.' },
  { prompt: 'Điền động từ đúng: He ___ not like fish.', sentence: 'He ___ not like fish.', correctAnswer: 'does', hint: 'Phủ định với he → "does not" + V nguyên mẫu.' },
  { prompt: 'Điền động từ đúng: They ___ football on weekends.', sentence: 'They ___ football on weekends.', correctAnswer: 'play', hint: 'Chủ ngữ số nhiều (they) → động từ giữ nguyên.' },
  { prompt: 'Điền động từ đúng: I ___ my homework after dinner.', sentence: 'I ___ my homework after dinner.', correctAnswer: 'do', hint: 'Chủ ngữ "I" → động từ giữ nguyên.' },
  { prompt: 'Điền động từ đúng: My father ___ TV in the evening.', sentence: 'My father ___ TV in the evening.', correctAnswer: 'watches', hint: '"My father" số ít; watch tận cùng -ch → thêm -es.' },
  { prompt: 'Điền động từ đúng: The cat ___ milk every day.', sentence: 'The cat ___ milk every day.', correctAnswer: 'drinks', hint: '"The cat" số ít → động từ thêm -s.' },
  { prompt: 'Điền động từ đúng: We ___ English on Mondays.', sentence: 'We ___ English on Mondays.', correctAnswer: 'study', hint: '"We" số nhiều → động từ giữ nguyên.' },
  { prompt: 'Điền động từ đúng: She ___ her teeth twice a day.', sentence: 'She ___ her teeth twice a day.', correctAnswer: 'brushes', hint: '"She" số ít; brush tận cùng -sh → thêm -es.' },
  { prompt: 'Điền động từ đúng: Birds ___ in the sky.', sentence: 'Birds ___ in the sky.', correctAnswer: 'fly', hint: '"Birds" số nhiều → động từ giữ nguyên.' },
  { prompt: 'Điền động từ đúng: He ___ to music every night.', sentence: 'He ___ to music every night.', correctAnswer: 'listens', hint: '"He" số ít → động từ thêm -s.' },
];

/* ---------------- Level 3 — Nối Câu (MATCHING) ---------------- */
// correctAnswer: number[] — index trong `right` tương ứng từng phần tử `left`.
const L3 = [
  { prompt: 'Nối chủ ngữ với động từ đúng.', left: ['I', 'She', 'They', 'He'], right: ['go', 'goes'], correctAnswer: [0, 1, 0, 1], hint: 'I/they → go; she/he → goes.' },
  { prompt: 'Nối chủ ngữ với động từ đúng.', left: ['We', 'He', 'I', 'She'], right: ['play', 'plays'], correctAnswer: [0, 1, 0, 1], hint: 'we/I → play; he/she → plays.' },
  { prompt: 'Nối chủ ngữ với động từ đúng.', left: ['She', 'They', 'He', 'We'], right: ['watch', 'watches'], correctAnswer: [1, 0, 1, 0], hint: 'she/he → watches; they/we → watch.' },
  { prompt: 'Nối chủ ngữ với động từ đúng.', left: ['He', 'I', 'She', 'They'], right: ['do', 'does'], correctAnswer: [1, 0, 1, 0], hint: 'he/she → does; I/they → do.' },
  { prompt: 'Nối chủ ngữ với động từ đúng.', left: ['They', 'She', 'We', 'He'], right: ['have', 'has'], correctAnswer: [0, 1, 0, 1], hint: 'they/we → have; she/he → has.' },
  { prompt: 'Nối chủ ngữ với động từ đúng.', left: ['She', 'We', 'He', 'I'], right: ['eat', 'eats'], correctAnswer: [1, 0, 1, 0], hint: 'she/he → eats; we/I → eat.' },
  { prompt: 'Nối chủ ngữ với động từ đúng.', left: ['I', 'He', 'They', 'She'], right: ['read', 'reads'], correctAnswer: [0, 1, 0, 1], hint: 'I/they → read; he/she → reads.' },
  { prompt: 'Nối chủ ngữ với động từ đúng.', left: ['We', 'She', 'I', 'He'], right: ['run', 'runs'], correctAnswer: [0, 1, 0, 1], hint: 'we/I → run; she/he → runs.' },
  { prompt: 'Nối chủ ngữ với động từ đúng.', left: ['He', 'They', 'She', 'We'], right: ['like', 'likes'], correctAnswer: [1, 0, 1, 0], hint: 'he/she → likes; they/we → like.' },
  { prompt: 'Nối chủ ngữ với động từ đúng.', left: ['They', 'He', 'I', 'She'], right: ['swim', 'swims'], correctAnswer: [0, 1, 0, 1], hint: 'they/I → swim; he/she → swims.' },
];

/* ---------------- Level 4 — Điền Đoạn Văn (CLOZE) — contract { segments, bank } ---------------- */
// correctAnswer: number[] — index trong `bank` cho từng chỗ trống theo thứ tự.
const L4 = [
  { prompt: 'Chọn từ đúng trong ngân hàng để điền vào chỗ trống.', segments: ['Every morning, Tom ', ' up early and ', ' his teeth.'], bank: ['get', 'gets', 'brush', 'brushes'], correctAnswer: [1, 3], hint: 'Tom số ít → get→gets, brush→brushes.' },
  { prompt: 'Chọn từ đúng trong ngân hàng để điền vào chỗ trống.', segments: ['My sister ', ' English and ', ' songs.'], bank: ['study', 'studies', 'sing', 'sings'], correctAnswer: [1, 3], hint: 'My sister = she → study→studies, sing→sings.' },
  { prompt: 'Chọn từ đúng trong ngân hàng để điền vào chỗ trống.', segments: ['We ', ' to school and ', ' hard.'], bank: ['go', 'goes', 'study', 'studies'], correctAnswer: [0, 2], hint: 'We số nhiều → go, study giữ nguyên.' },
  { prompt: 'Chọn từ đúng trong ngân hàng để điền vào chỗ trống.', segments: ['The cat ', ' milk and ', ' all day.'], bank: ['drink', 'drinks', 'sleep', 'sleeps'], correctAnswer: [1, 3], hint: 'The cat số ít → drink→drinks, sleep→sleeps.' },
  { prompt: 'Chọn từ đúng trong ngân hàng để điền vào chỗ trống.', segments: ['I ', ' breakfast and ', ' to music.'], bank: ['eat', 'eats', 'listen', 'listens'], correctAnswer: [0, 2], hint: 'I → eat, listen giữ nguyên.' },
  { prompt: 'Chọn từ đúng trong ngân hàng để điền vào chỗ trống.', segments: ['He ', ' football and ', ' TV.'], bank: ['play', 'plays', 'watch', 'watches'], correctAnswer: [1, 3], hint: 'He số ít → play→plays, watch→watches.' },
  { prompt: 'Chọn từ đúng trong ngân hàng để điền vào chỗ trống.', segments: ['They ', ' books and ', ' pictures.'], bank: ['read', 'reads', 'draw', 'draws'], correctAnswer: [0, 2], hint: 'They số nhiều → read, draw giữ nguyên.' },
  { prompt: 'Chọn từ đúng trong ngân hàng để điền vào chỗ trống.', segments: ['She ', ' her dog and ', ' in the park.'], bank: ['walk', 'walks', 'run', 'runs'], correctAnswer: [1, 3], hint: 'She số ít → walk→walks, run→runs.' },
  { prompt: 'Chọn từ đúng trong ngân hàng để điền vào chỗ trống.', segments: ['My parents ', ' dinner and ', ' the dishes.'], bank: ['cook', 'cooks', 'wash', 'washes'], correctAnswer: [0, 2], hint: 'My parents số nhiều → cook, wash giữ nguyên.' },
  { prompt: 'Chọn từ đúng trong ngân hàng để điền vào chỗ trống.', segments: ['The bird ', ' in the tree and ', ' happily.'], bank: ['sit', 'sits', 'sing', 'sings'], correctAnswer: [1, 3], hint: 'The bird số ít → sit→sits, sing→sings.' },
];

/* ---------------- Level 5 — Đúng / Sai / Không Đề Cập (TRUE_FALSE_NOT_GIVEN) ---------------- */
const L5 = [
  { prompt: 'Đọc đoạn văn và chọn đáp án đúng.', passage: 'Tom always gets up at 6 AM and walks to school.', statement: 'Tom drives to school.', correctAnswer: 'FALSE', hint: 'Đoạn văn nói Tom đi bộ (walks), không phải lái xe.' },
  { prompt: 'Đọc đoạn văn và chọn đáp án đúng.', passage: 'Anna likes apples and bananas.', statement: 'Anna likes apples.', correctAnswer: 'TRUE', hint: 'Đoạn văn nói rõ Anna thích táo.' },
  { prompt: 'Đọc đoạn văn và chọn đáp án đúng.', passage: 'Ben plays football on Sundays.', statement: 'Ben plays football on Saturdays.', correctAnswer: 'FALSE', hint: 'Đoạn văn nói Chủ Nhật, không phải Thứ Bảy.' },
  { prompt: 'Đọc đoạn văn và chọn đáp án đúng.', passage: 'My mother is a doctor.', statement: 'My mother works in a hospital.', correctAnswer: 'NOT_GIVEN', hint: 'Đoạn văn chỉ nói nghề nghiệp, không nói nơi làm việc.' },
  { prompt: 'Đọc đoạn văn và chọn đáp án đúng.', passage: 'The dog sleeps under the table.', statement: 'The dog sleeps under the table.', correctAnswer: 'TRUE', hint: 'Câu nhận định giống hệt đoạn văn.' },
  { prompt: 'Đọc đoạn văn và chọn đáp án đúng.', passage: 'We study English on Mondays and Wednesdays.', statement: 'We study English on Mondays.', correctAnswer: 'TRUE', hint: 'Thứ Hai nằm trong những ngày được nêu.' },
  { prompt: 'Đọc đoạn văn và chọn đáp án đúng.', passage: 'He drinks water after lunch.', statement: 'He drinks juice after lunch.', correctAnswer: 'FALSE', hint: 'Đoạn văn nói nước (water), không phải nước trái cây.' },
  { prompt: 'Đọc đoạn văn và chọn đáp án đúng.', passage: 'Lily reads books every night.', statement: 'Lily reads books every morning.', correctAnswer: 'FALSE', hint: 'Đoạn văn nói mỗi tối, không phải mỗi sáng.' },
  { prompt: 'Đọc đoạn văn và chọn đáp án đúng.', passage: 'My brother is tall.', statement: 'My brother likes basketball.', correctAnswer: 'NOT_GIVEN', hint: 'Không có thông tin về sở thích bóng rổ.' },
  { prompt: 'Đọc đoạn văn và chọn đáp án đúng.', passage: 'The children sing and dance at school.', statement: 'The children sing at school.', correctAnswer: 'TRUE', hint: 'Hát (sing) được nhắc đến trong đoạn văn.' },
];

/* ---------------- Build payload theo từng loại ---------------- */
function buildQuestions(type: QuestionType, rows: any[]) {
  return rows.map((row, i) => {
    let payload: any;
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        payload = { options: row.options, hint: row.hint };
        break;
      case QuestionType.FILL_BLANK:
        payload = { sentence: row.sentence, hint: row.hint };
        break;
      case QuestionType.MATCHING:
        payload = { left: row.left, right: row.right, hint: row.hint };
        break;
      case QuestionType.CLOZE:
        payload = { segments: row.segments, bank: row.bank, hint: row.hint };
        break;
      case QuestionType.TRUE_FALSE_NOT_GIVEN:
        payload = { passage: row.passage, statement: row.statement, hint: row.hint };
        break;
    }
    return {
      type,
      prompt: row.prompt,
      payload,
      correctAnswer: row.correctAnswer,
      order: i + 1,
    };
  });
}

const LEVELS = [
  { order: 1, name: 'Trắc Nghiệm', type: QuestionType.MULTIPLE_CHOICE, questions: buildQuestions(QuestionType.MULTIPLE_CHOICE, L1) },
  { order: 2, name: 'Điền Từ', type: QuestionType.FILL_BLANK, questions: buildQuestions(QuestionType.FILL_BLANK, L2) },
  { order: 3, name: 'Nối Câu', type: QuestionType.MATCHING, questions: buildQuestions(QuestionType.MATCHING, L3) },
  { order: 4, name: 'Điền Đoạn Văn', type: QuestionType.CLOZE, questions: buildQuestions(QuestionType.CLOZE, L4) },
  { order: 5, name: 'Đúng / Sai / Không Đề Cập', type: QuestionType.TRUE_FALSE_NOT_GIVEN, questions: buildQuestions(QuestionType.TRUE_FALSE_NOT_GIVEN, L5) },
];

async function main() {
  // ---- Admin seed (giữ nguyên) ----
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping admin seed.');
  } else {
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await prisma.user.create({
        data: { email: adminEmail, passwordHash, role: Role.ADMIN },
      });
      console.log('Admin user created:', adminEmail);
    } else {
      console.log('Admin user already exists. Skipping admin seed.');
    }
  }

  // ---- Tense Present Simple (giữ nguyên) ----
  let tense = await prisma.tense.findUnique({ where: { code: 'PRESENT_SIMPLE' } });
  if (!tense) {
    tense = await prisma.tense.create({
      data: { code: 'PRESENT_SIMPLE', name: 'Present Simple', order: 1 },
    });
    console.log('Tense created:', tense.name);
  } else {
    console.log('Tense already exists:', tense.name);
  }

  // ---- 5 Level × 10 câu ----
  for (const def of LEVELS) {
    let level = await prisma.level.findFirst({
      where: { tenseId: tense.id, order: def.order },
    });

    if (level) {
      // Đã có → cập nhật tên dạng bài (Vấn đề 2)
      level = await prisma.level.update({
        where: { id: level.id },
        data: { name: def.name },
      });
    } else {
      level = await prisma.level.create({
        data: {
          tenseId: tense.id,
          order: def.order,
          name: def.name,
          passScore: 70,
          coinReward: 50,
        },
      });
      console.log(`Level ${def.order} created:`, def.name);
    }

    // Xoá câu cũ, tạo lại 10 câu (áp dụng hint + contract mới + đủ số lượng)
    await prisma.question.deleteMany({ where: { levelId: level.id } });
    for (const q of def.questions) {
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
    console.log(`Level ${def.order} "${def.name}": seeded ${def.questions.length} questions`);
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
