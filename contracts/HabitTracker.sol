// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HabitTracker
 * @dev A smart contract for tracking daily habits on-chain
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Deploy this contract to Base Sepolia (testnet) or Base Mainnet
 * 2. Copy the deployed contract address
 * 3. Update CONTRACT_ADDRESSES in utils/config.ts with your contract address
 * 
 * You can deploy using:
 * - Remix IDE (https://remix.ethereum.org)
 * - Hardhat
 * - Foundry
 */
contract HabitTracker {
    struct Habit {
        string title;
        string description;
        uint256 createdAt;
    }

    // Mapping from user address to their habits
    mapping(address => Habit[]) public userHabits;
    
    // Mapping from user address => habit ID => completion timestamps
    mapping(address => mapping(uint256 => uint256[])) public completions;

    // Events
    event HabitCreated(address indexed user, uint256 indexed habitId, string title);
    event HabitCompleted(address indexed user, uint256 indexed habitId, uint256 timestamp);

    /**
     * @dev Add a new habit for the caller
     * @param title The title of the habit
     * @param description A brief description of the habit
     */
    function addHabit(string memory title, string memory description) public {
        uint256 habitId = userHabits[msg.sender].length;
        userHabits[msg.sender].push(Habit(title, description, block.timestamp));
        emit HabitCreated(msg.sender, habitId, title);
    }

    /**
     * @dev Get all habits for a user
     * @param user The address of the user
     * @return An array of Habit structs
     */
    function getHabits(address user) public view returns (Habit[] memory) {
        return userHabits[user];
    }

    /**
     * @dev Mark a habit as complete for today
     * @param habitId The ID of the habit to mark complete
     */
    function markComplete(uint256 habitId) public {
        require(habitId < userHabits[msg.sender].length, "Habit does not exist");
        
        uint256[] storage logs = completions[msg.sender][habitId];

        // Check if already completed today
        if (logs.length > 0) {
            uint256 last = logs[logs.length - 1];
            require(block.timestamp > last + 1 days, "Already completed today");
        }

        logs.push(block.timestamp);
        emit HabitCompleted(msg.sender, habitId, block.timestamp);
    }

    /**
     * @dev Get all completion timestamps for a habit
     * @param user The address of the user
     * @param habitId The ID of the habit
     * @return An array of completion timestamps
     */
    function getCompletions(address user, uint256 habitId) public view returns (uint256[] memory) {
        return completions[user][habitId];
    }

    /**
     * @dev Get the number of habits for a user
     * @param user The address of the user
     * @return The number of habits
     */
    function getHabitCount(address user) public view returns (uint256) {
        return userHabits[user].length;
    }
}
