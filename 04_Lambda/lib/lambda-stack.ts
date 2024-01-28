import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
// import * as sns from 'aws-cdk-lib/aws-sns';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPCの作成
    const vpc = new ec2.Vpc(this, 'VPC', {
      vpcName: 'VPCforLambdaFunctions',
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      subnetConfiguration: [],
      maxAzs: 3,
      enableDnsHostnames: true,
      enableDnsSupport:true,
      createInternetGateway: false,
      natGateways: 0,
    });

    // プライベートサブネットの作成
    const privateSubnet01 = new ec2.PrivateSubnet(this, 'PrivateSubnet01', {
      vpcId: vpc.vpcId,
      cidrBlock: '10.0.0.0/24',
      availabilityZone: vpc.availabilityZones[0]
    });
    const privateSubnet02 = new ec2.PrivateSubnet(this, 'PrivateSubnet02', {
      vpcId: vpc.vpcId,
      cidrBlock: '10.0.1.0/24',
      availabilityZone: vpc.availabilityZones[1]
    });
    const privateSubnet03 = new ec2.PrivateSubnet(this, 'PrivateSubnet03', {
      vpcId: vpc.vpcId,
      cidrBlock: '10.0.2.0/24',
      availabilityZone: vpc.availabilityZones[2]
    });

    // VPC Lambda用のIAMロールを作成
    const role = new iam.Role(this, "LambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      roleName: "iamRoleForLambda",
      description: "IAM Role for Lambda",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
      ]
    });

    const lambdaNames = ['lambda-01', 'lambda-02', 'lambda-03'];

    for (let i = 0; i < lambdaNames.length; i++) {
      const lambdaName = lambdaNames[i];
      const lambdaFunction = new lambda.Function(this, `${lambdaNames[i]}`, {
        functionName: `${lambdaNames[i]}`,
        description: `${lambdaNames[i]}`,
        environment: {
          'LAMBDA_NAME': lambdaName
        },
        code: lambda.Code.fromAsset(`../04_Lambda/lib/src/${lambdaNames[i]}`), // フォルダ名を指定する
        handler: 'lambda_function.lambda_handler',
        runtime: lambda.Runtime.PYTHON_3_12,
        role: role,
        memorySize: 128,
        timeout: Duration.seconds(20),
        retryAttempts: 0,
      });
      const errorAlarm = new cloudwatch.Alarm(this, `ErrorAlarmFor${lambdaNames[i]}`, {
        alarmName: `${lambdaNames[i]}_ErrorAlarm`,
        alarmDescription: `${lambdaNames[i]}_ErrorAlarm`,
        evaluationPeriods: 1,
        threshold: 3,
        metric: lambdaFunction.metricErrors({
          period: cdk.Duration.minutes(1)
        }),
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        actionsEnabled: true,
      });
      const throttlingAlarm = new cloudwatch.Alarm(this, `ThrottlingAlarmFor${lambdaNames[i]}`, {
        alarmName: `${lambdaNames[i]}_ThrottlingAlarm`,
        alarmDescription: `${lambdaNames[i]}_ThrottlingAlarm`,
        evaluationPeriods: 1,
        threshold: 3,
        metric: lambdaFunction.metricThrottles({
          period: cdk.Duration.minutes(1)
        }),
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        actionsEnabled: true,
      });
    }
  }
}