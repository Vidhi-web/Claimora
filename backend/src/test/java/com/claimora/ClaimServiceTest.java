package com.claimora;

import com.claimora.dto.ClaimRequest;
import com.claimora.dto.ClaimResponse;
import com.claimora.entity.*;
import com.claimora.exception.ValidationException;
import com.claimora.repository.ClaimRepository;
import com.claimora.repository.FindingRepository;
import com.claimora.repository.ProductRepository;
import com.claimora.repository.UserRepository;
import com.claimora.security.CustomUserDetails;
import com.claimora.service.ClaimService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClaimServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FindingRepository findingRepository;

    private ClaimService claimService;

    @BeforeEach
    void setUp() {
        claimService = new ClaimService(claimRepository, productRepository, userRepository, findingRepository);
    }

    @Test
    @DisplayName("Should successfully create a claim with SUBMITTED status")
    void testCreateClaimSuccess() {
        Product product = new Product("SN-123", "Model X", LocalDate.now(), LocalDate.now(), LocalDate.now().plusYears(1));
        product.setProductId(1L);

        User user = new User("Staff Member", "staff@claimora.internal", "hash", Role.STAFF, UserStatus.ACTIVE);
        user.setUserId(5L);

        CustomUserDetails userDetails = new CustomUserDetails(user);

        ClaimRequest request = new ClaimRequest(1L, null, "CLM-TEST-001", LocalDate.now(), "Screen issue");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(claimRepository.existsByClaimNumber("CLM-TEST-001")).thenReturn(false);
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(claimRepository.save(any(Claim.class))).thenAnswer(invocation -> {
            Claim c = invocation.getArgument(0);
            c.setClaimId(100L);
            return c;
        });

        ClaimResponse response = claimService.createClaim(request, userDetails);

        assertNotNull(response);
        assertEquals(100L, response.getClaimId());
        assertEquals("CLM-TEST-001", response.getClaimNumber());
        assertEquals(ClaimStatus.SUBMITTED, response.getStatus());
        verify(claimRepository).save(any(Claim.class));
    }

    @Test
    @DisplayName("Staff member accessing claim owned by another user should receive AccessDeniedException")
    void testStaffAccessingOtherUserClaimThrowsAccessDenied() {
        User owner = new User("Owner", "owner@claimora.internal", "hash", Role.STAFF, UserStatus.ACTIVE);
        owner.setUserId(10L);

        User otherStaff = new User("Other Staff", "other@claimora.internal", "hash", Role.STAFF, UserStatus.ACTIVE);
        otherStaff.setUserId(20L);

        Product product = new Product("SN-123", "Model X", LocalDate.now(), LocalDate.now(), LocalDate.now().plusYears(1));
        Claim claim = new Claim(product, owner, "CLM-SECRET-1", LocalDate.now(), ClaimStatus.SUBMITTED, "Secret Issue");
        claim.setClaimId(50L);

        when(claimRepository.findById(50L)).thenReturn(Optional.of(claim));

        CustomUserDetails otherStaffDetails = new CustomUserDetails(otherStaff);

        assertThrows(AccessDeniedException.class, () -> claimService.getClaimById(50L, otherStaffDetails));
    }
}
