package com.airline.service;

import com.airline.exception.ResourceNotFoundException;
import com.airline.model.SystemRule;
import com.airline.repository.SystemRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SystemRuleService {

    private final SystemRuleRepository systemRuleRepository;

    public List<SystemRule> getAllRules() {
        return systemRuleRepository.findAll();
    }

    public SystemRule getRuleById(Long id) {
        return systemRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule", id));
    }

    public SystemRule createRule(SystemRule rule) {
        return systemRuleRepository.save(rule);
    }

    public SystemRule updateRule(Long id, SystemRule updated) {
        SystemRule existing = getRuleById(id);
        existing.setRuleName(updated.getRuleName());
        existing.setRuleCategory(updated.getRuleCategory());
        existing.setRuleKey(updated.getRuleKey());
        existing.setRuleValue(updated.getRuleValue());
        existing.setDescription(updated.getDescription());
        existing.setIsActive(updated.getIsActive());
        return systemRuleRepository.save(existing);
    }

    public void toggleRule(Long id) {
        SystemRule rule = getRuleById(id);
        rule.setIsActive(!rule.getIsActive());
        systemRuleRepository.save(rule);
    }

    public void deleteRule(Long id) {
        systemRuleRepository.delete(getRuleById(id));
    }
}
