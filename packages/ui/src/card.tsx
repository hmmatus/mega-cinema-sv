type CardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
};

type CardHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

type CardTitleProps = {
  children: React.ReactNode;
  className?: string;
};

type CardContentProps = {
  children: React.ReactNode;
  className?: string;
};

function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`border-b border-gray-200 px-4 py-3 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-sm font-semibold text-gray-700 ${className}`}>
      {children}
    </h3>
  );
}

function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      {title && (
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
