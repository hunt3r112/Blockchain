// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import OpenZeppelin ERC-20 and Ownable contracts
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    //custom decimals
    uint8 private immutable _decimals;

    // Constructor
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals_
        ) ERC20(name, symbol) Ownable(msg.sender) {
        _decimals = decimals_; // Store the custom decimal value
        _mint(msg.sender, initialSupply * (10 ** uint256(_decimals))); // Adjust for decimals
    }

    //override base decimals() ở ERC20
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    // thêm function mint
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    // cho phép chuyển owner của token sang address khác
    function transferOwnership(address newOwner) public override onlyOwner {
        super.transferOwnership(newOwner); 
    }
}
