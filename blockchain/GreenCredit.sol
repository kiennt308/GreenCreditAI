// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GreenCredit is ERC20, Ownable {
    struct CreditRecord {
        address user;
        uint256 esgScore;
        uint256 creditAmount;
        bool approved;
        uint256 timestamp;
        string projectDescription;
        uint256 loanAmount;
    }

    mapping(uint256 => CreditRecord) public records;
    uint256 public recordCount;
    uint256 public totalTokensMinted;
    
    // Token redemption tracking
    mapping(address => uint256) public redeemedTokens;
    mapping(address => uint256) public lastRedemptionTime;
    
    event RecordAdded(uint256 indexed id, address indexed user, uint256 esgScore, uint256 creditAmount);
    event TokensRedeemed(address indexed user, uint256 amount, string discount);
    event CreditApproved(uint256 indexed recordId, address indexed user, uint256 loanAmount);

    constructor() ERC20("GreenCredit Token", "GCT") {
        _mint(msg.sender, 1000000 * 10**decimals()); // Initial supply
        totalTokensMinted = 1000000 * 10**decimals();
    }

    function addRecord(
        uint256 _esgScore,
        uint256 _creditAmount,
        string memory _projectDescription,
        uint256 _loanAmount
    ) public {
        records[recordCount] = CreditRecord({
            user: msg.sender,
            esgScore: _esgScore,
            creditAmount: _creditAmount,
            approved: false,
            timestamp: block.timestamp,
            projectDescription: _projectDescription,
            loanAmount: _loanAmount
        });
        
        // Mint tokens based on ESG score (higher score = more tokens)
        uint256 tokensToMint = (_esgScore * _creditAmount) / 100;
        _mint(msg.sender, tokensToMint);
        totalTokensMinted += tokensToMint;
        
        emit RecordAdded(recordCount, msg.sender, _esgScore, _creditAmount);
        recordCount++;
    }

    function getRecord(uint256 _id) public view returns (CreditRecord memory) {
        require(_id < recordCount, "Record does not exist");
        return records[_id];
    }

    function approveCredit(uint256 _recordId) public onlyOwner {
        require(_recordId < recordCount, "Record does not exist");
        records[_recordId].approved = true;
        
        emit CreditApproved(_recordId, records[_recordId].user, records[_recordId].loanAmount);
    }

    function redeemTokens(uint256 _amount) public {
        require(balanceOf(msg.sender) >= _amount, "Insufficient token balance");
        require(_amount > 0, "Amount must be greater than 0");
        
        // Burn tokens
        _burn(msg.sender, _amount);
        redeemedTokens[msg.sender] += _amount;
        lastRedemptionTime[msg.sender] = block.timestamp;
        
        // Emit event with discount calculation
        string memory discount = calculateDiscount(_amount);
        emit TokensRedeemed(msg.sender, _amount, discount);
    }

    function calculateDiscount(uint256 _amount) internal pure returns (string memory) {
        if (_amount >= 1000 * 10**18) {
            return "15% interest reduction";
        } else if (_amount >= 500 * 10**18) {
            return "10% interest reduction";
        } else if (_amount >= 100 * 10**18) {
            return "5% interest reduction";
        } else {
            return "2% interest reduction";
        }
    }

    function getUserStats(address _user) public view returns (
        uint256 totalRecords,
        uint256 totalTokens,
        uint256 redeemedAmount,
        uint256 lastRedemption
    ) {
        uint256 userRecords = 0;
        for (uint256 i = 0; i < recordCount; i++) {
            if (records[i].user == _user) {
                userRecords++;
            }
        }
        
        return (
            userRecords,
            balanceOf(_user),
            redeemedTokens[_user],
            lastRedemptionTime[_user]
        );
    }
}
