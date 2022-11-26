import { getBody } from '../../src/getBody';

exports.handler = async function () {
  const body = getBody();
  return {
    statusCode: 200,
    body,
  };
};
