import { siteContent } from "./siteContent";

export interface PartnerQuestion {
  question: string;
  answer: string[];
}

export type ProfileParagraph = string | Array<string | { text: string; href: string }>;
export type ProfileSocialPlatform = "linkedin" | "x";

export interface ProfileSocial {
  platform: ProfileSocialPlatform;
  href: string;
  ariaLabel: string;
}

export interface PartnerProfile {
  slug: string;
  legacySlug: string;
  role?: string;
  name: string;
  company: string;
  photo: string;
  sourceUrl: string;
  profileTitle: string;
  profile: ProfileParagraph[];
  questions?: PartnerQuestion[];
  recommendations?: string[];
  socials?: ProfileSocial[];
  companiesBuilt: string[];
}

const profileContent: Omit<PartnerProfile, "legacySlug" | "role" | "company" | "photo">[] = [
  {
    slug: "max-hsieh",
    name: "Max Hsieh",
    sourceUrl: "https://www.886studios.com/about/max-hsieh",
    profileTitle: "About Max",
    profile: [
      `Max Hsieh is a technology entrepreneur and product & engineering leader with over a decade of experience building products from the ground up. He was the Co-founder and Chief Technology Officer of Forma, the flexible benefits platform that helps modern companies scale global benefits programs.`,
      `Max is well versed in compliance, security, banking, and complex enterprise requirements that underpins any platform handling sensitive financial data at scale. That experience navigating regulated, high-stakes infrastructure is also what draws Max most to B2B, enterprise, and fintech companies.`,
      `Max also has a passion for working with startups and early-stage founders, and wants to help build a buzzing startup ecosystem in Taiwan.`,
    ],
    socials: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/max-hsieh-8045875a",
        ariaLabel: "Max Hsieh on LinkedIn",
      },
    ],
    companiesBuilt: [],
  },
  {
    slug: "patryk-chojecki",
    name: "Patryk Chojecki",
    sourceUrl: "https://www.886studios.com/about/patryk-chojecki",
    profileTitle: "About Patryk",
    profile: [
      `Patryk Chojecki is the Program Manager in charge of 886 Launchpad at 886 Studios. Originally from Poland, he has spent the past several years in Taipei working at the intersection of business, science, and venture capital.`,
      `He holds a degree from Jagiellonian University in Cracow and a master's from National Chengchi University, where he was a recipient of the Taiwan ICDF Scholarship.`,
      `Earlier in his career, he conducted research at Academia Sinica and worked at a cell and gene therapy startup accelerator, advising biotech startups on fundraising, market strategy, and international partnerships.`,
      `He brings this experience to building a cross-border ecosystem connecting founders, investors, and partners across Taiwan, APAC, and beyond.`,
    ],
    socials: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/patryk-chojecki/",
        ariaLabel: "Patryk Chojecki on LinkedIn",
      },
    ],
    companiesBuilt: [],
  },
  {
    slug: "carter-wang",
    name: "Carter Wang",
    sourceUrl: "https://www.886studios.com/about/carter-wang",
    profileTitle: "About Carter",
    profile: [
      `Carter Wang is a Venture Associate at 886 Studios, where he leads deal sourcing, researches and evaluates startups, and manages the founder pipeline for 886 Launchpad accelerator. He also oversees 886's content and social media presence, website, drives community building initiatives, and event programming in Taipei.`,
      `Before joining 886 Studios, Carter served as a Research Fellow at Contrary Research, writing investment memos on emerging startups, and was the Vice President and Head of the Venture Analyst team at Slug Fund at UC Santa Cruz, where he studied Business and Managerial Economics.`,
      [
        `Outside of work, Carter writes about technology, culture, and human nature in his Substack, `,
        { text: `flying Arrows`, href: "https://carterko.substack.com/" },
        `.`,
      ],
    ],
    socials: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/cartergrantwang/",
        ariaLabel: "Carter Wang on LinkedIn",
      },
      {
        platform: "x",
        href: "https://x.com/carterkowang",
        ariaLabel: "Carter Wang on X",
      },
    ],
    companiesBuilt: [],
  },
  {
    slug: "kai-huang",
    name: "Kai Huang",
    sourceUrl: "https://www.886studios.com/about/kai-huang",
    profileTitle: "Profile",
    profile: [
      `Kai has wanted to start his own company since adolescence, inspired by his father who had already started many businesses. After graduating from UC Berkeley, Kai planned to pursue an MBA before building his first startup. However, with the rise of the internet and the many opportunities that came along with it, Kai decided to take advantage of the timing and build his first company four years after college.`,
      `Several exits and hundreds of Angel investments later, Kai shares his story and what he looks for in a startup founder. He looks for intelligence, quick learning and adaptability, and receptiveness to feedback in startup founders. He also finds that successful startup founders are consistently good storytellers.`,
      `One of Kai's main goals is to help build a sustainable ecosystem of startups (like Silicon Valley) in Taiwan, with successful founders continuously giving back to the community.`,
    ],
    questions: [
      {
        question: "886: Why were you motivated to start your own company?",
        answer: [
          `Kai: “I’ve always wanted to start my own company, probably since junior high school or high school. I credit a lot of that to my dad; he started several businesses and would say things like ‘at some point in your you should start thinking about starting your own business so that you can do something for yourself and have better control over what you do.’”`,
        ],
      },
      {
        question: "886: What was your path?",
        answer: [
          `Kai: “I graduated college, and since I wanted to go back and get my MBA, I decided to do consulting, thinking that I would do it for a couple years and then go back to business school. This was the late 90’s, it was the age of the internet 1.0 and there was just so much activity, so I said I could always go back and get my MBA if I want, but this is an interesting opportunity from a timing perspective to start my own company.`,
          `My first startup was with my brother and two other cofounders and focused on server appliance software. After we sold it, we started to think about starting another company.`,
          `“The idea my brother and I had was renting video games online - think Netflix but for video games. At the time, it was a billion dollar industry, many VCs were interested, but there were no real video game rental companies, only movie rental companies.`,
          `We thought that if we could make things more convenient for the average video game consumer, we could take advantage of the huge rental industry and grow the whole pie, which was how we started on what later became RedOctane (acquired by Activision for $99.9M in 2006).”`,
        ],
      },
      {
        question: "886: What pivots did you make? Why did you decide to make those pivots?",
        answer: [
          `Kai: “At one point, we were renting Dance Dance Revolution, and many customers were asking us if we also rented or sold the dance pads. For months we told them no, we don’t touch hardware, all we do is rent games online, but when the market collapsed and we needed to generate revenue, we thought maybe there was an opportunity short term to earn money on the side.`,
          `“The dance pads start to sell well, and after about 4 months of selling dance pads that we got from a distributor, we got a lot of feedback and ideas from customers, and after another six months we decided to make our own dance pads. In retail, sometimes pricing can give a perception of quality, and it’s very easy to take the price down than to take the price up. So we decided to go up in price.`,
          `We launched our first product, it did really well, we built a really good reputation for ourselves, and we realized the high end market was a major area we could focus on.”`,
        ],
      },
      {
        question: "886: How do you manage decision-making?",
        answer: [
          `Kai: “I rarely go all in. I look at it as if you’re cooking and you’re juggling pans on a stove, and there are always three or four pans at a time, and it depends on which pan is in the front, which one is in the back, on the side… sometimes tasks have to be moved to the front, sometimes others are moved to the back burner or killed… it’s very rare that I say ‘everything dies, just focus on one pan.’ You just have to figure out how to manage it - focus is important.`,
          `You need to understand how to have focus but also keep things alive on the back burner.”`,
        ],
      },
    ],
    recommendations: [
      "CrunchBase",
      "TechCrunch",
      "Your network - staying current with industry news and learning from those who know more than you",
    ],
    socials: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/kai-huang-813142/",
        ariaLabel: "Kai Huang on LinkedIn",
      },
    ],
    companiesBuilt: ["Guitar Hero", "Red Octane", "Blue Goji", "Flash Bike"],
  },
  {
    slug: "joseph-hei",
    name: "Joseph Hei",
    sourceUrl: "https://www.886studios.com/about/joseph-hei",
    profileTitle: "Profile",
    profile: [
      `Joe had always wanted to start his own company, and personal experiences helped him realize his place in the baby products industry. He shares with us the story behind his inspiration for founding his first company, how he approaches product-market fit by thinking about “product-user fit,” and how to balance decisiveness with thoughtfulness in decision-making.`,
    ],
    questions: [
      {
        question: "886: What inspired Orbit Baby?",
        answer: [
          `Joe: “My ‘inspirational moment’ was when my older siblings were starting to have babies - I remember when my sister came to visit with my nephew and I had to interact with baby gear for the first time. Also, working at IDEO, I saw a lot of products across different industries, and my overall impression was that baby products kinda sucked! It seemed very backwards to me.`,
          `I had always wanted to start my own company, and so the baby products industry was intriguing to me because it seemed less competitive than others, and it just started from there.”`,
        ],
      },
      {
        question: "886: How did you find product-market fit?",
        answer: [
          `Joe: “I was very insistent on finding out what the business was like. Before even getting into product-market fit, I wanted to know how viable it was to get into this industry. I figured out that the baby industry was pretty viable to break into since there were lots of independent shops, no large corporations. So then we started doing prototypes, recruiting family and friends to interact with the prototype… I think in some ways product market fit is very mysterious.`,
          `I prefer the term product-user fit because it’s something you can get your hands around. Once you get product-user fit, you can then figure out what market those users belong to. So first, we wanted to know if there were users our product was useful for, and then we went into what market they represent.”`,
        ],
      },
      {
        question: "886: Did you have any mentors that taught you how it all works?",
        answer: [
          `Joe: “There are very few ‘out of nowhere’ founders. Usually there’s some background, some context, maybe parents who had their own businesses… Just being around family who are doing it, you pick things up. You have to see people doing it before you have the courage to do it.`,
          `So starting from the route, my parents have always been mentors for entrepreneurship, I also had friends at Stanford a couple years ahead of me - he had a lot of good insights like ‘don’t be so product focused, think abut the market and the business, etc.’ A lot of the projects I worked on at IDEO were also helpful.”`,
        ],
      },
      {
        question: "886: What do you look for in a founder?",
        answer: [
          `Joe: “People who are able to make decisions. Who will make the call. But I also don’t like overconfidence. I like people who have demonstrated thoughtfulness about their decisions. If you’ve talked to them, it’s obvious that they’ve looked at multiple sources of information, and they’ve synthesized multiple inputs and come out on the other side with something that is smart, and unexpected, and then makes a decision. I don’t like people who are decisive without really thinking through it.”`,
        ],
      },
    ],
    recommendations: ["How to Win Friends and Influence People by Dale Carnegie"],
    socials: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/joseph-hei/",
        ariaLabel: "Joseph Hei on LinkedIn",
      },
    ],
    companiesBuilt: ["Orbit Baby", "Speed Smith"],
  },
  {
    slug: "charles-huang",
    name: "Charles Huang",
    sourceUrl: "https://www.886studios.com/about/charles-huang",
    profileTitle: "Profile",
    profile: [
      `Charles is a co-founder of RedOctane, the company behind Guitar Hero. Most of his interests lie in hardware, and he serves on the board of various businesses as well as philanthropic groups for education and culture. He is currently a lecturer for entrepreneurship at his Alma Mater, UC Berkeley.`,
      `In our interview, he talks about his story and interests, as well as what he thinks made Guitar Hero a success and what other companies should do to find their own success.`,
    ],
    questions: [
      {
        question: "886: What are your recent interests?",
        answer: [
          `Charles: “Well some personal interests are that I’ve been running marathons recently, as well as a lot of travelling. I used to travel to go around and see different things but now I mostly travel to see people and spend time with friends and relatives. On the more professional side, I’m doing more philanthropy now. I’m on the board of several groups at Berkeley and at the Asian Art Museum. I also have been co-teaching a class on entrepreneurship at Berkeley for the past five years.”`,
        ],
      },
      {
        question: "886: How would you describe entrepreneurship?",
        answer: [
          `Charles: “At the most basic level, you are trying to create a product/service but at the same time build a company. There’s multiple dimensions to it. You have to first build a product that is successful. You also have to build a company that is successful. Sometimes those two don’t necessarily align. You are also trying to find the right employees, partners, vendors, investors, markets.”`,
        ],
      },
      {
        question: "886: What motivates you to become an entrepreneur?",
        answer: [
          `Charles: “I like to build interesting products, I think no matter what I work on it has to be intrinsically interesting. If somebody told me that my company would not be super successful- but I would be able to make games for the rest of my life and get my paycheck, I would still be happy doing it. One of the great things about making games, specifically Guitar Hero, is whenever somebody tells us they played our game, they’re usually smiling when they say it because it was fun to them.`,
          `And it’s very rewarding that we were able to bring that element of joy to their lives. There’s this reward for that which you wouldn’t get for doing something else.`,
        ],
      },
      {
        question: "886: What are elements that make a good or successful game?",
        answer: [
          `Charles: “What makes a game successful is different from what makes it good. I think that success is a completely different story. To build a good game, you need to build a world-class product. To be successful, you need to have a world-class product and a lot of luck.`,
          `When I was at Activision, the CMO once said: ‘we have 12 games at this company that are all pegged to be top 10 this year.’ But when you think about it, the math doesn’t really work out. How can you have 12 top 10 games in a year? What I think you can do is you can always make a good product. For a startup to be successful, they need to be able to make a world-class product. To me, that means top 3 in the industry. In tech, the number 1 and number 2 have a disproportionate market share and will survive.`,
          `Number 3 maybe survives. Everybody else is just waiting to get killed by 1 and 2. You need to be able to have a team that is capable of creating a world-class product in a specific category.`,
          `In our case, we specialized in making a hardware-software company in a time when many people didn’t do that. This was 15-16 years ago where you were either a hardware company or software company, not both. And it wasn’t until Apple came around and did both pretty well that people saw the value of doing both. But when we were doing it, I thought that our software couldn’t even compete with the software in the industry. Same with our hardware.`,
          `But since we were doing both, we were the best since there weren’t many other companies willing to try. And that gave us the shot to build something world-class.`,
          `In the games industry, it’s hard to be a monopoly. Like if you’re building an OS for mobile phones, it’s unlikely you can take down Apple or Android, there’s just no opportunity. But games can come and go, there will always be an opportunity to take down the top. Just like we did- we came out of nowhere to take the best selling game in 2007 and 2008. So for some industries like games, you have the opportunities, and in others you have no chance at all.`,
          `But what I like to emphasize over and over is that you have to build a great product. And whether or not it will be successful or not depends on luck. You need to find the right investors, customers, timing. If you can’t build a world-class product you have little chance at being successful.”`,
        ],
      },
      {
        question: "886: How do entrepreneurs overcome mental barriers, particularly in regards to funding?",
        answer: [
          `Charles: “Speaking from my experience with Guitar Hero, we were somewhat fortunate in regards to funding because we started in a time where VCs were just not looking to fund anything. This was during the Dotcom bust, and they weren’t investing in any startups. Because of that, it was easy to just give up on looking after 6-8 months, since nobody was ever going to invest in anything and we didn’t want to waste our time.`,
          `So we were able to build our company focusing specifically on what people would buy and how we would make money. Because of that we cut out a lot of useless stuff that we would have done and lost us money. That’s why I feel when a lot of startups raise money, it kind of clouds that clarity of what they need to do.`,
          `When we started, we did a lot of things that were not that innovative or exciting. When we started, we were selling dance pads for Dance Dance Revolution. People would tell us that there was no future in dance pads. And they were right, we weren’t stupid- but it made us money and helped to keep the company going. And while we’re selling we’re also learning things which can help us build the next product, then the next. Which eventually allowed us to build our own dance game and then Guitar Hero.`,
          `But when we started out our business wasn’t that flashy. We didn’t have the funding to build the things we thought people might want, so we had to get it right to keep the company going.`,
          `Silicon Valley has convinced the world that the way you run a startup is starting with an idea, then getting seed funding, then building something, then funding and scaling through VCs. But many people forget that it’s possible to build something on their own. I’ve found that a lot of entrepreneurs break rules in their industries- except when it comes to funding.`,
          `I always find it funny that they can find ways around market problems and product problems, but when it comes to funding, they all think the same which is to go to VCs for money.”`,
        ],
      },
      {
        question: "886: What are products or features of products that excite you?",
        answer: [
          `Charles: “A lot of what I like is building hardware. I’m on the board of a couple companies and one of the companies that fascinated me was working with Nintendo to create Mario Kart Live. It was an AR product, essentially the Mario Kart game but there was a physical drone with a camera attached that you played through. You could use your physical location and create your own race track and play Mario Kart.`,
          `It was probably the most sophisticated AR product that has been built to date, and I always think those are pretty interesting. AR isn’t too popular right now but it was interesting to see how they built it to craft a Mario Kart experience.”`,
        ],
      },
      {
        question: "886: How do you feel when all new startups are trying to implement the new technologies like web3, AI?",
        answer: [
          `Charles: “Many years ago there were two startups I was advising. One company was building a FitBit/health tracking tool for dogs that predicts potential health complications. When they went to the customers like veterinarians, they weren’t super excited because it would take years to collect all the data from the dogs to train their AI. It wasn’t useful to the customers yet, so they were told to come back when they had the technology.`,
          `But when the company went to VCs, the investors loved it because it involved AI, big data, pet health all that.`,
          `The other startup which was also pet related was taking pet medical records, which were on paper, and digitizing them using OCR to make it more accessible to owners and veterinarians. When they met with their customers, the vets were super excited because it saved them so much time. But the VCs didn’t care for it because they weren’t using interesting technologies. They were using OCR, so what’s to stop another company from competing in their market?`,
          `So for the first company, the customers didn’t really like it but the investors loved it. For the other company, the customers loved it but the investors not so much. And it made me realize that sometimes there’s a big disconnect between what investors want and what the customers want. Right now, AI is super hot to investors and a lot of people are getting funded, but many of these people actually have no idea what customers want.`,
          `I also see a lot of good companies with product-market fit but don’t have the new technologies, so investors aren’t interested.”`,
        ],
      },
      {
        question: "886: How do you see difference in growth between these two companies?",
        answer: [
          `Charles: “I would tell the company that is doing the pet medical records that they probably aren’t going to get that much funding, and need to figure out how to scale properly and naturally. They need to manage their costs, and can’t hire a ton of people. But as long as you are profitable, you will likely grow since people like your product. Later down the line when you have more profits, you can create more products that may be more attractive to investors.`,
          `So I think you can survive in both tracks, but you just need to know the best way to grow your company.”`,
        ],
      },
      {
        question: "886: What is the most difficult decision you had to make for your company?",
        answer: [
          `Charles: “By far the toughest thing that we ever had to do was layoffs. Particularly in 2008 when the economy crashed. It’s a very emotional process because these are the people that you hired, built a company with and you’ve gone through everything with. You’re probably very close since you’ve worked with them a long time and might know their family. And for me, the first time we had to do that in 2008, was really, really difficult.`,
          `We had to call people into meetings and take the time to talk with them about their situations, it was very emotional and personal. I had employees who had financial goals such as purchasing a house and we had to assess what we needed to do. These are some of the things where you think it’s just a business decision but when you know them as humans you know it’s much deeper than that. They had lives and invested their effort in the company and we invested in them.`,
          `So I would say that the hardest decisions are almost always the emotional and personal ones rather than for the business.”`,
        ],
      },
      {
        question: "886: What do you think about starting a company with a friend or relative considering you started a company with your brother?",
        answer: [
          `Charles: “I always start with the positive: we know exactly how each other thinks. Since we’ve known each other our entire lives, we know how each other thinks, we don’t need to guess, which is very helpful. There’s also trust between us, I trust what he’s going to do and he trusts what I’m going to do. The trouble comes from how we behaved with each other. If I was interacting with someone professionally and they said something not so smart, I would respond politely.`,
          `But if it was my brother Kai, I would say ‘that’s the stupidest thing I’ve ever heard.’ And then we would start arguing like we were twelve years old. There’s less formality between us and that sometimes would waste a lot of time when we got into arguments. It became a bit of a problem for business because we learned that when we disagreed, the rest of the company would just freeze since they didn’t want to disagree with either of us.`,
          `And so we had to learn and act more professionally since we realized that it also affects other people, usually negatively.”`,
        ],
      },
    ],
    socials: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/charleshuang2/",
        ariaLabel: "Charles Huang on LinkedIn",
      },
    ],
    companiesBuilt: ["Guitar Hero", "Red Octane", "Blue Goji", "Green Throttle Games (acquired by Google)"],
  },
  {
    slug: "jameson-hsu",
    name: "Jameson Hsu",
    sourceUrl: "https://www.886studios.com/about/jameson-hsu",
    profileTitle: "Profile",
    profile: [
      `Jameson Hsu, a Virginia Tech graduate, became an entrepreneur accidentally. He has since exited three startups (including one to Shanda Games and one to Facebook) and is working on his fourth as CEO / Co-Founder.`,
      `He shares with us how his first company was born from a fun after-hours project while working as a management consultant, and insights into the difficulties and challenges that come with founding a company in the present age. He shares on the importance of decision making and pushing past one’s imagined limits to achieve one’s full potential in a founder / CEO.`,
    ],
    questions: [
      {
        question: "886: Why were you motivated to start your own company?",
        answer: [
          `Jameson: “I actually got started by accident. After graduating, I was working in a big company doing management consulting, and I would work on these projects building websites after work with friends.`,
          `My friend actually initiated it - he was creative and said, ‘let’s work on this together.’ This was 1999, so it was the really early stages of the internet, and we had some press take note of our websites, and then some major companies started taking notice said, ‘hey, if you build these websites for us we’ll pay you money.’ We built it, it won a lot of awards, it got even more media attention, we got even more calls, and so we decided to quit and work on this full time.”`,
          `“I started just for fun. When you’re young, you should be doing stuff. So, why did I do that? I had nothing else to do. I guess I could have gone out, clubbing or whatever, but it was more fun building stuff.”`,
        ],
      },
      {
        question: "886: How has starting a company changed since the 90’s and early 2000’s?",
        answer: [
          `Jameson: “Well, let’s start with what hasn’t changed. The thing that has never changed is problem solving - the thing you’re creating is working to solve a problem. It’s how everything started back then, and it’s still how things start today. The thing that has changed is that it’s now a lot easier to start a company than it was back then. We used to have to buy servers, manage the servers, change out hard disks, buy electricity, buy data… now it’s much easier.`,
          `So now, if you have an idea, there’s probably someone who’s already doing it. Now, anyone with an idea can start a company. So now, the thing that’s different, good ideas are harder to come by. It’s harder to come by some unique idea. Back then, if you had an okay idea, you could build a company! Now, you really have to find a problem and a really really good solution that no has already thought of. There are two sides: back then, execution was much harder, idea was easy.`,
          `Now, the idea is really hard, and execution is not as hard. In English, we call it signal and noise: there’s a lot more noise now.”`,
        ],
      },
      {
        question: "886: Did you have any other ideas prior to starting Mochi?",
        answer: [
          `Jameson: “Um… no. That was pretty much it. But I spent a lot of time thinking about it. Some people might have a bunch of ideas and build MVPs and test them all out; I spend a lot of time thinking about what will work. I play with it in my head instead of trying to build it out.”`,
        ],
      },
      {
        question: "886: When did you have to make hard decisions about your company?",
        answer: [
          `Jameson: “Oh, every day. I think that’s the hardest part about being an entrepreneur - you have to make hard decisions every day. Whether you’re going to fire somebody, whether you’re going to hire somebody, every decision you make can make or break the company.`,
          `If you make one bad decision - if you have two features to build and you choose poorly, you could make the wrong choice; or if you spend half of the amount of money you have to hire someone, and that person doesn’t deliver, then you’ve wasted all that money. That’s the difference between entrepreneurs that succeed and don’t succeed: their ability to make decisions, and to make good decisions, and to make decisions quickly and decisively.”`,
        ],
      },
      {
        question: "886: What do you look for in a founder?",
        answer: [
          `Jameson: “I can tell just by talking to them how much horsepower they have. Looking at a car, you can’t tell how much horsepower it has, but when you hear the sound of the engine, you can hear ‘oh, this is a powerful engine.’ It’s the same thing with people: when you talk to them, you can tell that they can go far.`,
          `That’s why I bring people to the gym - when you go alone, it’s easy to be like ‘oh I’m so tired and I can’t do it any more.’ But when you go with a coach, with people pushing you to go harder, you realize ‘oh I actually did a lot more than I thought I could.’ I want people to understand that they can do more than they think they can. We’re all limited by our own mind.”`,
        ],
      },
    ],
    socials: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/jamesonhsu/",
        ariaLabel: "Jameson Hsu on LinkedIn",
      },
    ],
    companiesBuilt: ["Mochi Media", "WDDG"],
  },
  {
    slug: "kevin-lin",
    name: "Kevin Lin",
    sourceUrl: "https://www.886studios.com/about/kevin-lin",
    profileTitle: "About Kevin",
    profile: [
      `Kevin Lin is an experienced technology investor and entrepreneur with more than 20 years of operating and investment experience. Kevin is a Batch Partner at 886 Studios and Co-Founder and General Partner at Lifelike Capital, a leading early stage technology venture capital firm. Prior, Kevin was Co-Founder and COO of Twitch, the world’s leading live streaming gaming and community platform.`,
      `Under his leadership, Twitch brought live social video to hundreds of millions of people worldwide, enabling thousands of creators to build communities and make a living through live, shared experiences. Kevin led Twitch from inception to a dominant 90% market share, 2,000+ employees, $1.5B USD in revenue, and an acquisition by Amazon for $1B USD.`,
      `Kevin is also a Co-Founder of Lin Capital (predecessor to Lifelike Capital), former Chairman of the Board of OURA, Board Director for Krafton/PUBG, Co-Founder and CEO of Metatheory, Co-Founder of Gold House, and a prolific angel/venture capital investor. Kevin has led venture capital investments in top companies including Cruise Automation (the leading autonomous AI driving company, acquired by GM for $1B+ USD), Alto Pharmacy (latest value at $1B USD), OURA (latest value at $5B USD).`,
      `Kevin holds a Bachelors from Yale University.`,
    ],
    socials: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/kevinlin3/",
        ariaLabel: "Kevin Lin on LinkedIn",
      },
    ],
    companiesBuilt: ["Twitch", "Justin.tv", "Lifelike Capital", "Metatheory"],
  },
  {
    slug: "kevin-chou",
    name: "Kevin Chou",
    sourceUrl: "https://www.886studios.com/about/kevin-chou",
    profileTitle: "Profile",
    profile: [
      `Kevin has successfully founded and exited on three companies spanning crypto, gaming, and esports. His current interests are in Web3 and its fundamental technology and focus on decentralization. Originally from a finance background, he shares his initial motivation to start his own company as well as tips and insights into what makes a successful founder and company.`,
      `While he originally had financial goals for building his first company, he really enjoys the creative aspect and the people-oriented culture of a smaller company.`,
      `Despite having successfully started multiple companies, he still feels that finding product-market fit is the hardest step - there is no magic solution. He thinks the most successful startup founders are those that understand what investors want to invest in, and often have a history of overcoming significant challenges.`,
    ],
    questions: [
      {
        question: "886: Why were you motivated to start your own company?",
        answer: [
          `Kevin: “I've always cared about financial independence and making enough money so that I could do whatever I wanted without having to work for other people or companies I didn't want to. I thought doing a startup was a way to do that. I also really enjoyed the small company feel; I can talk to the customers, I know who’s making the product, I know who’s making the decisions.`,
          `I really liked the culture - I feel like I’m making an impact and I understand how the work I’m doing today fits into the mission of the overall company.”`,
        ],
      },
      {
        question: "886: How do you find product-market fit? What’s the secret sauce?",
        answer: [
          `Kevin: “Finding product market fit is the hardest part about founding a company. There’s no magic to product-market fit: founders just need to keep trying, building their expertise and accumulating experience, and if it takes off it takes off. There is no real metric by which to measure product-market fit, it just feels right.”`,
        ],
      },
      {
        question: "886: What does success look like to you?",
        answer: [
          `Kevin: “If you start a business for financial reasons and you achieve financial success, you need to replace that financial reason with something else that you care about. For me, building a new company and products is a creative process. Something I find a lot of joy in is starting with an idea and taking it and building a product, and then seeing how that product impacts people’s lives - there’s the human aspect to it.`,
          `There’s the feeling of ‘Okay, I created a company that employed a lot of people and allowed them to buy their first house, make their first downpayment, start their lives…’”`,
        ],
      },
      {
        question: "886: What are some characteristics of successful founders?",
        answer: [
          `Kevin: “The biggest thing is that these founders know how to build a big enough company that investors want to invest in. They follow the news (even just people on Twitter), meeting successful ex-founders, and networking with and engaging experienced individuals, and carefully considering feedback.”`,
          `“The one thing that I find more common than most things is that the founder has generally overcome some significant challenges in their lives, often unrelated to business. They were immigrants and had to deal with the challenges of being immigrants, they had to take care of their family because their parents died, or they have these amazing stories… they are just generally not normal people.”`,
        ],
      },
    ],
    recommendations: [
      "The Hard Thing About Hard Things by Ben Horowitz",
      "TechMeme",
      "Hacker News by Y Combinator",
    ],
    socials: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/kevinchou/",
        ariaLabel: "Kevin Chou on LinkedIn",
      },
    ],
    companiesBuilt: ["Rally", "Kabam", "Gen.G Esports"],
  },
  {
    slug: "chris-wang",
    name: "Chris Wang",
    sourceUrl: "https://www.886studios.com/about/chris-wang",
    profileTitle: "Profile",
    profile: [
      `Chris Wang completed his undergraduate studies at UC Berkeley and went on to earn a PhD in Computer Science from Carnegie Mellon University at just 22. To finance his startup ambitions, he built a profitable online poker bot and experimented with multiple concepts before shifting into gaming industry. He cofounded Playdom, which is acquired by Disney for $563M only two years later.`,
      `Today, Chris is a prolific angel investor with early bets on global names such as Alibaba, JD.com, ThunderCore and The Sandbox.`,
      `He shares with us his process of founding his first company and his best advice for aspiring founders - how to seize the time-opportunities, the importance of the ability to pivot and adapt to new situations, and how to find product market fit.`,
    ],
    questions: [
      {
        question: "886: Why were you motivated to start your own company?",
        answer: [
          `Chris: “Honestly, I just wanted to earn money and be able to retire early. I realized too that if I wanted to help the world, I needed to have money to be able to do that. I can put money into causes I care about, like investing in new startups that are changing the world. So I wanted to earn money young.”`,
        ],
      },
      {
        question: "886: How did you land on the idea for Playdom?",
        answer: [
          `Chris: “The most important thing when deciding on an idea is to take advantage of the “時機” time-opportunity. It wasn’t that I always wanted to do games - in fact, I didn’t even start with games. I happened to start right when Facebook opened up their platform - it was a way to create apps and get a lot of users quickly. I had a lot of ideas. I‘ve tried many ideas and finally landed on games. The most important thing is that you do something that people haven’t done before.`,
          `Many ideas failed before I landed on my success. If there’s an idea that could have been done 10 years ago, you have to ask yourself why it was never done before. It’s not likely that no one had thought of that idea before; it’s more likely that people tried and it failed, so you have to ask yourself why.”`,
          `“The choice is more important than the hard work. The key to my success was giving up the wrong choices, but you should only focus on one startup or one idea at one time. Each idea deserves your full and undivided attention - it’s not something you can do part time.”`,
        ],
      },
      {
        question: "886: What do you look for in a founder / startup?",
        answer: [
          `Chris: The most important is that their ‘觀念’ mindset is flexible. They need to be willing to pivot - this is super super important. I don’t like founders who are extremely set on one idea. And of course, they need to be collaborative and work well with team. Product-market fit is also important.`,
        ],
      },
      {
        question: "886: What advice do you have for finding product-market fit?",
        answer: [
          `Chris: “People will spend too much time thinking about product features, but they won’t know as much about their users. The most important thing before you make your product is to learn how users will react to it, so don’t be afraid of releasing an MVP early.”`,
          `“When we started, we didn’t even make games, we only made ads, and we had people do a response survey to the ads. Only after we felt like we had traction from the ads did we dare start making the actual game.”`,
          `“If you don’t have good marketing, what’s the point of having a good product? If you have an amazing product, but aren’t able to get the word out about it, there is no point in having a ground-breaking product. So if you can’t get traction, if you can’t get people’s attention, don’t bother continuing with making the product!”`,
        ],
      },
      {
        question: "886: What resources do Taiwanese startups need?",
        answer: [
          `Chris: “Taiwan startups care too much about product and accelerators. From the start, people need to start thinking about the global market. Taiwan’s market is too small - do not start from the Taiwan market. It’s so easy to figure out the Taiwan market and then not know what to do next. My favorite way is to start by directly thinking about the global market.”`,
        ],
      },
      {
        question: "886: What are your major pieces of advice for founders?",
        answer: [
          `Chris: “Find product-market fit early. Be willing to pivot. Instead of focusing on your competition, focus on your specific market and what your customers want. Choose an idea that was never possible to do before - seize the time-opportunity.”`,
        ],
      },
    ],
    socials: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/chris0804/",
        ariaLabel: "Chris Wang on LinkedIn",
      },
    ],
    companiesBuilt: ["Playdom", "ThunderCore"],
  },
  {
    slug: "jacob-hsu",
    name: "Jacob Hsu",
    sourceUrl: "https://www.886studios.com/about/jacob-hsu",
    profileTitle: "Profile",
    profile: [
      `Jacob Hsu fell into the startup ecosystem by accident. Originally from an investment banking background, Jacob started by simply wanting a way to make data-entry easier prior to the dawn of the internet. He created a web-crawler and data-scraper on a floppy disk, originally for personal use, but then later sold the intellectual property to a bank. However, when a bank expressed interest in his new technology, he sold the intellectual property at age 23.`,
      `Currently, he is interested in exploring the increase in Asian (and especially Taiwanese) representation and influence in the U.S., as well as traveling with his family.`,
    ],
    questions: [
      {
        question: "886: Why were you motivated to start your own company?",
        answer: [
          `Jacob: “It was an accident - I never planned to do a startup. In college I would have told you I’d be a banker for the rest of my life. During investment banking, there was no internet yet, no company email addresses, very difficult to access information. To do work you had to get physical copies of information. I knew you could get this information online and on databases, so I write a web-crawler and data scraper. I just wanted to be more efficient with data entry.`,
          `It was all on a floppy disk, just for me and my friends to use really. I was really surprised then when I was approached by a bank who was interested in buying what I had made, but since I didn’t have a company or anything, I just sold the bank the IP.”`,
        ],
      },
      {
        question: "886: What does your path look like?",
        answer: [
          `Jacob: “After I sold the IP to my first ‘company’ in 1998, I went back to silicon valley and raised capital doing the same thing, just more polished, with a better business plan, better account aggregation, and 11 employees. I ended up exiting to a Japanese company 8 months in.”`,
          `“At this point, I’d done two startups (sort of) with two exits, and now I wanted to learn how to run a real company and manage real employees. I had connections working at a company (the predecessor of Symbio) working on single code base for technology, and I was brought in as the “business guy.” At this company I established a lab in China, became CEO five years in, and the company has now grown up to 40,000 people, mostly working on R&D and engineering new technologies.`,
          `We exited Symbio to Bain in 2014.”`,
        ],
      },
      {
        question: "886: What are characteristics of successful startups?",
        answer: [
          `Jacob: “The Grind. There’s a difference between a “job” and being a CEO/founder. You have to let things cook under pressure and time and hard work. I’ve noticed that startups that start in bad times seem to succeed more than startups that start in good times, because it requires a certain mental fortitude that you don’t need in good times.`,
          `There are ways you can tell if a founder is grinding - what are they sacrificing to make it work? You can ask yourself, ‘What are you sacrificing to pursue this dream?’ You can get advisors, get consultants, but it’s the mental fortitude that makes a good entrepreneur. Founders also need to have a strong, authentic “why,” which is why you can’t just create a founder - there needs to be something intrinsic about them.`,
          `Also, it’s important to find product-market fit early.”`,
        ],
      },
      {
        question: "886: What is your advice to aspiring founders?",
        answer: [
          `Jacob: “First make friends, then find ways to do business - relationships first. Technology comes and goes, products come and go, it’s all fleeting. Never fall in love with products, or companies. Think of this as hobby, like I just love building stuff. Love the process, love the learning, always support other founders.”`,
        ],
      },
    ],
    socials: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/jacobhsu/",
        ariaLabel: "Jacob Hsu on LinkedIn",
      },
    ],
    companiesBuilt: ["Symbio", "Catalyte"],
  },
  {
    slug: "james-hong",
    name: "James Hong",
    sourceUrl: "https://www.886studios.com/about/james-hong",
    profileTitle: "Profile",
    profile: [],
    socials: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/thehonger/",
        ariaLabel: "James Hong on LinkedIn",
      },
    ],
    companiesBuilt: ["Hot or Not (acquired by Ruby)"],
  },
  {
    slug: "steven-chiang",
    name: "Steven Chiang",
    sourceUrl: "https://www.886studios.com/about/steven-chiang",
    profileTitle: "About Steven",
    profile: [
      `Steven Chiang is a prominent figure in the video game industry, known for his leadership roles at major gaming companies and his contributions to game development. He graduated from Columbia University with a Bachelor of Science in Electrical Engineering in 1993.`,
      `Chiang's career in gaming began when he co-founded Tiburon Entertainment in 1994. The company was later acquired by Electronic Arts (EA) in 1998, where Chiang continued to work in various leadership positions. At EA, he served as Senior Vice President and Group General Manager of EA Sports, overseeing the development of popular franchises including FIFA, Madden, NBA Live.`,
      `In 2010, Chiang joined Zynga as Studio President, where he led free-to-play game development across multiple platforms.`,
      `In November 2015, Chiang was appointed Executive Vice President of Worldwide Production and Studios at Warner Bros. Interactive Entertainment. In this position, he oversaw the development of games based on multiple franchises across all platforms, managing internal studios, external partnerships, quality assurance, and localization.`,
      `Most recently, in July 2021, Chiang became the President and Founder of Fortis Games. At Fortis, he focuses on building leadership culture and ensuring game delivery.`,
      `Throughout his career, Chiang has been credited on over 100 games, including major titles such as Mortal Kombat 11, Cyberpunk 2077, and Hogwarts Legacy. He has also served as a board member and advisor for several organizations, including The Topps Company, Virtuos, and Gamebasics.`,
    ],
    socials: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/steven-chiang-98689/",
        ariaLabel: "Steven Chiang on LinkedIn",
      },
    ],
    companiesBuilt: ["Tiburon (acquired by EA)", "Zynga"],
  },
  {
    slug: "timothy-chen",
    name: "Timothy Chen",
    sourceUrl: "https://www.886studios.com/about/timothy-chen",
    profileTitle: "Profile",
    profile: [
      `Tim started his career at VIA Technologies, a semiconductor company based in Taiwan. As the Head of Global Sales and Marketing, he soon began angel investing in various companies. He also founded CATCHPLAY, a media/film streaming, production, and distribution company based in Taiwan.`,
      `With a clear vision of what he wants to achieve, he shares with us how he came to be an angel investor and how his own interests have driven him to find and solve problems.`,
    ],
    socials: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/timothy-chen-0a5173/",
        ariaLabel: "Timothy Chen on LinkedIn",
      },
    ],
    questions: [
      {
        question: "886: What makes you want to become an angel investor?",
        answer: [
          `Tim: “When I was younger in my 20s to early 30s, I used to work Monday to Sunday 9am to midnight, super busy. And all of sudden the company I was at, VIA Technologies, grew to the point of stability. Next thing you know I was showing up at 9 and leaving at 5:30 and had a lot of time on my hands. I wanted to find something to do to fill this new time and I had heard about angel investing before but had no clue what it was.`,
          `So I decided to call some people I knew and told them that I wanted to be an angel investor. I ended up talking to various people and VCs and eventually made my first angel investment in a company with SBCVC. To me, I see angel investing as a hobby, not as a means to make money. I always felt that there were different things that I wanted to do so angel investing was something that allowed me to explore my interests. When I invest, the returns are secondary.`,
          `The problem the company solves and the solutions that are created are what interest me.”`,
        ],
      },
      {
        question: "886: What kind of startups are you interested in?",
        answer: [
          `Tim: “Every couple of years I have different interests. For example, my grandma had diabetes for many years. I took note of some of her symptoms, and when she passed, I wanted to look for and invest in a company that did diabetes management and chronic disease management. I was on the airplane talking to a longtime friend who was selling his company at the time when the opportunity presented itself. He told me that all four of his grandparents had passed from diabetes.`,
          `Considering he would also be susceptible to diabetes, I said ‘don’t you think you should do anything about it?’ He told me he had been thinking about it, and at that moment I offered to invest in him. I told him that I would put in my own money and find some other funding over the next few weeks if he wanted to run with his idea. He went through and created the company Health2Sync and it grew to be the most successful diabetes control management company in Taiwan and Japan.`,
          `Another problem I solved involves my dad. A while ago he got sick and became hard of hearing, so he got a hearing aid. He hated the hearing aid, and so did I because it worked terribly and every time we wanted to talk we would have to shout. I wanted to find a better solution, so I sat down with him and listed the problems: it was too big, the battery was hard to change, you had to go to the clinic to tune it, etc.`,
          `The next day I took his hearing aid to the lab and took it apart to figure out the design and how it could be changed. I sent out a few emails to people I knew and looking for anyone in Taiwan that was working on a hearing aid. But a key part of this search was that I wanted to find someone that had an incentive to make it work. If they were deaf, then you know that one they will work hard towards solving the problem and two they will understand the problem.`,
          `I found an engineer that was deaf who was working on a hearing aid and I looked at my list of problems to see if this hearing aid hit each one. It did, so I offered to put in my own money and find other funding as well. The company was RelaJet. Each of these companies that I’ve invested in fufills a need for me, either by resolving an issue or a personal interest.”`,
        ],
      },
      {
        question: "886: For startups who focus on Asia who want to expand to the US, what do they need to prepare?",
        answer: [
          `Tim: “It’s about the founder’s mindset and if they can change to an American mindset. If the founder is able to adapt, then they will be successful. Some founders may be more suited to a southeast Asian mindset and they should grow in Asia. It will always be dependent from person to person and founders should work with their strengths.`,
        ],
      },
      {
        question: "886: Why is advisory board important to a company? When should startup need to think about it?",
        answer: [
          `Tim: “Advisory boards could be good or bad for a company. Do you need five advisors or do you need one or two mentors that can really help you? Consider what is best for your company at the time and really think about what they will provide for you.”`,
        ],
      },
      {
        question: "886: What are the differences between founders and CEOs?",
        answer: [
          `Tim: “Founders can be good CEOs and founders can be bad CEOs. Sometimes founders will grow to become a good CEO. When you’re a founder, you’re doing everything in the company. When the company eventually grows with many employees and teams, the responsibilities and skillset of a founder changes and shifts towards big picture. For example, when VIA grew and I was starting to manage a large group of people, I noticed that most of what I was doing was resource allocation, budgeting, management.`,
          `It’s very different. Founders can be CEOs and CEOs can be founders, but they’re two different things. Sometimes founders that remain CEO will limit the company’s growth or performance because they simply don’t have the skillset for a high level management role.”`,
        ],
      },
      {
        question: "886: What would you say are some of your personal principles that primarily guide your investing?",
        answer: [
          `Tim: “I have a set of personal principles that guide my own life. I set my goals and I try to make sure I adhere to my values in my actions. But when I’m investing I mostly am looking at whether it interests me. Does it itch and do I want to scratch it? Kind of like a mosquito bite. If it doesn’t bother me I don’t give it attention but if it does then I’ll be thinking about it in the shower, the toilet, and it persists and lingers for a period of time before I eventually act.”`,
        ],
      },
    ],
    companiesBuilt: ["VIA Technologies", "CATCHPLAY"],
  },
  {
    slug: "phil-chen",
    name: "Phil Chen",
    sourceUrl: "https://www.886studios.com/about/phil-chen",
    profileTitle: "Profile",
    profile: [
      `Phil has spent much of his career working with hardware and technology, creating and building products such as the first Android phone, HTC Exodus, and the HTC Vive. He shares his journey and some of his learning through his experience of being an entrepreneur, an exit, and joining then eventually creating his own venture capital.`,
      `He gives insight into his basketball team, the New Taipei Kings as well as his energy company Cold Electric. He also shares his perspective on returning to entrepreneurship after working his way up to venture capital.`,
    ],
    questions: [
      {
        question: "886: What would you say are your interests at the moment?",
        answer: [
          `Phil: “I spend my week running the New Taipei Kings. It actually started after the success of P. League+. I saw the success and decided to create my own team to compete in the league so I’m the CEO and run the team. I sign the players, coaches and oversee the sales, marketing, and operations team. I knew nothing about how to build or start a team, but it came naturally to me as it was just like running a business/startup. You figure out what is needed, what is standard for contracts and you run with it.`,
          `I really wanted to do something different with the team, so we are actually the only team in Asia that fully represents the city and don’t have a major corporate sponsor. I don’t think having a corporate sponsor is the right way and I want to build the city/regional pride that makes sports so exciting. I want a team that represents the city and because of that we can do cooler things such as our partnership with Audi and Lululemon.”`,
          `“I also spend a lot of time as an executive advisor in a battery company in Taiwan called Cold Electric that provides battery energy storage for homes, and buildings. I’m a Bitcoin fanatic and have my own mining rigs, and when I learned about the energy consumption of Bitcoin I explored cheaper and greener energy which soon got me into batteries. We’re working towards a more efficient and sustainable future utilizing a decentralized power grid.`,
          `We currently are working with a solar rooftop installer in California to deploy our batteries and want to expand across the US.”`,
        ],
      },
      {
        question: "886: In your career you have held various roles in the startup industry, what is your favorite/most enjoyable role and why?",
        answer: [
          `Phil: “It’s changed over the different stages of my life. When I was young I enjoyed being an entrepreneur. When I exited to a larger company, I really enjoyed that too. I went from being a corporate venture to angel seed investor to venture capital, and then to starting my own venture capital. I’ve enjoyed all of it, but the most surprising role that I enjoyed that I didn’t think I would enjoy as much as I did is building the New Taipei Kings.`,
          `Everything that I’ve built before has been in the tech space, which has naturally been international and global. It’s fun to feel like a global citizen and connected with other countries. But doing a basketball team based in Taiwan is local. Most people outside probably don’t care that much since it only involves Taiwan and is largely local. And I didn’t think I would really enjoy that since I’ve always been globally minded- maybe too much.`,
          `But I’ve enjoyed it immensely- building something local and seeing how the fans truly care and appreciate what you do for the city. I wouldn’t say it’s the most enjoyable, but definitely the most surprisingly enjoyable role. It’s really how we’ve been engaging with the local community that has been quite different.”`,
        ],
      },
      {
        question: "886: Do you have exits that you were a part of which were particularly significant to you in ways more than money?",
        answer: [
          `Phil: “This isn’t necessarily an exit but an event that took my career in a completely different direction. Back in 2014, my family and were living in Hong Kong. This was back when I was working on the Vive, and during this time I was doing demos of the product all around the world and was travelling almost a quarter million miles a year. I remember during this period, I was in Israel in a space that had been given to me by a fund that I had invested in to run demos.`,
          `The GP of that fund came in and told me ‘there’s a special guest here that wants to try out your VR headset today.’ We were fully packed, but I was still able to give her a demo. It turns out, she ran a venture fund in Hong Kong called Horizons Ventures. Long story short, I ended up working for her and became an investor. But what really was amazing was that their office in Hong Kong was just a five minute walk from where I lived.`,
          `And that was really, really what I needed at that time since I was travelling a lot and being so close gave me quality time with my family.”`,
        ],
      },
      {
        question: "886: What would you say are some of your personal principles that primarily guide your investing?",
        answer: [
          `Phil: “There’s a lot, but the one that I mainly look for is what I call the ‘persistence mileage.’ At its essence, its basically evaluating how far will this person go before they give up. Sometimes I ask the founder outright. How much pain and suffering are you willing to endure until you give up on this idea? Or are you going to persist no matter what. And you know, it’s not always certain. It’s kind of an intuition, a thought in the back of my mind when they’re pitching.`,
          `You ask them questions and probe them to see how much they’ve thought ahead. Are they an opportunist and take what they can? Are they a mercenary or missionary? Are they in it for the money or do they really believe in what they are saying? I believe all startup entrepreneurs should all be missionaries first. The successful founders are missionaries who hire the mercenaries to develop and scale. I’ve met a few people in their journey where I can tell they’re not gonna give up.`,
          `Like- I would be scared to compete with this type of person. They won’t give up fundraising, opportunities, absolutely nothing in order to execute their vision. They truly believe in what they’re pitching and their vision. Those are the people most likely to be successful.”`,
        ],
      },
      {
        question: "886: What would you say is the hardest challenge or period a founder faces when creating a startup for the first time?",
        answer: [
          `Phil: “One of the biggest challenges I see in almost every founder is in confidence or self doubt. When you start a company and 10 people tell you ‘no’ when you are trying to raise money, you still have the ‘yes’ in your mind. But if 50 people tell you ‘no’ then you just might start believing that. For example, Kevin Lin has his story where he had 100 ‘no’s before his first ‘yes’ and that’s really amazing belief and confidence in yourself. I’ve talked with many NBA trainers before.`,
          `When you want to determine the difference between a good and a great shooter it’s not in the technique, practice, or talent. They all have the same training and put in the same amount of work. What separates the great from the good is if they themselves believe they will make the shot. I’ve noticed especially in Taiwan that many founders lack this when they can and should be more confident.`,
          `They have the talent but are hindered by themselves, and they don’t believe that they can move to Silicon Valley and make it. They envision themselves but never actually take the leap and do so.”`,
        ],
      },
    ],
    socials: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/philchen777/",
        ariaLabel: "Phil Chen on LinkedIn",
      },
    ],
    companiesBuilt: ["HTC", "Cold Electric", "New Taipei Kings", "Race Capital", "Presence Capital"],
  },
];

// Directory and profile headers read the same identity fields from the roster.
const roster = [...siteContent.about.team, ...siteContent.about.partners];
const firstNameCounts = new Map<string, number>();
for (const person of profileContent) {
  const firstName = person.slug.split("-")[0];
  firstNameCounts.set(firstName, (firstNameCounts.get(firstName) ?? 0) + 1);
}

export const partnerProfiles: PartnerProfile[] = profileContent.map((profile) => {
  const person = roster.find((person) => person.name === profile.name);
  if (!person) throw new Error(`Missing team entry for ${profile.name}`);
  const firstName = profile.slug.split("-")[0];
  const socials: ProfileSocial[] | undefined = "linkedinUrl" in person ? [
    { platform: "linkedin", href: person.linkedinUrl, ariaLabel: `${person.name} on LinkedIn` },
    ...("xUrl" in person && person.xUrl ? [{ platform: "x" as const, href: person.xUrl, ariaLabel: `${person.name} on X` }] : []),
  ] : profile.socials;
  return {
    ...profile,
    legacySlug: profile.slug,
    slug: firstNameCounts.get(firstName) === 1 ? firstName : profile.slug,
    role: "role" in person ? person.role : undefined,
    company: "company" in person ? person.company ?? "" : "",
    photo: person.photo,
    socials,
  };
});

export const partnerProfileBySlug = new Map(partnerProfiles.map((profile) => [profile.slug, profile]));
export const partnerProfileByName = new Map(partnerProfiles.map((profile) => [profile.name, profile]));
