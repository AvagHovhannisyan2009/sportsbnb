import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GameCardProps {
  id: string;
  title: string;
  sport: string;
  location: string;
  date: string;
  time: string;
  spotsTotal: number;
  spotsTaken: number;
  hostName: string;
  level: "beginner" | "intermediate" | "advanced" | "all";
}

const GameCard = ({
  id,
  title,
  sport,
  location,
  date,
  time,
  spotsTotal,
  spotsTaken,
  hostName,
  level,
}: GameCardProps) => {
  const spotsLeft = spotsTotal - spotsTaken;
  const isFull = spotsLeft === 0;

  const levelColors = {
    beginner: "bg-chart-1/20 text-chart-5",
    intermediate: "bg-chart-2/20 text-chart-5",
    advanced: "bg-chart-3/20 text-chart-5",
    all: "bg-accent text-accent-foreground",
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{sport}</Badge>
            <Badge className={levelColors[level]}>{level}</Badge>
          </div>
          <h3 className="font-semibold text-foreground text-lg">{title}</h3>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-lg font-semibold ${isFull ? "text-muted-foreground" : "text-primary"}`}>
            {spotsLeft} spots
          </div>
          <div className="text-sm text-muted-foreground">of {spotsTotal} left</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{time}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Hosted by {hostName}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link to={`/game/${id}`} className="flex-1">
          <Button variant={isFull ? "secondary" : "default"} className="w-full" disabled={isFull}>
            {isFull ? "Full" : "Join Game"}
          </Button>
        </Link>
        <Link to={`/game/${id}`}>
          <Button variant="outline">Details</Button>
        </Link>
      </div>
    </div>
  );
};

export default GameCard;
