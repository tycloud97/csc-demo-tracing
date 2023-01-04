require('source-map-support').install();

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import nodemailer from 'nodemailer';

import Log from '@dazn/lambda-powertools-logger';
import { createTransport } from './frameworks/nodemailer';

const NODEMAILER_USER = process.env.NODEMAILER_USER;
const NODEMAILER_PASS = process.env.NODEMAILER_PASS;
if (!NODEMAILER_USER || !NODEMAILER_USER)
  throw new Error('Missing Nodemailer user and/or password!');

import wrap from '@dazn/lambda-powertools-pattern-basic';
import AWSXRay from 'aws-xray-sdk';
import { reportError, withMiddlewares } from '../../common/Tracing/middleware';
import { createMessage } from './frameworks/messages';

export const Email = wrap(withMiddlewares(EmailHandler))
const delay = ms => new Promise(res => setTimeout(res, ms));

const request = async () => {
  Log.info("request ne")
  const segment = AWSXRay.getSegment();  //returns the facade segment
  const subsegment = segment.addNewSubsegment('subseg');
  await delay(5000);
  await request2(subsegment)
  subsegment.close();
}

const request2 = async (sm) => {
  Log.info("request ne")
  // const segment = AWSXRay.getSegment();  //returns the facade segment
  const subsegment = sm.addNewSubsegment('subseg22');
  await delay(1000);


  subsegment.close();
}



/**
 * @description Send email with Ethereal mail service
 */
export async function EmailHandler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  Log.info('event1111111111', { event })
  const subsegment = AWSXRay.getSegment();

  Log.info('subsegment', { subsegment })

  const eventBody = event.body ? JSON.parse(event.body) : event;
  const transaction = eventBody.transaction;

  const message = createMessage(transaction, eventBody);

  const mailTransport = createTransport(NODEMAILER_USER, NODEMAILER_PASS);
  Log.info("Chan the bro")
  await request();
  // Attempt to send the email
  Log.info("222222222222")
  try {
    generateResultRandomly()
    await runOperations(5);

    const mail = await mailTransport.sendMail(message);
    const previewUrl = nodemailer.getTestMessageUrl(mail);
    return {
      statusCode: 200,
      body: JSON.stringify(previewUrl)
    } as APIGatewayProxyResult;
  } catch (error) {
    Log.error(error)
    // subsegment.addError(error);
    reportError(error)
    xray(error);
    // Log.info("1111111111111")
    return {
      statusCode: 400,
      body: JSON.stringify(error)
    } as APIGatewayProxyResult;
  } finally {
    subsegment.close()
  }
}

function xray(error: Error) {
  let subsegment = AWSXRay.getSegment().addNewSubsegment("Downstream Service Call Failure");
  subsegment.addError(error);
  subsegment.close();
}

async function runOperations(n) {
  AWSXRay.captureAsyncFunc('send', function (subsegment) {
    console.log(`Running ${n} operations sequentially...`)


    for (let i = 0; i < n; ++i) {
      AWSXRay.captureAsyncFunc(`my-subsegment-${i}`, (subsegment) => {
        telemetry(1000, i);
        subsegment.close()
      }, subsegment);
    }


    console.log("Done!")
  })


}

async function telemetry(ms, i) {
  console.log(`Task ${i} - Sleep for ${ms} ms ...`);
  await sleep(ms);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
var win_percentage = 10;


function generateResultRandomly() {
  var random = Math.floor(Math.random() * 101); // returns a random integer from 0 to 100
  if (random <= win_percentage) {
    throw new Error('Chúc mừng bạn đã rơi vào 10% lỗi @@')
  }
}