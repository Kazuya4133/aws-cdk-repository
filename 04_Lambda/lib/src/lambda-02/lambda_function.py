import json
import os

def lambda_handler(event, context):
    # Lambda関数の名前を取得
    lambda_name = os.environ.get('LAMBDA_NAME', 'Unknown')

    # 応答メッセージを動的に生成
    return {
        "statusCode": 200,
        "body": json.dumps(f"Hello from {lambda_name}!")
    }