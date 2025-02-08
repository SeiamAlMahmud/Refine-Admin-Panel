import { GraphQLFormattedError } from "graphql";
const customFetch = async (url: string, options: RequestInit) => {
  const accessToken = localStorage.getItem("access_token");

  const headers = options.headers as Record<string, string>;
  return await fetch(url, {
    method: options.method,
    headers: {
      ...headers,
      Authorization: headers?.Authorization || `Bearer ${accessToken}`,
      "content-type": "application/json",
      "Apollo-Require-Preflight": "true",
    },
    ...options,
  });
};

const getGraphQLError = (
  body: Record<"errors", GraphQLFormattedError[] | undefined>
): CustomError | null => {
  if (!body) {
    return new CustomError({
      statusCode: "INTERNAL_SERVER_ERROR",
      message: "No GraphQL error found in response",
    });
  }

  let errors: GraphQLFormattedError[] | undefined;
  let messages: string | undefined;
  if ("errors" in body) {
    errors = body?.errors;

    messages = errors?.map((error) => error?.message)?.join("\n");
  }
  const code = errors?.[0]?.extensions?.code;

  return {
    name: "GraphQLError",
    message: messages || JSON.stringify(errors),
    statusCode: code || 500,
  };
  return null;
};

class CustomError extends Error {
  statusCode: string | number;

  constructor({
    message,
    statusCode,
  }: {
    message: string;
    statusCode: string | number;
  }) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const fetchWrapper = async (url: string, options: RequestInit) => {
  const response = await customFetch(url, options);

  const responseClone = response.clone();
  const body = await responseClone.json();

  const error = getGraphQLError(body);
  if (error) {
    throw error;
  }
  return response;
};
