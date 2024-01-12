#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from '../lib/lambda-stack';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();
new LambdaStack(app, 'LambdaStack');