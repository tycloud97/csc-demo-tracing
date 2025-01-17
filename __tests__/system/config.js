exports.config = {
  endpoints: {
    dev: {
      createOrderServiceEndpoint:
        'https://abcde12345.execute-api.us-east-1.amazonaws.com/dev/createOrder',
      databaseServiceEndpoint:
        'https://abcde12345.execute-api.us-east-1.amazonaws.com/dev/database'
    },
    prod: {
      createOrderServiceEndpoint:
        'https://abcde12345.execute-api.us-east-1.amazonaws.com/dev/createOrder',
      databaseServiceEndpoint:
        'https://abcde12345.execute-api.us-east-1.amazonaws.com/prod/database'
    }
  }
};
