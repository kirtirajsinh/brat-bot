import { Bindings, promptTemplate } from "./prompt";

export const getPostFromParentHash = async (
  parentHash: string,
  env: Bindings
) => {
  if (!parentHash) return;
  const url = `https://api.neynar.com/v2/farcaster/cast?identifier=${parentHash}&type=hash`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      api_key: env.api_key,
    },
  };

  try {
    const response = await fetch(url, options);

    const post = await response.json();

    console.log(post);

    return post;
  } catch (error) {
    console.log(error);
    return;
  }
};

export const handlePostResponse = async (
  parentHash: string,
  hash: string,
  env: Bindings
) => {
  const post: any = await getPostFromParentHash(parentHash, env);

  if (post?.cast) {
    const { text, embeds } = post.cast;

    // Extract the embed URL if it's an image
    const embedUrl = embeds?.[0]?.url || "";
    const contentType = embeds?.[0]?.metadata?.content_type || "";

    console.log(embedUrl, text, "this is a test of embedUrl and text");

    const isImage = contentType.startsWith("image");
    const roast = await roastthePost(text, isImage ? embedUrl : "");

    if (roast) {
      const reply = await replyWithARoast(roast, hash, env);
      console.log(reply, "reply of the post");
      return reply;
    } else {
      console.log("no roast");
      return;
    }
  }
};

export const roastthePost = async (text: string, embedUrl: string) => {
  const response = await fetch(
    "https://0x768da699e7b40d6fa4660afefa33ef6ccc45749a.us.gaianet.network/v1/chat/completions",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: `${promptTemplate}` },
          { role: "user", content: `${text}, ${embedUrl}` },
        ],
        completion_tokens: 100,
      }),
    }
  );
  const data: { choices?: { message: { content: string } }[] } =
    await response.json();
  console.log(data?.choices?.[0]?.message.content);
  return data?.choices?.[0]?.message.content;
};

export const replyWithARoast = async (
  roast: string,
  parentHash: string,
  env: Bindings
) => {
  const url = "https://api.neynar.com/v2/farcaster/cast";
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      api_key: env.api_key,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      signer_uuid: env.signer_uuid,
      text: roast,
      parent: parentHash,
    }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data, "reply of the post");
    return data;
  } catch (error) {
    console.error("Error in replyWithARoast:", error);
    return { error: "Failed to post reply" };
  }
};
