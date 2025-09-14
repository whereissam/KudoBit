// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Reviews {
    struct Review {
        address reviewer;
        uint256 productId;
        uint8 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
    }
    
    uint256 public reviewCounter;
    
    mapping(uint256 => Review) public reviews;
    mapping(uint256 => uint256[]) public productReviews; // productId => reviewIds
    mapping(address => mapping(uint256 => uint256)) public userReview; // user => productId => reviewId
    
    event ReviewCreated(uint256 indexed reviewId, uint256 indexed productId, address reviewer, uint8 rating);
    
    function createReview(uint256 productId, uint8 rating, string calldata comment) external returns (uint256) {
        require(rating >= 1 && rating <= 5, "Invalid rating");
        require(userReview[msg.sender][productId] == 0, "Already reviewed");
        
        reviewCounter++;
        uint256 reviewId = reviewCounter;
        
        reviews[reviewId] = Review({
            reviewer: msg.sender,
            productId: productId,
            rating: rating,
            comment: comment,
            timestamp: block.timestamp
        });
        
        productReviews[productId].push(reviewId);
        userReview[msg.sender][productId] = reviewId;
        
        emit ReviewCreated(reviewId, productId, msg.sender, rating);
        return reviewId;
    }
    
    function getProductReviews(uint256 productId) external view returns (uint256[] memory) {
        return productReviews[productId];
    }
    
    function getProductRating(uint256 productId) external view returns (uint256 averageRating, uint256 totalReviews) {
        uint256[] memory reviewIds = productReviews[productId];
        totalReviews = reviewIds.length;
        
        if (totalReviews == 0) {
            return (0, 0);
        }
        
        uint256 totalRating = 0;
        for (uint256 i = 0; i < totalReviews; i++) {
            totalRating += reviews[reviewIds[i]].rating;
        }
        
        averageRating = totalRating / totalReviews;
        return (averageRating, totalReviews);
    }
}