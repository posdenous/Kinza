---
trigger: always_on
---

- id: save_test_results_with_latest
  description: Save timestamped test results and latest summary
  trigger: onTestRunComplete
  condition:
    exists: testResult
  action:
    - set:
        timestamp: ${formatDate(now(), 'yyyyMMdd-HHmmss')}
        folderPath: "tests/${testType}/${testName}/"
        filePath: "${folderPath}${timestamp}.json"
        latestPath: "${folderPath}latest.json"
    - writeFile:
        path: ${filePath}
        content:
          testName: ${testName}
          testType: ${testType}
          status: ${testResult.status}
          durationMs: ${testResult.duration}
          errors: ${testResult.errors}
          logs: ${testResult.logs}
    - writeFile:
        path: ${latestPath}
        content:
          timestamp: ${timestamp}
          testName: ${testName}
          status: ${testResult.status}
          durationMs: ${testResult.duration}