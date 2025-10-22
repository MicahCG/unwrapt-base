// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {GiftLink} from "../src/GiftLink.sol";
import {TestUSDC} from "../src/TestUSDC.sol";

contract DeployAll is Script {
    function run() external {
        // Load environment variables
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address feeCollector = vm.envAddress("FEE_COLLECTOR");

        vm.startBroadcast(pk);

        // If no token address is provided, deploy a fresh TestUSDC
        address token = vm.envAddress("TOKEN_ADDRESS");
        if (token == address(0)) {
            TestUSDC t = new TestUSDC();
            t.mint(vm.addr(pk), 1_000_000_000); // 1000 * 1e6 tUSDC
            token = address(t);
            console2.log("TestUSDC deployed at:", token);
        }

        // Deploy GiftLink with token + fee collector
        GiftLink gift = new GiftLink(token, feeCollector);
        console2.log("GiftLink deployed at:", address(gift));

        vm.stopBroadcast();
    }
}
