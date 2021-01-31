import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

type OrderCreated = {
  orderId: number;
  products: string;
  totalPrice: number;
};

/**
 * @description Example of how a finance service could receive basic information about money generated by an order
 */
export async function Finance(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult | void> {
  const eventBody = event.body ? JSON.parse(event.body) : event;

  if (eventBody['detail-type'] === 'OrderCreated') {
    const orderEvent: OrderCreated = eventBody.detail;
    const priceInDollars: number = orderEvent.totalPrice / 100;
    const message = `Adding order ID "${orderEvent.orderId}" and $${priceInDollars} to the books!`;
    console.log(message);

    return {
      statusCode: 200,
      body: JSON.stringify(message)
    } as APIGatewayProxyResult;
  }

  console.error('No valid event passed');

  return {
    statusCode: 400,
    body: JSON.stringify('No valid event passed')
  } as APIGatewayProxyResult;
}
