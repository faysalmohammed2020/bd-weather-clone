import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const { signIn, signUp, signOut, useSession, admin } = createAuthClient({
  plugins: [
    adminClient(),
    inferAdditionalFields({
      user: {
        district: {
          type: "string",
        },
        division: {
          type: "string",
        },
        upazila: {
          type: "string",
        },
        stationName: {
          required: false,
          type: "string",
        },
        stationId: {
          required: false,
          type: "string",
        },
        securityCode: {
          // Changed from stationCode to securityCode to match your schema
          required: false,
          type: "string",
        },
        role: {
          required: true,
          type: "string",
        },
      },
    }),
  ],
});
