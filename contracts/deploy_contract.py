#!/usr/bin/env python3
"""
Deploy script for DID Registry smart contract
Feature 3 implementation
Deploys to Algorand TestNet and saves App ID
"""

import os
import sys
import base64
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from algosdk import mnemonic, transaction, encoding
from algosdk.account import address_from_private_key
from algosdk.v2client import algod


# Load environment variables from backend
env_path = Path(__file__).parent.parent / "backend" / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    print(f"Warning: .env file not found at {env_path}")


def get_algod_client():
    """Create Algod client for TestNet"""
    algod_address = os.getenv("VITE_ALGOD_URL", "https://testnet-api.algonode.cloud")
    algod_token = ""  # algonode doesn't require token
    return algod.AlgodClient(algod_token, algod_address)


def get_approval_teal():
    """Return the approval program TEAL code"""
    return """#pragma version 8
txna Txn ApplicationArgs 0
method "register_did(byte[])byte[]:0"
==
bnz register_did
txna Txn ApplicationArgs 0
method "issue_credential(account,byte[],byte[],uint64)byte[]:1"
==
bnz issue_credential
txna Txn ApplicationArgs 0
method "verify_credential(account,byte[])byte[]:2"
==
bnz verify_credential
txna Txn ApplicationArgs 0
method "get_did(account)byte[]:3"
==
bnz get_did
err

register_did:
txn NumAppArgs
int 2
==
assert
int 0
txna Txn ApplicationArgs 1
app_local_put
txn Sender
txna Txn ApplicationArgs 1
concat
byte "did:algo:testnet:"
txn Sender
concat
return

issue_credential:
txn Sender
global CreatorAddress
==
assert
txn NumAppArgs
int 4
==
assert
int 0
txna Txn ApplicationArgs 1
txna Txn ApplicationArgs 2
concat
txna Txn ApplicationArgs 3
app_local_put
byte "credential_issued"
return

verify_credential:
txn NumAppArgs
int 2
==
assert
txna Txn ApplicationArgs 1
txna Txn ApplicationArgs 2
concat
int 0
app_local_get_ex
bnz found
byte "not_found"
return
found:
return

get_did:
txn NumAppArgs
int 1
==
assert
txna Txn ApplicationArgs 1
int 0
app_local_get_ex
bnz has_did
byte "not_registered"
return
has_did:
return
"""


def get_clear_teal():
    """Return the clear state program TEAL code"""
    return """#pragma version 8
int 1
"""


def deploy_contract():
    """Deploy the contract to TestNet"""
    
    print("\n" + "="*60)
    print("  🚀 DID Registry Smart Contract Deployment")
    print("="*60)
    
    try:
        client = get_algod_client()
        
        # Get university account from mnemonic
        university_mnemonic = os.getenv("UNIVERSITY_MNEMONIC")
        if not university_mnemonic:
            print("\n❌ ERROR: UNIVERSITY_MNEMONIC not found in .env")
            return None
        
        university_private_key = mnemonic.to_private_key(university_mnemonic)
        university_address = address_from_private_key(university_private_key)
        
        print(f"\n✅ University Account: {university_address}")
        
        # Compile programs
        approval_teal = get_approval_teal()
        clear_teal = get_clear_teal()
        
        print("\n📦 Compiling approval program...")
        approval_response = client.compile(approval_teal)
        approval_program = base64.b64decode(approval_response["result"])
        print("   ✅ Approval program compiled")
        
        print("📦 Compiling clear program...")
        clear_response = client.compile(clear_teal)
        clear_program = base64.b64decode(clear_response["result"])
        print("   ✅ Clear program compiled")
        
        # Get suggested parameters
        print("\n⏳ Getting network parameters...")
        sp = client.suggested_params()
        print(f"   ✅ Last round: {sp.first}")
        
        # Create application creation transaction
        print("\n📝 Creating app creation transaction...")
        txn = transaction.ApplicationCreateTxn(
            sender=university_address,
            index=0,
            approval_program=approval_program,
            clear_program=clear_program,
            global_schema=transaction.StateSchema(num_uints=0, num_byte_slices=100),
            local_schema=transaction.StateSchema(num_uints=0, num_byte_slices=100),
            sp=sp,
        )
        print("   ✅ Transaction created")
        
        # Sign transaction
        print("\n✍️  Signing transaction...")
        signed_txn = txn.sign(university_private_key)
        print("   ✅ Transaction signed")
        
        # Submit transaction
        print("\n🚀 Submitting to network...")
        txid = client.send_transaction(signed_txn)
        print(f"   ✅ Transaction ID: {txid}")
        
        # Wait for confirmation
        print("\n⏳ Waiting for confirmation...")
        confirmed_txn = transaction.wait_for_confirmation(client, txid, 5)
        print("   ✅ Transaction confirmed")
        
        app_id = confirmed_txn["application-index"]
        
        print("\n" + "="*60)
        print("  ✨ DEPLOYMENT SUCCESSFUL!")
        print("="*60)
        print(f"\n📊 Contract Details:")
        print(f"   App ID: {app_id}")
        print(f"   Network: Algorand TestNet")
        print(f"   Creator: {university_address}")
        print(f"   Transaction: {txid}")
        
        return app_id
        
    except Exception as e:
        print(f"\n❌ Error during deployment: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def save_app_id(app_id):
    """Save App ID to .env files"""
    
    print("\n💾 Saving configuration...")
    
    # Update backend .env
    backend_env = Path(__file__).parent.parent / "backend" / ".env"
    with open(backend_env, "r") as f:
        backend_lines = f.readlines()
    
    updated_backend = []
    for line in backend_lines:
        if line.startswith("VITE_APP_ID="):
            updated_backend.append(f"VITE_APP_ID={app_id}\n")
        else:
            updated_backend.append(line)
    
    with open(backend_env, "w") as f:
        f.writelines(updated_backend)
    print(f"   ✅ backend/.env updated with App ID: {app_id}")
    
    # Update frontend .env
    frontend_env = Path(__file__).parent.parent / "frontend" / ".env"
    if frontend_env.exists():
        with open(frontend_env, "r") as f:
            frontend_lines = f.readlines()
        
        updated_frontend = []
        for line in frontend_lines:
            if line.startswith("VITE_APP_ID="):
                updated_frontend.append(f"VITE_APP_ID={app_id}\n")
            else:
                updated_frontend.append(line)
        
        with open(frontend_env, "w") as f:
            f.writelines(updated_frontend)
        print(f"   ✅ frontend/.env updated with App ID: {app_id}")
    else:
        # Create frontend .env
        frontend_content = f"""VITE_BACKEND_URL=http://localhost:3001
VITE_ALGOD_URL=https://testnet-api.algonode.cloud
VITE_INDEXER_URL=https://testnet-idx.algonode.cloud
VITE_APP_ID={app_id}
"""
        with open(frontend_env, "w") as f:
            f.write(frontend_content)
        print(f"   ✅ frontend/.env created with App ID: {app_id}")
    
    # Save to contracts directory
    deployed_file = Path(__file__).parent / "deployed_app_id.txt"
    with open(deployed_file, "w") as f:
        f.write(f"DID Registry Smart Contract\n")
        f.write(f"App ID: {app_id}\n")
        f.write(f"Network: Algorand TestNet\n")
    print(f"   ✅ contracts/deployed_app_id.txt created")


def main():
    """Main deployment function"""
    
    # Deploy contract
    app_id = deploy_contract()
    
    if app_id is None:
        print("\n❌ Deployment failed!")
        sys.exit(1)
    
    # Save configuration
    save_app_id(app_id)
    
    print("\n" + "="*60)
    print("  ✅ FEATURE 3 COMPLETE!")
    print("="*60)
    print(f"\n📝 Summary:")
    print(f"   ✅ Smart contract compiled")
    print(f"   ✅ Contract deployed to TestNet")
    print(f"   ✅ App ID: {app_id}")
    print(f"   ✅ Configuration files updated")
    print(f"\n🚀 Next Steps:")
    print(f"   - Both .env files have App ID: {app_id}")
    print(f"   - Restart your servers to load new .env")
    print(f"   - Ready for Feature 4: DID Creation\n")


if __name__ == "__main__":
    main()
