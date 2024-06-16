import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getContact, updateContact } from "../data";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);

  if (!contact) {
    throw new Response("Not Found", { status: 404 });
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
        <button type="button">Cancel</button>
      </p>
    </Form>
  );
}