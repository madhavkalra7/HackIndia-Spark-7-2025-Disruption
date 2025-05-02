// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract JobShield {
    struct JobApplication {
        bool exists;
        uint8 conditionsMet;
        bool tokenSent;
    }

    // Mapping from jobId to applicant address to application details
    mapping(uint256 => mapping(address => JobApplication)) public jobApplications;
    
    // Event emitted when a job application is processed
    event JobApplication(uint256 indexed jobId, address indexed applicant, uint8 conditionsMet, bool tokenSent);

    // Apply for a job
    function applyForJob(uint256 jobId, address applicant, uint8 conditionsMet) public {
        // Check if the applicant has already applied for this job
        require(!jobApplications[jobId][applicant].exists, "Already applied for this job");
        
        // Create a new job application
        bool tokenSent = false;
        
        // If the applicant meets at least 3 conditions, send a token
        if (conditionsMet >= 3) {
            tokenSent = true;
            // In a real implementation, this would transfer tokens
            // token.transfer(applicant, rewardAmount);
        }
        
        // Store the job application
        jobApplications[jobId][applicant] = JobApplication({
            exists: true,
            conditionsMet: conditionsMet,
            tokenSent: tokenSent
        });
        
        // Emit an event
        emit JobApplication(jobId, applicant, conditionsMet, tokenSent);
    }
    
    // Get job application details
    function getJobApplication(uint256 jobId, address applicant) public view returns (bool exists, uint8 conditionsMet, bool tokenSent) {
        JobApplication memory application = jobApplications[jobId][applicant];
        return (application.exists, application.conditionsMet, application.tokenSent);
    }
    
    // Send reward token (simplified for demo)
    function sendRewardToken(address to) public {
        // In a real implementation, this would transfer tokens
        // token.transfer(to, rewardAmount);
        
        // For demo purposes, we just emit an event
        emit RewardSent(to, 1);
    }
    
    // Event emitted when a reward is sent
    event RewardSent(address indexed to, uint256 amount);
}
