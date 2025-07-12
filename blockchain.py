import hashlib
import json
from time import time
from typing import List, Dict, Any

class Block:
    def __init__(self, index: int, transactions: List[Dict], timestamp: float, previous_hash: str, nonce: int = 0):
        self.index = index
        self.transactions = transactions
        self.timestamp = timestamp
        self.previous_hash = previous_hash
        self.nonce = nonce

    def compute_hash(self) -> str:
        block_string = json.dumps(self.__dict__, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

class Blockchain:
    def __init__(self):
        self.chain: List[Block] = []
        self.current_transactions: List[Dict] = []
        self.nodes = set()
        self.create_genesis_block()

    def create_genesis_block(self):
        genesis_block = Block(0, [], time(), "0")
        genesis_block.hash = genesis_block.compute_hash()
        self.chain.append(genesis_block)

    def add_block(self, block: Block, proof: str) -> bool:
        previous_hash = self.last_block.hash
        if previous_hash != block.previous_hash:
            return False
        if not self.is_valid_proof(block, proof):
            return False
        block.hash = proof
        self.chain.append(block)
        return True

    def is_valid_proof(self, block: Block, block_hash: str) -> bool:
        return block_hash.startswith('0000') and block_hash == block.compute_hash()

    def proof_of_work(self, block: Block) -> str:
        block.nonce = 0
        computed_hash = block.compute_hash()
        while not computed_hash.startswith('0000'):
            block.nonce += 1
            computed_hash = block.compute_hash()
        return computed_hash

    def add_new_transaction(self, sender: str, recipient: str, amount: float) -> int:
        self.current_transactions.append({
            'sender': sender,
            'recipient': recipient,
            'amount': amount
        })
        return self.last_block.index + 1

    def mine(self) -> Dict[str, Any]:
        if not self.current_transactions:
            return {'message': 'No transactions to mine'}

        last_block = self.last_block
        new_block = Block(
            index=last_block.index + 1,
            transactions=self.current_transactions,
            timestamp=time(),
            previous_hash=last_block.hash
        )

        proof = self.proof_of_work(new_block)
        self.add_block(new_block, proof)
        self.current_transactions = []

        return {
            'message': 'New block mined',
            'index': new_block.index,
            'hash': new_block.hash,
            'transactions': new_block.transactions
        }

    def register_node(self, address: str):
        self.nodes.add(address)

    def is_chain_valid(self, chain: List[Block]) -> bool:
        for i in range(1, len(chain)):
            current = chain[i]
            previous = chain[i-1]
            if current.hash != current.compute_hash():
                return False
            if current.previous_hash != previous.hash:
                return False
        return True

    @property
    def last_block(self) -> Block:
        return self.chain[-1]