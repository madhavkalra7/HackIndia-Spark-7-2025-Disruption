const hre = require("hardhat")

async function main() {
  const JobShield = await hre.ethers.getContractFactory("JobShield")
  const jobShield = await JobShield.deploy()

  await jobShield.deployed()

  console.log(`JobShield deployed to ${jobShield.address}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
