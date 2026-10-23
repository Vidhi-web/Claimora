package com.claimora.exception;

/**
 * Exception thrown when business validation fails.
 */
public class ValidationException extends RuntimeException {

    public ValidationException(String message) {
        super(message);
    }
}
