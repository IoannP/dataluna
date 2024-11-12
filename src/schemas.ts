const authSchema = {
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string' },
      password: { type: 'string' },
    },
  },
};
const passwordSchema = {
  body: {
    type: 'object',
    required: ['userId', 'password'],
    properties: {
      userId: { type: 'integer' },
      password: { type: 'string' },
    },
  },
};

export default { authSchema, passwordSchema };