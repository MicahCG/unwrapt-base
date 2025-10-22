// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GiftLink
 * @notice Create crypto gifts claimable via Farcaster Frames
 * @dev Supports even splits and mystery (random) splits
 */
contract GiftLink is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Split mode for gift distribution
    enum SplitMode {
        Even,     // Equal split among all claimants
        Mystery   // Random amount per claim, last gets remainder
    }

    /// @notice Gift structure
    struct Gift {
        address sender;
        uint256 amount;        // Total deposit
        uint256 remaining;     // Current balance
        uint64 expiry;         // Unix timestamp
        uint16 slots;          // Total claim slots
        uint16 claimed;        // Number of claims so far
        bytes32 claimHash;     // keccak256 of claim secret
        uint16 feeBps;         // Platform fee in basis points
        SplitMode mode;        // Distribution mode
    }

    /// @notice Token used for gifts (e.g., USDC)
    IERC20 public immutable token;

    /// @notice Address receiving platform fees
    address public immutable feeCollector;

    /// @notice Next gift ID
    uint256 public nextId = 1;

    /// @notice All gifts
    mapping(uint256 => Gift) public gifts;

    /// @notice Maximum platform fee (10%)
    uint16 public constant MAX_FEE_BPS = 1000;

    // Events
    event GiftCreated(
        uint256 indexed id,
        address indexed sender,
        uint256 amount,
        SplitMode mode
    );

    event GiftClaimed(
        uint256 indexed id,
        address indexed to,
        uint256 netAmount,
        uint256 fee
    );

    event GiftRefunded(
        uint256 indexed id,
        address indexed to,
        uint256 amount
    );

    // Errors
    error Empty();
    error Expired();
    error NotSender();
    error BadSecret();
    error TooHighFee();

    constructor(address _token, address _feeCollector) {
        token = IERC20(_token);
        feeCollector = _feeCollector;
    }

    /**
     * @notice Create a new gift
     * @param amount Total tokens to deposit
     * @param expiry Expiration timestamp
     * @param slots Number of claim slots
     * @param claimHash Hash of the claim secret
     * @param feeBps Platform fee in basis points
     * @param mode Split mode (Even or Mystery)
     * @return id The gift ID
     */
    function createGift(
        uint256 amount,
        uint64 expiry,
        uint16 slots,
        bytes32 claimHash,
        uint16 feeBps,
        SplitMode mode
    ) external nonReentrant returns (uint256 id) {
        if (amount == 0 || slots == 0) revert Empty();
        if (feeBps > MAX_FEE_BPS) revert TooHighFee();

        id = nextId++;

        gifts[id] = Gift({
            sender: msg.sender,
            amount: amount,
            remaining: amount,
            expiry: expiry,
            slots: slots,
            claimed: 0,
            claimHash: claimHash,
            feeBps: feeBps,
            mode: mode
        });

        token.safeTransferFrom(msg.sender, address(this), amount);

        emit GiftCreated(id, msg.sender, amount, mode);
    }

    /**
     * @notice Claim a gift
     * @param id Gift ID
     * @param claimSecret The claim secret
     * @param to Recipient address
     */
    function claim(
        uint256 id,
        bytes32 claimSecret,
        address to
    ) external nonReentrant {
        Gift storage g = gifts[id];

        if (g.remaining == 0) revert Empty();
        if (block.timestamp > g.expiry) revert Expired();
        if (keccak256(abi.encodePacked(claimSecret)) != g.claimHash) {
            revert BadSecret();
        }

        g.claimed++;
        uint256 remainingSlots = g.slots - g.claimed + 1;
        uint256 payout;

        // Calculate payout based on split mode
        if (g.mode == SplitMode.Even) {
            // Even split: divide remaining by remaining slots
            payout = g.remaining / remainingSlots;
        } else {
            // Mystery split: random amount, unless last claim
            if (remainingSlots == 1) {
                // Last claimer gets everything
                payout = g.remaining;
            } else {
                payout = _randomShare(id, to, g.remaining, remainingSlots);
            }
        }

        // Ensure we don't exceed remaining
        if (payout > g.remaining) payout = g.remaining;

        // Calculate fee
        uint256 fee = (payout * g.feeBps) / 10000;
        uint256 netAmount = payout - fee;

        // Update remaining balance
        g.remaining -= payout;

        // Transfer tokens
        if (fee > 0) {
            token.safeTransfer(feeCollector, fee);
        }
        token.safeTransfer(to, netAmount);

        emit GiftClaimed(id, to, netAmount, fee);
    }

    /**
     * @notice Calculate random share for Mystery mode
     * @param giftId Gift ID
     * @param claimer Address of claimer
     * @param remaining Remaining balance
     * @param remainingSlots Remaining claim slots
     * @return payout The calculated random payout
     */
    function _randomShare(
        uint256 giftId,
        address claimer,
        uint256 remaining,
        uint256 remainingSlots
    ) internal view returns (uint256 payout) {
        // Generate pseudo-random number
        uint256 r = uint256(
            keccak256(
                abi.encodePacked(
                    giftId,
                    claimer,
                    block.prevrandao,
                    block.timestamp
                )
            )
        );

        // Calculate average per remaining slot
        uint256 avg = remaining / remainingSlots;

        // Min: 5% of average, Max: 150% of average
        uint256 min = (avg * 5) / 100;
        uint256 max = (avg * 150) / 100;

        // Ensure max doesn't exceed what's safe to give
        // (must leave enough for remaining claimants)
        uint256 maxSafe = remaining - (remainingSlots - 1);
        if (max > maxSafe) max = maxSafe;

        // Map random number to range [min, max]
        if (max > min) {
            payout = min + (r % (max - min + 1));
        } else {
            payout = min;
        }

        // Safety: ensure payout doesn't exceed remaining
        if (payout > remaining) payout = remaining;

        // Safety: ensure payout is at least 1 (avoid zero payouts)
        if (payout == 0 && remaining > 0) payout = 1;
    }

    /**
     * @notice Refund an expired gift
     * @param id Gift ID
     * @param to Recipient address (usually sender)
     */
    function refund(uint256 id, address to) external nonReentrant {
        Gift storage g = gifts[id];

        if (msg.sender != g.sender) revert NotSender();
        if (block.timestamp <= g.expiry) revert();
        if (g.remaining == 0) revert Empty();

        uint256 refundAmount = g.remaining;
        g.remaining = 0;

        token.safeTransfer(to, refundAmount);

        emit GiftRefunded(id, to, refundAmount);
    }

    /**
     * @notice Get gift split mode
     * @param id Gift ID
     * @return The split mode of the gift
     */
    function getGiftMode(uint256 id) external view returns (SplitMode) {
        return gifts[id].mode;
    }

    /**
     * @notice Get remaining slots for a gift
     * @param id Gift ID
     * @return Number of unclaimed slots
     */
    function getRemainingSlots(uint256 id) external view returns (uint16) {
        Gift storage g = gifts[id];
        return g.slots - g.claimed;
    }
}
