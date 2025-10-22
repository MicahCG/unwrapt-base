// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {GiftLink} from "../src/GiftLink.sol";
import {TestUSDC} from "../src/TestUSDC.sol";

contract DeployAll is Script {
    function run() external {
        // Read a HEX private key from env (0x....)
        bytes32 pkHex = vm.envBytes32("PRIVATE_KEY");
        address feeCollector = vm.envAddress("FEE_COLLECTOR");

        vm.startBroadcast(uint256(pkHex));

        // If TOKEN_ADDRESS is 0x0, deploy a fresh tUSDC and mint 1000 * 1e6 to deployer
        address token = vm.envAddress("TOKEN_ADDRESS");
        if (token == address(0)) {
            TestUSDC t = new TestUSDC();
            t.mint(vm.addr(uint256(pkHex)), 1_000_000_000); // 1000 * 1e6
            token = address(t);
            console2.log("TestUSDC deployed at:", token);
        }

        GiftLink gift = new GiftLink(token, feeCollector);
        console2.log("GiftLink deployed at:", address(gift));

        vm.stopBroadcast();
    }
}
