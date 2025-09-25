export const NotFoundPage = ({ Link = "" }) => {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-2 text-lg text-gray-600">
        The page you're looking for does not exist.
      </p>
      <a href={`/${Link}`} className="mt-4 text-blue-500 underline">
        Go back home
      </a>
    </div>
  );
};

export const UnauthorizedPage = ({ Link = "" }) => {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold">401 - Unauthorized</h1>
      <p className="mt-2 text-lg text-gray-600">
        You are accessing a page that requires you to be logged in.
      </p>
      <a href={`/${Link}`} className="mt-4 text-blue-500 underline">
        Go back home
      </a>
    </div>
  );
};
