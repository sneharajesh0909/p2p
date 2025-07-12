// Download vis-network.min.js from https://visjs.github.io/vis-network/docs/network/
// and place it in frontend/lib/vis-network.min.js

document.addEventListener('DOMContentLoaded', function() {
    // Network visualization
    const container = document.getElementById('network');
    
    // Initialize nodes with rectangle shape and blockchain data
    let nodes = new vis.DataSet([
        { 
            id: 1, 
            label: 'Node 1\nHash: genesis\nNonce: 0', 
            shape: 'box',
            color: {
                background: '#4CAF50',
                border: '#388E3C'
            },
            font: {
                size: 14,
                color: '#FFFFFF',
                align: 'center'
            },
            margin: 10,
            widthConstraint: {
                minimum: 150,
                maximum: 200
            },
            title: 'Genesis Block\nPrevious Hash: 0\nTransactions: 0'
        }
    ]);
    
    let edges = new vis.DataSet([]);
    
    const data = {
        nodes: nodes,
        edges: edges
    };
    
    const options = {
        nodes: {
            shape: 'box',
            font: {
                size: 14,
                color: '#FFFFFF',
                align: 'center'
            },
            margin: 10,
            widthConstraint: {
                minimum: 150,
                maximum: 200
            },
            borderWidth: 2,
            shadow: true
        },
        edges: {
            width: 2,
            smooth: {
                type: 'continuous'
            },
            arrows: {
                to: {
                    enabled: false
                }
            },
            color: {
                color: '#666666',
                highlight: '#FFA500'
            }
        },
        physics: {
            stabilization: {
                enabled: true,
                iterations: 1000
            },
            repulsion: {
                nodeDistance: 200
            }
        }
    };
    
    const network = new vis.Network(container, data, options);
    
    // Blockchain state
    let nodeCounter = 1;
    let blockCounter = 1;
    let blockchain = {
        chain: [
            { 
                index: 0, 
                hash: '0', 
                previous_hash: '0', 
                transactions: [],
                nonce: 0
            }
        ],
        nodes: ['Node 1']
    };
    
    // Update blockchain info display
    function updateBlockchainInfo() {
        document.getElementById('chainLength').textContent = `Chain Length: ${blockchain.chain.length}`;
        const lastBlock = blockchain.chain[blockchain.chain.length - 1];
        document.getElementById('lastBlock').textContent = `Last Block Hash: ${lastBlock.hash.substring(0, 10)}...`;
        document.getElementById('nodesCount').textContent = `Nodes: ${blockchain.nodes.length}`;
    }
    
    // Add Node button
    document.getElementById('addNodeBtn').addEventListener('click', function() {
        nodeCounter++;
        const newNodeId = `Node ${nodeCounter}`;
        blockchain.nodes.push(newNodeId);
        
        // Get the last block's data
        const lastBlock = blockchain.chain[blockchain.chain.length - 1];
        
        // Add to visualization with block data
        nodes.add({
            id: nodeCounter, 
            label: `${newNodeId}\nHash: ${lastBlock.hash.substring(0, 10)}...\nNonce: ${lastBlock.nonce || 0}`,
            shape: 'box',
            color: {
                background: '#4CAF50',
                border: '#388E3C'
            },
            font: {
                size: 14,
                color: '#FFFFFF',
                align: 'center'
            },
            margin: 10,
            widthConstraint: {
                minimum: 150,
                maximum: 200
            },
            title: `Full Hash: ${lastBlock.hash}\nPrevious Hash: ${lastBlock.previous_hash}\nTransactions: ${lastBlock.transactions.length}`
        });
        
        // Connect to a random existing node
        if (nodeCounter > 1) {
            const randomNode = Math.floor(Math.random() * (nodeCounter - 1)) + 1;
            edges.add({ from: randomNode, to: nodeCounter });
        }
        
        updateBlockchainInfo();
    });
    
    // Mine Block button
    document.getElementById('mineBlockBtn').addEventListener('click', function() {
        // In a real app, this would call the backend /mine endpoint
        blockCounter++;
        const newBlock = {
            index: blockCounter,
            hash: `0000${Math.random().toString(36).substring(2, 10)}`,
            previous_hash: blockchain.chain[blockchain.chain.length - 1].hash,
            transactions: [
                { sender: 'system', recipient: `Node ${Math.floor(Math.random() * nodeCounter) + 1}`, amount: 1 }
            ],
            nonce: Math.floor(Math.random() * 10000) // Random nonce for simulation
        };
        
        blockchain.chain.push(newBlock);
        
        // Update all node labels with new block data
        const allNodes = nodes.get();
        allNodes.forEach(node => {
            nodes.update({
                id: node.id,
                label: `${node.label.split('\n')[0]}\nHash: ${newBlock.hash.substring(0, 10)}...\nNonce: ${newBlock.nonce}`,
                color: { background: '#FFA500' }, // Orange during mining
                title: `Full Hash: ${newBlock.hash}\nPrevious Hash: ${newBlock.previous_hash}\nTransactions: ${newBlock.transactions.length}`
            });
        });
        
        setTimeout(() => {
            allNodes.forEach(node => {
                nodes.update({
                    id: node.id,
                    color: { background: '#4CAF50' } // Green after mining
                });
            });
        }, 1000);
        
        updateBlockchainInfo();
    });
    
    // Add Transaction button
    document.getElementById('addTransactionBtn').addEventListener('click', function() {
        document.getElementById('transactionForm').style.display = 'block';
    });
    
    // Cancel Transaction button
    document.getElementById('cancelTransaction').addEventListener('click', function() {
        document.getElementById('transactionForm').style.display = 'none';
    });
    
    // Submit Transaction button
    document.getElementById('submitTransaction').addEventListener('click', function() {
        const sender = document.getElementById('sender').value;
        const recipient = document.getElementById('recipient').value;
        const amount = document.getElementById('amount').value;
        
        if (sender && recipient && amount) {
            // In a real app, this would call the backend /transactions/new endpoint
            alert(`Transaction created: ${sender} sends ${amount} to ${recipient}`);
            document.getElementById('transactionForm').style.display = 'none';
            
            // Add transaction to pending transactions
            blockchain.chain[blockchain.chain.length - 1].transactions.push({
                sender: sender,
                recipient: recipient,
                amount: amount
            });
            
            // Reset form
            document.getElementById('sender').value = '';
            document.getElementById('recipient').value = '';
            document.getElementById('amount').value = '';
        } else {
            alert('Please fill all fields');
        }
    });
    
    // Resolve Conflicts button
    document.getElementById('resolveConflictsBtn').addEventListener('click', function() {
        // In a real app, this would call the backend /nodes/resolve endpoint
        alert('Resolving conflicts across the network...');
        
        // Visual feedback
        const allNodes = nodes.get();
        allNodes.forEach(node => {
            nodes.update({ id: node.id, color: '#2196F3' }); // Blue during resolution
        });
        
        setTimeout(() => {
            allNodes.forEach(node => {
                nodes.update({ id: node.id, color: '#4CAF50' }); // Green after resolution
            });
        }, 1000);
    });
    
    // Initialize
    updateBlockchainInfo();
});