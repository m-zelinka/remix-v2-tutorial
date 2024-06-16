import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import type { ReactNode } from "react";
import invariant from "tiny-invariant";
import { ErrorPage } from "~/components/error-page";
import { getContact, updateContact } from "../data";

export const meta: MetaFunction = () => {
  return [{ title: "Edit contact" }];
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
  const updates = Object.fromEntries(formData);

  invariant(params.contactId, "Missing contactId param");
  await updateContact(params.contactId, updates);

  return redirect(`/contacts/${params.contactId}`);
}

export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function Component() {
  const { contact } = useLoaderData<typeof loader>();

  return (
    <Form key={contact.id} id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          defaultValue={contact.first}
          aria-label="First name"
          name="first"
          type="text"
          placeholder="First"
        />
        <input
          aria-label="Last name"
          defaultValue={contact.last}
          name="last"
          placeholder="Last"
          type="text"
        />
      </p>
      <label>
        <span>Twitter</span>
        <input
          defaultValue={contact.twitter}
          name="twitter"
          placeholder="@jack"
          type="text"
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={contact.avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea defaultValue={contact.notes} name="notes" rows={6} />
      </label>
      <p>
        <button type="submit">Save</button>
        <CancelButton>Cancel</CancelButton>
      </p>
    </Form>
  );
}

function CancelButton({ children }: { children?: ReactNode }) {
  const navigate = useNavigate();

  return (
    <button type="button" onClick={() => navigate(-1)}>
      {children}
    </button>
  );
}
