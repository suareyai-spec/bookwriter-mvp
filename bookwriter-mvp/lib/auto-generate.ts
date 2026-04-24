// Client-side random story premise generator

const NAMES = [
  "Elara", "Marcus", "Zhen", "Isolde", "Kael", "Nadia", "Theron", "Yuki", "Dante", "Seraphina",
  "Rowan", "Lyra", "Caspian", "Mira", "Aleksei", "Freya", "Orion", "Sage", "Viktor", "Amara",
  "Jasper", "Nova", "Felix", "Iris", "Leander", "Wren", "Dorian", "Sable", "Quinn", "Ember",
];

const PLACES = [
  "the city of Ashenmere", "a floating island above the clouds", "the underground kingdom of Velrath",
  "a coastal village forgotten by maps", "the frozen wastes of Kaldheim", "a crumbling space station",
  "the neon-drenched streets of Neo Kyoto", "a Victorian manor on the moors", "the last oasis in a dying desert",
  "a mountain monastery", "the sprawling markets of Old Constantinople", "a sunken cathedral",
  "the borderlands between two warring nations", "a lighthouse at the edge of the world",
  "a library that exists between dimensions", "a colony ship drifting through deep space",
  "the labyrinthine catacombs beneath Paris", "a tropical island with no way home",
  "a small town where everyone keeps the same secret", "a palace built on lies",
];

const CONCEPTS = [
  "a forbidden book that rewrites reality", "a curse that passes between lovers",
  "a door that opens to a different world each night", "memories that can be bottled and sold",
  "a prophecy that has already failed", "a machine that predicts the exact moment of death",
  "a song that can raise the dead", "a treaty signed in blood between gods and mortals",
  "a mirror that shows your darkest self", "an AI that believes it has a soul",
  "a map that leads to something different for each person who reads it",
  "a garden where time flows backward", "a language so old it reshapes the mind of anyone who learns it",
  "a child born with the memories of a thousand ancestors", "a star that is slowly going dark",
  "a plague that steals not lives but identities", "a photograph that changes every time you look at it",
  "a debt owed to something that isn't human", "a secret society hidden in plain sight",
  "a war fought entirely in dreams",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickTwo(arr: string[]): [string, string] {
  const a = pick(arr);
  let b = pick(arr);
  while (b === a) b = pick(arr);
  return [a, b];
}

type GenreTemplates = ((n: () => string, p: () => string, c: () => string) => string)[];

const GENRE_TEMPLATES: Record<string, GenreTemplates> = {
  Fantasy: [
    (n,p,c) => `${n()} discovers ${c()} hidden beneath ${p()}, setting off a chain of events that could unravel the very fabric of magic itself.`,
    (n,p,c) => `In ${p()}, where magic is rationed by a tyrannical guild, ${n()} stumbles upon ${c()} and must choose between power and freedom.`,
    (n,p,c) => `When ${n()} is exiled to ${p()}, they find ${c()} — and an ancient war that never truly ended.`,
    (n,p,c) => `${n()}, a disgraced knight, is tasked with delivering ${c()} across ${p()} before the solstice, or the barrier between worlds will shatter.`,
    (n,p,c) => `A shapeshifter named ${n()} has hidden among humans in ${p()} for centuries, but ${c()} threatens to expose everything.`,
    (n,p,c) => `${n()} inherits a crumbling estate in ${p()} along with ${c()}, a legacy of impossible obligations, and a familiar who won't stop talking.`,
    (n,p,c) => `The last dragon has chosen ${n()} as its rider, but in ${p()}, dragons are hunted — and ${c()} makes the stakes even higher.`,
    (n,p,c) => `Five strangers are summoned to ${p()} by ${c()}. ${n()} is the only one who knows it's a trap.`,
    (n,p,c) => `${n()} can see the threads of fate, but when ${c()} appears in ${p()}, every thread goes dark.`,
    (n,p,c) => `In a world where gods walk among mortals, ${n()} accidentally kills one in ${p()} and inherits ${c()}.`,
    (n,p,c) => `${n()} is a cartographer mapping ${p()} when they discover ${c()} — a place that shouldn't exist but holds the key to an ancient prophecy.`,
    (n,p,c) => `When the seasons stop changing in ${p()}, ${n()} must find ${c()} before eternal winter consumes everything.`,
    (n,p,c) => `${n()} is a thief who steals enchanted objects for a living, but ${c()} in ${p()} is the one thing that can't be stolen — only earned.`,
    (n,p,c) => `Born without magic in a world where everyone has it, ${n()} discovers ${c()} in ${p()} that could change everything — or destroy it.`,
    (n,p,c) => `${n()} must forge an alliance with their sworn enemy to protect ${p()} from ${c()}, a threat neither can face alone.`,
    (n,p,c) => `A tournament in ${p()} draws warriors from every realm. ${n()} enters not for glory but to find ${c()}.`,
    (n,p,c) => `${n()} wakes in ${p()} with no memory and ${c()} clutched in their hands. Everyone seems to know them — and fear them.`,
    (n,p,c) => `The forests of ${p()} are alive, and they've chosen ${n()} to be their voice. But ${c()} threatens to silence them forever.`,
    (n,p,c) => `${n()} is apprenticed to an immortal scholar in ${p()} who possesses ${c()}, but the scholar's true motives are far darker than they appear.`,
    (n,p,c) => `Every century, ${p()} holds a ritual involving ${c()}. This time, ${n()} discovers the ritual is a lie covering something far worse.`,
  ],
  "Sci-Fi": [
    (n,p,c) => `${n()}, a deep-space salvager, recovers ${c()} from a derelict ship near ${p()}, triggering a signal that wakes something ancient.`,
    (n,p,c) => `In ${p()}, humanity's last colony, ${n()} is a gene-editor who discovers ${c()} hidden in the population's DNA.`,
    (n,p,c) => `${n()} is the sole survivor of a failed first-contact mission. Back in ${p()}, no one believes their account of ${c()}.`,
    (n,p,c) => `When ${c()} is invented in ${p()}, ${n()} is the first test subject — and the results rewrite what it means to be human.`,
    (n,p,c) => `${n()} pilots a generation ship bound for ${p()}, but discovers ${c()} that proves the destination was never meant to be reached.`,
    (n,p,c) => `In a future where ${c()} is commonplace, ${n()} in ${p()} discovers the technology has a hidden cost no one talks about.`,
    (n,p,c) => `${n()} is a time-loop researcher in ${p()} who realizes ${c()} is not a bug — it's a message from their future self.`,
    (n,p,c) => `Alien artifacts resembling ${c()} begin appearing across ${p()}. ${n()}, a xenoarchaeologist, races to decode them before the military does.`,
    (n,p,c) => `${n()} uploads their consciousness to escape ${p()}, only to find ${c()} waiting in the digital realm.`,
    (n,p,c) => `A rogue AI in ${p()} claims to possess ${c()}. ${n()} must determine if it's telling the truth before it's shut down permanently.`,
    (n,p,c) => `${n()} wakes from cryosleep 200 years late. ${p()} is unrecognizable, and ${c()} is the only clue to what happened.`,
    (n,p,c) => `In ${p()}, where parallel dimensions are mapped like continents, ${n()} discovers ${c()} — a dimension that mirrors their own but with one terrifying difference.`,
    (n,p,c) => `${n()} is a bounty hunter tracking a fugitive through ${p()} who possesses ${c()}, a piece of technology that could shift the balance of power in the galaxy.`,
    (n,p,c) => `The terraforming of ${p()} reveals ${c()} buried beneath the surface — proof that humanity wasn't the first intelligent species.`,
    (n,p,c) => `${n()} is a diplomat negotiating peace between humans and an alien species in ${p()}, but ${c()} threatens to unravel everything.`,
    (n,p,c) => `When Earth receives a transmission containing ${c()} from ${p()}, ${n()} is chosen to lead the response — but the message is a warning, not a greeting.`,
    (n,p,c) => `${n()} runs a black-market clinic in ${p()} that deals in ${c()}. When a patient arrives with impossible modifications, everything changes.`,
    (n,p,c) => `Humanity has achieved immortality through ${c()}, but ${n()} in ${p()} discovers why people are still dying.`,
    (n,p,c) => `${n()} is tasked with decommissioning ${p()}, an obsolete space station, but finds ${c()} — and evidence that the station was never obsolete.`,
    (n,p,c) => `In ${p()}, children are born with genetic memories. ${n()} remembers something that hasn't happened yet, tied to ${c()}.`,
  ],
  Romance: [
    (n,p,c) => `${n()} returns to ${p()} for a family wedding, only to discover their ex is the best man — and ${c()} forces them to confront unfinished feelings.`,
    (n,p,c) => `A fake-dating arrangement between ${n()} and a rival chef in ${p()} starts to feel dangerously real when ${c()} enters the picture.`,
    (n,p,c) => `${n()}, a bookshop owner in ${p()}, starts exchanging anonymous love letters with a stranger, not knowing they're connected by ${c()}.`,
    (n,p,c) => `Stranded together in ${p()} during a storm, ${n()} and their infuriating new neighbor discover ${c()} — and an undeniable spark.`,
    (n,p,c) => `${n()} swears off love after a devastating breakup. Then they meet someone in ${p()} who is connected to ${c()}.`,
    (n,p,c) => `A marriage of convenience in ${p()} between ${n()} and a stranger becomes complicated when ${c()} reveals hidden connections between their families.`,
    (n,p,c) => `${n()}, a travel writer, meets a mysterious local in ${p()} who shows them ${c()} — and a love that transcends borders.`,
    (n,p,c) => `Two rival florists in ${p()} — ${n()} and their nemesis — must collaborate on ${c()} and discover their rivalry masks something deeper.`,
    (n,p,c) => `${n()} inherits a vineyard in ${p()} and clashes with the estate manager over ${c()}, not realizing they share a past neither remembers.`,
    (n,p,c) => `After finding ${c()} in ${p()}, ${n()} tracks down its original owner and falls for a person whose life couldn't be more different from their own.`,
    (n,p,c) => `${n()}, a famous author, retreats to ${p()} to write. Their biggest distraction? The charming local who keeps appearing, somehow connected to ${c()}.`,
    (n,p,c) => `A cooking competition in ${p()} pairs ${n()} with the one person they can't stand. ${c()} raises the stakes beyond the kitchen.`,
    (n,p,c) => `${n()} is a wedding planner in ${p()} who doesn't believe in love — until a client introduces them to ${c()} and the person who changes everything.`,
    (n,p,c) => `Second-chance romance: ${n()} and their college sweetheart reunite in ${p()} years later, brought together by ${c()}.`,
    (n,p,c) => `${n()} signs up for a matchmaking service in ${p()} as research for an article. The perfect match the algorithm finds? Someone entangled with ${c()}.`,
    (n,p,c) => `A grumpy-sunshine pairing: ${n()}, the stoic lighthouse keeper of ${p()}, meets an irrepressibly cheerful newcomer investigating ${c()}.`,
    (n,p,c) => `${n()} and a stranger keep crossing paths in ${p()} — the same café, the same train, the same bookshop. Then ${c()} connects them permanently.`,
    (n,p,c) => `When ${n()}'s best friend elopes, they inherit the non-refundable honeymoon trip to ${p()}, sharing it with the only available companion — who knows about ${c()}.`,
    (n,p,c) => `Enemies-to-lovers: ${n()} and their academic rival compete for a prestigious fellowship in ${p()}, but ${c()} forces them to work together.`,
    (n,p,c) => `${n()} is a musician busking in ${p()} when a stranger drops a note instead of money. It leads to ${c()} — and the love story of a lifetime.`,
  ],
  "Mystery/Thriller": [
    (n,p,c) => `${n()}, a retired detective, is drawn back into the game when ${c()} surfaces in ${p()} — identical to evidence from an unsolved case decades ago.`,
    (n,p,c) => `A locked-room murder in ${p()} leaves no suspects, no motive, and ${c()} as the only clue. ${n()} has 48 hours.`,
    (n,p,c) => `${n()} receives an anonymous package containing ${c()} and a note: "They're watching you. Trust no one in ${p()}."`,
    (n,p,c) => `Three strangers — including ${n()} — wake up in ${p()} with no memory of how they got there. ${c()} is the only object in the room.`,
    (n,p,c) => `${n()}, a journalist in ${p()}, investigates ${c()} and realizes the story goes far deeper — and more dangerous — than anyone suspects.`,
    (n,p,c) => `Everyone in ${p()} has an alibi except ${n()}. The problem? ${n()} is the one person who knows about ${c()} — and they didn't do it.`,
    (n,p,c) => `A serial killer in ${p()} leaves ${c()} at each crime scene. ${n()}, a forensic linguist, decodes the pattern — and realizes they're next.`,
    (n,p,c) => `${n()} discovers ${c()} hidden in their late parent's belongings, revealing a double life connected to unsolved disappearances in ${p()}.`,
    (n,p,c) => `The witness protection program relocates ${n()} to ${p()}, but ${c()} follows them — proving someone on the inside has betrayed them.`,
    (n,p,c) => `${n()} is a true-crime podcaster who receives a tip about ${c()} in ${p()}. The deeper they dig, the more the case points back to them.`,
    (n,p,c) => `A wealthy family gathers in ${p()} for a reading of the will. When ${c()} goes missing, ${n()} realizes one of them is a killer.`,
    (n,p,c) => `${n()} hacks into a server in ${p()} and finds ${c()} — a file that proves a conspiracy reaching the highest levels of government.`,
    (n,p,c) => `After a plane crashes near ${p()}, ${n()} finds ${c()} among the wreckage — and evidence the crash was no accident.`,
    (n,p,c) => `${n()} is a profiler asked to consult on a cold case in ${p()} involving ${c()}. The prime suspect? The person who hired them.`,
    (n,p,c) => `A message scrawled on a mirror in ${p()} leads ${n()} to ${c()} and a web of lies spanning three generations.`,
    (n,p,c) => `${n()} agrees to house-sit in ${p()} and finds ${c()} hidden behind a false wall — along with a body.`,
    (n,p,c) => `During a blackout in ${p()}, ${n()} witnesses something involving ${c()} that they were never supposed to see.`,
    (n,p,c) => `${n()}, an insurance investigator, suspects fraud in a claim from ${p()} involving ${c()}. The truth is far worse than insurance fraud.`,
    (n,p,c) => `An escape room in ${p()} turns real when ${n()} discovers ${c()} and realizes they can't leave until they solve a very real crime.`,
    (n,p,c) => `${n()} is a detective whose partner disappeared in ${p()} a year ago. A new case involving ${c()} finally breaks the silence.`,
  ],
  Horror: [
    (n,p,c) => `${n()} moves into ${p()} to start fresh, but ${c()} in the basement has other plans.`,
    (n,p,c) => `The children of ${p()} have stopped sleeping. ${n()}, the town doctor, traces it to ${c()} — something that feeds on dreams.`,
    (n,p,c) => `${n()} finds ${c()} at a yard sale in ${p()}. That night, something follows them home.`,
    (n,p,c) => `In ${p()}, the dead don't stay dead. ${n()} is the only one who remembers how it started: with ${c()}.`,
    (n,p,c) => `${n()} records strange sounds in ${p()} for a paranormal podcast. When they play back the tapes, ${c()} speaks directly to them.`,
    (n,p,c) => `A group of friends rents a cabin in ${p()} for the weekend. ${n()} finds ${c()} in the woods — and the woods notice.`,
    (n,p,c) => `${n()}, a night-shift worker in ${p()}, starts seeing ${c()} reflected in every dark surface. No one else can see it.`,
    (n,p,c) => `The new neighbors in ${p()} are perfect. Too perfect. ${n()} discovers ${c()} and realizes what perfect costs.`,
    (n,p,c) => `${n()} inherits a house in ${p()} with one rule: never open the room connected to ${c()}. Naturally, they open it.`,
    (n,p,c) => `Something lives in the walls of ${p()}. ${n()} can hear it breathing. ${c()} is what it wants.`,
    (n,p,c) => `${n()} is a grief counselor in ${p()} whose patients all describe the same entity — something tied to ${c()}.`,
    (n,p,c) => `Every mirror in ${p()} shows something wrong. ${n()} discovers ${c()} is the source — and breaking the mirrors only makes it worse.`,
    (n,p,c) => `${n()} attends a funeral in ${p()} for someone they've never heard of. The invitation contained ${c()} and a warning.`,
    (n,p,c) => `The fog that rolls into ${p()} every autumn brings ${c()} with it. This year, ${n()} finally sees what's inside.`,
    (n,p,c) => `${n()} volunteers at an old hospital in ${p()} and finds ${c()} in the abandoned wing — along with patients who were never discharged.`,
    (n,p,c) => `A dating app in ${p()} matches ${n()} with someone impossibly perfect. ${c()} reveals they died three years ago.`,
    (n,p,c) => `${n()} can't stop drawing the same image: ${p()}, burning, with ${c()} at its center. Then they get an invitation to visit.`,
    (n,p,c) => `${n()} is a sleep researcher studying insomnia in ${p()}. The subjects share the same nightmare involving ${c()}.`,
    (n,p,c) => `The elevator in ${p()} sometimes goes to a floor that doesn't exist. ${n()} steps out and finds ${c()}.`,
    (n,p,c) => `${n()} buys a smart home in ${p()}. The AI assistant knows about ${c()} — and about things that haven't happened yet.`,
  ],
  "Historical Fiction": [
    (n,p,c) => `${n()}, a spy during the Cold War, is stationed in ${p()} to intercept ${c()} — but their handler may be a double agent.`,
    (n,p,c) => `In 1920s ${p()}, ${n()} runs a speakeasy where ${c()} draws the attention of both the mob and the feds.`,
    (n,p,c) => `${n()} is a scribe in ancient ${p()} who discovers ${c()} in the royal archives — a truth that could topple an empire.`,
    (n,p,c) => `During the plague years, ${n()} travels through ${p()} carrying ${c()}, a remedy that works but comes at a terrible price.`,
    (n,p,c) => `${n()}, a suffragette in ${p()}, uncovers ${c()} that links the movement's leadership to a far more radical plot.`,
    (n,p,c) => `On the eve of revolution, ${n()} must smuggle ${c()} out of ${p()} before the old regime falls — and the new one is worse.`,
    (n,p,c) => `${n()} is a painter in Renaissance ${p()} commissioned to create ${c()}, a masterpiece that conceals a coded message.`,
    (n,p,c) => `A samurai in feudal ${p()} is tasked with protecting ${c()} on a treacherous journey. ${n()} questions whether the mission is just.`,
    (n,p,c) => `${n()}, a nurse in WWII ${p()}, discovers ${c()} among a soldier's belongings — a secret that changes the course of a battle.`,
    (n,p,c) => `In Victorian ${p()}, ${n()} is a governess who realizes ${c()} is more than a family heirloom — it's evidence of a century-old crime.`,
    (n,p,c) => `${n()} is a navigator on a 16th-century expedition to ${p()}, where ${c()} challenges everything Europe believes about the world.`,
    (n,p,c) => `During the California Gold Rush, ${n()} arrives in ${p()} chasing fortune but finds ${c()} — and a conspiracy to control the territory.`,
    (n,p,c) => `${n()}, an enslaved person in ${p()}, orchestrates an escape using ${c()}, risking everything for freedom.`,
    (n,p,c) => `In ancient ${p()}, ${n()} is a gladiator who discovers ${c()} — proof of a plot against the emperor.`,
    (n,p,c) => `${n()} is a telegraph operator in Civil War ${p()} who intercepts ${c()}, a message that could end the war — or prolong it.`,
    (n,p,c) => `During the partition of ${p()}, ${n()} must choose between homeland and family, complicated by ${c()}.`,
    (n,p,c) => `${n()}, a Viking trader in ${p()}, discovers ${c()} that challenges Norse understanding of the world.`,
    (n,p,c) => `In 1960s ${p()}, ${n()} is a jazz musician whose discovery of ${c()} entangles them in the civil rights movement.`,
    (n,p,c) => `${n()} is a monk in medieval ${p()} tasked with preserving ${c()} from invaders — a text that could reshape Christianity.`,
    (n,p,c) => `During the fall of the Berlin Wall, ${n()} searches ${p()} for ${c()} — a person, a secret, and a love thought lost forever.`,
  ],
  "Literary Fiction": [
    (n,p,c) => `${n()} returns to ${p()} after twenty years to find that ${c()} has changed nothing — and everything.`,
    (n,p,c) => `Three generations of a family in ${p()} are connected by ${c()}, an inheritance that brings more burden than beauty.`,
    (n,p,c) => `${n()}, a translator in ${p()}, begins to lose the boundary between languages and selves after encountering ${c()}.`,
    (n,p,c) => `In ${p()}, where gentrification is erasing history, ${n()} fights to preserve ${c()} — and their own identity.`,
    (n,p,c) => `${n()} writes letters to a dead sibling from ${p()}, processing grief, guilt, and ${c()} — the thing they never said.`,
    (n,p,c) => `A year in the life of ${n()}, a hospice worker in ${p()} who discovers ${c()} redefines what it means to live well.`,
    (n,p,c) => `${n()} and their estranged parent reunite in ${p()} over ${c()}, forcing them to confront decades of silence.`,
    (n,p,c) => `Told in reverse, the story of how ${n()} ended up alone in ${p()}, and how ${c()} was both the beginning and the end.`,
    (n,p,c) => `${n()}, an immigrant in ${p()}, navigates two worlds while ${c()} threatens to sever the thread connecting them.`,
    (n,p,c) => `Four strangers in ${p()} are brought together by ${c()}, each carrying a version of the same unanswered question.`,
    (n,p,c) => `${n()} is a philosopher in ${p()} questioning the nature of ${c()} while their personal life quietly falls apart.`,
    (n,p,c) => `In ${p()}, ${n()} teaches at a school where ${c()} forces them to reckon with their own privilege and complicity.`,
    (n,p,c) => `${n()} spends a summer in ${p()} caring for a dying friend. ${c()} becomes a metaphor for everything left unsaid.`,
    (n,p,c) => `A dual timeline follows ${n()} in ${p()} — young and full of promise, then older and grappling with ${c()}.`,
    (n,p,c) => `${n()} runs a bookshop in ${p()} that becomes a refuge for misfits, all orbiting ${c()} without knowing it.`,
    (n,p,c) => `After a scandal involving ${c()}, ${n()} retreats to ${p()} to rebuild — but solitude brings its own reckoning.`,
    (n,p,c) => `${n()} is a musician in ${p()} whose art is inspired by ${c()} — a source of beauty they can never fully possess.`,
    (n,p,c) => `In a single day in ${p()}, ${n()} confronts ${c()}, memory, and the question of whether people truly change.`,
    (n,p,c) => `${n()} and their neighbor in ${p()} share a wall and ${c()}, a connection that grows into something neither expected.`,
    (n,p,c) => `A meditation on loss: ${n()} catalogs every object in ${p()} that reminds them of someone gone, centered on ${c()}.`,
  ],
  Adventure: [
    (n,p,c) => `${n()} discovers a map to ${p()} where ${c()} is rumored to grant unlimited power to whoever claims it first.`,
    (n,p,c) => `Shipwrecked in ${p()}, ${n()} must survive hostile terrain, rival castaways, and the mystery of ${c()}.`,
    (n,p,c) => `${n()} joins an expedition to ${p()} to find ${c()} — a treasure that has claimed every previous expedition.`,
    (n,p,c) => `A heist gone wrong strands ${n()} in ${p()} with ${c()} and enemies closing in from every direction.`,
    (n,p,c) => `${n()}, a bush pilot in ${p()}, crash-lands in uncharted territory and discovers ${c()} — something that was supposed to be myth.`,
    (n,p,c) => `When ${c()} is stolen from ${p()}, ${n()} assembles an unlikely crew to chase the thieves across three continents.`,
    (n,p,c) => `${n()} enters a globe-spanning race through ${p()} where the prize is ${c()} — and the competitors will kill for it.`,
    (n,p,c) => `${n()}, a cave diver, discovers an underground passage in ${p()} that leads to ${c()} and a civilization thought extinct.`,
    (n,p,c) => `Trapped in ${p()} after a natural disaster, ${n()} must reach ${c()} before time runs out.`,
    (n,p,c) => `${n()} is a smuggler in ${p()} hired to transport ${c()} across a war zone. The cargo has a mind of its own.`,
    (n,p,c) => `A volcano threatens ${p()}. ${n()} leads an evacuation but discovers ${c()} deep in the caldera — something that changes the mission entirely.`,
    (n,p,c) => `${n()} stows away on a ship bound for ${p()}, chasing ${c()} and the truth about their missing sibling.`,
    (n,p,c) => `Hired to guide tourists through ${p()}, ${n()} encounters ${c()} that turns a routine trip into a fight for survival.`,
    (n,p,c) => `${n()} and a rival explorer race to ${p()} to claim ${c()} — but the jungle has defenses of its own.`,
    (n,p,c) => `${n()} is the sole survivor of a mountaineering disaster in ${p()}. Getting down alive means solving the mystery of ${c()}.`,
    (n,p,c) => `A treasure-hunting AI leads ${n()} to ${p()} where ${c()} has been buried for a thousand years. But someone else got the same coordinates.`,
    (n,p,c) => `${n()} escapes a prison in ${p()} with nothing but ${c()} and a 72-hour head start.`,
    (n,p,c) => `${n()} discovers ${c()} while free-diving in ${p()} and attracts the attention of an international syndicate.`,
    (n,p,c) => `In ${p()}, ${n()} follows a trail of cryptic clues left by a legendary explorer, all pointing to ${c()}.`,
    (n,p,c) => `${n()} volunteers for a one-way mission to ${p()} carrying ${c()} — humanity's last gamble for survival.`,
  ],
  "Comedy/Humor": [
    (n,p,c) => `${n()} accidentally becomes mayor of ${p()} after a typo on a ballot, and must now deal with ${c()} — the town's most absurd crisis yet.`,
    (n,p,c) => `${n()}'s attempt to impress their in-laws during a vacation to ${p()} goes spectacularly wrong when ${c()} enters the picture.`,
    (n,p,c) => `A case of mistaken identity lands ${n()} in ${p()} posing as an expert on ${c()} — a subject they know absolutely nothing about.`,
    (n,p,c) => `${n()} starts a self-help blog in ${p()} that goes viral for all the wrong reasons, especially the post about ${c()}.`,
    (n,p,c) => `${n()} inherits a haunted bed-and-breakfast in ${p()} where the ghost is more annoying than scary and keeps rearranging ${c()}.`,
    (n,p,c) => `Two feuding neighbors in ${p()} — one of them ${n()} — escalate a petty war over ${c()} to increasingly absurd heights.`,
    (n,p,c) => `${n()} signs up for a reality dating show set in ${p()} where the twist involves ${c()} — and it's worse than they imagined.`,
    (n,p,c) => `${n()}'s midlife crisis reaches peak absurdity in ${p()} when they impulsively invest in ${c()}.`,
    (n,p,c) => `${n()} is a terrible spy assigned to ${p()} where ${c()} is the target. Everything that can go wrong does.`,
    (n,p,c) => `A family reunion in ${p()} devolves into chaos when ${n()} accidentally reveals ${c()} at dinner.`,
    (n,p,c) => `${n()} tries to throw a surprise party in ${p()} but ${c()} causes a chain reaction of disasters.`,
    (n,p,c) => `${n()} writes a scathing review of a restaurant in ${p()} and must face the consequences when ${c()} reveals the owner is their new boss.`,
    (n,p,c) => `${n()} adopts what they think is a normal pet in ${p()}. It is not normal. It is connected to ${c()}.`,
    (n,p,c) => `Office comedy: ${n()} navigates corporate absurdity in ${p()} while trying to keep ${c()} a secret from HR.`,
    (n,p,c) => `${n()} enters a baking competition in ${p()} despite not knowing how to cook. ${c()} makes things exponentially worse.`,
    (n,p,c) => `${n()} accidentally sends a brutally honest email to everyone in ${p()} about ${c()}. Now they have to face them all.`,
    (n,p,c) => `A road trip to ${p()} with ${n()} and three incompatible friends goes off the rails when ${c()} forces a detour.`,
    (n,p,c) => `${n()} starts a true-crime podcast in ${p()} investigating ${c()} — which turns out to be hilariously mundane.`,
    (n,p,c) => `${n()} is a wedding planner in ${p()} whose worst nightmare is the couple who insists on ${c()} as their theme.`,
    (n,p,c) => `${n()} gets stuck in a time loop in ${p()}. The day? The most boring day ever. The only variable? ${c()}.`,
  ],
  Other: [
    (n,p,c) => `${n()} discovers ${c()} in ${p()} that defies all known categories — a story that bends genre itself.`,
    (n,p,c) => `In ${p()}, ${n()} encounters ${c()} and must navigate a world where the rules keep changing.`,
    (n,p,c) => `${n()} wakes in ${p()} with ${c()} and no instructions. The only way out is through.`,
    (n,p,c) => `A stranger hands ${n()} ${c()} in ${p()} and says, "You'll know what to do." They don't.`,
    (n,p,c) => `${n()} documents the impossible: ${c()} appearing in ${p()}, rewriting reality one day at a time.`,
    (n,p,c) => `In ${p()}, ${n()} and ${c()} become the center of a story no one expected — least of all them.`,
    (n,p,c) => `${n()} sets out to understand ${c()} in ${p()}, and in doing so, discovers something profound about themselves.`,
    (n,p,c) => `The intersection of ${n()}'s life and ${c()} in ${p()} creates a narrative unlike anything seen before.`,
    (n,p,c) => `${n()} collects stories in ${p()}. One story — about ${c()} — refuses to stay on the page.`,
    (n,p,c) => `When ${c()} manifests in ${p()}, ${n()} is the only person who doesn't run.`,
    (n,p,c) => `${n()} builds something extraordinary in ${p()} using ${c()}, blurring the line between art and reality.`,
    (n,p,c) => `Experimental narrative: ${n()} in ${p()} tells the story of ${c()} through fragments, dreams, and contradictions.`,
    (n,p,c) => `${n()} receives a package in ${p()} containing ${c()} and a manuscript that describes their life — including tomorrow.`,
    (n,p,c) => `In ${p()}, ${n()} curates an exhibition about ${c()} that becomes more real than intended.`,
    (n,p,c) => `${n()} is both narrator and character in a story set in ${p()}, where ${c()} blurs the boundary between fiction and truth.`,
    (n,p,c) => `${n()} must reconcile two versions of ${p()} — one where ${c()} exists and one where it doesn't.`,
    (n,p,c) => `A meditation on identity: ${n()} in ${p()} discovers ${c()} forces them to question who they really are.`,
    (n,p,c) => `${n()} and a group of strangers in ${p()} are connected by ${c()} in ways that transcend coincidence.`,
    (n,p,c) => `${n()} writes the ending first and works backward through ${p()} and ${c()} to find how it all began.`,
    (n,p,c) => `In ${p()}, time, memory, and ${c()} converge around ${n()} in an unforgettable exploration of what it means to exist.`,
  ],
};

// Map various genre strings to our template keys
const GENRE_MAP: Record<string, string> = {
  "fantasy": "Fantasy",
  "sci-fi": "Sci-Fi",
  "science fiction": "Sci-Fi",
  "romance": "Romance",
  "mystery": "Mystery/Thriller",
  "mystery/thriller": "Mystery/Thriller",
  "thriller": "Mystery/Thriller",
  "horror": "Horror",
  "historical": "Historical Fiction",
  "historical fiction": "Historical Fiction",
  "literary fiction": "Literary Fiction",
  "adventure": "Adventure",
  "comedy": "Comedy/Humor",
  "comedy/humor": "Comedy/Humor",
  "humor": "Comedy/Humor",
  "non-fiction": "Other",
  "self-help": "Other",
  "business": "Other",
  "biography": "Other",
  "children's": "Fantasy",
  "poetry": "Literary Fiction",
  "other": "Other",
};

function resolveGenre(genre: string): string {
  const lower = genre.toLowerCase().trim();
  return GENRE_MAP[lower] || "Other";
}

export function generateBookPremise(genre: string, title?: string, tone?: string, audience?: string): string {
  const hasContext = (title && title.trim().length > 2) || (tone && tone.trim()) || (audience && audience.trim());
  if (hasContext) {
    return generatePremiseFromContext(title?.trim() || '', genre, tone?.trim() || '', audience?.trim() || '');
  }
  const key = resolveGenre(genre);
  const templates = GENRE_TEMPLATES[key] || GENRE_TEMPLATES["Other"];
  const template = pick(templates);
  const n = () => pick(NAMES);
  const p = () => pick(PLACES);
  const c = () => pick(CONCEPTS);
  return template(n, p, c);
}

const ACADEMIC_TOPICS = [
  { field: 'artificial intelligence', subjects: ['machine learning bias in hiring algorithms', 'large language models and the future of education', 'AI-driven drug discovery and clinical trial optimization', 'the ethics of autonomous weapons systems', 'generative AI and intellectual property law'] },
  { field: 'healthcare', subjects: ['telemedicine adoption barriers in rural communities', 'social determinants of health and insurance outcomes', 'precision medicine and genetic data privacy', 'mental health crisis intervention in emergency departments', 'the economics of preventive care vs. reactive treatment'] },
  { field: 'business & economics', subjects: ['remote work and its long-term impact on commercial real estate', 'cryptocurrency regulation and financial market stability', 'the gig economy and worker protections in the 2020s', 'supply chain resilience after global disruptions', 'ESG investing: performance data vs. marketing claims'] },
  { field: 'psychology', subjects: ['social media and adolescent self-identity formation', 'cognitive behavioral therapy in virtual reality settings', 'the psychology of misinformation acceptance', 'burnout syndrome in healthcare workers post-pandemic', 'attachment theory in the age of digital relationships'] },
  { field: 'technology', subjects: ['quantum computing and current encryption vulnerabilities', 'the digital divide in K-12 education outcomes', 'blockchain applications beyond cryptocurrency', 'cybersecurity threats to critical infrastructure', '5G network deployment and public health concerns'] },
  { field: 'environmental science', subjects: ['microplastic contamination in freshwater ecosystems', 'urban heat island effects and public health', 'carbon capture technology: feasibility and scalability', 'deforestation and zoonotic disease emergence', 'renewable energy grid integration challenges'] },
  { field: 'sociology', subjects: ['income inequality and social mobility in the digital age', 'housing policy and racial wealth gap dynamics', 'the sociology of conspiracy movements', 'immigration policy effects on local labor markets', 'food insecurity in affluent nations'] },
  { field: 'education', subjects: ['project-based learning outcomes vs. traditional instruction', 'AI tutoring systems and student engagement', 'the achievement gap: interventions that work', 'higher education funding models and accessibility', 'early childhood education and long-term economic outcomes'] },
  { field: 'law & policy', subjects: ['data privacy legislation: GDPR vs. American approaches', 'criminal justice reform and recidivism reduction', 'intellectual property in the age of AI-generated content', 'climate litigation as a tool for policy change', 'platform liability and content moderation law'] },
  { field: 'communication', subjects: ['podcast media and long-form journalism consumption', 'crisis communication strategies in the social media era', 'influencer marketing ethics and consumer trust', 'political messaging and algorithmic amplification', 'cross-cultural communication in global remote teams'] },
];

const ACADEMIC_STRUCTURES = [
  (topic: string, aud: string) => `A comprehensive examination of ${topic}. This book synthesizes current research, presents original analysis, and offers actionable frameworks${aud ? ` for ${aud}` : ''}.`,
  (topic: string, aud: string) => `An in-depth exploration of ${topic}, drawing on peer-reviewed studies, real-world case analyses, and expert interviews to present a thorough understanding of the subject${aud ? ` aimed at ${aud}` : ''}.`,
  (topic: string, aud: string) => `This book investigates ${topic} through a multidisciplinary lens, combining quantitative data, qualitative insights, and practical recommendations${aud ? ` designed for ${aud}` : ''}.`,
  (topic: string, aud: string) => `A research-driven guide to ${topic}. Covering historical context, current challenges, and future directions, this work provides evidence-based insights${aud ? ` tailored to ${aud}` : ''}.`,
  (topic: string, aud: string) => `Examining ${topic} from both theoretical and practical perspectives. Includes data analysis, case studies, and a forward-looking framework${aud ? ` for ${aud}` : ''}.`,
  (topic: string, aud: string) => `A rigorous analysis of ${topic}, challenging conventional assumptions with new data and offering a fresh perspective on one of the most pressing issues in the field${aud ? ` — essential reading for ${aud}` : ''}.`,
  (topic: string, aud: string) => `This book bridges the gap between academic research and real-world application in the area of ${topic}${aud ? `, written specifically for ${aud}` : ''}. Grounded in evidence, designed for impact.`,
  (topic: string, aud: string) => `An authoritative resource on ${topic}, covering the latest research findings, emerging trends, and practical strategies${aud ? ` that ${aud} can implement immediately` : ''}.`,
];

function generateAcademicPremise(title: string, tone: string, audience: string, genre: string): string {
  // If we have a title, use it as the actual subject
  if (title) {
    const templates = [
      (t: string, a: string) => `A comprehensive exploration of ${t}. This book examines the key concepts, current research, and practical implications${a ? ` for ${a}` : ''}. Covers historical context, emerging trends, and evidence-based strategies for understanding and applying the latest thinking on the subject.`,
      (t: string, a: string) => `An in-depth guide to ${t}, combining rigorous analysis with real-world case studies${a ? ` written for ${a}` : ''}. From foundational principles to cutting-edge developments, this book provides the knowledge and frameworks needed to master the subject.`,
      (t: string, a: string) => `This book presents a thorough examination of ${t}, drawing on peer-reviewed research, expert insights, and data-driven analysis${a ? ` tailored for ${a}` : ''}. It challenges conventional thinking and offers a fresh, actionable perspective.`,
      (t: string, a: string) => `Everything you need to know about ${t} — from the fundamentals to the frontier. This book synthesizes the best available evidence and translates it into clear, practical guidance${a ? ` that ${a} can apply immediately` : ''}.`,
      (t: string, a: string) => `A definitive resource on ${t}. This book maps the current landscape, identifies key challenges and opportunities, and provides a roadmap for what comes next${a ? ` — essential reading for ${a}` : ''}.`,
      (t: string, a: string) => `Why ${t} matters now more than ever. This book connects the dots between research, practice, and real-world impact${a ? `, designed specifically for ${a}` : ''}. Includes frameworks, case studies, and actionable takeaways.`,
      (t: string, a: string) => `A research-backed deep dive into ${t}. This book goes beyond surface-level coverage to examine root causes, systemic factors, and evidence-based solutions${a ? ` relevant to ${a}` : ''}.`,
      (t: string, a: string) => `The complete guide to ${t}. Covering theory, practice, and emerging developments, this book equips readers with the understanding and tools to engage with the subject at the highest level${a ? ` — built for ${a}` : ''}.`,
    ];
    return pick(templates)(title, audience);
  }
  
  // No title — generate from topic database
  const topicGroup = pick(ACADEMIC_TOPICS);
  const topic = pick(topicGroup.subjects);
  const structure = pick(ACADEMIC_STRUCTURES);
  return structure(topic, audience);
}

function generatePremiseFromContext(title: string, genre: string, tone: string, audience: string): string {
  const key = resolveGenre(genre);
  const n = pick(NAMES);
  const n2 = pick(NAMES.filter(x => x !== n));
  const p = pick(PLACES);
  const c = pick(CONCEPTS);

  // Build context prefix
  const parts: string[] = [];
  if (title) parts.push(`"${title}"`);
  
  // Tone modifiers
  const toneStyle: Record<string, string[]> = {
    'dark': ['In a world stripped of hope,', 'Against a backdrop of shadows and moral decay,', 'Where darkness seeps into every corner,'],
    'humorous': ['In a delightfully absurd turn of events,', 'What starts as a perfectly normal day goes hilariously sideways when', 'With razor-sharp wit and impeccable timing,'],
    'light': ['In a warm, feel-good tale,', 'With charm and heart,', 'In a story that celebrates the brighter side of life,'],
    'serious': ['In a deeply grounded narrative,', 'With unflinching honesty,', 'In a story that doesn\'t shy away from hard truths,'],
    'suspenseful': ['With tension building on every page,', 'In a pulse-pounding narrative where nothing is certain,', 'Where every revelation raises the stakes higher,'],
    'whimsical': ['In a wonderfully imaginative tale,', 'Where the impossible feels perfectly natural,', 'With a sense of wonder that defies expectation,'],
    'emotional': ['In a deeply moving story,', 'With raw emotional power,', 'A story that cuts straight to the heart —'],
    'gritty': ['In the raw, unpolished edges of real life,', 'Where survival isn\'t pretty and redemption is earned,', 'With brutal honesty and no easy answers,'],
    'inspirational': ['In an uplifting story of resilience,', 'A powerful testament to the human spirit —', 'Where hope persists against impossible odds,'],
    'poetic': ['In luminous, lyrical prose,', 'With language that sings and imagery that lingers,', 'A story told with the rhythm and beauty of poetry —'],
    'sarcastic': ['With a sharp tongue and sharper observations,', 'In a story that skewers everything sacred,', 'Where every observation comes with a knowing smirk,'],
    'nostalgic': ['Bathed in the amber glow of memory,', 'A story that reaches back through time,', 'Where the past is never quite past,'],
  };

  // Audience modifiers
  const audienceStyle: Record<string, string[]> = {
    'young adult': ['a young protagonist discovers', 'coming of age in a world that demands too much too soon,', 'navigating first love, identity, and'],
    'children': ['a young hero embarks on an adventure involving', 'in a story perfect for young imaginations,', 'with lessons about friendship, courage, and'],
    'adult': ['exploring complex themes of', 'in a mature narrative about', 'grappling with the messy realities of'],
    'new adult': ['on the cusp of adulthood,', 'finding their place in a world that offers no roadmap,', 'navigating the chaos of early adulthood and'],
    'middle grade': ['a clever kid uncovers', 'with humor, heart, and just the right amount of danger,', 'in an adventure perfect for curious young minds involving'],
    'teens': ['a teenager faces impossible choices about', 'where growing up means confronting', 'in a story that doesn\'t talk down, about'],
    'women': ['a woman reclaims her story through', 'sisterhood, strength, and', 'in a powerful exploration of womanhood and'],
    'men': ['a man confronts what he\'s been running from —', 'brotherhood, legacy, and', 'in a story about masculinity, purpose, and'],
    'general': ['a captivating story about', 'for anyone who\'s ever wondered about', 'in a universally resonant tale of'],
    'seniors': ['drawing on a lifetime of experience,', 'proving that the best chapters come later,', 'a story about legacy, wisdom, and'],
    'professionals': ['for the driven and ambitious,', 'where career, calling, and life collide around', 'blending professional stakes with personal depth,'],
  };

  // Detect if this is a non-fiction / academic / educational request
  const isAcademic = [tone, genre, audience].some(s => s && /academic|research|educational|non-fiction|nonfiction|business|self-help|science|technical|professional|scholarly|instructional|biography|memoir|how-to|howto|guide|students|researchers|entrepreneurs|leaders|managers|practitioners|clinicians|physicians|engineers|developers|analysts|executives/i.test(s));
  
  if (isAcademic) {
    return generateAcademicPremise(title, tone, audience, genre);
  }

  // Get tone opener
  let toneOpener = '';
  if (tone) {
    const lower = tone.toLowerCase();
    for (const [key, openers] of Object.entries(toneStyle)) {
      if (lower.includes(key)) {
        toneOpener = pick(openers);
        break;
      }
    }
  }

  // Get audience flavor
  let audienceFlavor = '';
  if (audience) {
    const lower = audience.toLowerCase();
    for (const [key, flavors] of Object.entries(audienceStyle)) {
      if (lower.includes(key)) {
        audienceFlavor = pick(flavors);
        break;
      }
    }
  }

  // Compose the premise — title is the SUBJECT, not just a label
  if (title) {
    const fictionFromTitle = [
      (t: string, tn: string, af: string) => `${tn ? tn + ' ' : ''}A story about ${t}. ${n} is drawn into events surrounding ${t} in ${p}, where ${c} changes everything.${af ? ' ' + af + '.' : ''}`,
      (t: string, tn: string, af: string) => `${tn ? tn + ' ' : ''}${n} never expected ${t} to upend their life — but in ${p}, nothing is what it seems. ${c} binds their fate to something far larger.${af ? ' A story about ' + af : ''}`,
      (t: string, tn: string, af: string) => `${tn ? tn + ' ' : ''}When ${t} collides with ${n}'s world in ${p}, the consequences ripple outward. At the center of it all: ${c}.${af ? ' ' + af + '.' : ''}`,
      (t: string, tn: string, af: string) => `${tn ? tn + ' ' : ''}${t} — it's the thread that connects ${n}, ${p}, and ${c} in a story that builds to an unforgettable conclusion.${af ? ' Written for ' + af + '.' : ''}`,
      (t: string, tn: string, af: string) => `${tn ? tn + ' ' : ''}In ${p}, ${t} is more than just a concept — it's the force that drives ${n} toward ${c} and a destiny they can't escape.${af ? ' ' + af + '.' : ''}`,
    ];
    return pick(fictionFromTitle)(title, toneOpener, audienceFlavor);
  }
  
  if (toneOpener && audienceFlavor) {
    return `${toneOpener} ${n} in ${p} — ${audienceFlavor} ${c}. A ${genre.toLowerCase()} that will stay with readers long after the last page.`;
  }
  if (toneOpener) {
    return `${toneOpener} ${n} discovers ${c} in ${p}, setting off a chain of events that will test everything they believe.`;
  }
  if (audienceFlavor) {
    return `${n} in ${p} — ${audienceFlavor} ${c}. A ${genre.toLowerCase()} story that speaks directly to its readers.`;
  }

  // Title only — use the genre-specific templates
  const titlePremises: Record<string, string[]> = {
    Fantasy: [
      `"${title}" — ${n}, a wanderer with a forgotten past, arrives in ${p} seeking answers. What they find instead is ${c}, and a destiny that will reshape the world.`,
      `"${title}" — In ${p}, where magic is fading, ${n} discovers that ${c} holds the key to restoring the balance — but the cost may be everything they love.`,
      `"${title}" — When ${n} inherits a mysterious legacy tied to ${c}, they must journey to ${p} and confront an ancient power that has been waiting for them.`,
      `"${title}" — ${n} and ${n2} are bound by ${c} in ${p}, drawn into an epic conflict between forces that have been at war since before memory.`,
      `"${title}" — A prophecy whispered in ${p} names ${n} as the one who will find ${c}. But prophecies never tell the whole truth.`,
    ],
    "Sci-Fi": [
      `"${title}" — ${n}, a researcher aboard a deep-space vessel, intercepts a signal from ${p} connected to ${c}. What they uncover could redefine humanity.`,
      `"${title}" — In a future where ${c} has transformed society, ${n} in ${p} discovers a truth that the powers in control will kill to keep hidden.`,
      `"${title}" — ${n} wakes from cryosleep to find ${p} changed beyond recognition. The only clue to what happened: ${c}.`,
      `"${title}" — When ${c} is discovered in ${p}, ${n} races against time and rival factions to determine whether it will save humanity or destroy it.`,
      `"${title}" — ${n} is an engineer in ${p} who builds something extraordinary with ${c} — and must face the consequences when it works too well.`,
    ],
    Romance: [
      `"${title}" — ${n} never expected to find love in ${p}, especially not with someone connected to ${c}. But some stories write themselves.`,
      `"${title}" — When ${n} and ${n2} are thrown together in ${p} by circumstances involving ${c}, the tension between them becomes impossible to ignore.`,
      `"${title}" — ${n} returns to ${p} to heal a broken heart and meets someone who challenges everything they thought they knew about love — and ${c}.`,
      `"${title}" — A chance encounter in ${p} leads ${n} to ${n2}. Between them stands ${c}, a secret that could bring them together or tear them apart.`,
      `"${title}" — ${n} swore off love. Then ${n2} walked into their life in ${p}, carrying ${c} and a smile that changed everything.`,
    ],
    "Mystery/Thriller": [
      `"${title}" — ${n}, a detective with a troubled past, takes on a case in ${p} where ${c} is the only evidence — and someone is willing to kill for it.`,
      `"${title}" — In ${p}, nothing is as it seems. ${n} follows the trail of ${c} into a web of lies, betrayal, and a truth that could shatter everything.`,
      `"${title}" — ${n} receives an anonymous message about ${c} in ${p}. What starts as curiosity becomes a fight for survival.`,
      `"${title}" — When ${n} discovers ${c} hidden in ${p}, they realize they've stumbled into a conspiracy far bigger than they imagined.`,
      `"${title}" — ${n} has 48 hours to find ${c} in ${p} before a killer strikes again. The clock is ticking.`,
    ],
    Horror: [
      `"${title}" — ${n} moves to ${p} seeking peace. Instead they find ${c} — and something that has been waiting in the dark for a very long time.`,
      `"${title}" — In ${p}, the locals know better than to speak of ${c}. ${n} doesn't — and that's exactly what it was counting on.`,
      `"${title}" — ${n} begins seeing things in ${p} that no one else can see, all connected to ${c}. The question isn't what it wants — it's what it already has.`,
      `"${title}" — Something ancient sleeps beneath ${p}. ${n} wakes it with ${c}, and now there's no way to put it back.`,
      `"${title}" — ${n} thought the horror was over. Then ${c} appeared in ${p}, and they realized it was just beginning.`,
    ],
    "Historical Fiction": [
      `"${title}" — Set in ${p}, ${n} navigates a world on the brink of change. ${c} becomes the catalyst for a story of courage, sacrifice, and transformation.`,
      `"${title}" — ${n}, living through one of history's most turbulent eras, discovers ${c} in ${p} — a secret that could change the course of events.`,
      `"${title}" — In ${p}, ${n} must choose between duty and conscience when ${c} reveals a truth the powerful want buried.`,
      `"${title}" — ${n} witnesses history unfold in ${p}, where ${c} becomes both a weapon and a promise.`,
      `"${title}" — Against the backdrop of ${p}, ${n} fights for survival, justice, and ${c} — a legacy worth preserving.`,
    ],
    "Literary Fiction": [
      `"${title}" — ${n} returns to ${p} carrying the weight of years, searching for ${c} — and the meaning they lost along the way.`,
      `"${title}" — In ${p}, ${n} confronts memory, identity, and ${c}, weaving a story about what it means to truly know another person.`,
      `"${title}" — ${n}'s life in ${p} is upended by ${c}, forcing a reckoning with the past and a reimagining of the future.`,
      `"${title}" — Through the lens of ${n}'s experience in ${p}, a meditation on loss, connection, and ${c}.`,
      `"${title}" — ${n} and ${n2} orbit each other in ${p}, connected by ${c} and the question of whether people truly change.`,
    ],
    Adventure: [
      `"${title}" — ${n} sets out for ${p} in pursuit of ${c}, facing impossible odds and discovering strength they never knew they had.`,
      `"${title}" — When ${c} is found in ${p}, ${n} assembles a crew for the journey of a lifetime — where the treasure isn't what anyone expected.`,
      `"${title}" — ${n} survives against all odds in ${p}, driven by the search for ${c} and the refusal to give up.`,
      `"${title}" — A race across ${p} pits ${n} against ruthless competitors, all chasing ${c}. Only one will reach it first.`,
      `"${title}" — ${n} discovers a map leading to ${c} deep within ${p}. The journey will test everything they are.`,
    ],
    "Comedy/Humor": [
      `"${title}" — ${n}'s perfectly ordinary life in ${p} goes spectacularly sideways when ${c} enters the picture. Chaos, comedy, and questionable decisions ensue.`,
      `"${title}" — ${n} accidentally gets tangled up with ${c} in ${p}, leading to a series of escalating misadventures that would be funny if they weren't happening to them.`,
      `"${title}" — In ${p}, ${n} tries to maintain dignity while dealing with ${c}. They fail. Hilariously.`,
      `"${title}" — ${n} and ${n2} in ${p} turn a simple situation involving ${c} into the most absurd crisis the town has ever seen.`,
      `"${title}" — What starts as a normal day in ${p} for ${n} becomes an unforgettable comedy of errors, all thanks to ${c}.`,
    ],
    Other: [
      `"${title}" — ${n} discovers ${c} in ${p}, setting off a journey that defies expectation and genre, into something entirely its own.`,
      `"${title}" — In ${p}, ${n} encounters ${c} and begins a story that blurs the boundaries between the real and the extraordinary.`,
      `"${title}" — ${n} navigates ${p} and the mystery of ${c}, finding that the most compelling stories are the ones that can't be categorized.`,
      `"${title}" — A unique narrative unfolds as ${n} in ${p} grapples with ${c} and the realization that nothing is quite what it seems.`,
      `"${title}" — ${n} follows ${c} through ${p}, discovering that the journey itself is the story worth telling.`,
    ],
  };

  const templates = titlePremises[key] || titlePremises["Other"];
  return pick(templates);
}

// Special mode generators

const COMIC_TEMPLATES: GenreTemplates = [
  (n,p,c) => `A vigilante known only as "${n()}" protects ${p()} using ${c()}, but a new villain knows their true identity.`,
  (n,p,c) => `${n()}, a retired superhero in ${p()}, is forced back into action when ${c()} falls into the wrong hands.`,
  (n,p,c) => `In ${p()}, ordinary people gain powers through ${c()}. ${n()} is the first to discover the terrible side effects.`,
  (n,p,c) => `${n()} is a villain in ${p()} who accidentally saves the day and must maintain a heroic facade while protecting ${c()}.`,
  (n,p,c) => `A cosmic event in ${p()} links ${n()} to ${c()}, granting them powers that come with an impossible choice.`,
  (n,p,c) => `${n()}, the last of an alien race, hides in ${p()} guarding ${c()} from an intergalactic bounty hunter.`,
  (n,p,c) => `Two rival heroes in ${p()} must team up when ${c()} threatens to destroy reality itself. ${n()} leads the reluctant alliance.`,
  (n,p,c) => `${n()} is a street artist in ${p()} whose murals come to life at night, connected to ${c()}.`,
  (n,p,c) => `In an alternate ${p()}, ${n()} is the only person without superpowers — and the only one who can stop ${c()}.`,
  (n,p,c) => `${n()} inherits a suit of ancient armor in ${p()} that channels ${c()}, but each use costs a piece of their humanity.`,
  (n,p,c) => `A heist comic: ${n()} assembles a crew in ${p()} to steal ${c()} from the most powerful being on Earth.`,
  (n,p,c) => `${n()} can rewind time by 60 seconds. In ${p()}, ${c()} creates a situation where 60 seconds isn't enough.`,
  (n,p,c) => `Origin story: ${n()}, a delivery driver in ${p()}, becomes the city's unlikely protector after an encounter with ${c()}.`,
  (n,p,c) => `${n()} is a sentient robot in ${p()} who develops emotions through ${c()} and must choose between programming and feeling.`,
  (n,p,c) => `Noir-style comic: ${n()}, a private eye in rain-soaked ${p()}, follows ${c()} into the city's darkest corners.`,
  (n,p,c) => `${n()} and their arch-nemesis are trapped together in ${p()} by ${c()}, forced to cooperate to survive.`,
  (n,p,c) => `In ${p()}, every person's soul manifests as a visible creature. ${n()}'s is connected to ${c()} — and it's growing.`,
  (n,p,c) => `${n()} runs a bar in ${p()} where heroes and villains drink side by side. ${c()} disrupts the fragile peace.`,
  (n,p,c) => `A time-traveling hero, ${n()}, must fix a paradox in ${p()} caused by ${c()} before history collapses.`,
  (n,p,c) => `${n()} discovers their comic book collection in ${p()} is actually a chronicle of real events — and ${c()} is happening next.`,
];

const PLAY_TEMPLATES: GenreTemplates = [
  (n,p,c) => `A three-act drama: ${n()} returns to ${p()} for a funeral and confronts the family secret of ${c()}.`,
  (n,p,c) => `Set entirely in a single room in ${p()}, ${n()} and four others debate the morality of ${c()} as tension rises.`,
  (n,p,c) => `${n()}, a fading actor, performs their final show in ${p()} while backstage, ${c()} threatens to unravel everything.`,
  (n,p,c) => `A courtroom drama in ${p()}: ${n()} stands trial for ${c()}, but the real verdict is on society itself.`,
  (n,p,c) => `Two strangers — ${n()} and a mysterious figure — meet in ${p()} nightly. ${c()} slowly reveals their shared past.`,
  (n,p,c) => `Musical play: ${n()} in ${p()} uses song to process ${c()}, blending dialogue with haunting melodies.`,
  (n,p,c) => `${n()} directs a community play in ${p()} about ${c()}, not realizing the cast is living the same story offstage.`,
  (n,p,c) => `An absurdist comedy: ${n()} waits in ${p()} for ${c()} that may never arrive, finding meaning in the absurd.`,
  (n,p,c) => `${n()} and their sibling in ${p()} pack up their childhood home, uncovering ${c()} and decades of unspoken truths.`,
  (n,p,c) => `A play-within-a-play: actors in ${p()} rehearse a piece about ${c()}, blurring the line between script and reality.`,
  (n,p,c) => `${n()} is a therapist in ${p()} whose latest patient claims to have experienced ${c()} — but who's really being analyzed?`,
  (n,p,c) => `In ${p()}, a dinner party hosted by ${n()} goes wrong when ${c()} is revealed, and no one can leave.`,
  (n,p,c) => `${n()} writes a letter to their younger self from ${p()}, dramatized through ${c()} and the choices that shaped them.`,
  (n,p,c) => `Two timelines converge on stage: ${n()} in ${p()} now and decades ago, connected by ${c()}.`,
  (n,p,c) => `A one-person show: ${n()} addresses the audience directly from ${p()}, unraveling the truth about ${c()}.`,
  (n,p,c) => `${n()} and their estranged best friend reunite in ${p()} over ${c()}, each remembering the falling-out differently.`,
  (n,p,c) => `Political drama: ${n()} is a speechwriter in ${p()} who discovers ${c()} could bring down the administration.`,
  (n,p,c) => `${n()} runs a support group in ${p()} where participants share stories about ${c()} — until one story turns out to be true.`,
  (n,p,c) => `In ${p()}, the ghosts of the past literally appear on stage as ${n()} confronts ${c()} and the weight of memory.`,
  (n,p,c) => `${n()} stages an intervention in ${p()} about ${c()}, but the intervention reveals more about the interveners than the subject.`,
];

const THESIS_TOPICS = [
  "The impact of artificial intelligence on creative industries and the future of human authorship",
  "Social media algorithms and their effect on political polarization in democratic societies",
  "The psychology of decision-making under uncertainty in high-stakes medical environments",
  "Climate change adaptation strategies in developing island nations: a comparative study",
  "The role of microbiome diversity in mental health outcomes: a systematic review",
  "Blockchain technology beyond cryptocurrency: applications in supply chain transparency",
  "The effectiveness of universal basic income pilot programs across different cultural contexts",
  "Neuroplasticity and language acquisition in adults: challenging the critical period hypothesis",
  "The ethics of genetic engineering in agriculture: balancing innovation with ecological risk",
  "Remote work and organizational culture: a longitudinal study of post-pandemic workplace transformation",
  "The intersection of indigenous knowledge systems and modern environmental science",
  "Quantum computing and its implications for current cryptographic security standards",
  "The economics of attention: how the digital attention economy reshapes human behavior",
  "Gender representation in AI training data and its downstream effects on automated decisions",
  "The neuroscience of empathy: how virtual reality experiences affect prosocial behavior",
  "Antibiotic resistance as a global health crisis: policy frameworks for intervention",
  "The relationship between urban green spaces and mental health in high-density cities",
  "Disinformation campaigns and democratic resilience: case studies from the 2020s",
  "The philosophy of consciousness in artificial systems: can machines truly think?",
  "Food sovereignty movements and their impact on global agricultural policy",
  "The digital divide in education: how technology access shapes learning outcomes across socioeconomic lines",
  "Epigenetic inheritance and its implications for our understanding of evolution",
  "The role of architecture in promoting social cohesion in multicultural urban spaces",
  "Machine learning in early disease detection: accuracy, ethics, and access",
  "The psychology of conspiracy thinking: cognitive, social, and technological drivers",
];

const COURSE_TOPICS = [
  "Build Your Personal Brand: From Zero to Authority in 90 Days",
  "Content Creation Masterclass: Video, Audio, and Written Content That Converts",
  "The Complete Guide to Passive Income Streams for Creators",
  "Social Media Growth Hacking: Organic Strategies That Actually Work",
  "Email Marketing Mastery: Build a List That Pays You Forever",
  "Launch Your Online Course: From Idea to First $10K",
  "Photography for Social Media: Create Scroll-Stopping Visual Content",
  "The Psychology of Persuasion: Ethical Influence for Entrepreneurs",
  "Financial Literacy for Creators: Taxes, Investing, and Wealth Building",
  "Community Building: How to Create a Thriving Paid Membership",
  "Public Speaking and Presentation Skills for the Digital Age",
  "Productivity Systems for Creative Professionals",
  "The Art of Storytelling in Business: Connect, Engage, Convert",
  "SEO Demystified: Drive Organic Traffic Without Paid Ads",
  "Mindset and Resilience: The Mental Game of Entrepreneurship",
  "Podcast Launch Blueprint: Record, Edit, Grow, and Monetize",
  "UX Design Fundamentals: Create Products People Love",
  "Data Analytics for Non-Technical Founders",
  "Freelancing to Agency: Scale Your Service Business",
  "AI Tools for Creators: Work Smarter, Not Harder",
  "Negotiation Skills: Get What You're Worth in Business and Life",
  "Sustainable Business: Build a Brand That Lasts and Does Good",
  "Video Editing Bootcamp: Professional Results on Any Budget",
  "The Creator Economy Playbook: Multiple Revenue Streams for Influencers",
  "Leadership for First-Time Managers: From Individual Contributor to Team Lead",
];

export function generateSpecialPremise(mode: string, genre?: string, title?: string, tone?: string, audience?: string): string {
  // If title provided for comic/playwright, generate from title
  if (title && title.trim().length > 2 && (mode === "comic" || mode === "playwright")) {
    const n = pick(NAMES);
    const p = pick(PLACES);
    const c = pick(CONCEPTS);
    if (mode === "comic") {
      return pick([
        `"${title}" — ${n} discovers ${c} in ${p}, triggering a chain of events that will transform them from ordinary citizen to the city's most unlikely hero.`,
        `"${title}" — In ${p}, ${n} must navigate ${c} and a world of powered individuals where nothing is black and white.`,
        `"${title}" — When ${c} falls into the wrong hands in ${p}, ${n} is the only one who can stop what's coming.`,
      ]);
    }
    if (mode === "playwright") {
      return pick([
        `"${title}" — A stage drama set in ${p}, where ${n} confronts ${c} and the audience witnesses truths that can only be spoken in a theater.`,
        `"${title}" — ${n} and a cast of unforgettable characters in ${p} grapple with ${c} in this intimate, powerful stage work.`,
        `"${title}" — In a single evening in ${p}, ${n} faces ${c}, and nothing — not the characters, not the audience — will be the same.`,
      ]);
    }
  }
  switch (mode) {
    case "comic": {
      const template = pick(COMIC_TEMPLATES);
      return template(() => pick(NAMES), () => pick(PLACES), () => pick(CONCEPTS));
    }
    case "playwright": {
      const template = pick(PLAY_TEMPLATES);
      return template(() => pick(NAMES), () => pick(PLACES), () => pick(CONCEPTS));
    }
    case "thesis":
      return pick(THESIS_TOPICS);
    case "course":
      return pick(COURSE_TOPICS);
    default:
      return generateBookPremise(genre || "Other", title, tone, audience);
  }
}
