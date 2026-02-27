interface Props {
  companyName: string;
}

export default function Footer({ companyName }: Props) {
  return (
    <footer className="bg-gray-900 text-white py-16 px-10">

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">

        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <p className="text-gray-400 text-sm">
            Modern SaaS platform built for scalable teams.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>Features</li>
            <li>Pricing</li>
            <li>Security</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>Contact</li>
            <li>Documentation</li>
            <li>FAQ</li>
          </ul>
        </div>

      </div>

      <div className="mt-12 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} {companyName}. All rights reserved.
      </div>

    </footer>
  );
}