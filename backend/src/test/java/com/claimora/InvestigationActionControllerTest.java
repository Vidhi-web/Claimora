package com.claimora;

import com.claimora.controller.InvestigationActionController;
import com.claimora.service.InvestigationActionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class InvestigationActionControllerTest {

    @Mock
    private InvestigationActionService actionService;

    private InvestigationActionController controller;

    @BeforeEach
    void setUp() {
        controller = new InvestigationActionController(actionService);
    }

    @Test
    void testPutAction_Returns405MethodNotAllowed() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.updateActionForbidden(1L));
        assertEquals(HttpStatus.METHOD_NOT_ALLOWED, ex.getStatusCode());
        assertTrue(ex.getReason().contains("strictly append-only"));
    }

    @Test
    void testDeleteAction_Returns405MethodNotAllowed() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.deleteActionForbidden(1L));
        assertEquals(HttpStatus.METHOD_NOT_ALLOWED, ex.getStatusCode());
        assertTrue(ex.getReason().contains("strictly append-only"));
    }

    @Test
    void testPatchAction_Returns405MethodNotAllowed() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.patchActionForbidden(1L));
        assertEquals(HttpStatus.METHOD_NOT_ALLOWED, ex.getStatusCode());
        assertTrue(ex.getReason().contains("strictly append-only"));
    }
}
