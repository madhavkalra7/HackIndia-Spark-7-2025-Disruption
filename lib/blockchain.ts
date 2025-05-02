// This file contains functions for interacting with the blockchain
// using ethers.js and MetaMask

// Contract address for the JobShield contract
export const JOB_SHIELD_CONTRACT_ADDRESS = "0x87cC0b99Ae03b2C443e62a8dB806701263cCBDe9"

// Mumbai testnet chain ID
const MUMBAI_CHAIN_ID = "0x13881"

// ABI for the JobShield contract (simplified for demo)
export const JOB_SHIELD_ABI = [
  "function applyForJob(uint256 jobId, uint256 conditionsMet) public returns (bool)",
  "function getApplicationStatus(uint256 jobId, address applicant) public view returns (bool, uint256)",
  "function postJob(uint256 jobId, uint256 requiredConditions) public returns (bool)",
  "event JobPosted(uint256 indexed jobId, address indexed recruiter, uint256 requiredConditions)",
  "event JobApplication(uint256 indexed jobId, address indexed applicant, uint256 conditionsMet, bool success)",
]

// Function to check if MetaMask is installed
export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && window.ethereum !== undefined
}

// Function to connect to MetaMask
export async function connectWallet(): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed")
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    return accounts[0]
  } catch (error) {
    console.error("Error connecting to MetaMask:", error)
    throw error
  }
}

// Function to check if connected to Mumbai testnet
export async function checkMumbaiNetwork(): Promise<boolean> {
  if (!isMetaMaskInstalled()) {
    return false
  }

  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" })
    return chainId === MUMBAI_CHAIN_ID
  } catch (error) {
    console.error("Error checking network:", error)
    return false
  }
}

// Function to switch to Mumbai testnet
export async function switchToMumbai(): Promise<boolean> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed")
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MUMBAI_CHAIN_ID }],
    })
    return true
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: MUMBAI_CHAIN_ID,
              chainName: "Polygon Mumbai Testnet",
              nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC",
                decimals: 18,
              },
              rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
              blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
            },
          ],
        })
        return true
      } catch (addError) {
        console.error("Error adding Mumbai network:", addError)
        return false
      }
    }
    console.error("Error switching to Mumbai network:", error)
    return false
  }
}

// Function to get wallet balance
export async function getWalletBalance(address: string): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed")
  }

  try {
    const balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    })

    // Convert from wei to MATIC
    const balanceInMatic = Number.parseInt(balance, 16) / 1e18
    return balanceInMatic.toString()
  } catch (error) {
    console.error("Error getting balance:", error)
    throw error
  }
}

// Function to add wallet listeners
export function addWalletListeners(onAccountsChanged: (accounts: string[]) => void): () => void {
  if (!isMetaMaskInstalled()) {
    return () => {}
  }

  const accountsChangedHandler = (accounts: string[]) => {
    onAccountsChanged(accounts)
  }

  window.ethereum.on("accountsChanged", accountsChangedHandler)

  // Return a function to remove the listener
  return () => {
    window.ethereum.removeListener("accountsChanged", accountsChangedHandler)
  }
}

// Function to apply for a job using the smart contract
export async function applyForJobOnChain(
  jobId: number,
  conditionsMet: number,
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  if (!isMetaMaskInstalled()) {
    return { success: false, error: "MetaMask is not installed" }
  }

  try {
    // For demo purposes, we'll just simulate a transaction
    // In a real app, you would use ethers.js to interact with the contract
    console.log(`Applying for job ${jobId} with ${conditionsMet} conditions met`)

    // Simulate transaction hash
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`

    return {
      success: true,
      txHash,
    }
  } catch (error: any) {
    console.error("Error applying for job on chain:", error)
    return {
      success: false,
      error: error.message || "Transaction failed",
    }
  }
}

// Function to post a job using the smart contract
export async function postJobOnChain(
  jobId: number,
  requiredConditions: number,
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  if (!isMetaMaskInstalled()) {
    return { success: false, error: "MetaMask is not installed" }
  }

  try {
    // For demo purposes, we'll just simulate a transaction
    // In a real app, you would use ethers.js to interact with the contract
    console.log(`Posting job ${jobId} with ${requiredConditions} required conditions`)

    // Simulate transaction hash
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`

    return {
      success: true,
      txHash,
    }
  } catch (error: any) {
    console.error("Error posting job on chain:", error)
    return {
      success: false,
      error: error.message || "Transaction failed",
    }
  }
}

// Function to check if an applicant meets the conditions for a job
export function checkConditionsMet(
  jobRequirements: { skills: string[]; experience: number; education: string },
  applicantProfile: { skills: string[]; experience: number; education: string },
): { conditionsMet: number; details: { skills: boolean; experience: boolean; education: boolean } } {
  let conditionsMet = 0
  const details = {
    skills: false,
    experience: false,
    education: false,
  }

  // Check skills
  if (jobRequirements.skills && applicantProfile.skills) {
    const matchedSkills = jobRequirements.skills.filter((skill) => applicantProfile.skills.includes(skill))
    if (matchedSkills.length > 0) {
      conditionsMet++
      details.skills = true
    }
  }

  // Check experience
  if (jobRequirements.experience && applicantProfile.experience) {
    if (applicantProfile.experience >= jobRequirements.experience) {
      conditionsMet++
      details.experience = true
    }
  }

  // Check education
  if (jobRequirements.education && applicantProfile.education) {
    if (applicantProfile.education === jobRequirements.education) {
      conditionsMet++
      details.education = true
    }
  }

  return { conditionsMet, details }
}

// Add type definitions for window.ethereum
declare global {
  interface Window {
    ethereum: {
      isMetaMask?: boolean
      request: (request: { method: string; params?: any[] }) => Promise<any>
      on: (eventName: string, handler: (...args: any[]) => void) => void
      removeListener: (eventName: string, handler: (...args: any[]) => void) => void
    }
  }
}
