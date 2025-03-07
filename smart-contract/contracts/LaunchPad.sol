// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";

interface IDEX {
    function addLiquidity(address token, uint256 amount) external;
}

contract TokenLaunchpad {
    uint8 public constant DECIMALS = 18; //Hằng số decimals cho tất cả token tạo trên sàn
    uint256 public constant CREATION_FEE = 0.001 ether; // Phí tạo token
    uint256 public constant INITIAL_PRICE = 0.00000002 ether; // giá ban đầu của token (đơn vị ether)
    uint256 public constant TOTAL_SUPPLY = 1000000000; // tổng số supply của token
    uint256 public constant THRESHOLD = 800000000; // Threshold để transfer token đến DEX
    uint256 public constant INCREMENT_STEP = 1000000; // số lượng token cần bán để tăng giá
    uint256 public constant PRICE_INCREMENT = 0.00000001 ether; // giá tăng sau mỗi lần bán được số token nhất định (INCREMENT_STEP)
    
    address public owner; // địa chỉ owner của sàn
    address public dexAddress; // địa chỉ của DEX

    constructor() {
        owner = address(this);
    }

    // Cấu trúc token
    struct TokenInfo {
        Token token;
        string description;
        string image; // ảnh được encode base64
        uint256 amountSold; // số lượng token đã bán
        bool migrated; // token đã được lên DEX chưa
    }

    // map token address với token
    mapping(address => TokenInfo) public Tokens;
    // dùng nested mapping để map creator với token
    mapping(address => mapping(address => TokenInfo)) public TokenCreators;

    // event tạo token
    event TokenCreated(address indexed creator, address tokenAddress, string name, string symbol, uint256 totalSupply, string description, string image);
    // event swap token
    event TokenSwapped(address indexed sender, address repicient, address tokenAddress, uint256 amount);
    // event transfer to DEX
    event TokensTransferredToDEX(address tokenAddress, uint256 amount);

    function createToken(
        string memory name,
        string memory symbol,
        string memory description,
        string memory image
    ) external payable returns (address) {
        require(msg.value >= CREATION_FEE, "Insufficient fee to create token");
        
        // Tạo token
        Token token = new Token(name, symbol, TOTAL_SUPPLY, DECIMALS);
        // chuyển ownership cho sàn
        token.transferOwnership(address(this));
        // chuyển token sang address của sàn
        token.mint(address(this), TOTAL_SUPPLY * 10**DECIMALS);
        
        TokenInfo memory tokenStruct = TokenInfo({
            token: token,
            description: description,
            image: image,
            amountSold: 0,
            migrated: false
        });
        // map creator và token 
        Tokens[address(token)] = tokenStruct;
        TokenCreators[msg.sender][address(token)] = Tokens[address(token)];
        
        emit TokenCreated(msg.sender, address(token), name, symbol, TOTAL_SUPPLY, description, image);
        return address(token);
    }

    // tính cost hiện tại, cứ mỗi <INCREMENT_STEP> token sold sẽ tăng giá của token lên <PRICE_INCREMENT> so với INITIAL_PRICE
    function getUnitPrice(address tokenAddress) public view returns (uint256) {
        TokenInfo storage tokenInfo = Tokens[tokenAddress];
        uint256 price = (INITIAL_PRICE + (tokenInfo.amountSold / INCREMENT_STEP) * PRICE_INCREMENT);
        return price; // đơn vị wei
    }

    function swap(address tokenAddress, uint256 amountIn, bool isBuy) external payable {
        uint256 unitPrice = getUnitPrice(tokenAddress);
        uint256 cost = unitPrice * amountIn;

        // case buy (ETH -> Token)
        if (isBuy) {
            require(msg.value == cost, "Incorrect ETH amount sent");

            // gửi token cho buyer
            Token(tokenAddress).transfer(msg.sender, amountIn);

            // update số lượng bán
            Tokens[tokenAddress].amountSold += amountIn;

            emit TokenSwapped(address(tokenAddress), msg.sender, tokenAddress, amountIn); 
        } 
        // case sell (Token -> ETH)
        else {
            // gửi token từ seller tới contract
            Token(tokenAddress).transferFrom(msg.sender, address(this), amountIn);

            // gửi ETH cho user
            payable(msg.sender).transfer(cost);

            // Update the contract's reserves
            Tokens[tokenAddress].amountSold -= amountIn;

            emit TokenSwapped(msg.sender, address(tokenAddress), tokenAddress, amountIn);
        }

        if (Tokens[tokenAddress].amountSold >= THRESHOLD) {
            transferTokensToDEX(tokenAddress);
        }
    }

    // Set DEX address
    function setDexAddress(address _dexAddress) external {
        dexAddress = _dexAddress;
    }

    // gửi token lên DEX
    function transferTokensToDEX(address tokenAddress) private {
        uint256 remainingTokens = TOTAL_SUPPLY - Tokens[tokenAddress].amountSold;
        require(remainingTokens > 0, "No tokens left to transfer");

        Tokens[tokenAddress].token.transfer(dexAddress, remainingTokens);
        IDEX(dexAddress).addLiquidity(tokenAddress, remainingTokens);

        emit TokensTransferredToDEX(tokenAddress, remainingTokens);
    }

    function getCreationFee() external pure returns (uint256) {
        return CREATION_FEE;
    }

    // cho phép hợp đồng nhận token
    receive() external payable {}
}