exports.handler = async function handler() {
  return {
    statusCode: 200,
    body: JSON.stringify({ node: process.version }),
  };
};
