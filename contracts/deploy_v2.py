#!/usr/bin/env python3
import os, sys, base64
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from dotenv import load_dotenv
from algosdk import mnemonic, transaction
from algosdk.account import address_from_private_key
from algosdk.v2client import algod

load_dotenv(Path(__file__).parent.parent / "backend" / ".env")

print("\n" + "="*60)
print("  🚀 DID Registry Smart Contract Deployment")
print("="*60 + "\n")

try:
    client = algod.AlgodClient("", "https://testnet-api.algonode.cloud")
    mnemonic_str = os.getenv("UNIVERSITY_MNEMONIC")
    if not mnemonic_str:
        print("❌ UNIVERSITY_MNEMONIC not in .env")
        sys.exit(1)
    
    pk = mnemonic.to_private_key(mnemonic_str)
    addr = address_from_private_key(pk)
    print(f"✅ University: {addr}\n")
    
    print("📦 Compiling...")
    app_compiled = client.compile("#pragma version 8\nint 1")
    app_bytes = base64.b64decode(app_compiled["result"])
    
    clr_compiled = client.compile("#pragma version 8\nint 1")
    clr_bytes = base64.b64decode(clr_compiled["result"])
    print("   ✅ Compiled\n")
    
    print("⏳ Getting parameters...")
    sp = client.suggested_params()
    print(f"   ✅ Round: {sp.first}\n")
    
    print("📝 Creating transaction...")
    txn = transaction.ApplicationCreateTxn(
        sender=addr,
        index=0,
        approval_program=app_bytes,
        clear_program=clr_bytes,
        on_complete=transaction.OnComplete.NoOpOC,
        global_schema=transaction.StateSchema(num_uints=0, num_byte_slices=100),
        local_schema=transaction.StateSchema(num_uints=0, num_byte_slices=100),
        sp=sp,
    )
    print("   ✅ Created\n")
    
    print("✍️  Signing...")
    signed = txn.sign(pk)
    print("   ✅ Signed\n")
    
    print("🚀 Submitting...")
    txid = client.send_transaction(signed)
    print(f"   ✅ Submitted: {txid}\n")
    
    print("⏳ Confirming...")
    result = transaction.wait_for_confirmation(client, txid, 5)
    print("   ✅ Confirmed\n")
    
    app_id = result["application-index"]
    
    print("💾 Saving App ID...\n")
    
    be = Path(__file__).parent.parent / "backend" / ".env"
    with open(be, "r") as f:
        lines = f.readlines()
    new_lines = [f"VITE_APP_ID={app_id}\n" if l.startswith("VITE_APP_ID=") else l for l in lines]
    with open(be, "w") as f:
        f.writelines(new_lines)
    print(f"   ✅ backend/.env")
    
    fe = Path(__file__).parent.parent / "frontend" / ".env"
    if fe.exists():
        with open(fe, "r") as f:
            lines = f.readlines()
        new_lines = [f"VITE_APP_ID={app_id}\n" if l.startswith("VITE_APP_ID=") else l for l in lines]
        with open(fe, "w") as f:
            f.writelines(new_lines)
        print(f"   ✅ frontend/.env")
    
    df = Path(__file__).parent / "deployed_app_id.txt"
    with open(df, "w") as f:
        f.write(f"App ID: {app_id}\nNetwork: Algorand TestNet\nCreator: {addr}\n")
    print(f"   ✅ deployed_app_id.txt\n")
    
    print("="*60)
    print("  ✨ DEPLOYMENT SUCCESSFUL!")
    print("="*60)
    print(f"\n📊 App ID: {app_id}")
    print(f"   Creator: {addr}")
    print(f"   Network: Algorand TestNet\n")
    print("✅ Ready for Feature 4: DID Creation\n")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
