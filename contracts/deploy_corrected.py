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
print("  DID Registry Smart Contract Deployment")
print("="*60 + "\n")


def get_approval_program():
    return """#pragma version 8
txn ApplicationID
int 0
==
bnz init

txn OnCompletion
int NoOp
==
bnz no_op

txn OnCompletion
int OptIn
==
bnz approve

txn OnCompletion
int CloseOut
==
bnz approve

err

init:
int 1
return

approve:
int 1
return

no_op:
txn NumAppArgs
int 2
==
bz reject

txna ApplicationArgs 0
byte "register_did"
==
bz reject

txn Sender
txna ApplicationArgs 1
app_global_put

int 1
return

reject:
int 0
return
"""


def get_clear_program():
    return """#pragma version 8
int 1
"""

try:
    client = algod.AlgodClient("", "https://testnet-api.algonode.cloud")
    mnemonic_str = os.getenv("UNIVERSITY_MNEMONIC")
    if not mnemonic_str:
        print("[ERROR] UNIVERSITY_MNEMONIC not in .env")
        sys.exit(1)
    
    pk = mnemonic.to_private_key(mnemonic_str)
    addr = address_from_private_key(pk)
    print(f"[OK] University: {addr}\n")
    
    print("[PROCESS] Compiling...")
    app_compiled = client.compile(get_approval_program())
    app_bytes = base64.b64decode(app_compiled["result"])
    
    clr_compiled = client.compile(get_clear_program())
    clr_bytes = base64.b64decode(clr_compiled["result"])
    print("   [OK] Compiled\n")
    
    print("[PROCESS] Getting parameters...")
    sp = client.suggested_params()
    print(f"   [OK] Round: {sp.first}\n")
    
    print("[PROCESS] Creating transaction...")
    txn = transaction.ApplicationCreateTxn(
        sender=addr,
        approval_program=app_bytes,
        clear_program=clr_bytes,
        on_complete=transaction.OnComplete.NoOpOC,
        global_schema=transaction.StateSchema(num_uints=0, num_byte_slices=64),
        local_schema=transaction.StateSchema(num_uints=0, num_byte_slices=0),
        sp=sp,
    )
    print("   [OK] Created\n")
    
    print("[PROCESS] Signing...")
    signed = txn.sign(pk)
    print("   [OK] Signed\n")
    
    print("[PROCESS] Submitting...")
    txid = client.send_transaction(signed)
    print(f"   [OK] Submitted: {txid}\n")
    
    print("[PROCESS] Confirming...")
    result = transaction.wait_for_confirmation(client, txid, 5)
    print("   [OK] Confirmed\n")
    
    app_id = result["application-index"]
    
    print("[PROCESS] Saving App ID...\n")
    
    be = Path(__file__).parent.parent / "backend" / ".env"
    with open(be, "r") as f:
        lines = f.readlines()

    has_algorand_app_id = any(l.startswith("ALGORAND_APP_ID=") for l in lines)
    new_lines = [f"ALGORAND_APP_ID={app_id}\n" if l.startswith("ALGORAND_APP_ID=") else l for l in lines]
    if not has_algorand_app_id:
        if len(new_lines) > 0 and not new_lines[-1].endswith("\n"):
            new_lines[-1] = new_lines[-1] + "\n"
        new_lines.append(f"ALGORAND_APP_ID={app_id}\n")

    with open(be, "w") as f:
        f.writelines(new_lines)
    print(f"   [OK] backend/.env")
    
    fe = Path(__file__).parent.parent / "frontend" / ".env"
    if fe.exists():
        with open(fe, "r") as f:
            lines = f.readlines()
        new_lines = [f"VITE_APP_ID={app_id}\n" if l.startswith("VITE_APP_ID=") else l for l in lines]
        with open(fe, "w") as f:
            f.writelines(new_lines)
        print(f"   [OK] frontend/.env")
    
    df = Path(__file__).parent / "deployed_app_id.txt"
    with open(df, "w") as f:
        f.write(f"App ID: {app_id}\nNetwork: Algorand TestNet\nCreator: {addr}\n")
    print(f"   [OK] deployed_app_id.txt\n")
    
    print("="*60)
    print("  DEPLOYMENT SUCCESSFUL!")
    print("="*60)
    print(f"\nApp ID: {app_id}")
    print(f"   Creator: {addr}")
    print(f"   Network: Algorand TestNet\n")
    print("[OK] Ready for Feature 4: DID Creation\n")

except Exception as e:
    print(f"[ERROR] Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
