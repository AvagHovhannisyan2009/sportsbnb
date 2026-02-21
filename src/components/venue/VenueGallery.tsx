import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VenueGalleryProps {
  images: { id: string; image_url: string; caption?: string | null }[];
  venueName: string;
  mainImage: string;
}

const VenueGallery = ({ images, venueName, mainImage }: VenueGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const allImages = [
    { id: "main", image_url: mainImage, caption: venueName },
    ...images,
  ];

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  const next = () => setSelectedIndex((i) => (i + 1) % allImages.length);
  const prev = () => setSelectedIndex((i) => (i - 1 + allImages.length) % allImages.length);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
          onClick={() => openLightbox(0)}
        >
          <img
            src={allImages[0].image_url}
            alt={venueName}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="hidden md:grid grid-cols-2 gap-4">
          {allImages.slice(1, 5).map((img, i) => (
            <div
              key={img.id}
              className="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer relative"
              onClick={() => openLightbox(i + 1)}
            >
              <img
                src={img.image_url}
                alt={img.caption || `${venueName} view ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              {i === 3 && allImages.length > 5 && (
                <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-lg">
                    +{allImages.length - 5} more
                  </span>
                </div>
              )}
            </div>
          ))}
          {allImages.length < 5 &&
            [...Array(4 - (allImages.length - 1))].map((_, i) => (
              <div key={`placeholder-${i}`} className="aspect-[4/3] rounded-xl bg-muted" />
            ))}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-foreground/95 border-none">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="flex items-center justify-center min-h-[60vh]">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={prev}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <img
                src={allImages[selectedIndex].image_url}
                alt={allImages[selectedIndex].caption || venueName}
                className="max-h-[80vh] max-w-full object-contain"
              />

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={next}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {allImages[selectedIndex].caption && (
              <div className="text-center py-3">
                <p className="text-primary-foreground/80 text-sm">{allImages[selectedIndex].caption}</p>
              </div>
            )}

            <div className="flex justify-center gap-1 pb-4">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === selectedIndex ? "w-6 bg-primary-foreground" : "w-1.5 bg-primary-foreground/40"
                  )}
                  onClick={() => setSelectedIndex(i)}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VenueGallery;
