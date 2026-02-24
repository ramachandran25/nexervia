import { NavLink } from "react-router-dom";

interface Section {
  label: string;
  items: { label: string; path: string }[];
}

interface Props {
  title: string;
  sections: Section[];
}

const Sidebar = ({ title, sections }: Props) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b font-semibold text-lg">
        {title}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-xs text-gray-400 uppercase mb-2">
              {section.label}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-md text-sm ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

      </div>
    </aside>
  );
};

export default Sidebar;