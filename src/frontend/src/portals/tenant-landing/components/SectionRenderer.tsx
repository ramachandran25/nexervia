interface Props {
  section: {
    type: string;
    config: any;
  };
}

export default function SectionRenderer({ section }: Props) {
  switch (section.type) {
    case "hero":
      return (
        <section className="py-24 text-center bg-gray-50">
          <h1 className="text-4xl font-bold mb-4">
            {section.config.title}
          </h1>
          <p className="text-lg text-gray-600">
            {section.config.subtitle}
          </p>
        </section>
      );

    case "features":
      return (
        <section className="py-20 px-10">
          <div className="grid md:grid-cols-3 gap-10">
            {section.config.items.map((item: any, index: number) => (
              <div key={index} className="p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-2">
                  {item.title}
                </h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      );

    default:
      return null;
  }
}