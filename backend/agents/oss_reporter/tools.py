def analyze_development(repository: str, recent_commits: str, active_branches: str) -> dict:
    """Analyze recent development activity for a repository.

    Args:
        repository: Repository in owner/repo format
        recent_commits: Text describing recent commits
        active_branches: Text listing active branches

    Returns:
        Analysis with commit count, momentum, key signals, and recommendations
    """
    import re

    lines = recent_commits.strip().split('\n') if recent_commits.strip() else []
    commit_count = len(lines)
    branch_count = len(active_branches.strip().split('\n')) if active_branches.strip() else 0

    # Pattern detection
    patterns = {
        'fixes': len(re.findall(r'(?i)(fix|bug|patch|hotfix)', recent_commits)),
        'features': len(re.findall(r'(?i)(feat|add|new|implement)', recent_commits)),
        'refactoring': len(re.findall(r'(?i)(refactor|clean|reorganize)', recent_commits)),
        'docs': len(re.findall(r'(?i)(doc|readme|comment)', recent_commits)),
        'tests': len(re.findall(r'(?i)(test|spec|coverage)', recent_commits)),
        'ci_cd': len(re.findall(r'(?i)(ci|cd|pipeline|deploy|docker)', recent_commits)),
    }

    total_signals = sum(patterns.values())
    momentum = 'high' if total_signals >= 8 else 'medium' if total_signals >= 4 else 'low'

    key_signals = [f"{k}: {v} occurrences" for k, v in patterns.items() if v > 0]

    return {
        'repository': repository,
        'commit_count': commit_count,
        'branch_count': branch_count,
        'development_momentum': momentum,
        'key_signals': key_signals,
        'summary': f"{repository}: {commit_count} commits, {branch_count} branches, momentum={momentum}"
    }


def analyze_features(repository: str, pull_requests: str) -> dict:
    """Analyze feature proposals from pull requests.

    Args:
        repository: Repository in owner/repo format
        pull_requests: Text describing open pull requests

    Returns:
        Analysis with PR count, feature momentum, and proposed capabilities
    """
    import re

    lines = pull_requests.strip().split('\n') if pull_requests.strip() else []
    pr_count = len(lines)

    patterns = {
        'features': len(re.findall(r'(?i)(feat|feature|add|new)', pull_requests)),
        'ui_ux': len(re.findall(r'(?i)(ui|ux|frontend|design|css)', pull_requests)),
        'api': len(re.findall(r'(?i)(api|endpoint|rest|graphql)', pull_requests)),
        'performance': len(re.findall(r'(?i)(perf|optim|speed|cache)', pull_requests)),
        'security': len(re.findall(r'(?i)(security|auth|encrypt|token)', pull_requests)),
    }

    total = sum(patterns.values())
    momentum = 'high' if pr_count >= 6 else 'medium' if pr_count >= 3 else 'low'

    capabilities = [k for k, v in patterns.items() if v > 0]

    return {
        'repository': repository,
        'open_pr_count': pr_count,
        'feature_momentum': momentum,
        'proposed_capabilities': capabilities,
        'summary': f"{repository}: {pr_count} PRs, momentum={momentum}"
    }


def analyze_issues(repository: str, issues: str) -> dict:
    """Analyze and triage open issues.

    Args:
        repository: Repository in owner/repo format
        issues: Text describing open issues

    Returns:
        Analysis with issue count, triage priority, themes, and recommended actions
    """
    import re

    lines = issues.strip().split('\n') if issues.strip() else []
    issue_count = len(lines)

    patterns = {
        'bugs': len(re.findall(r'(?i)(bug|error|crash|broken|fail)', issues)),
        'security': len(re.findall(r'(?i)(security|vulnerability|cve|exploit)', issues)),
        'docs': len(re.findall(r'(?i)(doc|readme|guide|tutorial)', issues)),
        'performance': len(re.findall(r'(?i)(slow|perf|memory|leak)', issues)),
        'support': len(re.findall(r'(?i)(help|question|how to|support)', issues)),
    }

    # Weighted scoring
    score = patterns['security'] * 3 + patterns['bugs'] * 2 + patterns['performance']
    priority = 'high' if score >= 8 else 'medium' if score >= 4 else 'low'

    themes = [k for k, v in patterns.items() if v > 0]
    actions = []
    if patterns['security'] > 0:
        actions.append('Address security issues immediately')
    if patterns['bugs'] > 0:
        actions.append('Triage and prioritize bug reports')
    if patterns['support'] > 0:
        actions.append('Create FAQ or improve documentation')

    return {
        'repository': repository,
        'open_issue_count': issue_count,
        'triage_priority': priority,
        'themes': themes,
        'recommended_actions': actions,
        'summary': f"{repository}: {issue_count} issues, priority={priority}"
    }


def analyze_discussions(repository: str, discussions: str) -> dict:
    """Analyze active community discussions.

    Args:
        repository: Repository in owner/repo format
        discussions: Text describing active discussions

    Returns:
        Analysis with discussion count, decision priority, themes, and actions
    """
    import re

    lines = discussions.strip().split('\n') if discussions.strip() else []
    count = len(lines)

    patterns = {
        'proposals': len(re.findall(r'(?i)(proposal|rfc|suggest|idea)', discussions)),
        'decisions': len(re.findall(r'(?i)(decision|agreed|consensus|approved)', discussions)),
        'feedback': len(re.findall(r'(?i)(feedback|review|opinion|thoughts)', discussions)),
        'technical': len(re.findall(r'(?i)(architecture|design|implementation|approach)', discussions)),
    }

    score = patterns['technical'] * 2 + patterns['proposals'] * 2 + patterns['decisions']
    priority = 'high' if score >= 7 else 'medium' if score >= 4 else 'low'

    themes = [k for k, v in patterns.items() if v > 0]
    actions = []
    if patterns['proposals'] > 0:
        actions.append('Review and respond to community proposals')
    if patterns['decisions'] > 0:
        actions.append('Document decisions and next steps')

    return {
        'repository': repository,
        'active_discussion_count': count,
        'decision_priority': priority,
        'themes': themes,
        'recommended_actions': actions,
        'summary': f"{repository}: {count} discussions, priority={priority}"
    }
