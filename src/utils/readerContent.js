// ========================================
// READER CONTENT GENERATOR
// AI-style content generation for books
// ========================================

// Genre-specific content templates
const genreContent = {
  thriller: {
    openings: [
      "The night was darker than usual when the first body was discovered.",
      "She knew she was being watched. The feeling had started three days ago.",
      "The letter arrived on a Tuesday, postmarked from a town that no longer existed.",
      "In twenty years of detective work, he had never seen anything like this.",
    ],
    middles: [
      "Every clue led to another dead end, but the pattern was emerging.",
      "Trust no one—the words echoed in her mind as she reviewed the evidence.",
      "The suspect's alibi was perfect. Too perfect.",
      "Time was running out, and the killer knew they were getting close.",
      "The photograph revealed more than anyone expected.",
      "Behind the facade of normalcy lurked something sinister.",
    ],
    endings: [
      "The truth, when it finally emerged, changed everything they thought they knew.",
      "Justice would be served, but at what cost?",
      "Some secrets, once revealed, can never be buried again.",
    ],
  },
  "self-help": {
    openings: [
      "The journey of a thousand miles begins with a single step—and the courage to take it.",
      "What if everything you believed about success was holding you back?",
      "The most powerful changes start with the smallest decisions.",
      "Your potential is not defined by your past, but by the choices you make today.",
    ],
    middles: [
      "Research shows that consistency trumps intensity every single time.",
      "The compound effect of daily habits creates extraordinary results over time.",
      "When we change our perspective, we change our possibilities.",
      "True growth happens outside our comfort zone, in the space between who we are and who we could become.",
      "Success leaves clues. The patterns of high achievers reveal universal principles.",
      "Your environment shapes your behavior more than willpower ever could.",
    ],
    endings: [
      "The time for change is not tomorrow—it's now. What will you do differently today?",
      "Remember: you have within you everything you need to create the life you desire.",
      "Your story is still being written. Make it one worth reading.",
    ],
  },
  fiction: {
    openings: [
      "In a world where dreams held more truth than reality, Santiago began his journey.",
      "The old man sat by the window, watching clouds form shapes of memories long forgotten.",
      "She had always believed in magic, even when the world told her otherwise.",
      "The map was old, its edges worn by countless hands seeking the same destination.",
    ],
    middles: [
      "Along the way, he met travelers whose stories intertwined with his own.",
      "The universe, it seemed, had been waiting for this moment all along.",
      "What appears as coincidence is often destiny wearing a clever disguise.",
      "In the space between dreams and waking, truth reveals itself.",
      "Every person we meet carries a lesson we need to learn.",
      "The journey itself transforms us more than any destination ever could.",
    ],
    endings: [
      "And so the story continues, for all stories are connected in the end.",
      "Home, he realized, was not a place but a feeling he carried within.",
      "The treasure was never lost—it was simply waiting to be recognized.",
    ],
  },
  finance: {
    openings: [
      "The rich don't work for money—they make money work for them.",
      "Financial freedom begins with a simple truth: it's not about how much you earn.",
      "The greatest investment you'll ever make is the one you make in yourself.",
      "Most people spend their lives climbing a ladder that's leaning against the wrong wall.",
    ],
    middles: [
      "Assets put money in your pocket. Liabilities take money out. Know the difference.",
      "The wealthy understand that cash flow is more important than capital.",
      "Financial literacy is not taught in schools—yet it determines life outcomes.",
      "Every dollar is a seed. Plant it wisely, and watch your garden grow.",
      "The poor work for money. The middle class work for appreciation. The wealthy work for cash flow.",
      "Risk is not in the investment—it's in the investor's lack of knowledge.",
    ],
    endings: [
      "The choice is yours: trade time for money, or build systems that generate wealth.",
      "Financial freedom is not a destination but a journey of continuous learning.",
      "Your financial future is determined by the decisions you make today.",
    ],
  },
};

// Default content for genres not specifically defined
const defaultContent = {
  openings: [
    "Every story begins somewhere, and this one starts with a question.",
    "The world was about to change, though no one knew it yet.",
    "In the quiet moments before dawn, everything seemed possible.",
  ],
  middles: [
    "The path forward was neither straight nor simple.",
    "What seemed impossible yesterday became today's reality.",
    "Between intention and action lies the space where character is forged.",
    "Time passed, and with it came understanding.",
    "The connections between events revealed themselves slowly.",
  ],
  endings: [
    "And so the chapter closes, but the story continues.",
    "In the end, we find what we were always searching for.",
    "The journey transforms us more than the destination.",
  ],
};

// Generate a preview for locked books (first 2-3 paragraphs)
export function generatePreview(book) {
  const content = genreContent[book.genre] || defaultContent;
  const opening = content.openings[Math.floor(book.id % content.openings.length)];
  
  return [
    {
      chapter: "Preview",
      text: `Welcome to "${book.title}". This ${book.genre} masterpiece takes you on an unforgettable journey. Here's a glimpse of what awaits you...`,
    },
    {
      chapter: "Chapter 1",
      text: opening,
    },
    {
      chapter: "",
      text: `This preview of "${book.title}" ends here. Unlock the full book to continue reading and discover the complete story that awaits you.`,
    },
  ];
}

// Generate full content for unlocked books (multiple pages)
export function generateFullContent(book) {
  const content = genreContent[book.genre] || defaultContent;
  const pages = [];
  
  // Title page
  pages.push({
    chapter: book.title,
    isTitle: true,
    text: `A ${book.genre.charAt(0).toUpperCase() + book.genre.slice(1)} Experience\n\nPrepare yourself for a journey through the pages of "${book.title}". What lies ahead will challenge your perceptions and expand your understanding.`,
  });

  // Chapter 1 - Opening
  const openingIndex = book.id % content.openings.length;
  pages.push({
    chapter: "Chapter 1: The Beginning",
    text: content.openings[openingIndex] + "\n\n" + getExpandedParagraph(book, "opening"),
  });

  // Additional opening pages
  pages.push({
    chapter: "Chapter 1: The Beginning",
    text: getExpandedParagraph(book, "early") + "\n\n" + getContextualParagraph(book, 1),
  });

  // Chapter 2 - Development
  pages.push({
    chapter: "Chapter 2: Unfolding",
    text: content.middles[0] + "\n\n" + getExpandedParagraph(book, "development"),
  });

  pages.push({
    chapter: "Chapter 2: Unfolding",
    text: content.middles[1] + "\n\n" + getContextualParagraph(book, 2),
  });

  // Chapter 3 - Rising Action
  pages.push({
    chapter: "Chapter 3: The Journey",
    text: content.middles[2] + "\n\n" + getExpandedParagraph(book, "journey"),
  });

  pages.push({
    chapter: "Chapter 3: The Journey",
    text: content.middles[3 % content.middles.length] + "\n\n" + getContextualParagraph(book, 3),
  });

  // Chapter 4 - Climax building
  pages.push({
    chapter: "Chapter 4: Revelation",
    text: content.middles[4 % content.middles.length] + "\n\n" + getExpandedParagraph(book, "revelation"),
  });

  pages.push({
    chapter: "Chapter 4: Revelation",
    text: content.middles[5 % content.middles.length] + "\n\n" + getContextualParagraph(book, 4),
  });

  // Chapter 5 - Resolution
  pages.push({
    chapter: "Chapter 5: Resolution",
    text: content.endings[book.id % content.endings.length] + "\n\n" + getExpandedParagraph(book, "resolution"),
  });

  // Final page
  pages.push({
    chapter: "The End",
    isEnding: true,
    text: `Thank you for reading "${book.title}".\n\nThis ${book.genre} journey has come to an end, but the insights and experiences within these pages stay with you. May what you've discovered here inspire and guide you.\n\n— The End —`,
  });

  return pages;
}

// Helper function to generate expanded paragraphs based on context
function getExpandedParagraph(book, context) {
  const expansions = {
    thriller: {
      opening: "The investigation had only just begun, but already the shadows seemed to hold more questions than answers. Every lead pointed somewhere unexpected, somewhere dangerous.",
      early: "Evidence collected at the scene told a story—but was it the true story? The detective knew from experience that the obvious explanation was rarely the correct one.",
      development: "As the pieces fell into place, a disturbing pattern emerged. This wasn't random. This was calculated, methodical, and deeply personal.",
      journey: "The trail led through forgotten archives and abandoned places, each discovery raising the stakes higher than before.",
      revelation: "The moment of clarity came like lightning—sudden, illuminating, and impossible to ignore. Everything they thought they knew was wrong.",
      resolution: "Justice takes many forms. Sometimes it's swift, sometimes it's patient, but it always finds a way.",
    },
    "self-help": {
      opening: "The first step toward transformation is awareness. Once you see the patterns that have been holding you back, you can begin to change them.",
      early: "Small changes create ripple effects. A single decision made today can alter the trajectory of your entire life.",
      development: "The science is clear: lasting change requires both mindset shifts and practical systems. One without the other leads to frustration.",
      journey: "Along the path of growth, you'll encounter resistance—both from within and without. This resistance is not your enemy; it's your teacher.",
      revelation: "The breakthrough moment comes when you realize that you've had the power all along. It was simply waiting to be recognized and applied.",
      resolution: "Growth is not a destination but a continuous journey. Each day offers new opportunities to become more fully yourself.",
    },
    fiction: {
      opening: "The world stretched out before them, full of possibility and mystery. Every path led somewhere new, somewhere that held the promise of adventure.",
      early: "In the quieter moments, truth whispered its secrets to those patient enough to listen.",
      development: "The journey revealed that maps and guides could only take you so far. The most important discoveries came from within.",
      journey: "Fellow travelers appeared when least expected, each carrying wisdom hard-earned from their own adventures.",
      revelation: "The treasure, when finally found, was not what anyone expected. It was something far more valuable than gold or jewels.",
      resolution: "Home, they discovered, was never a place you could return to. It was something you carried with you, built from experiences and connections.",
    },
    finance: {
      opening: "The first lesson of wealth is simple: understand the difference between what makes you feel rich and what actually builds wealth.",
      early: "Most financial problems stem not from lack of income but from lack of understanding. Knowledge is the true currency of the wealthy.",
      development: "The wealthy play a different game with different rules. Understanding these rules is the first step toward joining them.",
      journey: "Building wealth is a marathon, not a sprint. Patience and consistency outperform excitement and timing every single time.",
      revelation: "The moment financial literacy transforms into financial freedom is when passive income exceeds your expenses. This is the true measure of wealth.",
      resolution: "Your financial legacy is not measured in dollars but in the wisdom you pass on and the freedom you create for those you love.",
    },
  };

  const genreExpansions = expansions[book.genre] || expansions.fiction;
  return genreExpansions[context] || genreExpansions.opening;
}

// Helper function to generate contextual paragraphs
function getContextualParagraph(book, pageNum) {
  const contextuals = {
    thriller: [
      "The night deepened, and with it came revelations that would shake the foundation of everything they believed.",
      "Trust became a luxury they could no longer afford. In this game, everyone was suspect.",
      "The clock was ticking. Somewhere out there, the next move was already being planned.",
      "In the world of shadows and secrets, truth was the most dangerous weapon of all.",
    ],
    "self-help": [
      "Consider this: every expert was once a beginner. Every master started with a single step.",
      "The question isn't whether you can change—it's whether you're willing to do what change requires.",
      "Your beliefs shape your reality. Change your beliefs, and you change your world.",
      "Success leaves patterns. Study them, understand them, and apply them to your own journey.",
    ],
    fiction: [
      "The world held its breath, waiting for what would come next. Some moments change everything.",
      "In the tapestry of existence, every thread connects to countless others. Pull one, and the whole pattern shifts.",
      "Magic, they learned, wasn't about spells and potions. It was about seeing what others overlooked.",
      "The story wove itself through time and space, connecting hearts across impossible distances.",
    ],
    finance: [
      "Remember: the rich buy assets, the poor buy liabilities, and the middle class buys liabilities thinking they're assets.",
      "Financial intelligence isn't about numbers—it's about understanding how money flows and how to direct that flow.",
      "The greatest investors share one trait: they see opportunities where others see only obstacles.",
      "Your net worth is not your self-worth, but understanding money frees you to pursue what truly matters.",
    ],
  };

  const genreContextuals = contextuals[book.genre] || contextuals.fiction;
  return genreContextuals[pageNum % genreContextuals.length];
}

// Get total page count
export function getTotalPages(book, isUnlocked) {
  if (!isUnlocked) {
    return generatePreview(book).length;
  }
  return generateFullContent(book).length;
}

// Get content for a specific page
export function getPageContent(book, pageIndex, isUnlocked) {
  const content = isUnlocked ? generateFullContent(book) : generatePreview(book);
  return content[pageIndex] || null;
}
