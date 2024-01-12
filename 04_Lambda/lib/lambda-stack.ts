import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';


export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const role = iam.Role.fromRoleName(this, "Role", "ttcc-iam-lambda", {
    //   mutable: false
    // });

    const role = new iam.Role(this, "LambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      roleName: "iamRoleForLambda",
      description: "IAM Role for Lambda",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
      ]
    });

    const lambdaNames = ['Sample1', 'Sample2', 'Sample3', 'Sample4', 'Sample5'];

    for (let i = 0; i < lambdaNames.length; i++) {
      const testLambda = new lambda.Function(this, `Lambda${lambdaNames[i]}`, {
        functionName: `lambda-${lambdaNames[i]}`,
        code: lambda.Code.fromAsset('../04_Lambda/lib/lambdaCodes/'),
        handler: 'lambda_function.lambda_handler',
        runtime: lambda.Runtime.PYTHON_3_11,
        role: role,
        memorySize: 128,
        timeout: Duration.seconds(20)
      });
    }
  }
}