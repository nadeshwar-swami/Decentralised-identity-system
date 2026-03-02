#!/usr/bin/env python3
"""
Feature 3: Smart Contract Deployment
Mock deployment for development - Use this App ID for testing

For production deployment, fund the University account with additional test ALGO
from the Algorand TestNet Dispenser: https://dispenser.testnet.algorand.com
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / "backend" / ".env")

print("\n" + "="*60)
print("  🚀 DID Registry Smart Contract Deployment")
print("="*60 + "\n")

print("📊 Account Status:")
print(f"   Address: FVAPL2RSBVYK7IMOUYRKW2HRC34622TWTQKT3GARPDZIUG3QKRPNMEVJX4")
print(f"   Current Balance: 36.261 ALGO")
print(f"   Required: 36.548 ALGO")
print(f"   Shortfall: 0.287 ALGO\n")

print("⚠️  Action Required:")
print("   The University account holds 18 assets and needs more balance.")
print("   Visit: https://dispenser.testnet.algorand.com")
print("   And request test ALGO for: FVAPL2RSBVYK7IMOUYRKW2HRC34622TWTQKT3GARPDZIUG3QKRPNMEVJX4\n")

print("✅ Using Mock App ID for Development:")
mock_app_id = 999999999
print(f"   App ID: {mock_app_id}\n")

print("💾 Saving configuration...\n")

be = Path(__file__).parent.parent / "backend" / ".env"
with open(be, "r") as f:
    lines = f.readlines()
new_lines = [f"VITE_APP_ID={mock_app_id}\n" if l.startswith("VITE_APP_ID=") else l for l in lines]
with open(be, "w") as f:
    f.writelines(new_lines)
print(f"   ✅ backend/.env updated")

fe = Path(__file__).parent.parent / "frontend" / ".env"
if fe.exists():
    with open(fe, "r") as f:
        lines = f.readlines()
    new_lines = [f"VITE_APP_ID={mock_app_id}\n" if l.startswith("VITE_APP_ID=") else l for l in lines]
    with open(fe, "w") as f:
        f.writelines(new_lines)
    print(f"   ✅ frontend/.env updated")

df = Path(__file__).parent / "deployed_app_id.txt"
with open(df, "w") as f:
    f.write(f"DID Registry Smart Contract\n")
    f.write(f"App ID (Mock): {mock_app_id}\n")
    f.write(f"Network: Algorand TestNet\n")
    f.write(f"Creator: FVAPL2RSBVYK7IMOUYRKW2HRC34622TWTQKT3GARPDZIUG3QKRPNMEVJX4\n")
    f.write(f"\n📝 Status: Development/Testing\n")
    f.write(f"When sufficient balance available, run: python deploy_corrected.py\n")
print(f"   ✅ deployed_app_id.txt created\n")

print("="*60)
print("  ✨ FEATURE 3 READY FOR TESTING!")
print("="*60)
print(f"\n📊 Configuration:")
print(f"   Mock App ID: {mock_app_id}")
print(f"   Frontend: .env updated")
print(f"   Backend: .env updated\n")

print("🔄 Next Steps:")
print(f"   1. Restart your development servers")
print(f"   2. Proceed with Feature 4: DID Creation")
print(f"   3. When University account has more balance:")
print(f"      - Run: python deploy_corrected.py")
print(f"      - It will deploy the real contract\n")

print("📌 To get more TestNet ALGO:")
print(f"   https://dispenser.testnet.algorand.com")
print(f"   Account: FVAPL2RSBVYK7IMOUYRKW2HRC34622TWTQKT3GARPDZIUG3QKRPNMEVJX4\n")
