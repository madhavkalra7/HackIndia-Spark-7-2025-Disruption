"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { Wallet, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

declare global {
  interface Window {
    ethereum?: any
  }
}

interface WalletConnectProps {
  onConnect?: () => void
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const { user, login } = useAuth()

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== "undefined" && window.ethereum !== undefined

  // Check if already connected on component mount
  useEffect(() => {
    if (isMetaMaskInstalled && user?.walletAddress) {
      setAddress(user.walletAddress)
    }
  }, [isMetaMaskInstalled, user])

  // Function to connect wallet
  const connectWallet = async () => {
    setError(null)
    setIsConnecting(true)

    try {
      if (!isMetaMaskInstalled) {
        setError("MetaMask is not installed. Please install MetaMask to continue.")
        return
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      const account = accounts[0]
      setAddress(account)

      // Check if we're on Mumbai testnet (chainId: 0x13881)
      const chainId = await window.ethereum.request({ method: "eth_chainId" })

      // If not on Mumbai, prompt to switch
      if (chainId !== "0x13881") {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x13881" }], // Mumbai testnet
          })
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x13881",
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
            } catch (addError: any) {
              if (addError.code === 4001) {
                setError("You rejected the request to add the Mumbai network. Please try again.")
              } else {
                setError("Failed to add Mumbai network to MetaMask")
              }
              setIsConnecting(false)
              return
            }
          } else if (switchError.code === 4001) {
            setError("You rejected the request to switch networks. Please try again.")
            setIsConnecting(false)
            return
          } else {
            setError("Failed to switch to Mumbai network")
            setIsConnecting(false)
            return
          }
        }
      }

      // Update user with wallet address
      if (user && login) {
        // Use login function instead of updateUser
        login({
          ...user,
          walletAddress: account,
        })
      }

      // Call onConnect callback if provided
      if (onConnect) {
        onConnect()
      }

      setIsConnecting(false)
    } catch (error: any) {
      console.error("Error connecting wallet:", error)

      // Handle specific error codes
      if (error.code === 4001) {
        setError("You rejected the wallet connection request. Please try again when you're ready to connect.")
      } else if (error.code === -32002) {
        setError("A MetaMask connection request is already pending. Please check your MetaMask extension.")
      } else {
        setError(error.message || "Failed to connect wallet")
      }

      setIsConnecting(false)
    }
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {address ? (
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-green-600" />
            <span className="font-medium">Connected:</span>
            <code className="rounded bg-muted px-2 py-1 text-sm">
              {address.slice(0, 6)}...{address.slice(-4)}
            </code>
          </div>
          <p className="text-sm text-muted-foreground">
            Your wallet is connected to the Polygon Mumbai testnet. You can now post blockchain-verified jobs.
          </p>
        </div>
      ) : (
        <Button
          onClick={connectWallet}
          disabled={isConnecting || !isMetaMaskInstalled}
          className="flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect MetaMask"}
        </Button>
      )}

      {!isMetaMaskInstalled && !address && (
        <p className="mt-2 text-sm text-muted-foreground">
          MetaMask is not installed.{" "}
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Install MetaMask
          </a>{" "}
          to connect your wallet.
        </p>
      )}
    </div>
  )
}
