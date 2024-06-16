import { isRouteErrorResponse, useRouteError } from "@remix-run/react";

export function ErrorPage() {
  const error = useRouteError();
  const erorrMessage = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
    ? error.message
    : "Unknown error";

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{erorrMessage}</i>
      </p>
    </div>
  );
}
