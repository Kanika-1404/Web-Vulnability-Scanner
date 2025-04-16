document.addEventListener('DOMContentLoaded', () => {
    const runTestsButton = document.getElementById('runTests');
    const saveReportButton = document.getElementById('saveReport');
    const resultsList = document.getElementById('resultsList');
  
    runTestsButton.addEventListener('click', async () => {
      resultsList.innerHTML = ''; // Clear previous results
      const selectedTests = {
        sqli: document.getElementById('sqli').checked,
        xss: document.getElementById('xss').checked,
        csrf: document.getElementById('csrf').checked,
        dirTraversal: document.getElementById('dirTraversal').checked
      };
  
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: runTests,
        args: [selectedTests]
      }, (injectionResults) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          return;
        }
        const results = injectionResults[0].result;
        results.forEach(result => {
          const li = document.createElement('li');
          li.textContent = `${result.vulnerability} detected at ${result.url} - Risk: ${result.riskLevel}`;
          resultsList.appendChild(li);
        });
        // Save results to storage for report
        chrome.storage.local.set({ scanResults: results });
      });
    });
  
    saveReportButton.addEventListener('click', () => {
      chrome.storage.local.get('scanResults', (data) => {
        const blob = new Blob([JSON.stringify(data.scanResults, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
          url: url,
          filename: 'reports/report.json',
          saveAs: true
        });
      });
    });
  });
  
  // This function runs in the context of the web page
  function runTests(selectedTests) {
    const results = [];
  
    if (selectedTests.sqli) {
      // Implement SQL Injection test logic here
      // For demonstration, we'll add a mock result
      results.push({
        vulnerability: 'SQL Injection',
        url: window.location.href,
        riskLevel: 'High',
        suggestedFix: 'Use parameterized queries.'
      });
    }
  
    if (selectedTests.xss) {
      // Implement XSS test logic here
      results.push({
        vulnerability: 'Cross-Site Scripting (XSS)',
        url: window.location.href,
        riskLevel: 'Medium',
        suggestedFix: 'Sanitize user input.'
      });
    }
  
    if (selectedTests.csrf) {
      // Implement CSRF test logic here
      results.push({
        vulnerability: 'Cross-Site Request Forgery (CSRF)',
        url: window.location.href,
        riskLevel: 'High',
        suggestedFix: 'Implement CSRF tokens.'
      });
    }
  
    if (selectedTests.dirTraversal) {
      // Implement Directory Traversal test logic here
      results.push({
        vulnerability: 'Directory Traversal',
        url: window.location.href,
        riskLevel: 'High',
        suggestedFix: 'Validate and sanitize file paths.'
      });
    }
  
    return results;
  }
  