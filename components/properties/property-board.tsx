import Image from "next/image";
import { Building2, Map, Phone, SlidersHorizontal } from "lucide-react";
import { properties } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PropertyBoard() {
  return (
    <div className="space-y-5">
      <section className="rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary text-white">
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black">Properties</h1>
            <p className="truncate text-sm text-muted-foreground">Flats, rentals, PGs, commercial spaces</p>
          </div>
          <Button variant="secondary" size="iconSm" aria-label="Filters">
            <SlidersHorizontal className="size-4" />
          </Button>
          <Button variant="secondary" size="iconSm" aria-label="Map view">
            <Map className="size-4" />
          </Button>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {properties.map((property) => (
          <article key={property.id} className="overflow-hidden rounded-[1.6rem] border border-border bg-card shadow-soft">
            <div className="relative aspect-[4/3]">
              <Image src={property.imageUrl} alt={property.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              <div className="absolute left-3 top-3">
                <Badge tone="accent">{property.type}</Badge>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <h2 className="text-lg font-black">{property.title}</h2>
                <p className="text-sm font-semibold text-muted-foreground">{property.location}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black">{property.price}</span>
                <Button size="sm">
                  <Phone className="size-4" />
                  Contact
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
