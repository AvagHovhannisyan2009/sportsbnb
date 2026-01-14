import venueFootball from "@/assets/venue-football.jpg";
import venueTennis from "@/assets/venue-tennis.jpg";
import venueBasketball from "@/assets/venue-basketball.jpg";
import venueSwimming from "@/assets/venue-swimming.jpg";

const venueTemplates = [
  { namePrefix: "Downtown", sports: ["Football", "Basketball", "Tennis"], indoor: true },
  { namePrefix: "Riverside", sports: ["Tennis"], indoor: true },
  { namePrefix: "Central", sports: ["Basketball"], indoor: true },
  { namePrefix: "Olympic", sports: ["Swimming"], indoor: true },
  { namePrefix: "Greenfield", sports: ["Football", "Rugby"], indoor: false },
  { namePrefix: "Elite", sports: ["Basketball", "Volleyball", "Badminton"], indoor: true },
  { namePrefix: "Sunset", sports: ["Tennis", "Badminton"], indoor: false },
  { namePrefix: "Metro", sports: ["Football", "Basketball"], indoor: true },
  { namePrefix: "Lakeside", sports: ["Swimming", "Volleyball"], indoor: false },
  { namePrefix: "Urban", sports: ["Basketball", "Gym"], indoor: true },
  { namePrefix: "Premier", sports: ["Football"], indoor: false },
  { namePrefix: "Pacific", sports: ["Swimming"], indoor: true },
  { namePrefix: "Highland", sports: ["Tennis", "Basketball"], indoor: true },
  { namePrefix: "Coastal", sports: ["Volleyball", "Swimming"], indoor: false },
  { namePrefix: "Summit", sports: ["Gym", "Basketball"], indoor: true },
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

const images = [venueFootball, venueTennis, venueBasketball, venueSwimming];

const generateVenues = () => {
  const venues = [];
  
  for (let i = 1; i <= 100; i++) {
    const template = venueTemplates[i % venueTemplates.length];
    const venueType = venueTypes[i % venueTypes.length];
    const neighborhood = neighborhoods[i % neighborhoods.length];
    const street = streets[i % streets.length];
    const amenities = amenitySets[i % amenitySets.length];
    const description = descriptions[i % descriptions.length];
    const image = images[i % images.length];
    
    venues.push({
      id: String(i),
      name: `${template.namePrefix} ${venueType}`,
      image,
      location: `${100 + i} ${street}, ${neighborhood}`,
      sports: template.sports,
      price: 20 + (i % 60),
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
