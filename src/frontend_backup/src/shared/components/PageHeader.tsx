interface Props {
  title: string;
  subtitle?: string;
}

const PageHeader = ({ title, subtitle }: Props) => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PageHeader;