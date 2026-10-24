package com.claimora.dto;

/**
 * Metric payload representing trigger frequency for a specific fraud detection rule.
 */
public class RuleTriggerStat {

    private String ruleCode;
    private String ruleName;
    private long count;

    public RuleTriggerStat() {
    }

    public RuleTriggerStat(String ruleCode, String ruleName, long count) {
        this.ruleCode = ruleCode;
        this.ruleName = ruleName;
        this.count = count;
    }

    public String getRuleCode() {
        return ruleCode;
    }

    public void setRuleCode(String ruleCode) {
        this.ruleCode = ruleCode;
    }

    public String getRuleName() {
        return ruleName;
    }

    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
