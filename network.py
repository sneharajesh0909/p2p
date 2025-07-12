import requests
from urllib.parse import urlparse
from backend.blockchain import Blockchain
class P2PNetwork:
    def __init__(self, blockchain: Blockchain):
        self.blockchain = blockchain
        self.nodes = set()
    
    def register_node(self, address: str):
        parsed_url = urlparse(address)
        self.nodes.add(parsed_url.netloc)
    
    def broadcast_transaction(self, sender: str, recipient: str, amount: float):
        for node in self.nodes:
            try:
                requests.post(f'http://{node}/transactions/new', json={
                    'sender': sender,
                    'recipient': recipient,
                    'amount': amount
                })
            except requests.exceptions.RequestException:
                continue
    
    def broadcast_block(self, block: dict):
        for node in self.nodes:
            try:
                requests.post(f'http://{node}/blocks/receive', json=block)
            except requests.exceptions.RequestException:
                continue
    
    def resolve_conflicts(self) -> bool:
        max_length = len(self.blockchain.chain)
        new_chain = None
        
        for node in self.nodes:
            try:
                response = requests.get(f'http://{node}/chain')
                if response.status_code == 200:
                    length = response.json()['length']
                    chain = response.json()['chain']
                    
                    if length > max_length and self.blockchain.is_chain_valid(chain):
                        max_length = length
                        new_chain = chain
            except requests.exceptions.RequestException:
                continue
        
        if new_chain:
            self.blockchain.chain = new_chain
            return True
        return False