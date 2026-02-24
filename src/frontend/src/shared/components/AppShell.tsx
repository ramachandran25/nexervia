import Sidebar from "./Sidebar";
import Header from "./Header";

interface Props {
  title: string;
  menu: { label: string; path: string }[];
  children: React.ReactNode;
}

const AppShell = ({ title, menu, children }: Props) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar title={title} menu={menu} />

      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppShell;