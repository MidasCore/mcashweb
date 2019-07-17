module.exports = {
    testRevert: {
        /*
        pragma solidity ^0.4.18;
        contract TestRevert {
            address owner;
            constructor() public {
            }
            function setOwner(address addr) public {
                require(addr != 0xb6e447d1d576dE6c7f767C32a649F0AD50aE5975, "Address forbidden :-)");
                // TSeFTBYCy3r2kZNYsj86G6Yz6rsmPdYdFs
                owner = addr;
            }
            function getOwner(uint check) public view returns (address) {
                require(check == 1, "Wrong check");
                return owner;
            }
            function getOwner2(uint check) public view returns (address) {
                require(check == 1);
                return owner;
            }
        }
        */
        contractName: "TestRevert",
        abi: [
            {
                "inputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "addr",
                        "type": "address"
                    }
                ],
                "name": "setOwner",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "check",
                        "type": "uint256"
                    }
                ],
                "name": "getOwner",
                "outputs": [
                    {
                        "name": "",
                        "type": "address"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "check",
                        "type": "uint256"
                    }
                ],
                "name": "getOwner2",
                "outputs": [
                    {
                        "name": "",
                        "type": "address"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            }
        ],
        bytecode: "0x608060405234801561001057600080fd5b5061037d806100206000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806313af40351461005c578063877333461461009f578063c41a360a1461010c575b600080fd5b34801561006857600080fd5b5061009d600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610179565b005b3480156100ab57600080fd5b506100ca60048036038101908080359060200190929190505050610274565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561011857600080fd5b50610137600480360381019080803590602001909291905050506102ae565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b73b6e447d1d576de6c7f767c32a649f0ad50ae597573ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614151515610231576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260158152602001807f41646472657373206d75737420626520213d203078000000000000000000000081525060200191505060405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600060018214151561028557600080fd5b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b6000600182141515610328576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600b8152602001807f57726f6e6720636865636b00000000000000000000000000000000000000000081525060200191505060405180910390fd5b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690509190505600a165627a7a7230582070775fabe424bfe924ea8b9a9f4863306d35202b9c074f195334273994260ef20029"
    }
}
