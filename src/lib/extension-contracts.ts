import { Address } from 'viem'

// Extension contract addresses - not yet deployed, use env vars when available
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address

export const EXTENSION_CONTRACTS = {
  dao: (import.meta.env.VITE_DAO_ADDRESS || ZERO_ADDRESS) as Address,
  governanceToken: (import.meta.env.VITE_GOVERNANCE_TOKEN_ADDRESS || ZERO_ADDRESS) as Address,
  affiliateProgram: (import.meta.env.VITE_AFFILIATE_PROGRAM_ADDRESS || ZERO_ADDRESS) as Address,
  gamification: (import.meta.env.VITE_GAMIFICATION_ADDRESS || ZERO_ADDRESS) as Address,
  perksRegistry: (import.meta.env.VITE_PERKS_REGISTRY_ADDRESS || ZERO_ADDRESS) as Address,
  subscriptionTiers: (import.meta.env.VITE_SUBSCRIPTION_TIERS_ADDRESS || ZERO_ADDRESS) as Address,
  tippingAndCrowdfunding: (import.meta.env.VITE_TIPPING_ADDRESS || ZERO_ADDRESS) as Address,
  nftGatedContent: (import.meta.env.VITE_NFT_GATED_CONTENT_ADDRESS || ZERO_ADDRESS) as Address,
  collaborativeProducts: (import.meta.env.VITE_COLLABORATIVE_PRODUCTS_ADDRESS || ZERO_ADDRESS) as Address,
  badgeChecker: (import.meta.env.VITE_BADGE_CHECKER_ADDRESS || ZERO_ADDRESS) as Address,
  reviews: (import.meta.env.VITE_REVIEWS_ADDRESS || ZERO_ADDRESS) as Address,
  categories: (import.meta.env.VITE_CATEGORIES_ADDRESS || ZERO_ADDRESS) as Address,
}

// ============================================================
// SimpleKudoBitDAO
// ============================================================
export const DAO_ABI = [
  {"inputs":[],"name":"PROPOSAL_THRESHOLD","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"QUORUM_THRESHOLD","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"VOTING_PERIOD","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"proposalId","type":"uint256"}],"name":"cancel","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"proposalId","type":"uint256"},{"name":"support","type":"uint8"}],"name":"castVote","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"proposalId","type":"uint256"},{"name":"support","type":"uint8"},{"name":"reason","type":"string"}],"name":"castVoteWithReason","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"delegatee","type":"address"}],"name":"delegate","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"","type":"address"}],"name":"delegatedVotes","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"","type":"address"}],"name":"delegates","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"proposalId","type":"uint256"}],"name":"execute","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"fundTreasury","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[],"name":"getActiveProposals","outputs":[{"name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getDAOStats","outputs":[{"name":"totalProposals","type":"uint256"},{"name":"activeProposals","type":"uint256"},{"name":"executedProposals","type":"uint256"},{"name":"treasury","type":"uint256"},{"name":"totalSupply","type":"uint256"},{"name":"quorumThreshold","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"proposalId","type":"uint256"}],"name":"getProposal","outputs":[{"name":"id","type":"uint256"},{"name":"proposer","type":"address"},{"name":"title","type":"string"},{"name":"description","type":"string"},{"name":"proposalType","type":"uint256"},{"name":"startTime","type":"uint256"},{"name":"endTime","type":"uint256"},{"name":"forVotes","type":"uint256"},{"name":"againstVotes","type":"uint256"},{"name":"abstainVotes","type":"uint256"},{"name":"executed","type":"bool"},{"name":"cancelled","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"proposalId","type":"uint256"},{"name":"voter","type":"address"}],"name":"getVote","outputs":[{"name":"hasVoted","type":"bool"},{"name":"support","type":"uint8"},{"name":"weight","type":"uint256"},{"name":"reason","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"account","type":"address"}],"name":"getVotingPower","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"proposalCount","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"title","type":"string"},{"name":"description","type":"string"},{"name":"proposalType","type":"uint256"},{"name":"target","type":"address"},{"name":"value","type":"uint256"},{"name":"callData","type":"bytes"}],"name":"propose","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"treasuryBalance","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
] as const

// ============================================================
// AffiliateProgram
// ============================================================
export const AFFILIATE_ABI = [
  {"inputs":[{"name":"","type":"address"}],"name":"affiliates","outputs":[{"name":"affiliateAddress","type":"address"},{"name":"referralCode","type":"bytes32"},{"name":"displayName","type":"string"},{"name":"bio","type":"string"},{"name":"joinedAt","type":"uint256"},{"name":"totalReferrals","type":"uint256"},{"name":"totalEarnings","type":"uint256"},{"name":"pendingEarnings","type":"uint256"},{"name":"isActive","type":"bool"},{"name":"isVerified","type":"bool"},{"name":"creatorReferrals","type":"uint256"},{"name":"buyerReferrals","type":"uint256"},{"name":"subscriptionReferrals","type":"uint256"},{"name":"totalSalesGenerated","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"referralCode","type":"bytes32"}],"name":"getAffiliateByCode","outputs":[{"name":"affiliateAddress","type":"address"},{"name":"displayName","type":"string"},{"name":"isActive","type":"bool"},{"name":"isVerified","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"affiliate","type":"address"}],"name":"getAffiliateStats","outputs":[{"name":"totalReferrals","type":"uint256"},{"name":"totalEarnings","type":"uint256"},{"name":"pendingEarnings","type":"uint256"},{"name":"currentTier","type":"uint256"},{"name":"tierName","type":"string"},{"name":"creatorReferrals","type":"uint256"},{"name":"buyerReferrals","type":"uint256"},{"name":"subscriptionReferrals","type":"uint256"},{"name":"totalSalesGenerated","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getPlatformStats","outputs":[{"name":"totalAffiliatesCount","type":"uint256"},{"name":"totalReferralsCount","type":"uint256"},{"name":"totalCommissionsPaidAmount","type":"uint256"},{"name":"activeAffiliatesCount","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"limit","type":"uint256"}],"name":"getTopAffiliates","outputs":[{"name":"affiliateAddresses","type":"address[]"},{"name":"displayNames","type":"string[]"},{"name":"totalReferrals","type":"uint256[]"},{"name":"totalEarnings","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"user","type":"address"}],"name":"isAffiliate","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"displayName","type":"string"},{"name":"bio","type":"string"}],"name":"registerAffiliate","outputs":[{"name":"","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"referralCode","type":"bytes32"},{"name":"newUser","type":"address"},{"name":"referralType","type":"uint8"},{"name":"purchaseAmount","type":"uint256"}],"name":"trackReferral","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"newDisplayName","type":"string"},{"name":"newBio","type":"string"}],"name":"updateAffiliateProfile","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"withdrawCommissions","outputs":[],"stateMutability":"nonpayable","type":"function"},
] as const

// ============================================================
// GamefiedEngagement
// ============================================================
export const GAMIFICATION_ABI = [
  {"inputs":[{"name":"","type":"uint256"}],"name":"achievements","outputs":[{"name":"id","type":"uint256"},{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"iconHash","type":"string"},{"name":"achievementType","type":"uint8"},{"name":"requiredValue","type":"uint256"},{"name":"xpReward","type":"uint256"},{"name":"loyaltyBadgeReward","type":"uint256"},{"name":"isSecret","type":"bool"},{"name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"achievementCount","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"questType","type":"uint8"},{"name":"targetValue","type":"uint256"},{"name":"rewardAmount","type":"uint256"},{"name":"xpReward","type":"uint256"},{"name":"loyaltyBadgeReward","type":"uint256"},{"name":"duration","type":"uint256"},{"name":"isRepeatable","type":"bool"},{"name":"maxCompletions","type":"uint256"}],"name":"createQuest","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"getActiveQuests","outputs":[{"name":"questIds","type":"uint256[]"},{"name":"names","type":"string[]"},{"name":"questTypes","type":"uint8[]"},{"name":"xpRewards","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"leaderboardType","type":"bytes32"},{"name":"limit","type":"uint256"}],"name":"getLeaderboard","outputs":[{"name":"users","type":"address[]"},{"name":"scores","type":"uint256[]"},{"name":"ranks","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"user","type":"address"},{"name":"questId","type":"uint256"}],"name":"getUserQuestProgress","outputs":[{"name":"currentProgress","type":"uint256"},{"name":"targetValue","type":"uint256"},{"name":"isCompleted","type":"bool"},{"name":"completionCount","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"user","type":"address"}],"name":"getUserStats","outputs":[{"name":"totalXP","type":"uint256"},{"name":"level","type":"uint256"},{"name":"currentStreak","type":"uint256"},{"name":"longestStreak","type":"uint256"},{"name":"completedQuestsCount","type":"uint256"},{"name":"unlockedAchievementsCount","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"questCount","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"","type":"uint256"}],"name":"quests","outputs":[{"name":"id","type":"uint256"},{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"questType","type":"uint8"},{"name":"targetValue","type":"uint256"},{"name":"rewardAmount","type":"uint256"},{"name":"xpReward","type":"uint256"},{"name":"loyaltyBadgeReward","type":"uint256"},{"name":"duration","type":"uint256"},{"name":"startTime","type":"uint256"},{"name":"endTime","type":"uint256"},{"name":"isActive","type":"bool"},{"name":"isRepeatable","type":"bool"},{"name":"maxCompletions","type":"uint256"},{"name":"completionCount","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"user","type":"address"},{"name":"questId","type":"uint256"},{"name":"progressAmount","type":"uint256"}],"name":"updateQuestProgress","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"","type":"address"}],"name":"userProgress","outputs":[{"name":"totalXP","type":"uint256"},{"name":"level","type":"uint256"},{"name":"currentStreak","type":"uint256"},{"name":"longestStreak","type":"uint256"},{"name":"lastLoginDate","type":"uint256"}],"stateMutability":"view","type":"function"},
] as const

// ============================================================
// PerksRegistry
// ============================================================
export const PERKS_ABI = [
  {"inputs":[{"name":"user","type":"address"},{"name":"perkId","type":"uint256"}],"name":"checkPerkEligibility","outputs":[{"name":"eligible","type":"bool"},{"name":"reason","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"perkType","type":"string"},{"name":"requiredBadgeId","type":"uint256"},{"name":"requiredBadgeContract","type":"address"},{"name":"minimumBadgeAmount","type":"uint256"},{"name":"metadata","type":"string"},{"name":"usageLimit","type":"uint256"},{"name":"expirationTimestamp","type":"uint256"},{"name":"redemptionCode","type":"string"}],"name":"createPerk","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"getAllActivePerks","outputs":[{"components":[{"name":"id","type":"uint256"},{"name":"creator","type":"address"},{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"perkType","type":"string"},{"name":"requiredBadgeId","type":"uint256"},{"name":"requiredBadgeContract","type":"address"},{"name":"minimumBadgeAmount","type":"uint256"},{"name":"metadata","type":"string"},{"name":"isActive","type":"bool"},{"name":"usageLimit","type":"uint256"},{"name":"timesUsed","type":"uint256"},{"name":"expirationTimestamp","type":"uint256"},{"name":"redemptionCode","type":"string"}],"name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"creator","type":"address"}],"name":"getCreatorPerks","outputs":[{"name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"user","type":"address"}],"name":"getEligiblePerksForUser","outputs":[{"components":[{"name":"id","type":"uint256"},{"name":"creator","type":"address"},{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"perkType","type":"string"},{"name":"requiredBadgeId","type":"uint256"},{"name":"requiredBadgeContract","type":"address"},{"name":"minimumBadgeAmount","type":"uint256"},{"name":"metadata","type":"string"},{"name":"isActive","type":"bool"},{"name":"usageLimit","type":"uint256"},{"name":"timesUsed","type":"uint256"},{"name":"expirationTimestamp","type":"uint256"},{"name":"redemptionCode","type":"string"}],"name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"perkId","type":"uint256"}],"name":"getPerk","outputs":[{"components":[{"name":"id","type":"uint256"},{"name":"creator","type":"address"},{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"perkType","type":"string"},{"name":"requiredBadgeId","type":"uint256"},{"name":"requiredBadgeContract","type":"address"},{"name":"minimumBadgeAmount","type":"uint256"},{"name":"metadata","type":"string"},{"name":"isActive","type":"bool"},{"name":"usageLimit","type":"uint256"},{"name":"timesUsed","type":"uint256"},{"name":"expirationTimestamp","type":"uint256"},{"name":"redemptionCode","type":"string"}],"name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"perkCount","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"perkId","type":"uint256"},{"name":"additionalData","type":"string"}],"name":"redeemPerk","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"perkId","type":"uint256"},{"name":"isActive","type":"bool"}],"name":"updatePerkStatus","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"userPerkRedeemed","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},
] as const

// ============================================================
// SubscriptionTiers
// ============================================================
export const SUBSCRIPTION_ABI = [
  {"inputs":[{"name":"tierId","type":"uint256"}],"name":"cancelSubscription","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"monthlyPrice","type":"uint256"},{"name":"annualPrice","type":"uint256"},{"name":"perks","type":"string[]"},{"name":"loyaltyBadgeId","type":"uint256"},{"name":"contentIpfsHash","type":"string"}],"name":"createSubscriptionTier","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"getAllSubscriptionTiers","outputs":[{"name":"tierIds","type":"uint256[]"},{"name":"names","type":"string[]"},{"name":"monthlyPrices","type":"uint256[]"},{"name":"annualPrices","type":"uint256[]"},{"name":"activeStatus","type":"bool[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"tierId","type":"uint256"}],"name":"getSubscriptionTier","outputs":[{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"monthlyPrice","type":"uint256"},{"name":"annualPrice","type":"uint256"},{"name":"isActive","type":"bool"},{"name":"perks","type":"string[]"},{"name":"loyaltyBadgeId","type":"uint256"},{"name":"contentIpfsHash","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"user","type":"address"}],"name":"getUserActiveTiers","outputs":[{"name":"activeTierIds","type":"uint256[]"},{"name":"tierNames","type":"string[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"user","type":"address"},{"name":"tierId","type":"uint256"}],"name":"getUserSubscriptionInfo","outputs":[{"name":"isActive","type":"bool"},{"name":"startTime","type":"uint256"},{"name":"endTime","type":"uint256"},{"name":"timeRemaining","type":"uint256"},{"name":"isAnnual","type":"bool"},{"name":"amountPaid","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"user","type":"address"},{"name":"tierId","type":"uint256"}],"name":"isSubscriptionActive","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"tierId","type":"uint256"},{"name":"isAnnual","type":"bool"}],"name":"subscribeToTier","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"tierCount","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"tierId","type":"uint256"},{"name":"isActive","type":"bool"}],"name":"updateTierStatus","outputs":[],"stateMutability":"nonpayable","type":"function"},
] as const

// ============================================================
// TippingAndCrowdfunding
// Note: contract has typo "contributeToCompaign" - must use exact name
// ============================================================
export const TIPPING_ABI = [
  {"inputs":[],"name":"campaignCount","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"","type":"uint256"}],"name":"campaigns","outputs":[{"name":"id","type":"uint256"},{"name":"creator","type":"address"},{"name":"title","type":"string"},{"name":"description","type":"string"},{"name":"mediaIpfsHash","type":"string"},{"name":"goalAmount","type":"uint256"},{"name":"raisedAmount","type":"uint256"},{"name":"startTime","type":"uint256"},{"name":"endTime","type":"uint256"},{"name":"status","type":"uint8"},{"name":"minimumContribution","type":"uint256"},{"name":"maxContributors","type":"uint256"},{"name":"contributorCount","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"campaignId","type":"uint256"}],"name":"cancelCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"campaignId","type":"uint256"},{"name":"amount","type":"uint256"},{"name":"message","type":"string"},{"name":"isAnonymous","type":"bool"}],"name":"contributeToCompaign","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"title","type":"string"},{"name":"description","type":"string"},{"name":"mediaIpfsHash","type":"string"},{"name":"goalAmount","type":"uint256"},{"name":"durationInDays","type":"uint256"},{"name":"milestones","type":"string[]"},{"name":"minimumContribution","type":"uint256"},{"name":"maxContributors","type":"uint256"}],"name":"createCrowdfundingCampaign","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"","type":"address"}],"name":"creatorProfiles","outputs":[{"name":"creator","type":"address"},{"name":"name","type":"string"},{"name":"bio","type":"string"},{"name":"profileImageHash","type":"string"},{"name":"totalTipsReceived","type":"uint256"},{"name":"totalTipCount","type":"uint256"},{"name":"totalCrowdfundingRaised","type":"uint256"},{"name":"activeCampaignsCount","type":"uint256"},{"name":"isVerified","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"campaignId","type":"uint256"},{"name":"limit","type":"uint256"}],"name":"getCampaignContributions","outputs":[{"name":"contributors","type":"address[]"},{"name":"amounts","type":"uint256[]"},{"name":"messages","type":"string[]"},{"name":"timestamps","type":"uint256[]"},{"name":"isAnonymousArray","type":"bool[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"creator","type":"address"}],"name":"getCreatorCampaigns","outputs":[{"name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"creator","type":"address"},{"name":"limit","type":"uint256"}],"name":"getCreatorTips","outputs":[{"name":"tippers","type":"address[]"},{"name":"amounts","type":"uint256[]"},{"name":"messages","type":"string[]"},{"name":"timestamps","type":"uint256[]"},{"name":"isAnonymousArray","type":"bool[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getPlatformStats","outputs":[{"name":"totalTips","type":"uint256"},{"name":"totalCrowdfunding","type":"uint256"},{"name":"activeCampaigns","type":"uint256"},{"name":"totalCreators","type":"uint256"},{"name":"verifiedCreatorCount","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"user","type":"address"}],"name":"getUserContributions","outputs":[{"name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"creator","type":"address"},{"name":"amount","type":"uint256"},{"name":"message","type":"string"},{"name":"isAnonymous","type":"bool"}],"name":"tipCreator","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"totalTipsAmount","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalCrowdfundingAmount","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
] as const

// ============================================================
// NFTGatedContent
// ============================================================
export const NFT_GATED_ABI = [
  {"inputs":[{"name":"contentId","type":"uint256"}],"name":"accessContent","outputs":[{"name":"success","type":"bool"},{"name":"contentHash","type":"string"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"user","type":"address"},{"name":"contentId","type":"uint256"}],"name":"checkAccess","outputs":[{"name":"hasAccess","type":"bool"},{"name":"reason","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"contentCount","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"","type":"uint256"}],"name":"contentGates","outputs":[{"name":"id","type":"uint256"},{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"ipfsContentHash","type":"string"},{"name":"accessLevel","type":"uint8"},{"name":"isActive","type":"bool"},{"name":"createdAt","type":"uint256"},{"name":"customNftContract","type":"address"},{"name":"tokenStandard","type":"uint8"},{"name":"minimumBalance","type":"uint256"},{"name":"requiredSubscriptionTier","type":"uint256"},{"name":"requiredLoyaltyBadge","type":"uint256"},{"name":"minimumLoyaltyBalance","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"ipfsContentHash","type":"string"},{"name":"customNftContract","type":"address"},{"name":"tokenStandard","type":"uint8"},{"name":"requiredTokenIds","type":"uint256[]"},{"name":"minimumBalance","type":"uint256"}],"name":"createCustomNFTGatedContent","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"ipfsContentHash","type":"string"},{"name":"requiredLoyaltyBadge","type":"uint256"},{"name":"minimumLoyaltyBalance","type":"uint256"}],"name":"createLoyaltyGatedContent","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"ipfsContentHash","type":"string"},{"name":"requiredSubscriptionTier","type":"uint256"}],"name":"createSubscriptionGatedContent","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"contentId","type":"uint256"}],"name":"getContentGate","outputs":[{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"accessLevel","type":"uint8"},{"name":"isActive","type":"bool"},{"name":"createdAt","type":"uint256"},{"name":"customNftContract","type":"address"},{"name":"requiredTokenIds","type":"uint256[]"},{"name":"minimumBalance","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"user","type":"address"}],"name":"getUserAccessibleContent","outputs":[{"name":"contentIds","type":"uint256[]"},{"name":"names","type":"string[]"},{"name":"accessStatus","type":"bool[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"contentId","type":"uint256"},{"name":"isActive","type":"bool"}],"name":"updateContentStatus","outputs":[],"stateMutability":"nonpayable","type":"function"},
] as const

// ============================================================
// CollaborativeProductFactory
// ============================================================
export const COLLABORATIVE_ABI = [
  {"inputs":[{"name":"productId","type":"uint256"},{"name":"collaboratorAddress","type":"address"},{"name":"royaltyPercentage","type":"uint256"},{"name":"role","type":"string"}],"name":"addCollaborator","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"productId","type":"uint256"}],"name":"buyCollaborativeProduct","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"ipfsContentHash","type":"string"},{"name":"priceInUSDC","type":"uint256"},{"name":"loyaltyBadgeId","type":"uint256"},{"name":"collaboratorAddresses","type":"address[]"},{"name":"royaltyPercentages","type":"uint256[]"},{"name":"roles","type":"string[]"}],"name":"createCollaborativeProduct","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"getAllCollaborativeProducts","outputs":[{"components":[{"name":"id","type":"uint256"},{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"ipfsContentHash","type":"string"},{"name":"priceInUSDC","type":"uint256"},{"name":"isActive","type":"bool"},{"name":"loyaltyBadgeId","type":"uint256"},{"name":"primaryCreator","type":"address"},{"name":"createdAt","type":"uint256"},{"name":"totalSales","type":"uint256"},{"name":"totalRevenue","type":"uint256"}],"name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"productId","type":"uint256"}],"name":"getCollaborativeProduct","outputs":[{"components":[{"name":"id","type":"uint256"},{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"ipfsContentHash","type":"string"},{"name":"priceInUSDC","type":"uint256"},{"name":"isActive","type":"bool"},{"name":"loyaltyBadgeId","type":"uint256"},{"name":"primaryCreator","type":"address"},{"name":"createdAt","type":"uint256"},{"name":"totalSales","type":"uint256"},{"name":"totalRevenue","type":"uint256"}],"name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"collaborator","type":"address"}],"name":"getCollaboratorEarnings","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"creator","type":"address"}],"name":"getCreatorProducts","outputs":[{"name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"productId","type":"uint256"}],"name":"getProductCollaborators","outputs":[{"components":[{"name":"collaboratorAddress","type":"address"},{"name":"royaltyPercentage","type":"uint256"},{"name":"role","type":"string"},{"name":"isActive","type":"bool"}],"name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"productCount","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"productId","type":"uint256"},{"name":"isActive","type":"bool"}],"name":"updateProductStatus","outputs":[],"stateMutability":"nonpayable","type":"function"},
] as const

// ============================================================
// BadgeChecker
// ============================================================
export const BADGE_CHECKER_ABI = [
  {"inputs":[{"name":"user","type":"address"}],"name":"checkAnyBadgeOwnership","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"user","type":"address"},{"name":"badgeId","type":"uint256"},{"name":"minimumAmount","type":"uint256"}],"name":"checkBadgeOwnership","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"user","type":"address"},{"name":"minimumTier","type":"uint256"}],"name":"checkMinimumTierRequirement","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"user","type":"address"}],"name":"getTotalBadgeCount","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"user","type":"address"}],"name":"getUserBadgeBalances","outputs":[{"components":[{"name":"badgeId","type":"uint256"},{"name":"balance","type":"uint256"},{"name":"badgeName","type":"string"},{"name":"tier","type":"string"}],"name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"user","type":"address"}],"name":"getUserHighestTier","outputs":[{"name":"highestTier","type":"uint256"},{"name":"tierName","type":"string"}],"stateMutability":"view","type":"function"},
] as const

// ============================================================
// SimpleGovernanceToken (ERC20)
// ============================================================
export const GOVERNANCE_TOKEN_ABI = [
  {"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"getDistributionInfo","outputs":[{"name":"maxSupply","type":"uint256"},{"name":"currentSupply","type":"uint256"},{"name":"mintedAmount","type":"uint256"},{"name":"completed","type":"bool"},{"name":"community","type":"address"},{"name":"creator","type":"address"},{"name":"dao","type":"address"},{"name":"team","type":"address"},{"name":"liquidity","type":"address"}],"stateMutability":"view","type":"function"},
] as const

// ============================================================
// Reviews
// ============================================================
export const REVIEWS_ABI = [
  {"inputs":[{"name":"productId","type":"uint256"},{"name":"rating","type":"uint8"},{"name":"comment","type":"string"}],"name":"createReview","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"productId","type":"uint256"}],"name":"getProductRating","outputs":[{"name":"averageRating","type":"uint256"},{"name":"totalReviews","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"productId","type":"uint256"}],"name":"getProductReviews","outputs":[{"name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"reviewCounter","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"","type":"uint256"}],"name":"reviews","outputs":[{"name":"reviewer","type":"address"},{"name":"productId","type":"uint256"},{"name":"rating","type":"uint8"},{"name":"comment","type":"string"},{"name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"userReview","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
] as const

// ============================================================
// Categories
// ============================================================
export const CATEGORIES_ABI = [
  {"inputs":[{"name":"","type":"uint256"}],"name":"categories","outputs":[{"name":"name","type":"string"},{"name":"description","type":"string"},{"name":"active","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"","type":"string"}],"name":"categoryByName","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"categoryCounter","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"categoryId","type":"uint256"}],"name":"getCategoryProducts","outputs":[{"name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"name","type":"string"},{"name":"description","type":"string"}],"name":"createCategory","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"productId","type":"uint256"},{"name":"categoryId","type":"uint256"}],"name":"setProductCategory","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"","type":"uint256"}],"name":"productCategory","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
] as const
