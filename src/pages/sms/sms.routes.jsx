import SMSPage from "./SMSPage";

export const smsRoutes = [
  {
    path: "/sms",
    element: <SMSPage />,
    meta: {
      guard: "auth",
    },
  },
];

