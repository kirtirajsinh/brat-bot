import { Hono } from "hono";
import { handlePostResponse } from "./utils";
import { Bindings } from "./prompt";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  // const response = await handlePostResponse(
  //   "0x39687a519966e4b7875ce3987a6d2d0584bac593"
  // );
  return c.text("Hello degens!");
});

app.post("/event", async (c) => {
  const body = await c.req.json();
  console.log(body, "original reply cast. parent hash");
  console.log(body?.data?.parent_hash, "parent hash");
  console.log(c.env as Bindings, "env");

  const reply = await handlePostResponse(
    body?.data?.parent_hash,
    body?.data?.hash,
    c.env
  );
  console.log(reply, "reply of the post");

  return c.json(reply as Record<string, unknown>);
});

export default app;
