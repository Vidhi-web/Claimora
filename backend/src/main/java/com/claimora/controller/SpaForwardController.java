package com.claimora.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller to forward client-side Angular SPA routes to index.html.
 */
@Controller
public class SpaForwardController {

    @GetMapping(value = {
            "/dashboard",
            "/products",
            "/claims",
            "/evidence",
            "/findings",
            "/investigations",
            "/reports",
            "/users",
            "/profile",
            "/auth",
            "/auth/**"
    })
    public String forwardSpa() {
        return "forward:/index.html";
    }
}

