#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from '../lib/lambda-stack';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;

const env = {
    account: account,
    region: region
}

new LambdaStack(app, 'LambdaStack', { env });