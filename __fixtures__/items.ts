export default {
  positiveCase: {
    items: [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
      { id: 4, name: "Item 4" },
      { id: 5, name: "Item 5" },
    ],
  },
  negativeCase: {
    rateLimit: {
      errors: [
        {
          id: "rate_limit_exceeded",
          message: "Rate limit exceeded",
        },
      ],
    },
  },
};
