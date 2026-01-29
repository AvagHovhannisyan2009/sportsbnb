import { memo } from 'react';
import { motion } from 'framer-motion';
import { Star, Calendar, Clock, MapPin } from 'lucide-react';

interface BookingCard3DProps {
  className?: string;
}

function BookingCard3D({ className = '' }: BookingCard3DProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Main card */}
      <div className="relative bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl shadow-black/20">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-2xl pointer-events-none" />
        
        {/* Card content */}
        <div className="relative space-y-4">
          {/* Venue preview */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground text-lg truncate">Premium Tennis Court</h4>
              <p className="text-sm text-muted-foreground">Downtown Sports Center</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-foreground">4.9</span>
                <span className="text-sm text-muted-foreground">(128 reviews)</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* Booking details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium text-foreground">Sat, Jan 25</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-sm font-medium text-foreground">10:00 AM</p>
              </div>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">$45<span className="text-sm font-normal text-muted-foreground">/hr</span></p>
            </div>
            <div className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">
              Book Now
            </div>
          </div>
        </div>
      </div>

      {/* Floating accent elements */}
      <motion.div
        className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-primary/30 to-primary/0 rounded-full blur-2xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </motion.div>
  );
}

export default memo(BookingCard3D);
