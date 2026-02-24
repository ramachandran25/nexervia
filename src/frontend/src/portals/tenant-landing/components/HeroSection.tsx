interface Props {
  hero: {
    title: string;
    subtitle: string;
    primary_cta: string;
    secondary_cta: string;
    image: string;
  };
  themeColor: string;
}

export default function HeroSection({ hero, themeColor }: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white px-10 pt-28 pb-36">

      {/* Glow Background */}
      <div className="absolute top-[-120px] right-[-120px] w-[600px] h-[600px] bg-blue-200 opacity-30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

        <div>
          <h1 className="text-6xl font-bold leading-tight mb-6 tracking-tight">
            {hero.title}
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-lg">
            {hero.subtitle}
          </p>

          <div className="flex gap-4">
            <button
              className="px-8 py-4 rounded-lg text-white font-semibold shadow-lg hover:scale-105 transition-transform"
              style={{ backgroundColor: themeColor }}
            >
              {hero.primary_cta}
            </button>

            <button className="px-8 py-4 rounded-lg border border-gray-300 font-semibold hover:bg-gray-100 transition">
              {hero.secondary_cta}
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <img
            src={hero.image}
            alt="Hero"
            className="max-w-xl drop-shadow-[0_40px_80px_rgba(0,0,0,0.25)] hover:scale-105 transition-transform duration-500"
          />
        </div>

      </div>
    </section>
  );
}