interface Feature {
  title: string;
  description: string;
}

interface Props {
  features: {
    title: string;
    subtitle: string;
    items: Feature[];
  };
}

export default function FeaturesSection({ features }: Props) {
  return (
    <section className="px-10 py-28 bg-gray-50">

      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">
            {features.title}
          </h2>
          <p className="text-lg text-gray-600">
            {features.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {features.items.map((item, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg mb-6" />

              <h3 className="text-xl font-semibold mb-4">
                {item.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}