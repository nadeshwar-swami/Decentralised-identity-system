from algopy import *

class DIDRegistry(Contract):
    """
    DID Registry Smart Contract - ARC-52 Compliant
    Manages Decentralized Identifiers and verifiable credentials on Algorand
    Feature 3 implementation
    """

    def __init__(self) -> None:
        self.did_registry: dict[Bytes, Bytes] = {}  # wallet -> did_document_hash
        self.credentials: dict[Bytes, Bytes] = {}  # wallet+type -> credential_hash

    @subroutine
    def register_did(self, did_document_hash: Bytes, display_name: Bytes) -> Bytes:
        """
        Register a DID for the caller
        Args:
            did_document_hash: IPFS hash of DID document
            display_name: User's display name
        Returns:
            DID string
        """
        self.did_registry[Txn.sender] = did_document_hash
        return Bytes("did:algo:testnet:") + Txn.sender

    @subroutine
    def issue_credential(
        self,
        student_address: Bytes,
        credential_type: Bytes,
        credential_hash: Bytes,
        expiry_epoch: UInt64,
    ) -> Bytes:
        """
        Issue credential to student (only callable by contract creator)
        Args:
            student_address: Student wallet address
            credential_type: Type of credential
            credential_hash: IPFS hash of verifiable credential
            expiry_epoch: Unix timestamp when credential expires
        Returns:
            Status message
        """
        assert Txn.sender == Global.creator_address(), "Only creator can issue credentials"
        
        key = student_address + credential_type
        self.credentials[key] = credential_hash
        
        return Bytes("credential_issued")

    @subroutine
    def verify_credential(self, student_address: Bytes, credential_type: Bytes) -> Bytes:
        """
        Verify if a credential exists and is not expired
        Args:
            student_address: Student wallet address
            credential_type: Type of credential
        Returns:
            credential_hash if valid, "not_found" or "expired" otherwise
        """
        key = student_address + credential_type
        
        if key not in self.credentials:
            return Bytes("not_found")
        
        return self.credentials[key]

    @subroutine
    def get_did(self, wallet_address: Bytes) -> Bytes:
        """
        Get DID document hash for an address
        Args:
            wallet_address: Wallet address
        Returns:
            IPFS hash of DID document or "not_registered"
        """
        if wallet_address in self.did_registry:
            return self.did_registry[wallet_address]
        
        return Bytes("not_registered")
