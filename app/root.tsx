import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { useEffect, type ReactNode } from "react";
import { useSpinDelay } from "spin-delay";
import "./app.css";
import { LoadingOverlay } from "./components/loading-overlay";
import { createEmptyContact, getContacts, type ContactRecord } from "./data";

export const meta: MetaFunction = () => {
  return [{ title: "Remix Contacts" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  const contacts = await getContacts(q);

  return json({ contacts });
}

export async function action() {
  const contact = await createEmptyContact();

  return redirect(`/contacts/${contact.id}/edit`);
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { contacts } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <SearchBar />
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      to={`contacts/${contact.id}`}
                      prefetch="intent"
                      className={({ isActive, isPending }) =>
                        isActive ? "active" : isPending ? "pending" : ""
                      }
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      <Favorite contact={contact}>
                        <span>★</span>
                      </Favorite>
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div id="detail">
          <LoadingOverlay>{children}</LoadingOverlay>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}

function SearchBar() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q");

  const navigation = useNavigation();
  const searching = new URLSearchParams(navigation.location?.search).has("q");
  const showSpinner = useSpinDelay(searching);

  // Used to submit the form for every keystroke
  const submit = useSubmit();

  // Sync search input value with the URL Search Params
  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q ?? "";
    }
  }, [q]);

  return (
    <Form id="search-form" role="search">
      <input
        id="q"
        className={showSpinner ? "loading" : undefined}
        aria-label="Search contacts"
        placeholder="Search"
        type="search"
        name="q"
        defaultValue={q ?? undefined}
        onChange={(event) => {
          const isFirstSearch = q === null;

          submit(event.currentTarget.form, {
            replace: !isFirstSearch,
          });
        }}
      />
      <div id="search-spinner" aria-hidden hidden={!showSpinner} />
    </Form>
  );
}

function Favorite({
  contact,
  children,
}: {
  contact: Pick<ContactRecord, "id" | "favorite">;
  children?: ReactNode;
}) {
  const fetcher = useFetcher({ key: `contact:${contact.id}` });
  const favorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : contact.favorite;

  if (!favorite) {
    return null;
  }

  return children;
}
