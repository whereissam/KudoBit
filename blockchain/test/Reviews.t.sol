// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../contracts/Reviews.sol";

contract ReviewsTest is Test {
    Reviews public reviews;
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    
    event ReviewCreated(uint256 indexed reviewId, uint256 indexed productId, address reviewer, uint8 rating);
    
    function setUp() public {
        reviews = new Reviews();
    }
    
    function testCreateReview() public {
        vm.startPrank(user1);
        
        vm.expectEmit(true, true, true, true);
        emit ReviewCreated(1, 1, user1, 5);
        
        uint256 reviewId = reviews.createReview(1, 5, "Great product!");
        
        assertEq(reviewId, 1);
        assertEq(reviews.reviewCounter(), 1);
        assertEq(reviews.userReview(user1, 1), 1);
        
        (address reviewer, uint256 productId, uint8 rating, string memory comment, uint256 timestamp) = 
            reviews.reviews(reviewId);
        
        assertEq(reviewer, user1);
        assertEq(productId, 1);
        assertEq(rating, 5);
        assertEq(comment, "Great product!");
        assertGt(timestamp, 0);
        
        vm.stopPrank();
    }
    
    function testCreateReviewInvalidRating() public {
        vm.startPrank(user1);
        
        vm.expectRevert("Invalid rating");
        reviews.createReview(1, 0, "Bad rating");
        
        vm.expectRevert("Invalid rating");
        reviews.createReview(1, 6, "Too high rating");
        
        vm.stopPrank();
    }
    
    function testCannotReviewTwice() public {
        vm.startPrank(user1);
        reviews.createReview(1, 5, "Great product!");
        
        vm.expectRevert("Already reviewed");
        reviews.createReview(1, 4, "Second review");
        
        vm.stopPrank();
    }
    
    function testGetProductRating() public {
        vm.startPrank(user1);
        reviews.createReview(1, 5, "Excellent");
        vm.stopPrank();
        
        vm.startPrank(user2);
        reviews.createReview(1, 3, "Average");
        vm.stopPrank();
        
        (uint256 averageRating, uint256 totalReviews) = reviews.getProductRating(1);
        assertEq(averageRating, 4); // (5 + 3) / 2 = 4
        assertEq(totalReviews, 2);
    }
    
    function testGetProductRatingNoReviews() public {
        (uint256 averageRating, uint256 totalReviews) = reviews.getProductRating(999);
        assertEq(averageRating, 0);
        assertEq(totalReviews, 0);
    }
}