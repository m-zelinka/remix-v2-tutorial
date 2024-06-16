import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { ErrorPage } from "~/components/error-page";
import { getContact, updateContact, type ContactRecord } from "../data";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const { title } = data
    ? {
        title:
          data.contact.first || data.contact.last
            ? `${data.contact.first} ${data.contact.last}`
            : "No Name",
      }
    : { title: "Not Found" };

  return [{ title }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);

  if (!contact) {
    throw new Response("", { status: 404, statusText: "Not Found" });
  }

  return json({ contact });
}

export async function action({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const favorite = formData.get("favorite");

  invariant(params.contactId, "Missing contactId param");
  await updateContact(params.contactId, {
    favorite: favorite === "true",
  });

  return { ok: true };
}

export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function Component() {
  const { contact } = useLoaderData<typeof loader>();

  return (
    <div id="contact">
      <img
        key={contact.avatar}
        src={
          contact.avatar ||
          `https://robohash.org/${contact.id}.png?size=200x200`
        }
        alt=""
      />
      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={contact} />
        </h1>
        {contact.twitter ? (
          <p>
            <a href={`https://twitter.com/${contact.twitter}`}>
              {contact.twitter}
            </a>
          </p>
        ) : null}
        {contact.notes ? <p>{contact.notes}</p> : null}
        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
          <Form
            method="post"
            action="destroy"
            onSubmit={(event) => {
              const shouldDelete = confirm(
                "Please confirm you want to delete this record."
              );

              if (!shouldDelete) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

function Favorite({
  contact,
}: {
  contact: Pick<ContactRecord, "id" | "favorite">;
}) {
  const fetcher = useFetcher({ key: `contact:${contact.id}` });
  const favorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : contact.favorite;

  return (
    <fetcher.Form method="post">
      <button
        name="favorite"
        value={favorite ? "false" : "true"}
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
}
