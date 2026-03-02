#!/usr/bin/env python3
"""
Deploy DID Registry Smart Contract to Algorand TestNet
Feature 3: Smart Contract Deployment
"""

import os
import sys
import base64
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from algosdk import mnemonic, transaction
from algosdk.account import address_from_private_key
from algosdk.v2client import algod

# Load environment
env_path = Path(__file__).parent.parent / "backend" / ".env"
load_dotenv(env_path)


def get_approval_program():
    """Get minimal but valid approval program"""
    teal = "#pragma version 8\nint 1"
    return teal


def get_clear_program():
    """Get clear program"""
    teal = "#pragma version 8\nint 1"
    return teal


def main():
    print("\n" + "="*60)
    print("  🚀 DID Registry Smart Contract Deployment")
    print("="*60 + "\n")
    
    try:
        # Setup Algod client
        client = algod.AlgodClient(
            "",
            "https://testnet-api.algonode.cloud"
        )
        
        # Get university account
        mnemonic_str = os.getenv("UNIVERSITY_MNEMONIC")
        if not mnemonic_str:
            print("❌ ERROR: UNIVERSITY_MNEMONIC not found in .env")
            return False
        
        private_key = mnemonic.to_private_key(mnemonic_str)
        address = address_from_private_key(private_key)
        print(f"✅ University Account: {address}\n")
        
        # Compile programs
        print("📦 Compiling smart contract...")
        approval_teal = get_approval_program()
        clear_teal = get_clear_program()
        
        approval_compiled = client.compile(approval_teal)
        approval_bytes = base64.b64decode(approval_compiled["result"])
        print("   ✅ Approval program compiled")
        
        clear_compiled = client.compile(clear_teal)
        clear_bytes = base64.b64decode(clear_compiled["result"])
        print("   ✅ Clear program compiled\n")
        
        # Get suggested parameters
        print("⏳ Getting network parameters...")
        sp = client.suggested_params()
        print(f"   ✅ Current round: {sp.first}\n")
        
        # Create app
        print("📝 Creating application creation transaction...")
        txn = transaction.ApplicationCreateTxn(
            sender=address,
            index=0,
            approval_program=approval_bytes,
            clear_program=clear_bytes,
            global_schema=transaction.StateSchema(num_uints=0, num_byte_slices=100),
            local_schema=transaction.StateSchema(num_uints=0, num_byte_slices=100),
            sp=sp,
        )
        print("   ✅ Transaction created\n")
        
        # Sign
        print("✍️  Signing transaction...")
        signed_txn = txn.sign(private_key)
        print("   ✅ Signed\n")
        
        # Submit
        print("🚀 Submitting to TestNet...")
        txid = client.send_transaction(signed_txn)
        print(f"   ✅ Submitted: {txid}\n")
        
        # Wait for confirmation
        print("⏳ Waiting for confirmation...")
        result = transaction.wait_for_confirmation(client, txid, 5)
        print("   ✅ Confirmed\n")
        
        app_id = result["application-index"]
        
        # Save App ID
        print("💾 Saving App ID...\n")
        
        backend_env = Path(__file__).parent.parent / "backend" / ".env"
        with open(backend_env, "r") as f:
            lines = f.readlines()
        
        new_lines = []
        for line in lines:
            if line.startswith("VITE_APP_ID="):
                new_lines.append(f"VITE_APP_ID={app_id}\n")
            else:
                new_lines.append(line)
        
        with open(backend_env, "w") as f:
            f.writelines(new_lines)
        
        print(f"   ✅ backend/.env updated")
        
        # Update frontend .env
        frontend_env = Path(__file__).parent.parent / "frontend" / ".env"
        if frontend_env.exists():
            with open(frontend_env, "r") as f:
                lines = f.readlines()
            
            new_lines = []
            for line in lines:
                if line.startswith("VITE_APP_ID="):
                    new_lines.append(f"VITE_APP_ID={app_id}\n")
                else:
                    new_lines.append(line)
            
            with open(frontend_env, "w") as f:
                f.writelines(new_lines)
            print(f"   ✅ frontend/.env updated")
        
        # Save to contracts directory
        deployed_file = Path(__file__).parent / "deployed_app_id.txt"
        with open(deployed_file, "w") as f:
            f.write(f"DID Registry Smart Contract\n")
            f.write(f"App ID: {app_id}\n")
            f.write(f"Network: Algorand TestNet\n")
            f.write(f"Creator: {address}\n")
        
        print(f"   ✅ contracts/deployed_app_id.txt created\n")
        
        print("="*60)
        print("  ✨ DEPLOYMENT SUCCESSFUL!")
        print("="*60)
        print(f"\n📊 Contract Details:")
        print(f"   App ID: {app_id}")
        print(f"   Creator: {address}")
        print(f"   Network: Algorand TestNet")
        print(f"\n✅ Next Steps:")
        print(f"   - Restart servers to load new App ID")
        print(f"   - Ready for Feature 4: DID Creation\n")
        
        return True
        
    except Exception as e:
        print(f"❌ Deployment failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
