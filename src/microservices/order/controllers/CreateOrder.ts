require('source-map-support').install();

import wrap from '@dazn/lambda-powertools-pattern-basic';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { makeNewOrder } from '../entities/Order';

import { OrderB2B, OrderB2C } from '../contracts/Order';
import { OrderDto } from '../contracts/OrderDto';

import { useCaseB2bUs } from '../usecases/useCaseB2bUs';
import { useCaseB2cMx } from '../usecases/useCaseB2cMx';
import { useCaseB2cUs } from '../usecases/useCaseB2cUs';


import { emitEvent } from '../../../common/EmitEvent/EmitEvent';
import { withMiddlewares } from '../../../common/Tracing/middleware';

import Log from '@dazn/lambda-powertools-logger';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

export const CreateOrder = (withMiddlewares(CreateOrderHandler))

const daznCorrelationHeaders = ['awsRequestId', 'x-correlation-id', 'call-chain-length', 'debug-log-enabled'];

/**
 * @description Create an order, which is the first part of the order journey
 */
export async function CreateOrderHandler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  // Handle CORS
  Log.info('event', {event})
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': `Content-Type, Authorization, ${daznCorrelationHeaders.join(', ')}`,
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'access-control-allow-credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
      },
      body: JSON.stringify('OK')
    } as APIGatewayProxyResult;
  }

  try {
    const body = event.body ? JSON.parse(event.body) : event;

    /**
     * Pull out all the data into a temporary Data Transfer Object
     */
    const orderData: OrderDto = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      street: body.street,
      city: body.city,
      customerType: body.customerType,
      market: body.market,
      products: body.products,
      totalPrice: body.totalPrice,
      testId: body.testId || 0,
      orgNumber: body.orgNumber || 0
    };

    const {
      name,
      email,
      phone,
      street,
      city,
      customerType,
      market,
      products,
      totalPrice,
      testId,
      orgNumber
    } = orderData;

    /**
     * Create a valid Order entity for us to work with
     */
    const order = makeNewOrder(orderData);

    /**
     * @description Use cases for B2B
     */
    if (customerType.toUpperCase() === 'B2B') {
      // US market
      if (market.toUpperCase() === 'US') {
        useCaseB2bUs(order as OrderB2B);
      }
      // Failure
      else throw new Error(`Invalid B2B market! Received market: ${market}`);
    }

    /**
     * @description Use cases for B2C
     */
    if (customerType.toUpperCase() === 'B2C') {
      // US market
      if (market.toUpperCase() === 'US') {
        useCaseB2cUs(order as OrderB2C);
      }
      // Mexico market
      else if (market.toUpperCase() === 'MX') {
        useCaseB2cMx(order as OrderB2C);
      }
      // Failure
      else throw new Error(`Invalid B2C market! Received market: ${market}`);
    }

    /**
     * Emit the data so other systems can continue processing it
     */
    Log.info('Order', order.getRequiredOrderPlacementData());


    const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')
    const correlationId = CorrelationIds.get();
    Log.info('correlationId', correlationId)

    await emitEvent('OrderCreated', { ...order.getRequiredOrderPlacementData(), correlationId: correlationId?.['x-correlation-id'] });

    /**
     * Frontend gets back an OK status code and a redirect URL so the customer is informed it's all A-OK
     */
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
      },
      body: JSON.stringify({
        status: 'SUCCESS',
        redirectUrl: '/success'
      })
    } as APIGatewayProxyResult;
  } catch (error) {
    reportError(error);
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
      },
      body: JSON.stringify(error)
    } as APIGatewayProxyResult;
  }
}
