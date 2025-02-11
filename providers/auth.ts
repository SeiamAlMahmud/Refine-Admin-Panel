import { API_URL, dataProvider } from "./index";
import { AuthBindings } from "@refinedev/core";

export const authCredentials = {
  email: "michael.scott@gmail.com",
  password: "demodemo", // Include the password here
};

export const authProvider: AuthBindings = {
    login: async () => {
        try {
          // Simulated response
          const { data } = await dataProvider.custom({
            url: API_URL,
            method: "post",
            headers: {},
            meta: {
              variables: { 
                email: authCredentials.email, 
                password: authCredentials.password 
              },
              rawQuery: `
                mutation Login($email: String!, $password: String!) {
                  login(loginInput: {email: $email, password: $password}) {
                    accessToken
                  }
                }
              `,
            },
          });
      
          if (data?.login?.accessToken) {
            localStorage.setItem("access_token", data.login.accessToken);
            return {
              success: true,
              redirectTo: "/dashboard",
            };
          } else {
            throw new Error("Login failed: User not found or invalid credentials.");
          }
        } catch (error) {
          console.error("Login error:", error);
          return {
            success: false,
            error: new Error("Login failed: " + (error || "Unknown error")),
          };
        }
      },
      

  logout: async () => {
    // Remove the access token from localStorage
    localStorage.removeItem("access_token");
    return {
      success: true,
      redirectTo: "/login", // Redirect to the login page after logging out
    };
  },

  check: async () => {
    try {
      // Simulating success
      return {
        authenticated: true,
        redirectTo: "/",
      };

    //   Below code is commented out for now
      await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: {},
        meta: {
          variables: {},
          query: `
            query Me {
              me {
                name
              }
            }
          `,
        },
      });
      return {
        authenticated: true,
        redirectTo: "/",
      };
    } catch (error) {
      console.error("Auth check failed:", error);
      return {
        authenticated: false,
        redirectTo: "/login",
        error: new Error("Authentication check failed"),
      };
    }
  },

  onError: async (error) => {
    console.error("Auth provider error:", error);
    if (error.statusCode === "UNAUTHENTICATED") {
      return {
        logout: true,
        ...error,
      };
    }
  },

  getIdentity: async () => {
    const accessToken = await localStorage.getItem("access_token");
    try {
      // Simulating successful identity response
      return {
        id: "123",
        name: "Michael Scott",
        email: "michael.scott@gmail.com",
        phone: "+880123456789",
        jobTitle: "Regional Manager",
        timezone: "EST",
        avatarUrl: "http://example.com/avatar.jpg",
      };

      // Below code is commented out for now
      const { data } = await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: accessToken ? { Authorization: "Bearer " + accessToken } : {},
        meta: {
          rawQuery: `
            query Me {
              me {
                id
                name
                email
                phone
                jobTitle
                timezone
                avatarUrl
              }
            }
          `,
        },
      });
      return data.me;
    } catch (error) {
      console.error("Error fetching identity:", error);
      return undefined;
    }
  },
};
