const venueTemplates = [
  { namePrefix: "Downtown", sports: ["Football", "Basketball", "Tennis"], indoor: true, imageKeyword: "soccer-field" },
  { namePrefix: "Riverside", sports: ["Tennis"], indoor: true, imageKeyword: "tennis-court" },
  { namePrefix: "Central", sports: ["Basketball"], indoor: true, imageKeyword: "basketball-court" },
  { namePrefix: "Olympic", sports: ["Swimming"], indoor: true, imageKeyword: "swimming-pool" },
  { namePrefix: "Greenfield", sports: ["Football", "Rugby"], indoor: false, imageKeyword: "football-stadium" },
  { namePrefix: "Elite", sports: ["Basketball", "Volleyball", "Badminton"], indoor: true, imageKeyword: "sports-gym" },
  { namePrefix: "Sunset", sports: ["Tennis", "Badminton"], indoor: false, imageKeyword: "tennis" },
  { namePrefix: "Metro", sports: ["Football", "Basketball"], indoor: true, imageKeyword: "indoor-sports" },
  { namePrefix: "Lakeside", sports: ["Swimming", "Volleyball"], indoor: false, imageKeyword: "volleyball-beach" },
  { namePrefix: "Urban", sports: ["Basketball", "Gym"], indoor: true, imageKeyword: "gym" },
  { namePrefix: "Premier", sports: ["Football"], indoor: false, imageKeyword: "soccer" },
  { namePrefix: "Pacific", sports: ["Swimming"], indoor: true, imageKeyword: "pool" },
  { namePrefix: "Highland", sports: ["Tennis", "Basketball"], indoor: true, imageKeyword: "sports-arena" },
  { namePrefix: "Coastal", sports: ["Volleyball", "Swimming"], indoor: false, imageKeyword: "beach-volleyball" },
  { namePrefix: "Summit", sports: ["Gym", "Basketball"], indoor: true, imageKeyword: "fitness" },
];

const venueTypes = [
  "Sports Complex", "Tennis Club", "Basketball Arena", "Aquatic Center",
  "Football Grounds", "Training Facility", "Recreation Center", "Athletic Club",
  "Fitness Hub", "Sports Arena", "Community Center", "Sports Pavilion"
];

const neighborhoods = [
  "Manhattan", "Brooklyn", "Queens", "Bronx", "Jersey City", "Hoboken",
  "Newark", "Staten Island", "Long Island City", "Astoria", "Williamsburg",
  "Harlem", "Chelsea", "SoHo", "Tribeca", "Upper East Side", "Upper West Side",
  "Midtown", "Financial District", "Park Slope"
];

const streets = [
  "Main St", "Oak Ave", "Park Blvd", "River Road", "Central Ave", "Olympic Way",
  "Sports Lane", "Victory Dr", "Champion Rd", "Athletic Way", "Stadium Blvd",
  "Field Ave", "Court St", "Arena Rd", "Training Way", "Fitness Blvd"
];

const amenitySets = [
  ["Parking", "Showers", "Lockers", "Equipment Rental", "Cafe"],
  ["Parking", "Pro Shop", "Coaching", "Showers"],
  ["Parking", "Locker Rooms", "Scoreboard", "Bleachers"],
  ["Lockers", "Showers", "Sauna", "Pool Gear Rental"],
  ["Parking", "Changing Rooms", "Floodlights"],
  ["Parking", "Gym", "Physical Therapy", "Cafe", "Pro Shop"],
  ["Showers", "Lockers", "Equipment Rental"],
  ["Parking", "Cafe", "First Aid", "Water Fountains"],
  ["Locker Rooms", "Showers", "Coaching", "Equipment Rental"],
  ["Parking", "Pro Shop", "Cafe", "Bleachers", "Scoreboard"],
];

const descriptions = [
  "A modern sports facility with state-of-the-art equipment and professional-grade surfaces.",
  "Premium courts with excellent lighting and climate control for year-round play.",
  "Full-size arena with top-quality flooring and spectator seating.",
  "Professional-grade facility with dedicated lanes for training and recreation.",
  "Well-maintained outdoor grounds with natural grass and excellent drainage.",
  "Multi-purpose facility perfect for team training, matches, and individual workouts.",
  "Community-focused venue offering affordable rates and flexible booking options.",
  "Elite training environment used by professional athletes and serious enthusiasts.",
  "Family-friendly facility with programs for all ages and skill levels.",
  "Recently renovated venue with modern amenities and accessibility features.",
];

// Generate unique image URL for each venue using Unsplash
const getVenueImage = (id: number, keyword: string) => {
  return `https://images.unsplash.com/photo-${1500000000000 + id * 1000}?w=800&h=600&fit=crop&q=80&auto=format`;
};

// Curated sports venue images from Unsplash
const venueImages = [
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop", // soccer
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", // tennis
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop", // basketball
  "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=600&fit=crop", // swimming
  "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=600&fit=crop", // stadium
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop", // gym
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop", // fitness
  "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=600&fit=crop", // volleyball
  "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=600&fit=crop", // badminton
  "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800&h=600&fit=crop", // sports hall
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop", // gym equipment
  "https://images.unsplash.com/photo-1562771379-eafdca7a02f8?w=800&h=600&fit=crop", // tennis court
  "https://images.unsplash.com/photo-1568287556346-26d4f5ed49a9?w=800&h=600&fit=crop", // pool
  "https://images.unsplash.com/photo-1504016798967-59a258e9386d?w=800&h=600&fit=crop", // outdoor field
  "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=600&fit=crop", // athletics
  "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=600&fit=crop", // running track
  "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800&h=600&fit=crop", // basketball indoor
  "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&h=600&fit=crop", // basketball
  "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=600&fit=crop", // soccer field
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop", // football
  "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop", // tennis
  "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&h=600&fit=crop", // pool lanes
  "https://images.unsplash.com/photo-1570498839593-e565b39455fc?w=800&h=600&fit=crop", // volleyball court
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop", // stadium lights
  "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop", // gym interior
  "https://images.unsplash.com/photo-1596357395217-80de13130e92?w=800&h=600&fit=crop", // sports court
  "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop", // badminton court
  "https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=800&h=600&fit=crop", // swimming
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop", // cycling
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop", // yoga
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop", // weights
  "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=800&h=600&fit=crop", // table tennis
  "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop", // indoor sports
  "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=800&h=600&fit=crop", // gym workout
  "https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800&h=600&fit=crop", // squash
  "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop", // swimming pool
  "https://images.unsplash.com/photo-1461896836934- voices&w=800&h=600&fit=crop", // arena
  "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&h=600&fit=crop", // soccer
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop", // soccer ball
  "https://images.unsplash.com/photo-1562552052-dbdb5765e37a?w=800&h=600&fit=crop", // cricket
  "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&h=600&fit=crop", // home gym
  "https://images.unsplash.com/photo-1595909315417-2edd382a56dc?w=800&h=600&fit=crop", // basketball hoop
  "https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=800&h=600&fit=crop", // tennis racket
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=600&fit=crop", // rugby
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop", // golf
  "https://images.unsplash.com/photo-1560012057-4372e14c5085?w=800&h=600&fit=crop", // boxing
  "https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=800&h=600&fit=crop", // martial arts
  "https://images.unsplash.com/photo-1558017487-06bf9f82613a?w=800&h=600&fit=crop", // climbing
  "https://images.unsplash.com/photo-1591741535018-d042c1f2a0ab?w=800&h=600&fit=crop", // outdoor court
  "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop", // hockey
  "https://images.unsplash.com/photo-1616279969965-e764d1a95584?w=800&h=600&fit=crop", // futsal
  "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop", // sports
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop", // training
  "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&h=600&fit=crop", // indoor
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop&sat=-100", // soccer bw
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&sat=50", // tennis warm
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop&bri=10", // basketball bright
  "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=600&fit=crop&con=10", // swimming contrast
  "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=600&fit=crop&blur=1", // stadium
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&exp=5", // gym
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&vib=10", // fitness
  "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=600&fit=crop&hue=10", // volleyball
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&h=600&fit=crop", // crossfit
  "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop", // run
  "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&h=600&fit=crop", // weights
  "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800&h=600&fit=crop", // treadmill
  "https://images.unsplash.com/photo-1567013127542-490d757e6349?w=800&h=600&fit=crop", // stretching
  "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=800&h=600&fit=crop", // dumbbells
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop", // workout
  "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800&h=600&fit=crop", // fitness class
  "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&h=600&fit=crop", // cardio
  "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=800&h=600&fit=crop", // basketball player
  "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=800&h=600&fit=crop", // football match
  "https://images.unsplash.com/photo-1580261450046-d0a30080dc9b?w=800&h=600&fit=crop", // pool diving
  "https://images.unsplash.com/photo-1558618047-f4b511d592ca?w=800&h=600&fit=crop", // bench press
  "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop", // baseball
  "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?w=800&h=600&fit=crop", // skateboard
  "https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=800&h=600&fit=crop", // surfing
  "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop", // tennis clay
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop", // spinning
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=600&fit=crop", // modern gym
  "https://images.unsplash.com/photo-1593810450967-f9c42742e326?w=800&h=600&fit=crop", // kettlebell
  "https://images.unsplash.com/photo-1520877880798-5ee004e3f11e?w=800&h=600&fit=crop", // athlete
  "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=800&h=600&fit=crop", // pilates
  "https://images.unsplash.com/photo-1518644961665-ed172691aaa1?w=800&h=600&fit=crop", // rowing
  "https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?w=800&h=600&fit=crop", // push up
  "https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?w=800&h=600&fit=crop", // sports shoes
  "https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=800&h=600&fit=crop", // squash court
  "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop", // padel
  "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&h=600&fit=crop", // pickleball
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop", // sneakers
  "https://images.unsplash.com/photo-1562771379-eafdca7a02f8?w=800&h=600&fit=crop", // tennis outdoor
  "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&h=600&fit=crop", // gym modern
];

const generateVenues = () => {
  const venues = [];
  
  for (let i = 1; i <= 100; i++) {
    const template = venueTemplates[i % venueTemplates.length];
    const venueType = venueTypes[i % venueTypes.length];
    const neighborhood = neighborhoods[i % neighborhoods.length];
    const street = streets[i % streets.length];
    const amenities = amenitySets[i % amenitySets.length];
    const description = descriptions[i % descriptions.length];
    const image = venueImages[i % venueImages.length];
    
    venues.push({
      id: String(i),
      name: `${template.namePrefix} ${venueType}`,
      image,
      location: `${100 + i} ${street}, ${neighborhood}`,
      sports: template.sports,
      price: 20 + (i % 11),
      rating: Number((4.0 + (i % 10) / 10).toFixed(1)),
      reviewCount: 20 + (i * 7) % 200,
      available: i % 5 !== 0,
      description,
      amenities,
      indoor: template.indoor,
    });
  }
  
  return venues;
};

export const venues = generateVenues();

export const games = [
  {
    id: "1",
    title: "Sunday Football Match",
    sport: "Football",
    location: "Downtown Sports Complex",
    date: "Jan 19, 2026",
    time: "10:00 AM",
    spotsTotal: 14,
    spotsTaken: 11,
    hostName: "Mike Johnson",
    level: "intermediate" as const,
  },
  {
    id: "2",
    title: "Casual Basketball Game",
    sport: "Basketball",
    location: "Central Basketball Arena",
    date: "Jan 18, 2026",
    time: "6:00 PM",
    spotsTotal: 10,
    spotsTaken: 7,
    hostName: "Sarah Williams",
    level: "all" as const,
  },
  {
    id: "3",
    title: "Tennis Doubles",
    sport: "Tennis",
    location: "Riverside Tennis Club",
    date: "Jan 20, 2026",
    time: "2:00 PM",
    spotsTotal: 4,
    spotsTaken: 2,
    hostName: "David Chen",
    level: "advanced" as const,
  },
  {
    id: "4",
    title: "Morning Swim Session",
    sport: "Swimming",
    location: "Olympic Aquatic Center",
    date: "Jan 17, 2026",
    time: "7:00 AM",
    spotsTotal: 8,
    spotsTaken: 8,
    hostName: "Emma Thompson",
    level: "beginner" as const,
  },
  {
    id: "5",
    title: "5-a-side Football",
    sport: "Football",
    location: "Greenfield Football Grounds",
    date: "Jan 21, 2026",
    time: "4:00 PM",
    spotsTotal: 10,
    spotsTaken: 6,
    hostName: "James Wilson",
    level: "intermediate" as const,
  },
];

export const sportTypes = [
  "Football",
  "Basketball",
  "Tennis",
  "Swimming",
  "Volleyball",
  "Badminton",
  "Rugby",
  "Gym",
];

export const timeSlots = [
  "06:00 AM",
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
];
