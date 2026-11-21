// Shared between the live preview (browser) and the PDF generator (server).

export type Kid = {
  name: string;
  age: string;
  deed: string; // past tense, e.g. "helped Grandma rake the leaves"
  goal: string; // optional, e.g. "sharing your toys with Leo"
  wish: string; // e.g. "a red bike with a bell"
  pet: string; // optional pet name
  city: string; // e.g. "Austin, Texas"
};

export const MAX_KIDS = 4;

export const LIMITS: Record<keyof Kid, number> = {
  name: 24,
  age: 2,
  deed: 110,
  goal: 80,
  wish: 70,
  pet: 20,
  city: 40,
};

export const emptyKid = (): Kid => ({
  name: "",
  age: "",
  deed: "",
  goal: "",
  wish: "",
  pet: "",
  city: "",
});

export const SAMPLE_KID: Kid = {
  name: "Emma",
  age: "6",
  deed: "helped your little brother Leo learn to tie his shoes",
  goal: "eating your vegetables without a fuss",
  wish: "a sparkly purple bike with a bell",
  pet: "Biscuit",
  city: "Austin, Texas",
};

// Keep Latin script characters the bundled fonts can draw; drop anything else.
function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7E -ÿ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function sanitizeKid(raw: unknown): Kid {
  const r = (raw ?? {}) as Record<string, unknown>;
  const kid = emptyKid();
  (Object.keys(LIMITS) as (keyof Kid)[]).forEach((k) => {
    kid[k] = clean(r[k], LIMITS[k]);
  });
  kid.age = kid.age.replace(/\D/g, "");
  // Strip trailing punctuation so templates control sentence endings.
  kid.deed = kid.deed.replace(/[.!?]+$/, "");
  kid.goal = kid.goal.replace(/[.!?]+$/, "");
  kid.wish = kid.wish.replace(/[.!?]+$/, "");
  return kid;
}

export function validateKids(raw: unknown): { kids: Kid[]; error?: string } {
  if (!Array.isArray(raw) || raw.length === 0) return { kids: [], error: "Add at least one child." };
  if (raw.length > MAX_KIDS) return { kids: [], error: `Up to ${MAX_KIDS} children per order.` };
  const kids = raw.map(sanitizeKid);
  for (const [i, k] of kids.entries()) {
    const who = kids.length > 1 ? `Child ${i + 1}: ` : "";
    if (!k.name) return { kids, error: `${who}please add a first name.` };
    if (!k.deed) return { kids, error: `${who}please add one good thing they did this year.` };
    if (!k.wish) return { kids, error: `${who}please add what they are wishing for.` };
  }
  return { kids };
}

const lowerFirst = (s: string) => (s ? s[0].toLowerCase() + s.slice(1) : s);

export type LetterContent = {
  greeting: string;
  paragraphs: string[];
  closing: string;
  ps: string;
};

// Three variants so siblings never get identical letters.
export function buildLetter(kid: Kid, variant = 0): LetterContent {
  const name = kid.name || "Little One";
  const deed = lowerFirst(kid.deed) || "were kind to the people around you";
  const wish = lowerFirst(kid.wish) || "something very special";
  const city = kid.city || "your town";
  const age = kid.age ? Number(kid.age) : 0;
  const v = ((variant % 3) + 3) % 3;

  const opener = [
    "Ho ho ho! Greetings from the North Pole, where the snow is deep, the cocoa is hot, and the workshop is busier than I have ever seen it.",
    "The elves just delivered this year's reports to my desk, and I wanted to write to you myself before the big night.",
    "It is a snowy evening here at the North Pole. The reindeer are tucked into their stable and I finally have a quiet moment to write to you.",
  ][v];

  const praise = [
    `Mrs. Claus and I have been reading the reports from my Scout Elves, and one story made us both smile. I heard that you ${deed}. That was a truly kind thing to do, and it made my heart as warm as a mug of cocoa.`,
    `My elves tell me everything, you know. And this year they told me that you ${deed}. When I read that, I let out such a big "Ho ho ho!" that the elves dropped their hammers. I am very proud of you.`,
    `I have a big book of good deeds, and your page has something wonderful written on it: you ${deed}. Kindness like that is the real magic of Christmas, and you have plenty of it.`,
  ][v];

  const growing = age
    ? [
        `I see you are ${age} years old now. My, how you have grown!`,
        `${age} years old already! The elves had to check twice.`,
        `Being ${age} is a very good age for big adventures.`,
      ][v]
    : "";

  const goalLine = kid.goal
    ? [
        `I also know you have been working on ${lowerFirst(kid.goal)}. Keep at it, ${name}. I believe in you!`,
        `The elves noticed you are practicing ${lowerFirst(kid.goal)}. That takes courage, and every little try counts.`,
        `One more thing: keep working on ${lowerFirst(kid.goal)}. Even Rudolph had to practice before he could lead the sleigh.`,
      ][v]
    : "";

  const petLine = kid.pet
    ? [
        `Please give ${kid.pet} a scratch behind the ears from me.`,
        `Tell ${kid.pet} that the reindeer say hello.`,
        `Dasher asked me to say hello to ${kid.pet}.`,
      ][v]
    : "";

  const wishLine = [
    `You asked for ${wish}. The elves have written it down in the big book, and Rudolph has already practiced the route to ${city}.`,
    `I have your wish right here on my list: ${wish}. The elves are working on it, and the sleigh has a special spot saved for ${city}.`,
    `Your wish for ${wish} has been delivered to the workshop. I will be flying over ${city} on Christmas Eve, so keep an eye on the sky.`,
  ][v];

  const bedtime = [
    "Remember to go to sleep early on Christmas Eve. I can only visit once everyone is dreaming!",
    "Be sure to leave a cookie or two out for me. Flying around the world is hungry work!",
    "Keep being the wonderful kid you are, and get to bed early on Christmas Eve.",
  ][v];

  const ps = [
    `P.S. ${name}, you are officially on the Nice List. I checked it twice!`,
    `P.S. Rudolph says his favorite snack is carrots. Just in case you were wondering.`,
    `P.S. Your name is on page 1,224 of the Nice List. I underlined it.`,
  ][v];

  const middle = [growing, goalLine, petLine].filter(Boolean).join(" ");

  return {
    greeting: `Dear ${name},`,
    paragraphs: [opener, praise, middle, wishLine, bedtime].filter(Boolean),
    closing: "With love and lots of snow,",
    ps,
  };
}

// Neighbours on the Nice List page.
export const NICE_LIST_NAMES = [
  "Olivia R.", "Liam T.", "Ava M.", "Noah K.", "Sofia L.", "Mateo G.", "Isla P.",
  "Lucas B.", "Mia W.", "Aria D.", "Ethan C.", "Chloe S.", "Henry F.", "Zoe H.",
  "Leo N.", "Grace O.", "Jack V.", "Nora J.", "Owen E.", "Ruby A.", "Elijah Q.",
  "Lily Y.", "Milo Z.", "Hazel I.", "Theo U.", "Ivy X.",
];

export function christmasYear(now = new Date()): number {
  // After Christmas, letters are for next year.
  return now.getMonth() === 11 && now.getDate() > 25 ? now.getFullYear() + 1 : now.getFullYear();
}
