import { CommandContext, defineFlags, TerminalAPI } from '@nameless-os/sdk';

const jokeCategories = {
  programming: [
    "Why did the programmer quit his job? — Because he didn't get arrays.",
    "What's the object-oriented way to become wealthy? — Inheritance.",
    "Why do functions always break up? — They have too many arguments.",
    "Why did the developer go broke? — Because he lost his domain in a bet.",
    "What do you call a group of 8 Hobbits? — A hobbyte.",
    "Why did the coder bring a ladder to work? — Because he was working on the cloud.",
    "What is a programmer's favorite instrument? — The keyboard.",
    "Why do programmers prefer dark mode? — Because light attracts bugs.",
    "How do you comfort a JavaScript bug? — You console it.",
    "Why was the developer always calm? — He had a good async routine.",
    "What did the frontend say to the backend? — You're such a pain in the API.",
    "What does a software tester drink? — Java.",
    "Why don't bachelors like Git? — Because they are afraid to commit.",
    "How do you know a programmer is an extrovert? — They look at *your* shoes while talking.",
    "Why did the Boolean leave the party? — It wasn't feeling true.",
    "What did the dev say when he lost his keys? — I can't find my cache!",
    "Why did the app go to therapy? — It had too many unresolved promises.",
    "Why are computers so smart? — Because they listen to their motherboards.",
    "Why did the dev break up over text? — Too many strings attached.",
    "What do you call an AI that tells jokes? — PunGPT.",
    "Why did the code fail its driving test? — Too many syntax errors.",
    "Why are programmers terrible at relationships? — They always try to solve emotional issues with logic.",
    "What's a programmer's favorite movie? — The Bugtrix.",
    "Why was the database administrator so chill? — He had strong relational skills.",
    "Why do programmers love nature? — It has no Java.",
    "Why was the bit feeling depressed? — It was set to 0.",
    "Why are devops engineers always calm? — They have great pipelines.",
    "What do you call a coder who can sing? — A SoundCloud engineer.",
    "Why do Java devs need glasses? — Because they can't C#.",
    "Why did the computer get cold? — It left its Windows open.",
    "There are 10 kinds of people in the world: those who understand binary and those who don't.",
    "I would tell you a UDP joke, but you might not get it.",
    "Why did the DNS server get in trouble? — It couldn't resolve anything.",
    "Why did the programmer keep staring at the screen? — He was trying to find his focus.",
    "What's the difference between hardware and software? — If you hit it and it breaks, it was hardware.",
    "Why do programmers always mix up Halloween and Christmas? — Because Oct 31 == Dec 25."
  ],

  general: [
    "Why don't scientists trust atoms? — Because they make up everything!",
    "I told my wife she was drawing her eyebrows too high. — She looked surprised.",
    "What do you call a fake noodle? — An impasta!",
    "Why did the scarecrow win an award? — He was outstanding in his field!",
    "I invented a new word: Plagiarism!",
    "Why don't eggs tell jokes? — They'd crack each other up!",
    "What do you call a bear with no teeth? — A gummy bear!",
    "Why did the math book look so sad? — Because it had too many problems!",
    "What's orange and sounds like a parrot? — A carrot!",
    "Why can't a bicycle stand up by itself? — It's two tired!",
    "What do you call a sleeping bull? — A bulldozer!",
    "Why did the cookie go to the doctor? — Because it felt crumbly!",
    "What do you call a fish wearing a crown? — A king fish!",
    "Why don't skeletons fight each other? — They don't have the guts!",
    "What's the best thing about Switzerland? — I don't know, but the flag is a big plus!",
    "Why did the banana go to the doctor? — It wasn't peeling well!",
    "What do you call a dinosaur that crashes his car? — Tyrannosaurus Wrecks!",
    "Why don't oysters share? — Because they're shellfish!",
    "What do you call a cow with no legs? — Ground beef!",
    "Why did the golfer bring two pairs of pants? — In case he got a hole in one!",
    "What's a skeleton's least favorite room? — The living room!",
    "Why don't melons get married? — Because they cantaloupe!",
    "What do you call a pig that does karate? — A pork chop!",
    "Why was the belt arrested? — For holding up a pair of pants!",
    "What do you call a factory that makes okay products? — A satisfactory!",
    "Why did the coffee file a police report? — It got mugged!",
    "What's the difference between a snowman and a snowwoman? — Snowballs!",
    "Why don't ants get sick? — Because they have little anty-bodies!",
    "What do you call a lazy kangaroo? — A pouch potato!",
    "Why did the tomato turn red? — Because it saw the salad dressing!"
  ],

  office: [
    "Why did the employee get fired from the calendar factory? — He took a day off!",
    "What's the best way to watch a fly fishing tournament? — Live stream!",
    "Why don't managers ever get cold? — They're surrounded by yes-men!",
    "What do you call a meeting that could have been an email? — Every meeting!",
    "Why did the PowerPoint cross the road? — To get to the other slide!",
    "What's a computer's favorite snack? — Microchips!",
    "Why was the spreadsheet always stressed? — Too many cells!",
    "What do you call an office worker who brings a ladder? — Highly motivated!",
    "Why don't keyboards ever get tired? — They always get a shift!",
    "What's the difference between a cat and a comma? — A cat has claws at the end of paws, and a comma is a pause at the end of a clause!",
    "Why did the email go to therapy? — It had attachment issues!",
    "What do you call a printer that can sing? — A Dell!",
    "Why was the boss always calm during storms? — He knew how to weather the situation!",
    "What's an accountant's favorite type of music? — Spread-sheets!",
    "Why don't office plants ever get promoted? — They're rooted in their position!",
    "What do you call a meeting room full of lawyers? — A law suit!",
    "Why did the stapler break up with the hole punch? — It was a binding relationship!",
    "What's the most organized office supply? — A filing cabinet!",
    "Why don't copiers ever get sick? — They always make copies of themselves!",
    "What do you call a very small office? — A cubicle!"
  ],

  animals: [
    "What do you call a sleeping bull? — A bulldozer!",
    "Why don't elephants use computers? — They're afraid of the mouse!",
    "What do you call a fish with two knees? — A two-knee fish!",
    "Why don't cats play poker in the jungle? — Too many cheetahs!",
    "What do you call a bear in the rain? — A drizzly bear!",
    "Why don't dogs make good DJs? — Because they have ruff beats!",
    "What do you call a pig that does karate? — A pork chop!",
    "Why don't elephants use elevators? — They prefer the stairs trunk!",
    "What do you call a cow that can play music? — A moo-sician!",
    "Why don't fish pay taxes? — Because they live in schools!",
    "What do you call a sheep with no legs? — A cloud!",
    "Why don't penguins fly? — Because they're not tall enough to be pilots!",
    "What do you call a duck that gets all A's? — A wise quacker!",
    "Why don't lions eat fast food? — Because they can't catch it!",
    "What do you call a rabbit that tells jokes? — A funny bunny!",
    "Why don't birds need to go to school? — Because they already tweet!",
    "What do you call a horse that lives next door? — A neigh-bor!",
    "Why don't cats ever win races? — Because they always paws at the finish line!",
    "What do you call a snake that works for the government? — A civil serpent!",
    "Why don't spiders go to school? — Because they learn everything on the web!",
    "What do you call a lazy dog? — A bull-dozer!",
    "Why don't kangaroos make good comedians? — Their jokes are too jumpy!",
    "What do you call a fish wearing a crown? — Your royal high-ness!",
    "Why don't zebras ever win at hide and seek? — Because they're always spotted!",
    "What do you call a turtle that flies? — A shell-icopter!"
  ],

  food: [
    "Why did the banana go to the doctor? — It wasn't peeling well!",
    "What do you call a fake noodle? — An impasta!",
    "Why did the cookie go to the doctor? — Because it felt crumbly!",
    "What do you call a sad strawberry? — A blueberry!",
    "Why don't eggs tell jokes? — They'd crack each other up!",
    "What's orange and sounds like a parrot? — A carrot!",
    "Why did the tomato turn red? — Because it saw the salad dressing!",
    "What do you call a nosy pepper? — Jalapeño business!",
    "Why don't melons get married? — Because they cantaloupe!",
    "What do you call cheese that isn't yours? — Nacho cheese!",
    "Why did the coffee file a police report? — It got mugged!",
    "What do you call a potato that's reluctant to jump? — A hesi-tater!",
    "Why don't bread jokes ever get old? — Because they're always fresh!",
    "What do you call a pickle that draws? — A dill-ustrator!",
    "Why was the corn embarrassed? — Because it was all ears!",
    "What do you call a grumpy cow? — Moody!",
    "Why don't onions ever win arguments? — They make everyone cry!",
    "What do you call a fish sandwich that's been blessed? — Holy mackerel!",
    "Why did the grape stop in the middle of the road? — Because it ran out of juice!",
    "What do you call a chicken that tells jokes? — A comedi-hen!",
    "Why don't lemons ever feel lonely? — Because they come in bunches!",
    "What do you call a sleeping pizza? — A PIZZZZa!",
    "Why did the mushroom go to the party? — Because he was a fungi!",
    "What do you call a cow that works as a gardener? — A lawn moo-er!",
    "Why don't burgers ever get cold? — Because they're well-done!"
  ],

  travel: [
    "Why don't bicycles ever get tired? — Because they're two-wheeled!",
    "What do you call a car that's been in an accident? — A car-wreck!",
    "Why did the airplane break up with the helicopter? — Because it was a whirly relationship!",
    "What do you call a train that sneezes? — Achoo-choo train!",
    "Why don't boats ever get seasick? — Because they're always on deck!",
    "What do you call a motorcycle that can't start? — A Harley-Davidson't!",
    "Why did the bus driver quit? — He was tired of people talking behind his back!",
    "What do you call a taxi that's always late? — A slow cab!",
    "Why don't submarines ever get depressed? — Because they stay above water!",
    "What do you call a car made of sponges? — A soft-top!",
    "Why did the traffic light turn red? — You would too if you had to change in the middle of the street!",
    "What do you call a sleeping truck? — A dozer!",
    "Why don't rockets ever get lonely? — Because they're always launching relationships!",
    "What do you call a bike that can't stand up? — Two-tired!",
    "Why did the car go to therapy? — It had too many miles on it!",
    "What do you call a train conductor who's also a musician? — A band leader!",
    "Why don't airplanes ever get jealous? — Because they're above it all!",
    "What do you call a boat that lies? — A fib-er-glass!",
    "Why did the mechanic sleep under the car? — Because he wanted to get up oily!",
    "What do you call a car that's also a detective? — Sherlock Homes!",
    "Why don't maps ever get lost? — Because they know where they are!",
    "What do you call a suitcase that's always full? — Packed with personality!",
    "Why did the passport go to school? — To get stamped with knowledge!",
    "What do you call a hotel that's always busy? — Fully booked!",
    "Why don't compasses ever get dizzy? — Because they always know which way is north!",
    "What do you call a vacation that's too short? — A weekend!",
    "Why did the tourist bring a ladder? — Because they heard the sights were breathtaking!",
    "What do you call a cruise ship that's also a library? — A book-ing!",
    "Why don't airports ever get tired? — Because they're always terminal!",
    "What do you call a road trip with no destination? — An adventure!"
  ],

  sports: [
    "Why did the golfer bring two pairs of pants? — In case he got a hole in one!",
    "What do you call a basketball player who misses all his shots? — Nothing but air!",
    "Why don't football players ever get cold? — Because they have fans!",
    "What do you call a tennis player who never wins? — A has-been!",
    "Why did the runner quit the race? — He was tired of running in circles!",
    "What do you call a boxer who works at a library? — A bookkeeper!",
    "Why don't baseball players ever get lost? — Because they know where home is!",
    "What do you call a swimmer who can't swim? — A sinker!",
    "Why did the soccer ball go to the doctor? — Because it was deflated!",
    "What do you call a yoga instructor who can't bend? — Inflexible!",
    "Why don't cyclists ever get tired? — Because they're always spinning!",
    "What do you call a skier who's always falling? — A slope-er!",
    "Why did the gym close down? — It just didn't work out!",
    "What do you call a weightlifter who can't lift? — A lightweight!",
    "Why don't marathoners ever give up? — Because they go the distance!",
    "What do you call a hockey player who's always cold? — A puck-sicle!",
    "Why did the athlete bring a ladder to the game? — Because he wanted to reach new heights!",
    "What do you call a coach who's always yelling? — A loud speaker!",
    "Why don't track runners ever get lost? — Because they stay on track!",
    "What do you call a team that never wins? — The underdogs!"
  ],

  school: [
    "Why did the math book look so sad? — Because it had too many problems!",
    "What's a math teacher's favorite place in NYC? — Times Square!",
    "Why don't students ever trust stairs? — Because they're always up to something!",
    "What do you call a teacher who never frowns? — A geometry teacher, because they always have acute angles!",
    "Why was the history book always tired? — Because it had too many dates!",
    "What do you call a student who's good at everything? — A know-it-all!",
    "Why did the pencil go to school? — To get sharp!",
    "What's a librarian's favorite type of music? — Heavy metal, because of all the bookends!",
    "Why don't chemistry students ever get bored? — Because they have all the right reactions!",
    "What do you call a classroom full of kids with runny noses? — A snot fest!",
    "Why was the physics teacher always happy? — Because she had good energy!",
    "What do you call a student who's always late? — Tardy!",
    "Why did the computer go to school? — To get programmed!",
    "What's an English teacher's favorite breakfast? — Synonym rolls!",
    "Why don't art students ever get lost? — Because they always draw a map!",
    "What do you call a music teacher who can't sing? — A conductor!",
    "Why was the geography teacher always calm? — Because she knew where she stood!",
    "What do you call a PE teacher who never exercises? — A coach potato!",
    "Why did the school bell go to therapy? — Because it was tired of being rung out!",
    "What's a principal's favorite type of music? — School rock!"
  ],

  family: [
    "Why don't parents ever win arguments with teenagers? — Because teens have too many apps!",
    "What do you call a mom who can fix anything? — A mother-in-wrench!",
    "Why did the dad joke go to therapy? — Because it was feeling pun-der appreciated!",
    "What do you call a baby potato? — A small fry!",
    "Why don't kids ever clean their rooms? — Because they're still growing into it!",
    "What do you call a grandpa who can dance? — A hip-hop grandpa!",
    "Why did the family go to the bank? — To get their interest!",
    "What do you call a mom who's also a detective? — Sherlock Homes!",
    "Why don't siblings ever agree? — Because they're always fighting for attention!",
    "What do you call a dad who's lost his car? — A taxi!",
    "Why did the baby corn call his dad? — Pop corn!",
    "What do you call a family of peppers? — A hot family!",
    "Why don't parents ever get tired of their kids? — Because love never sleeps!",
    "What do you call a mom who works at a bakery? — Bread winner!",
    "Why did the family tree go to the doctor? — Because it had bad roots!",
    "What do you call a dad who tells too many jokes? — A pun-isher!",
    "Why don't children ever win hide and seek? — Because good parents always find them!",
    "What do you call a grandmother who can rap? — Grammy!",
    "Why did the family go camping? — Because they wanted to branch out!",
    "What do you call a house full of teenagers? — A zoo!"
  ],

  tech: [
    "Why did the smartphone go to glasses? — Because it lost its contacts!",
    "What do you call a computer that sings? — A Dell!",
    "Why don't robots ever get tired? — Because they recharge their batteries!",
    "What do you call a tablet that can't work? — An iPad-dle!",
    "Why did the WiFi break up with the ethernet? — Because it wanted to be wireless!",
    "What do you call a phone that's always ringing? — Popular!",
    "Why don't TVs ever get hungry? — Because they're always full of channels!",
    "What do you call a camera that can't take pictures? — Focused on other things!",
    "Why did the battery go to the doctor? — Because it was drained!",
    "What do you call a smart TV that's not smart? — Just a TV!",
    "Why don't headphones ever get into arguments? — Because they're good listeners!",
    "What do you call a mouse that can't click? — Quiet!",
    "Why did the keyboard break up with the mouse? — Because they weren't clicking!",
    "What do you call a printer that works? — A miracle!",
    "Why don't speakers ever whisper? — Because they're always loud and clear!",
    "What do you call a phone charger that doesn't work? — Useless!",
    "Why did the laptop go to sleep? — Because it was tired of working!",
    "What do you call a GPS that's lost? — Ironic!",
    "Why don't emails ever get lost? — Because they know their address!",
    "What do you call social media without friends? — Anti-social media!"
  ],

  music: [
    "Why don't pianos ever get sick? — Because they have good keys to health!",
    "What do you call a guitar that can't tune itself? — Out of order!",
    "Why did the musician break up with his metronome? — Because it was too controlling!",
    "What do you call a singer who can't hit high notes? — A low performer!",
    "Why don't drums ever get tired? — Because they have good rhythm!",
    "What do you call a violin that's always in tune? — Perfect pitch!",
    "Why did the band break up? — Because they couldn't find their harmony!",
    "What do you call a DJ who plays the same song? — A broken record!",
    "Why don't musicians ever get lost? — Because they always follow the beat!",
    "What do you call a song that everyone knows? — A classic!",
    "Why did the microphone go to therapy? — Because it had feedback issues!",
    "What do you call a concert with no audience? — Practice!",
    "Why don't headphones ever get jealous? — Because they're always plugged in!",
    "What do you call a musician who's always late? — Behind the beat!",
    "Why did the radio go to school? — To improve its reception!",
    "What do you call a piano without keys? — A coffee table!",
    "Why don't singers ever get cold? — Because they have warm voices!",
    "What do you call a band that only plays in the shower? — Clean music!",
    "Why did the CD go to the doctor? — Because it had a scratch!",
    "What do you call music played by fish? — Something's fishy!"
  ],

  weather: [
    "Why don't clouds ever get speeding tickets? — Because they're always drifting!",
    "What do you call rain that's too lazy to fall? — Mist!",
    "Why did the sun go to school? — To get brighter!",
    "What do you call snow that's not cold? — Water!",
    "Why don't hurricanes ever get dizzy? — Because they're used to spinning!",
    "What do you call wind that tells jokes? — A breeze-y comedian!",
    "Why did the rainbow go to art school? — To learn about colors!",
    "What do you call lightning that's always on time? — Punctual!",
    "Why don't trees ever get haircuts? — Because they like their natural look!",
    "What do you call a flower that runs? — A daisy chain!",
    "Why did the mountain go to therapy? — Because it had peak performance anxiety!",
    "What do you call a river that's always happy? — A jolly stream!",
    "Why don't deserts ever get thirsty? — Because they're used to being dry!",
    "What do you call an ocean that's always calm? — Pacific!",
    "Why did the forest go to the doctor? — Because it was feeling a little green!",
    "What do you call a beach without sand? — Rocky!",
    "Why don't stars ever feel lonely? — Because they're always in clusters!",
    "What do you call the moon when it's shy? — A new moon!",
    "Why did the volcano go to anger management? — Because it kept erupting!",
    "What do you call grass that's always complaining? — Whiny weeds!"
  ],

  holidays: [
    "Why was the Christmas tree bad at knitting? — Because it kept dropping its needles!",
    "What do you call a Halloween costume that's too small? — A tight fit!",
    "Why don't Easter eggs ever get lost? — Because they're always hidden in plain sight!",
    "What do you call a Valentine's Day card that's late? — Better late than never!",
    "Why did the turkey join the band? — Because it had the drumsticks!",
    "What do you call a New Year's resolution that works? — A miracle!",
    "Why don't birthday candles ever get old? — Because they're always getting blown out!",
    "What do you call a graduation cap that fits perfectly? — A perfect match!",
    "Why did the Fourth of July fireworks go to school? — To learn how to be more explosive!",
    "What do you call a Mother's Day gift that's handmade? — Priceless!",
    "Why don't Father's Day ties ever go out of style? — Because dads never throw them away!",
    "What do you call a wedding that's perfectly planned? — A dream come true!",
    "Why did the anniversary couple go dancing? — Because they wanted to celebrate in style!",
    "What do you call a party that never ends? — A celebration!",
    "Why don't gift wrapping papers ever get wrinkled? — Because they're under pressure!",
    "What do you call a costume party where everyone dresses the same? — Uniform fun!",
    "Why did the birthday cake go to the gym? — Because it wanted to be in layers!",
    "What do you call a holiday that's always sunny? — Perfect weather!",
    "Why don't party balloons ever get sad? — Because they're always uplifting!",
    "What do you call a celebration without cake? — Incomplete!"
  ],
};

const allJokes = Object.values(jokeCategories).flat();

const jokeHistory = new Set();
const MAX_HISTORY_SIZE = 50;

const flagsDef = defineFlags([
  {
    name: 'category',
    aliases: ['c'],
    type: 'string',
    description: 'Category of jokes to tell',
    values: ['programming', 'general', 'office', 'animals', 'food', 'travel', 'sports', 'school', 'family', 'tech', 'music', 'weather', 'holidays', 'all'],
    default: 'all'
  },
  {
    name: 'count',
    aliases: ['n'],
    type: 'number',
    description: 'Number of jokes to tell (1-10)',
    default: 1
  },
  {
    name: 'list',
    aliases: ['l'],
    type: 'boolean',
    description: 'List all available categories',
    default: false
  },
  {
    name: 'interactive',
    aliases: ['i'],
    type: 'boolean',
    description: 'Interactive mode - press Enter for more jokes',
    default: false
  },
  {
    name: 'search',
    aliases: ['s'],
    type: 'string',
    description: 'Search for jokes containing specific keywords'
  },
  {
    name: 'no-repeat',
    aliases: ['nr'],
    type: 'boolean',
    description: 'Avoid repeating recent jokes',
    default: false
  },
  {
    name: 'reset-history',
    aliases: ['rh'],
    type: 'boolean',
    description: 'Reset joke history',
    default: false
  },
  {
    name: 'stats',
    type: 'boolean',
    description: 'Show statistics about available jokes',
    default: false
  },
  {
    name: 'format',
    aliases: ['f'],
    type: 'string',
    description: 'Output format',
    values: ['default', 'simple', 'numbered'],
    default: 'default'
  },
  {
    name: 'mood',
    aliases: ['m'],
    type: 'string',
    description: 'Filter jokes by mood/difficulty',
    values: ['simple', 'clever', 'family', 'work'],
    default: 'all'
  }
]);

const initJokeCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "joke",
    description: "Tell random jokes from 500+ collection with various categories for everyone!",
    flags: flagsDef,
    handler: async (args, ctx) => {
      const { flags } = args;

      if (flags['reset-history']) {
        jokeHistory.clear();
        ctx.io.print("🗑️ Joke history cleared!");
        return;
      }

      if (flags.stats) {
        const totalJokes = allJokes.length;
        const categoryStats = Object.entries(jokeCategories)
          .map(([cat, jokes]) => `  ${cat}: ${jokes.length} jokes`)
          .join('\n');

        ctx.io.print(`📊 Joke Statistics:\n\nTotal jokes: ${totalJokes}\nCategories:\n${categoryStats}\n\nHistory size: ${jokeHistory.size}/${MAX_HISTORY_SIZE}`);
        return;
      }

      if (flags.list) {
        const categories = Object.keys(jokeCategories);
        const categoryList = categories.map(cat => {
          const count = jokeCategories[cat].length;
          const description = getCategoryDescription(cat);
          return `  ${cat} (${count}) - ${description}`;
        }).join('\n');

        ctx.io.print(`📂 Available categories:\n\n${categoryList}\n\nUse --category or -c to specify a category.\nExample: joke -c animals -n 3`);
        return;
      }

      if (flags.search) {
        const searchTerm = flags.search.toLowerCase();
        const matchingJokes = allJokes.filter(joke =>
          joke.toLowerCase().includes(searchTerm)
        );

        if (matchingJokes.length === 0) {
          ctx.io.print(`🔍 No jokes found containing "${flags.search}"`);
          return;
        }

        ctx.io.print(`🔍 Found ${matchingJokes.length} joke(s) containing "${flags.search}":\n`);
        matchingJokes.slice(0, 10).forEach((joke, index) => {
          const formattedJoke = formatJoke(joke, flags.format, index + 1);
          ctx.io.print(formattedJoke);
        });

        if (matchingJokes.length > 10) {
          ctx.io.print(`\n... and ${matchingJokes.length - 10} more! Try a more specific search.`);
        }
        return;
      }

      let jokesPool;
      if (flags.category === 'all') {
        jokesPool = allJokes;
      } else {
        jokesPool = jokeCategories[flags.category] || jokeCategories.general;
      }

      if (flags.mood && flags.mood !== 'all') {
        jokesPool = filterJokesByMood(jokesPool, flags.mood);
      }

      const count = Math.max(1, Math.min(10, flags.count));

      if (flags.interactive) {
        await handleInteractiveMode(ctx, jokesPool, flags);
        return;
      }

      const jokes = getRandomJokes(jokesPool, count, flags['no-repeat']);

      if (count === 1) {
        ctx.io.print(formatJoke(jokes[0], flags.format, 1));
      } else {
        const categoryName = flags.category !== 'all' ? flags.category + ' ' : '';
        ctx.io.print(`🎭 Here are ${jokes.length} ${categoryName}jokes:\n`);
        jokes.forEach((joke, index) => {
          const formattedJoke = formatJoke(joke, flags.format, index + 1);
          ctx.io.print(formattedJoke);
        });
      }

      if (flags['no-repeat']) {
        jokes.forEach(joke => {
          jokeHistory.add(joke);
          if (jokeHistory.size > MAX_HISTORY_SIZE) {
            const firstJoke = jokeHistory.values().next().value;
            jokeHistory.delete(firstJoke);
          }
        });
      }
    }
  });
};

function getRandomJokes(jokesPool: string[], count: number, avoidRepeats: boolean) {
  let availableJokes = jokesPool;

  if (avoidRepeats && jokeHistory.size > 0) {
    availableJokes = jokesPool.filter(joke => !jokeHistory.has(joke));

    if (availableJokes.length === 0) {
      availableJokes = jokesPool;
    }
  }

  const selectedJokes = [];
  const usedIndices = new Set();

  for (let i = 0; i < count && i < availableJokes.length; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * availableJokes.length);
    } while (usedIndices.has(randomIndex) && usedIndices.size < availableJokes.length);

    usedIndices.add(randomIndex);
    selectedJokes.push(availableJokes[randomIndex]);
  }

  return selectedJokes;
}

function formatJoke(joke: string, format: "default" | "simple" | "numbered", number: number) {
  switch (format) {
    case 'simple':
      return joke;
    case 'numbered':
      return `${number}. ${joke}`;
    default:
      return `😄 ${joke}`;
  }
}

function getCategoryDescription(category: string): string {
  const descriptions = {
    programming: "For developers and tech enthusiasts",
    general: "Universal jokes everyone can enjoy",
    office: "Workplace humor for professionals",
    animals: "Funny jokes about our furry friends",
    food: "Delicious humor about cooking and eating",
    travel: "Transportation and journey jokes",
    sports: "Athletic and fitness humor",
    school: "Educational jokes for students and teachers",
    family: "Wholesome family-friendly humor",
    tech: "Simple technology jokes for everyone",
    music: "Musical jokes and puns",
    weather: "Nature and weather humor",
    holidays: "Seasonal and celebration jokes"
  };
  return descriptions[category] || "Miscellaneous humor";
}

function filterJokesByMood(jokes: string[], mood: string): string[] {
  switch (mood) {
    case 'simple':
      return jokes.filter(joke => joke.length < 100 && !joke.includes('—'));
    case 'clever':
      return jokes.filter(joke => joke.includes('—') || joke.includes('?'));
    case 'family':
      return jokes.filter(joke =>
        !joke.toLowerCase().includes('broke') &&
        !joke.toLowerCase().includes('quit') &&
        !joke.toLowerCase().includes('fired')
      );
    case 'work':
      return jokes.filter(joke =>
        joke.toLowerCase().includes('work') ||
        joke.toLowerCase().includes('job') ||
        joke.toLowerCase().includes('office') ||
        joke.toLowerCase().includes('boss')
      );
    default:
      return jokes;
  }
}

async function handleInteractiveMode(ctx: CommandContext, jokesPool: string[], flags: any) {
  const categoryName = flags.category !== 'all' ? ` ${flags.category}` : '';
  ctx.io.print(`🎭 Interactive${categoryName} joke mode! Press Enter for more jokes, type 'quit' to exit.\n`);

  let jokeCount = 0;

  while (true) {
    const joke = getRandomJokes(jokesPool, 1, flags['no-repeat'])[0];
    jokeCount++;

    ctx.io.print(`[${jokeCount}] ${formatJoke(joke, flags.format, jokeCount)}\n`);

    if (flags['no-repeat']) {
      jokeHistory.add(joke);
      if (jokeHistory.size > MAX_HISTORY_SIZE) {
        const firstJoke = jokeHistory.values().next().value;
        jokeHistory.delete(firstJoke);
      }
    }

    ctx.io.print("Press Enter for another joke, or type 'quit' to exit:");

    try {
      const input = await ctx.io.awaitInput();
      if (input.toLowerCase().trim() === 'quit' || input.toLowerCase().trim() === 'q') {
        const totalJokes = Object.values(jokeCategories).flat().length;
        ctx.io.print(`Thanks for laughing! You heard ${jokeCount} jokes out of ${totalJokes} available. 😊`);
        break;
      }
    } catch (error) {
      ctx.io.print("Interactive mode ended.");
      break;
    }
  }
}

export { initJokeCommand };