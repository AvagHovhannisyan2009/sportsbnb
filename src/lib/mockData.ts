import type { Venue } from "@/hooks/useVenues";
import type { Game } from "@/hooks/useGames";
import type { Team } from "@/hooks/useTeams";

const JP_BASE = "https://jsonplaceholder.typicode.com";

interface JPUser {
  id: number;
  name: string;
  username: string;
  email: string;
  address: { city: string; street: string; geo: { lat: string; lng: string } };
  company: { name: string; catchPhrase: string };
}

let cachedUsers: JPUser[] | null = null;

async function getJPUsers(): Promise<JPUser[]> {
  if (cachedUsers) return cachedUsers;
  const res = await fetch(`${JP_BASE}/users`);
  cachedUsers = await res.json();
  return cachedUsers!;
}

const sportsList = ["Football", "Basketball", "Tennis", "Swimming", "Volleyball", "Badminton", "Rugby", "Gym"];
const amenitiesList = ["Parking", "Showers", "Lockers", "WiFi", "Cafeteria", "First Aid", "Floodlights", "Water Fountain"];

const venueImages: Record<string, string> = {
  Football: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
  Basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop",
  Tennis: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
  Swimming: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=600&fit=crop",
  Volleyball: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=600&fit=crop",
  Badminton: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=600&fit=crop",
  Rugby: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=600&fit=crop",
  Gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pickRandom<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function pickMultiple<T>(arr: T[], count: number, seed: number): T[] {
  const shuffled = [...arr].sort((a, b) => seededRandom(seed + arr.indexOf(a)) - seededRandom(seed + arr.indexOf(b)));
  return shuffled.slice(0, count);
}

export async function generateMockVenues(): Promise<Venue[]> {
  const users = await getJPUsers();

  return users.map((user, i) => {
    const sport = pickRandom(sportsList, i);
    const secondSport = pickRandom(sportsList.filter(s => s !== sport), i + 100);
    const sports = i % 3 === 0 ? [sport, secondSport] : [sport];

    return {
      id: `mock-venue-${user.id}`,
      owner_id: `mock-owner-${user.id}`,
      name: `${user.company.name} ${sport} Center`,
      description: user.company.catchPhrase,
      address: `${user.address.street}, ${user.address.city}`,
      city: user.address.city,
      zip_code: "10001",
      image_url: venueImages[sport] || venueImages.Football,
      sports,
      price_per_hour: Math.round((3000 + seededRandom(i + 50) * 12000) / 100) * 100,
      is_indoor: i % 2 === 0,
      amenities: pickMultiple(amenitiesList, 3 + Math.floor(seededRandom(i + 20) * 3), i),
      is_active: true,
      rating: Math.round((3.5 + seededRandom(i + 30) * 1.5) * 10) / 10,
      review_count: Math.floor(5 + seededRandom(i + 40) * 95),
      created_at: new Date(Date.now() - i * 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString(),
      latitude: parseFloat(user.address.geo.lat),
      longitude: parseFloat(user.address.geo.lng),
      location_confirmed: true,
    };
  });
}

export async function generateMockGames(): Promise<(Game & { distance: number | null })[]> {
  const users = await getJPUsers();

  const gameTitles = [
    "Weekend Pickup Game", "Friendly Match", "Open Practice", "Community League",
    "After Work Session", "Morning Warmup", "Evening Showdown", "Tournament Prep",
    "Casual Play", "Skill Builder",
  ];

  const levels = ["beginner", "intermediate", "advanced", "all"];

  return users.slice(0, 8).map((user, i) => {
    const sport = pickRandom(sportsList, i + 200);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1 + Math.floor(seededRandom(i + 300) * 14));
    const hours = 8 + Math.floor(seededRandom(i + 400) * 12);

    return {
      id: `mock-game-${user.id}`,
      host_id: `mock-host-${user.id}`,
      venue_id: null,
      title: `${gameTitles[i % gameTitles.length]} - ${sport}`,
      description: `Join us for a great ${sport.toLowerCase()} session! ${user.company.catchPhrase}`,
      sport,
      skill_level: pickRandom(levels, i + 500),
      location: `${user.address.street}, ${user.address.city}`,
      latitude: parseFloat(user.address.geo.lat),
      longitude: parseFloat(user.address.geo.lng),
      game_date: futureDate.toISOString().split("T")[0],
      game_time: `${hours.toString().padStart(2, "0")}:00`,
      duration_hours: 1 + Math.floor(seededRandom(i + 600) * 2),
      max_players: 6 + Math.floor(seededRandom(i + 700) * 14),
      price_per_player: Math.floor(seededRandom(i + 800) * 5000),
      is_public: true,
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      host: {
        full_name: user.name,
        avatar_url: null,
      },
      participant_count: Math.floor(seededRandom(i + 900) * 6),
      distance: null,
    };
  });
}

export async function generateMockTeams(): Promise<Team[]> {
  const users = await getJPUsers();

  const teamNames = [
    "Thunder", "Wolves", "Eagles", "Titans", "Warriors",
    "Phoenix", "Storm", "Falcons", "Lions", "Hawks",
  ];

  return users.map((user, i) => {
    const sport = pickRandom(sportsList, i + 1000);

    return {
      id: `mock-team-${user.id}`,
      name: `${user.address.city} ${teamNames[i % teamNames.length]}`,
      description: `${sport} team based in ${user.address.city}. ${user.company.catchPhrase}`,
      sport,
      team_size: 5 + Math.floor(seededRandom(i + 1100) * 10),
      logo_url: null,
      visibility: "public",
      invite_code: `MOCK${user.id}${i}`,
      owner_id: `mock-owner-${user.id}`,
      created_at: new Date(Date.now() - i * 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString(),
      member_count: 2 + Math.floor(seededRandom(i + 1200) * 8),
    };
  });
}
