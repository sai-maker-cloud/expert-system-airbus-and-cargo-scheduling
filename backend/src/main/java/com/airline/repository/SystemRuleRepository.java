package com.airline.repository;

import com.airline.model.SystemRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SystemRuleRepository extends JpaRepository<SystemRule, Long> {
    Optional<SystemRule> findByRuleKey(String ruleKey);
    List<SystemRule> findByRuleCategory(SystemRule.RuleCategory category);
    List<SystemRule> findByIsActive(Boolean isActive);
}
