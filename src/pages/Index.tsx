import { Button } from "@/components/ui/button";
import heroCake from "@/assets/hero-cake.jpg";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: "Laila's Cakes",
    image: [heroCake],
    description: "Custom cakes, cupcakes, and desserts for every occasion.",
    url: '/',
    priceRange: '$$',
    servesCuisine: 'Bakery',
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <header className="container py-6 flex items-center justify-between">
        <a href="/" className="font-playfair text-2xl font-semibold tracking-tight">Laila's Cakes</a>
      </header>

      <main className="relative z-10">
        <section className="container pt-8 pb-16 grid md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold tracking-tight mb-6">Laila's Cakes</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-prose">
              Handcrafted cakes and cupcakes baked fresh to make your moments unforgettable. From elegant weddings to playful birthdays, we design the cake of your dreams.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="hero" size="lg" className="shadow-brand-glow" onClick={handleLoginClick}>Login</Button>
            </div>
          </div>
          <div className="order-1 md:order-2 relative">
            <div className="rounded-xl overflow-hidden border border-border shadow-brand-glow-strong animate-enter">
              <img src={heroCake} alt="Beautiful pink buttercream cake by Laila's Cakes" loading="eager" className="w-full h-auto" />
            </div>
          </div>
        </section>
      </main>

      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="bg-aurora" />
      </div>

      <footer className="container py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Laila's Cakes. All rights reserved.
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </div>
  );
};

export default Index;
